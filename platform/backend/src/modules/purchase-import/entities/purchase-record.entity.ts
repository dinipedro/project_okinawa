import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export type PurchaseImportMethod = 'manual' | 'xml_upload' | 'access_key';
export type PurchaseStatus = 'pending_match' | 'matched' | 'completed';

export interface PurchaseItemJson {
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  matched_ingredient_id?: string;
}

@Entity('purchase_records')
@Index('idx_purchase_restaurant', ['restaurant_id'])
@Index('idx_purchase_status', ['status'])
export class PurchaseRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'varchar', length: 200 })
  supplier_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  invoice_number: string;

  @Column({ type: 'date' })
  invoice_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'jsonb', default: '[]' })
  items: PurchaseItemJson[];

  @Column({
    type: 'varchar',
    length: 20,
    default: 'manual',
  })
  import_method: PurchaseImportMethod;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending_match',
  })
  status: PurchaseStatus;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
