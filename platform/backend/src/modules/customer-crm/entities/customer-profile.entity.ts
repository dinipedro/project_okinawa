import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export type CustomerSegment = 'new' | 'regular' | 'vip' | 'dormant';

@Entity('customer_profiles')
@Unique(['user_id', 'restaurant_id'])
@Index('idx_customer_profile_restaurant', ['restaurant_id'])
@Index('idx_customer_profile_segment', ['segment'])
@Index('idx_customer_profile_user', ['user_id'])
export class CustomerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'int', default: 0 })
  total_visits: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_spent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  avg_ticket: number;

  @Column({ type: 'timestamp', nullable: true })
  last_visit_at: Date;

  @Column({ type: 'jsonb', default: '[]' })
  favorite_items: string[];

  @Column({ type: 'jsonb', default: '[]' })
  dietary_preferences: string[];

  @Column({
    type: 'varchar',
    length: 20,
    default: 'new',
  })
  segment: CustomerSegment;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
