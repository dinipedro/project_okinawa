import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrepAnalytics } from '../entities/prep-analytics.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(PrepAnalytics)
    private readonly analyticsRepo: Repository<PrepAnalytics>,
  ) {}

  /**
   * Aggregates prep analytics: avg actual vs expected per menu_item and per station,
   * total_prepared, late_percentage. Group by menu_item_id and station_id.
   */
  async getPrepTimes(restaurantId: string, periodDays = 7) {
    const since = this.getSinceDate(periodDays);

    const results = await this.analyticsRepo
      .createQueryBuilder('pa')
      .select('pa.menu_item_id', 'menu_item_id')
      .addSelect('pa.station_id', 'station_id')
      .addSelect('ROUND(AVG(pa.actual_prep_minutes), 1)', 'avg_actual_minutes')
      .addSelect('ROUND(AVG(pa.expected_prep_minutes), 1)', 'avg_expected_minutes')
      .addSelect('COUNT(*)::int', 'total_prepared')
      .addSelect(
        'ROUND(SUM(CASE WHEN pa.was_late THEN 1 ELSE 0 END)::decimal / NULLIF(COUNT(*), 0) * 100, 1)',
        'late_percentage',
      )
      .where('pa.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('pa.recorded_at >= :since', { since })
      .andWhere('pa.actual_prep_minutes IS NOT NULL')
      .groupBy('pa.menu_item_id')
      .addGroupBy('pa.station_id')
      .orderBy('"total_prepared"', 'DESC')
      .getRawMany();

    return results;
  }

  /**
   * Stations sorted by late_percentage DESC, includes avg delay minutes.
   */
  async getBottlenecks(restaurantId: string, periodDays = 7) {
    const since = this.getSinceDate(periodDays);

    const results = await this.analyticsRepo
      .createQueryBuilder('pa')
      .select('pa.station_id', 'station_id')
      .addSelect('COUNT(*)::int', 'total_items')
      .addSelect(
        'ROUND(SUM(CASE WHEN pa.was_late THEN 1 ELSE 0 END)::decimal / NULLIF(COUNT(*), 0) * 100, 1)',
        'late_percentage',
      )
      .addSelect(
        'ROUND(AVG(CASE WHEN pa.was_late THEN pa.actual_prep_minutes - pa.expected_prep_minutes ELSE 0 END), 1)',
        'avg_delay_minutes',
      )
      .where('pa.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('pa.recorded_at >= :since', { since })
      .andWhere('pa.actual_prep_minutes IS NOT NULL')
      .groupBy('pa.station_id')
      .orderBy('"late_percentage"', 'DESC')
      .getRawMany();

    return results;
  }

  /**
   * Count of items completed per hour of day, grouped by shift.
   */
  async getThroughput(restaurantId: string, periodDays = 7) {
    const since = this.getSinceDate(periodDays);

    const results = await this.analyticsRepo
      .createQueryBuilder('pa')
      .select('EXTRACT(HOUR FROM pa.recorded_at)::int', 'hour')
      .addSelect('pa.shift', 'shift')
      .addSelect('COUNT(*)::int', 'items_completed')
      .where('pa.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('pa.recorded_at >= :since', { since })
      .andWhere('pa.actual_prep_minutes IS NOT NULL')
      .groupBy('hour')
      .addGroupBy('pa.shift')
      .orderBy('hour', 'ASC')
      .getRawMany();

    return results;
  }

  /**
   * Avg prep time and late% grouped by source (noowe, ifood, rappi, ubereats).
   */
  async getPlatformPerformance(restaurantId: string, periodDays = 30) {
    const since = this.getSinceDate(periodDays);

    const results = await this.analyticsRepo
      .createQueryBuilder('pa')
      .select('pa.source', 'source')
      .addSelect('ROUND(AVG(pa.actual_prep_minutes), 1)', 'avg_prep_minutes')
      .addSelect('COUNT(*)::int', 'total_items')
      .addSelect(
        'ROUND(SUM(CASE WHEN pa.was_late THEN 1 ELSE 0 END)::decimal / NULLIF(COUNT(*), 0) * 100, 1)',
        'late_percentage',
      )
      .where('pa.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('pa.recorded_at >= :since', { since })
      .andWhere('pa.actual_prep_minutes IS NOT NULL')
      .groupBy('pa.source')
      .orderBy('"total_items"', 'DESC')
      .getRawMany();

    return results;
  }

  // ─── Helpers ──────────────────────────────────────────────────

  private getSinceDate(periodDays: number): Date {
    const since = new Date();
    since.setDate(since.getDate() - periodDays);
    return since;
  }
}
