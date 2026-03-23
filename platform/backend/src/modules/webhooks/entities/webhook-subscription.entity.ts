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

export enum WebhookEvent {
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_COMPLETED = 'order.completed',
  ORDER_CANCELLED = 'order.cancelled',
  RESERVATION_CREATED = 'reservation.created',
  RESERVATION_CONFIRMED = 'reservation.confirmed',
  RESERVATION_CANCELLED = 'reservation.cancelled',
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  REVIEW_CREATED = 'review.created',
  TABLE_STATUS_CHANGED = 'table.status_changed',
  TIP_RECEIVED = 'tip.received',
  LEAVE_REQUEST_CREATED = 'leave_request.created',
  SHIFT_SCHEDULED = 'shift.scheduled',
}

@Entity('webhook_subscriptions')
@Index('idx_webhook_subscription_restaurant', ['restaurant_id'])
@Index('idx_webhook_subscription_active', ['is_active'])
@Index('idx_webhook_subscription_restaurant_active', ['restaurant_id', 'is_active'])
export class WebhookSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', array: true })
  events: WebhookEvent[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  secret: string | null;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0 })
  failure_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_triggered_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_success_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_failure_at: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  headers: Record<string, string> | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
