import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Order } from '../../orders/entities/order.entity';

/**
 * FiscalDocument -- represents an emitted NFC-e (or NF-e in the future).
 *
 * Each record is a fiscal document tied to an order.
 * Stores the full emission result for auditing and reprint.
 */
@Entity('fiscal_documents')
@Index('idx_fiscal_docs_order', ['order_id'])
@Index('idx_fiscal_docs_restaurant', ['restaurant_id'])
@Index('idx_fiscal_docs_access_key', ['access_key'])
export class FiscalDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'varchar', length: 20 })
  type: string; // 'nfce' | 'nfe'

  @Column({ type: 'varchar', length: 20 })
  status: string;
  // 'authorized' | 'cancelled' | 'denied' | 'pending' | 'contingency' | 'failed'

  @Column({ type: 'varchar', length: 20 })
  provider: string; // 'focus_nfe' | 'sefaz_direct'

  @Column({ type: 'varchar', length: 44, nullable: true })
  access_key: string;

  @Column({ type: 'int', nullable: true })
  number: number;

  @Column({ type: 'int', nullable: true })
  series: number;

  @Column({ type: 'text', nullable: true })
  xml: string;

  @Column({ type: 'text', nullable: true })
  qr_code_url: string;

  @Column({ type: 'text', nullable: true })
  danfe_url: string;

  @Column({ type: 'text', nullable: true })
  protocol: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'jsonb', nullable: true })
  items_snapshot: any;

  @Column({ type: 'varchar', length: 255, nullable: true })
  external_ref: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @CreateDateColumn()
  created_at: Date;

  // ─── Relations ───────────────────────────────────────────────────────────

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
