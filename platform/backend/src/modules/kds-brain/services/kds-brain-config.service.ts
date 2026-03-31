import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KdsBrainConfig } from '../entities/kds-brain-config.entity';

@Injectable()
export class KdsBrainConfigService {
  private readonly logger = new Logger(KdsBrainConfigService.name);

  constructor(
    @InjectRepository(KdsBrainConfig)
    private readonly configRepo: Repository<KdsBrainConfig>,
  ) {}

  /**
   * Get KDS Brain config for a restaurant.
   * Returns defaults if no config exists yet.
   */
  async getConfig(restaurantId: string): Promise<KdsBrainConfig> {
    const existing = await this.configRepo.findOne({
      where: { restaurant_id: restaurantId },
    });

    if (existing) return existing;

    // Return default config (not persisted until explicitly saved)
    return {
      id: '',
      restaurant_id: restaurantId,
      course_gap_mode: 'on_ready',
      course_gap_minutes: 0,
      delivery_buffer_minutes: 3,
      auto_accept_delivery: true,
      sound_enabled: true,
      sound_volume: 0.8,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Create or update KDS Brain config (upsert).
   */
  async upsertConfig(data: Partial<KdsBrainConfig> & { restaurant_id: string }): Promise<KdsBrainConfig> {
    const existing = await this.configRepo.findOne({
      where: { restaurant_id: data.restaurant_id },
    });

    if (existing) {
      // Update only provided fields
      const updatable = { ...data };
      delete (updatable as any).id;
      delete (updatable as any).created_at;

      Object.assign(existing, updatable);
      const saved = await this.configRepo.save(existing);

      this.logger.log(`Updated KDS Brain config for restaurant ${data.restaurant_id}`);
      return saved;
    }

    // Create new config
    const config = this.configRepo.create(data);
    const saved = await this.configRepo.save(config);

    this.logger.log(`Created KDS Brain config for restaurant ${data.restaurant_id}`);
    return saved;
  }
}
