import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('loyalty_configs')
@Unique('uq_loyalty_config_restaurant', ['restaurant_id'])
@Index('idx_loyalty_config_restaurant', ['restaurant_id'])
export class LoyaltyConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'boolean', default: false })
  cashback_enabled: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5.0 })
  cashback_percentage: number;

  @Column({ type: 'boolean', default: false })
  points_enabled: boolean;

  @Column({ type: 'int', default: 1 })
  points_per_real: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0.01 })
  points_redemption_rate: number;

  @Column({ type: 'int', default: 100 })
  min_points_for_redemption: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
