import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';

/**
 * GatewayConfig — per-restaurant gateway credentials and settings.
 *
 * Each restaurant can have one config per provider (Asaas, Stripe Terminal).
 * Credentials are stored as JSONB.
 *
 * Asaas credentials:
 *   { api_key, webhook_token, environment: 'sandbox' | 'production' }
 *
 * Stripe Terminal credentials:
 *   { secret_key, publishable_key, location_id }
 *
 * Settings examples:
 *   { max_installments: 12, pix_expiration_seconds: 600, auto_refund_on_cancel: true }
 */
@Entity('gateway_configs')
@Unique('UQ_gateway_configs_restaurant_provider', ['restaurant_id', 'provider'])
export class GatewayConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  /** Gateway provider: 'asaas' | 'stripe_terminal' */
  @Column({ type: 'varchar', length: 20 })
  provider: string;

  /** Encrypted credentials (API keys, secrets) */
  @Column({ type: 'jsonb' })
  credentials: Record<string, any>;

  /** Whether this gateway is active for the restaurant */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /** Provider-specific settings (installments, PIX expiration, etc.) */
  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ─── Relations ────────────────────────────────────────────────────────────

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
