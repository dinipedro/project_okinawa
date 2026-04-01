import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export type InventoryCountStatus = 'in_progress' | 'completed' | 'cancelled';

@Entity('inventory_counts')
@Index('idx_inventory_counts_restaurant', ['restaurant_id'])
@Index('idx_inventory_counts_status', ['restaurant_id', 'status'])
export class InventoryCount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'varchar', length: 20, default: 'in_progress' })
  status: InventoryCountStatus;

  @Column({ type: 'uuid' })
  started_by: string;

  @Column({ type: 'uuid', nullable: true })
  completed_by: string | null;

  @CreateDateColumn()
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_deviation_value: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => InventoryCountItem, (item) => item.count, { cascade: true })
  items: InventoryCountItem[];
}

@Entity('inventory_count_items')
@Index('idx_inventory_count_items_count', ['count_id'])
@Index('idx_inventory_count_items_stock', ['stock_item_id'])
export class InventoryCountItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  count_id: string;

  @Column({ type: 'uuid' })
  stock_item_id: string;

  @Column({ type: 'uuid' })
  ingredient_id: string;

  @Column({ type: 'varchar', length: 200 })
  ingredient_name: string;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  system_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  counted_quantity: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  deviation: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deviation_value: number | null;

  @Column({ type: 'boolean', default: false })
  is_counted: boolean;

  @ManyToOne(() => InventoryCount, (count) => count.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'count_id' })
  count: InventoryCount;
}
