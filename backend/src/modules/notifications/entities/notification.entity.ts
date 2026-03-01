import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';

export enum NotificationType {
  ORDER_PLACED = 'order_placed',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_READY = 'order_ready',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_GUEST_ADDED = 'order_guest_added',
  RESERVATION_CONFIRMED = 'reservation_confirmed',
  RESERVATION_REMINDER = 'reservation_reminder',
  RESERVATION_CANCELLED = 'reservation_cancelled',
  RESERVATION_INVITE = 'reservation_invite',
  RESERVATION_RESPONSE = 'reservation_response',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  LOYALTY_POINTS_EARNED = 'loyalty_points_earned',
  LOYALTY_TIER_UPGRADE = 'loyalty_tier_upgrade',
  LOYALTY_REWARD_AVAILABLE = 'loyalty_reward_available',
  TIP_RECEIVED = 'tip_received',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
  REVIEW_REQUEST = 'review_request',
  REVIEW_RESPONSE = 'review_response',
}

export enum RelatedType {
  ORDER = 'order',
  RESERVATION = 'reservation',
  PAYMENT = 'payment',
  LOYALTY = 'loyalty',
  REVIEW = 'review',
  RESTAURANT = 'restaurant',
  PROMOTION = 'promotion',
}

@Entity('notifications')
@Index('idx_notification_user', ['user_id'])
@Index('idx_notification_read', ['is_read'])
@Index('idx_notification_user_read', ['user_id', 'is_read'])
@Index('idx_notification_type', ['notification_type'])
@Index('idx_notification_created', ['created_at'])
@Index('idx_notification_user_created', ['user_id', 'created_at'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  notification_type: NotificationType;

  @Column('uuid', { nullable: true })
  related_id: string;

  @Column({ type: 'enum', enum: RelatedType, nullable: true })
  related_type: RelatedType;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;
}
