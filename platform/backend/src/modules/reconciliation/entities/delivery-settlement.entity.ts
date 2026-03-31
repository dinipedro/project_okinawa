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

/**
 * DeliverySettlement -- tracks delivery platform settlements for reconciliation.
 *
 * For each delivery order (source != 'noowe'):
 * - On ORDER CREATION: register with gross_amount, estimated commission, expected_net
 * - When SETTLEMENT arrives (webhook or manual import): compare expected vs actual
 * - If difference > threshold (R$0.50): mark as 'discrepancy'
 * - If ok: mark as 'reconciled'
 *
 * Configurable commission rates per platform:
 * - iFood:    commission_rate (e.g. 0.23 = 23%)
 * - Rappi:    commission_rate (e.g. 0.20)
 * - UberEats: commission_rate (e.g. 0.25)
 */
@Entity('delivery_settlements')
@Index('idx_delivery_settlements_restaurant', ['restaurant_id'])
@Index('idx_delivery_settlements_platform', ['platform'])
@Index('idx_delivery_settlements_status', ['status'])
@Index('idx_delivery_settlements_date', ['settlement_date'])
export class DeliverySettlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'varchar', length: 20 })
  platform: string; // 'ifood' | 'rappi' | 'uber_eats'

  @Column({ type: 'date' })
  settlement_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  gross_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commission_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  expected_net: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actual_received: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  difference: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;
  // 'pending' | 'reconciled' | 'discrepancy' | 'manual_override'

  @Column({ type: 'int' })
  order_count: number;

  @CreateDateColumn()
  created_at: Date;

  // ─── Relations ───────────────────────────────────────────────────────────

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
