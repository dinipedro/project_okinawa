import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { CashRegisterMovement } from './cash-register-movement.entity';

@Entity('cash_register_sessions')
@Index('idx_cash_register_sessions_restaurant', ['restaurant_id'])
@Index('idx_cash_register_sessions_status', ['status'])
export class CashRegisterSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'uuid' })
  opened_by: string;

  @Column({ type: 'uuid', nullable: true })
  closed_by: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  opening_balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  expected_balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actual_balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  difference: number;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: 'open' | 'closed';

  @CreateDateColumn()
  opened_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  @Column({ type: 'text', nullable: true })
  closing_notes: string;

  @OneToMany(() => CashRegisterMovement, (m) => m.session)
  movements: CashRegisterMovement[];
}
