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
import { OrderItemStatus } from '@/common/enums';
import { Tab } from './tab.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

/**
 * TabItem Entity - Items ordered within a tab
 * Reuses patterns from OrderItem
 */
@Entity('tab_items')
@Index('idx_tab_item_tab', ['tab_id'])
@Index('idx_tab_item_menu_item', ['menu_item_id'])
@Index('idx_tab_item_ordered_by', ['ordered_by_user_id'])
@Index('idx_tab_item_status', ['status'])
export class TabItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tab_id: string;

  @Column('uuid')
  menu_item_id: string;

  @Column('uuid')
  ordered_by_user_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  discount_reason: string; // "Happy Hour", "Promoção", etc.

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

  @Column({ type: 'boolean', default: false })
  is_round_repeat: boolean; // If ordered via "Repeat Round" feature

  @Column('uuid', { nullable: true })
  prepared_by: string;

  @Column({ type: 'timestamp', nullable: true })
  prepared_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Tab, (tab) => tab.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tab_id' })
  tab: Tab;

  @ManyToOne(() => MenuItem)
  @JoinColumn({ name: 'menu_item_id' })
  menu_item: MenuItem;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'ordered_by_user_id' })
  ordered_by: Profile;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'prepared_by' })
  prepared_by_user: Profile;
}
