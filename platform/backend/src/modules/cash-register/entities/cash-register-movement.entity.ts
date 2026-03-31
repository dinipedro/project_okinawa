import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CashRegisterSession } from './cash-register-session.entity';

export type MovementType =
  | 'sale_cash'
  | 'sale_card'
  | 'sale_pix'
  | 'sale_tap'
  | 'sale_wallet'
  | 'tip'
  | 'sangria'
  | 'reforco'
  | 'refund'
  | 'expense';

@Entity('cash_register_movements')
@Index('idx_cash_register_movements_session', ['session_id'])
@Index('idx_cash_register_movements_type', ['type'])
export class CashRegisterMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  session_id: string;

  @Column({ type: 'varchar', length: 20 })
  type: MovementType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'boolean' })
  is_cash: boolean;

  @Column({ type: 'uuid', nullable: true })
  order_id: string;

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => CashRegisterSession, (s) => s.movements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: CashRegisterSession;
}
