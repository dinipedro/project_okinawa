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
import { Order } from './order.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

export enum OrderGuestStatus {
  JOINED = 'joined',
  LEFT = 'left',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_COMPLETED = 'payment_completed',
}

@Entity('order_guests')
@Index('idx_order_guest_order', ['order_id'])
@Index('idx_order_guest_user', ['guest_user_id'])
@Index('idx_order_guest_status', ['status'])
@Unique('UQ_order_guest_user', ['order_id', 'guest_user_id'])
export class OrderGuest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  order_id: string;

  @Column('uuid', { nullable: true })
  guest_user_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  guest_name: string;

  @Column({ type: 'boolean', default: false })
  is_host: boolean;

  @Column({
    type: 'enum',
    enum: OrderGuestStatus,
    default: OrderGuestStatus.JOINED,
  })
  status: OrderGuestStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount_due: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount_paid: number;

  @Column({ type: 'boolean', default: false })
  payment_completed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  payment_completed_at: Date;

  @CreateDateColumn()
  joined_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  left_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Order, (order) => order.guests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'guest_user_id' })
  guest_user: Profile;
}
