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
import { VipTableTab } from './vip-table-tab.entity';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

/**
 * VipTableTabItem Entity - Items ordered within VIP table tab
 * Reuses patterns from TabItem
 */
@Entity('vip_table_tab_items')
@Index('idx_vip_tab_item_tab', ['table_tab_id'])
@Index('idx_vip_tab_item_menu_item', ['menu_item_id'])
@Index('idx_vip_tab_item_ordered_by', ['ordered_by_user_id'])
@Index('idx_vip_tab_item_status', ['status'])
export class VipTableTabItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  table_tab_id: string;

  @Column('uuid')
  menu_item_id: string;

  @Column('uuid')
  ordered_by_user_id: string;

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

  @Column({ type: 'text', nullable: true })
  special_instructions: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => VipTableTab, (tab) => tab.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_tab_id' })
  tab: VipTableTab;

  @ManyToOne(() => MenuItem)
  @JoinColumn({ name: 'menu_item_id' })
  menu_item: MenuItem;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'ordered_by_user_id' })
  ordered_by: Profile;
}
