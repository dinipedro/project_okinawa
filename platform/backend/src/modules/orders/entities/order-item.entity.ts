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
import { OrderItemStatus } from '../../../common/enums';
import { Order } from './order.entity';
import { MenuItem } from '../../menu-items/entities/menu-item.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

@Entity('order_items')
@Index('idx_order_item_order', ['order_id'])
@Index('idx_order_item_menu_item', ['menu_item_id'])
@Index('idx_order_item_status', ['status'])
@Index('idx_order_item_ordered_by', ['ordered_by'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  order_id: string;

  @Column('uuid')
  menu_item_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({
    type: 'enum',
    enum: OrderItemStatus,
    default: OrderItemStatus.PENDING,
  })
  status: OrderItemStatus;

  @Column({ type: 'jsonb', nullable: true })
  customizations: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  special_instructions: string;

  @Column('uuid', { nullable: true })
  ordered_by: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ordered_by_name: string;

  @Column('uuid', { nullable: true })
  prepared_by: string;

  @Column({ type: 'timestamp', nullable: true })
  prepared_at: Date;

  @Column('uuid', { nullable: true })
  station_id: string;

  @Column({ type: 'timestamp', nullable: true })
  fire_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expected_ready_at: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  course: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.order_items)
  @JoinColumn({ name: 'menu_item_id' })
  menu_item: MenuItem;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'ordered_by' })
  ordered_by_user: Profile;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'prepared_by' })
  prepared_by_user: Profile;
}
