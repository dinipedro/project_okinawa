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
import { TabStatus } from '@/common/enums';
import { VipTableReservation } from './vip-table-reservation.entity';
import { VipTableTabItem } from './vip-table-tab-item.entity';

/**
 * VipTableTab Entity - Consumption tab for VIP tables
 * Reuses patterns from Tab entity
 */
@Entity('vip_table_tabs')
@Index('idx_vip_tab_reservation', ['reservation_id'])
@Index('idx_vip_tab_status', ['status'])
export class VipTableTab {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reservation_id: string;

  @Column({
    type: 'enum',
    enum: TabStatus,
    default: TabStatus.OPEN,
  })
  status: TabStatus;

  // Credits available
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deposit_credit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  entry_credits_total: number;

  // Totals
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount_paid: number;

  // Minimum spend tracking
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimum_spend_progress: number; // Percentage achieved

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => VipTableReservation, (reservation) => reservation.tabs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: VipTableReservation;

  @OneToMany(() => VipTableTabItem, (item) => item.tab, { cascade: true })
  items: VipTableTabItem[];
}
