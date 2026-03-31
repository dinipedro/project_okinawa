import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { PrepAnalytics } from '../entities/prep-analytics.entity';
import { PrepTimeSuggestion } from '../entities/prep-time-suggestion.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { KDS_MESSAGES } from '@/common/i18n/kds-brain.i18n';

/** Minimum number of records required to generate a suggestion. */
const MIN_SAMPLE_SIZE = 20;

/** Minimum percentage difference to trigger a suggestion. */
const MIN_DIFF_PERCENTAGE = 20;

/** Days of analytics data to consider. */
const ANALYSIS_PERIOD_DAYS = 30;

@Injectable()
export class SelfLearningService {
  private readonly logger = new Logger(SelfLearningService.name);

  constructor(
    @InjectRepository(PrepAnalytics)
    private readonly analyticsRepo: Repository<PrepAnalytics>,

    @InjectRepository(PrepTimeSuggestion)
    private readonly suggestionRepo: Repository<PrepTimeSuggestion>,

    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  /**
   * Generate prep-time suggestions for a restaurant.
   *
   * For each MenuItem with >= MIN_SAMPLE_SIZE records in the last ANALYSIS_PERIOD_DAYS:
   * Calculate avg actual_prep_minutes. If difference > MIN_DIFF_PERCENTAGE% from
   * current estimated_prep_minutes: create a PrepTimeSuggestion with status 'pending'.
   */
  async generateSuggestions(restaurantId: string): Promise<PrepTimeSuggestion[]> {
    const since = new Date();
    since.setDate(since.getDate() - ANALYSIS_PERIOD_DAYS);

    // Aggregate: avg actual prep per menu_item with enough samples
    const aggregated = await this.analyticsRepo
      .createQueryBuilder('pa')
      .select('pa.menu_item_id', 'menu_item_id')
      .addSelect('pa.station_id', 'station_id')
      .addSelect('ROUND(AVG(pa.actual_prep_minutes))::int', 'avg_actual')
      .addSelect('COUNT(*)::int', 'sample_size')
      .where('pa.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('pa.recorded_at >= :since', { since })
      .andWhere('pa.actual_prep_minutes IS NOT NULL')
      .groupBy('pa.menu_item_id')
      .addGroupBy('pa.station_id')
      .having('COUNT(*) >= :minSamples', { minSamples: MIN_SAMPLE_SIZE })
      .getRawMany();

    const created: PrepTimeSuggestion[] = [];

    for (const row of aggregated) {
      const menuItem = await this.menuItemRepo.findOne({
        where: { id: row.menu_item_id },
      });
      if (!menuItem) continue;

      const currentPrep = menuItem.estimated_prep_minutes || menuItem.preparation_time || 10;
      const avgActual = Number(row.avg_actual);
      const sampleSize = Number(row.sample_size);

      // Check if difference exceeds threshold
      const diffPercent = Math.abs(avgActual - currentPrep) / currentPrep * 100;
      if (diffPercent < MIN_DIFF_PERCENTAGE) continue;

      // Skip if there's already a pending suggestion for this menu_item + station
      const existingSuggestion = await this.suggestionRepo.findOne({
        where: {
          restaurant_id: restaurantId,
          menu_item_id: row.menu_item_id,
          station_id: row.station_id || null,
          status: 'pending',
        },
      });
      if (existingSuggestion) continue;

      // confidence_score = min(sample_size / 50 * 100, 100)
      const confidenceScore = Math.min((sampleSize / 50) * 100, 100);

      const suggestion = this.suggestionRepo.create({
        restaurant_id: restaurantId,
        menu_item_id: row.menu_item_id,
        station_id: row.station_id || null,
        menu_item_name: menuItem.name,
        current_prep_minutes: currentPrep,
        suggested_prep_minutes: avgActual,
        sample_size: sampleSize,
        confidence_score: confidenceScore,
        status: 'pending',
      });

      created.push(await this.suggestionRepo.save(suggestion));
    }

    this.logger.log(
      `Generated ${created.length} prep-time suggestions for restaurant ${restaurantId}`,
    );

    return created;
  }

  /**
   * Return all pending suggestions for a restaurant.
   */
  async getSuggestions(restaurantId: string): Promise<PrepTimeSuggestion[]> {
    return this.suggestionRepo.find({
      where: { restaurant_id: restaurantId, status: 'pending' },
      order: { confidence_score: 'DESC' },
    });
  }

  /**
   * Accept a suggestion: update MenuItem.estimated_prep_minutes and mark accepted.
   */
  async acceptSuggestion(suggestionId: string): Promise<PrepTimeSuggestion> {
    const suggestion = await this.suggestionRepo.findOne({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      throw new NotFoundException(KDS_MESSAGES.SUGGESTION_NOT_FOUND);
    }

    // Update the MenuItem's prep time
    await this.menuItemRepo.update(suggestion.menu_item_id, {
      estimated_prep_minutes: suggestion.suggested_prep_minutes,
    });

    suggestion.status = 'accepted';
    suggestion.decided_at = new Date();

    const saved = await this.suggestionRepo.save(suggestion);

    this.logger.log(
      `Accepted suggestion ${suggestionId}: ${suggestion.menu_item_name} ` +
      `${suggestion.current_prep_minutes}min -> ${suggestion.suggested_prep_minutes}min`,
    );

    return saved;
  }

  /**
   * Reject a suggestion.
   */
  async rejectSuggestion(suggestionId: string): Promise<PrepTimeSuggestion> {
    const suggestion = await this.suggestionRepo.findOne({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      throw new NotFoundException(KDS_MESSAGES.SUGGESTION_NOT_FOUND);
    }

    suggestion.status = 'rejected';
    suggestion.decided_at = new Date();

    const saved = await this.suggestionRepo.save(suggestion);

    this.logger.log(`Rejected suggestion ${suggestionId}: ${suggestion.menu_item_name}`);

    return saved;
  }

  /**
   * Weekly cron: Monday 6AM — generate suggestions for all active restaurants.
   */
  @Cron('0 6 * * 1')
  async weeklyGenerateSuggestions(): Promise<void> {
    this.logger.log('Starting weekly prep-time suggestion generation');

    const restaurants = await this.restaurantRepo.find({
      where: { is_active: true },
      select: ['id'],
    });

    let totalSuggestions = 0;

    for (const restaurant of restaurants) {
      try {
        const suggestions = await this.generateSuggestions(restaurant.id);
        totalSuggestions += suggestions.length;
      } catch (err) {
        const error = err as Error;
        this.logger.warn(
          `Failed to generate suggestions for restaurant ${restaurant.id}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Weekly suggestion generation complete: ${totalSuggestions} suggestions across ${restaurants.length} restaurants`,
    );
  }
}
