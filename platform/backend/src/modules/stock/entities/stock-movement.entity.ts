import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { StockItem } from './stock-item.entity';

export type StockMovementType =
  | 'sale_consumption'
  | 'purchase_manual'
  | 'purchase_nfe'
  | 'adjustment_positive'
  | 'adjustment_negative'
  | 'waste'
  | 'expired'
  | 'internal_use'
  | 'transfer_in'
  | 'transfer_out'
  | 'inventory_count';

export type StockMovementReferenceType =
  | 'order_item'
  | 'purchase_record'
  | 'inventory_count';

@Entity('stock_movements')
@Index('idx_stock_movements_item', ['stock_item_id', 'created_at'])
@Index('idx_stock_movements_restaurant', ['restaurant_id', 'created_at'])
@Index('idx_stock_movements_type', ['restaurant_id', 'type'])
@Index('idx_stock_movements_reference', ['reference_id', 'reference_type'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  stock_item_id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'uuid' })
  ingredient_id: string;

  @Column({ type: 'varchar', length: 30 })
  type: StockMovementType;

  /** Positive = stock in, Negative = stock out */
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  quantity_before: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  quantity_after: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  unit_cost: number | null;

  @Column({ type: 'uuid', nullable: true })
  reference_id: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  reference_type: StockMovementReferenceType | null;

  @Column({ type: 'uuid', nullable: true })
  created_by: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => StockItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_item_id' })
  stock_item: StockItem;
}
