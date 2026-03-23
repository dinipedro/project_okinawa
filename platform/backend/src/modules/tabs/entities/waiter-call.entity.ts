import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { RestaurantTable } from '@/modules/tables/entities/restaurant-table.entity';

/**
 * WaiterCall Entity - Call waiter functionality
 * Shared across Pub & Bar, Club, and other service types
 */
@Entity('waiter_calls')
@Index('idx_waiter_call_restaurant', ['restaurant_id'])
@Index('idx_waiter_call_table', ['table_id'])
@Index('idx_waiter_call_status', ['status'])
@Index('idx_waiter_call_created', ['created_at'])
export class WaiterCall {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid', { nullable: true })
  table_id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  tab_id: string;

  @Column({ type: 'varchar', length: 50 })
  reason: string; // 'order', 'bill', 'question', 'other'

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // 'pending', 'acknowledged', 'resolved'

  @Column('uuid', { nullable: true })
  acknowledged_by: string;

  @Column({ type: 'timestamp', nullable: true })
  acknowledged_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => RestaurantTable, { nullable: true })
  @JoinColumn({ name: 'table_id' })
  table: RestaurantTable;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'acknowledged_by' })
  acknowledged_by_user: Profile;
}
