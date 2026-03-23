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
import { TabStatus, TabType } from '@/common/enums';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { RestaurantTable } from '@/modules/tables/entities/restaurant-table.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { TabMember } from './tab-member.entity';
import { TabItem } from './tab-item.entity';
import { TabPayment } from './tab-payment.entity';

/**
 * Tab Entity - Digital tab for Pub & Bar service type
 * Extends the concept of Orders but specialized for bar consumption
 */
@Entity('tabs')
@Index('idx_tab_restaurant', ['restaurant_id'])
@Index('idx_tab_host', ['host_user_id'])
@Index('idx_tab_table', ['table_id'])
@Index('idx_tab_status', ['status'])
@Index('idx_tab_created', ['created_at'])
export class Tab {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid', { nullable: true })
  table_id: string;

  @Column('uuid')
  host_user_id: string;

  @Column({
    type: 'enum',
    enum: TabStatus,
    default: TabStatus.OPEN,
  })
  status: TabStatus;

  @Column({
    type: 'enum',
    enum: TabType,
    default: TabType.INDIVIDUAL,
  })
  type: TabType;

  // Pre-authorization
  @Column('uuid', { nullable: true })
  preauth_transaction_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  preauth_amount: number;

  // Credits (from cover charge or deposit)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cover_charge_credit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deposit_credit: number;

  // Totals
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tip_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount_paid: number;

  // Invite token for group tabs
  @Column({ type: 'text', nullable: true })
  invite_token: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => RestaurantTable, { nullable: true })
  @JoinColumn({ name: 'table_id' })
  table: RestaurantTable;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'host_user_id' })
  host: Profile;

  @OneToMany(() => TabMember, (member) => member.tab, { cascade: true })
  members: TabMember[];

  @OneToMany(() => TabItem, (item) => item.tab, { cascade: true })
  items: TabItem[];

  @OneToMany(() => TabPayment, (payment) => payment.tab, { cascade: true })
  payments: TabPayment[];
}
