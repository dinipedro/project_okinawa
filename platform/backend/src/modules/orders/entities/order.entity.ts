import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrderStatus, OrderType } from '../../../common/enums';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Profile } from '../../users/entities/profile.entity';
import { RestaurantTable } from '../../tables/entities/restaurant-table.entity';
import { OrderItem } from './order-item.entity';
import { OrderGuest } from './order-guest.entity';
import { PaymentSplitMode } from '@/modules/payments/entities/payment-split.entity';

@Entity('orders')
@Index(['restaurant_id'])
@Index(['user_id'])
@Index(['status'])
@Index(['created_at'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  table_id: string;

  @Column('uuid', { nullable: true })
  waiter_id: string;

  @Column({ type: 'int', default: 1 })
  party_size: number;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.DINE_IN,
  })
  order_type: OrderType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tip_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  special_instructions: string;

  @Column({ type: 'text', nullable: true })
  delivery_address: string;

  @Column({ nullable: true })
  delivery_phone: string;

  @Column({ type: 'timestamp', nullable: true })
  estimated_ready_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_ready_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'boolean', default: false })
  is_shared: boolean;

  @Column({
    type: 'enum',
    enum: PaymentSplitMode,
    nullable: true,
  })
  payment_split_mode: PaymentSplitMode;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => RestaurantTable, { nullable: true })
  @JoinColumn({ name: 'table_id' })
  table: RestaurantTable;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'waiter_id' })
  waiter: Profile;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderGuest, (orderGuest) => orderGuest.order, { cascade: true })
  guests: OrderGuest[];
}
