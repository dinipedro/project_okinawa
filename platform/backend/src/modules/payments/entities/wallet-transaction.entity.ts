import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TransactionType } from '../../../common/enums';
import { Wallet } from './wallet.entity';

@Entity('wallet_transactions')
@Index('idx_wallet_tx_wallet', ['wallet_id'])
@Index('idx_wallet_tx_type', ['transaction_type'])
@Index('idx_wallet_tx_order', ['order_id'])
@Index('idx_wallet_tx_created', ['created_at'])
@Index('idx_wallet_tx_wallet_created', ['wallet_id', 'created_at'])
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  wallet_id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transaction_type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance_before: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance_after: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('uuid', { nullable: true })
  order_id: string;

  @Column('uuid', { nullable: true })
  payment_method_id: string;

  @Column({ nullable: true })
  external_transaction_id: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  idempotency_key: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;
}
