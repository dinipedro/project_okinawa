import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '@/modules/orders/entities/order.entity';

/**
 * GatewayTransaction — immutable log of every payment gateway operation.
 *
 * Every call to processPayment, refundPayment, or webhook status update
 * creates or updates a row here. Used for reconciliation, audit, and debugging.
 *
 * Amount convention: amount_cents and refunded_amount_cents are in centavos (INT).
 * Example: R$ 98,90 = 9890.
 */
@Entity('gateway_transactions')
@Index('idx_gateway_tx_order', ['order_id'])
@Index('idx_gateway_tx_external', ['external_id'])
@Index('idx_gateway_tx_idempotency', ['idempotency_key'])
@Index('idx_gateway_tx_restaurant', ['restaurant_id'])
export class GatewayTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'uuid', nullable: true })
  order_id: string;

  /** Gateway provider: 'asaas' | 'stripe_terminal' | 'wallet' | 'cash' */
  @Column({ type: 'varchar', length: 20 })
  provider: string;

  /** External ID in the gateway (e.g., Asaas charge ID, Stripe PaymentIntent ID) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  external_id: string;

  /** Payment method used: credit_card, debit_card, pix, wallet, cash, tap_to_pay */
  @Column({ type: 'varchar', length: 20 })
  payment_method: string;

  /** Amount in centavos (integer). R$ 98,90 = 9890 */
  @Column({ type: 'int' })
  amount_cents: number;

  /** Transaction status: pending, completed, failed, refunded, partially_refunded, expired */
  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: string;

  /** Client-provided idempotency key to prevent duplicate charges */
  @Column({ type: 'varchar', length: 255 })
  idempotency_key: string;

  /** Correlation ID for distributed tracing */
  @Column({ type: 'varchar', length: 255, nullable: true })
  correlation_id: string;

  /** Arbitrary metadata (card brand, installments, PIX info, etc.) */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  /** Error code from gateway (e.g., 'card_declined', 'insufficient_funds') */
  @Column({ type: 'varchar', length: 50, nullable: true })
  error_code: string;

  /** Human-readable error message */
  @Column({ type: 'text', nullable: true })
  error_message: string;

  /** Total refunded amount in centavos */
  @Column({ type: 'int', default: 0 })
  refunded_amount_cents: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ─── Relations ────────────────────────────────────────────────────────────

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
