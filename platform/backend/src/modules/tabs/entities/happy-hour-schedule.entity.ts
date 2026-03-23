import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DayOfWeek, HappyHourDiscountType, HappyHourAppliesTo } from '@/common/enums';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';

/**
 * HappyHourSchedule Entity - Promotional schedules for Pub & Bar
 */
@Entity('happy_hour_schedules')
@Index('idx_happy_hour_restaurant', ['restaurant_id'])
@Index('idx_happy_hour_active', ['is_active'])
export class HappyHourSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array' })
  days: DayOfWeek[];

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({
    type: 'enum',
    enum: HappyHourDiscountType,
    default: HappyHourDiscountType.PERCENTAGE,
  })
  discount_type: HappyHourDiscountType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discount_value: number;

  @Column({
    type: 'enum',
    enum: HappyHourAppliesTo,
    default: HappyHourAppliesTo.ALL,
  })
  applies_to: HappyHourAppliesTo;

  @Column({ type: 'simple-array', nullable: true })
  category_ids: string[];

  @Column({ type: 'simple-array', nullable: true })
  item_ids: string[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
