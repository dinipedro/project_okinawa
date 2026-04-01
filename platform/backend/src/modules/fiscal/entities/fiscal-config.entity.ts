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
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import {
  encryptedTransformer,
  encryptedJsonTransformer,
} from '../../../common/utils/field-encryption';

/**
 * FiscalConfig -- fiscal configuration per restaurant.
 *
 * Stores emitter data, tax regime, CSC credentials, numbering sequence,
 * and the selected fiscal adapter (focus_nfe or sefaz_direct).
 *
 * One restaurant has exactly one FiscalConfig (restaurant_id is UNIQUE).
 */
@Entity('fiscal_configs')
@Index('idx_fiscal_configs_restaurant', ['restaurant_id'], { unique: true })
export class FiscalConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  restaurant_id: string;

  // ─── Emitter Data ────────────────────────────────────────────────────────

  @Column({ type: 'varchar', length: 14 })
  cnpj: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  ie: string;

  @Column({ type: 'varchar', length: 200 })
  razao_social: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  nome_fantasia: string;

  @Column({ type: 'varchar', length: 2 })
  state_code: string; // UF

  @Column({ type: 'jsonb' })
  endereco: Record<string, any>;

  // ─── Tax Regime ──────────────────────────────────────────────────────────

  @Column({ type: 'varchar', length: 30 })
  regime_tributario: string;
  // 'simples_nacional' | 'lucro_presumido' | 'lucro_real'

  @Column({ type: 'jsonb' })
  tax_defaults: Record<string, any>;
  // { cfop: '5102', ncm_default: '00000000', icms_csosn: '102',
  //   pis_cst: '99', cofins_cst: '99', pis_aliquota: 0, cofins_aliquota: 0 }

  // ─── CSC (Codigo de Seguranca do Contribuinte) ──────────────────────────

  @Column({ type: 'varchar', length: 10, nullable: true })
  csc_id: string;

  @Column({ type: 'text', nullable: true, transformer: encryptedTransformer })
  csc_token: string;

  // ─── Numbering ───────────────────────────────────────────────────────────

  @Column({ type: 'int', default: 1 })
  current_series: number;

  @Column({ type: 'int', default: 1 })
  next_number: number;

  // ─── Provider Configuration ──────────────────────────────────────────────

  @Column({ type: 'varchar', length: 20, default: 'focus_nfe' })
  fiscal_provider: string;
  // 'focus_nfe' | 'sefaz_direct' | 'none'

  // Focus NFe specific
  @Column({ type: 'text', nullable: true, transformer: encryptedTransformer })
  focus_nfe_token: string;

  @Column({ type: 'boolean', default: false })
  certificate_uploaded: boolean;

  // SEFAZ Direct specific (Phase 2)
  @Column({ type: 'text', nullable: true })
  certificate_base64: string;

  @Column({ type: 'text', nullable: true, transformer: encryptedTransformer })
  certificate_password: string;

  // ─── Behavior ────────────────────────────────────────────────────────────

  @Column({ type: 'boolean', default: true })
  auto_emit: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // ─── Timestamps ──────────────────────────────────────────────────────────

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ─── Relations ───────────────────────────────────────────────────────────

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
