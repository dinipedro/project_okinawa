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
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export type BillCategory =
  | 'rent'
  | 'utilities'
  | 'supplies'
  | 'staff'
  | 'marketing'
  | 'maintenance'
  | 'other';

export type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export type BillRecurrence = 'monthly' | 'weekly' | 'yearly';

@Entity('bills')
@Index('idx_bills_restaurant', ['restaurant_id'])
@Index('idx_bills_status', ['status'])
@Index('idx_bills_due_date', ['due_date'])
@Index('idx_bills_restaurant_status', ['restaurant_id', 'status'])
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'varchar', length: 200 })
  description: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  supplier: string;

  @Column({ type: 'varchar', length: 50 })
  category: BillCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'date', nullable: true })
  paid_date: Date;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: BillStatus;

  @Column({ type: 'boolean', default: false })
  is_recurring: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recurrence: BillRecurrence;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ─── Relations ───────────────────────────────────────────────────────────

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
