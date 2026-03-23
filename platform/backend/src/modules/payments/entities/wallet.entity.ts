import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Check,
} from 'typeorm';
import { WalletType } from '../../../common/enums';
import { Profile } from '../../users/entities/profile.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { WalletTransaction } from './wallet-transaction.entity';

/**
 * Wallet entity - supports both user wallets and restaurant wallets
 * Constraint: A wallet must belong to either a user OR a restaurant (not both, not neither)
 */
@Entity('wallets')
@Check('chk_wallet_owner', '(user_id IS NOT NULL AND restaurant_id IS NULL) OR (user_id IS NULL AND restaurant_id IS NOT NULL)')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  user_id: string;

  @Column('uuid', { nullable: true })
  restaurant_id: string;

  @Column({
    type: 'enum',
    enum: WalletType,
  })
  wallet_type: WalletType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Profile, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => Restaurant, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet, { cascade: true })
  transactions: WalletTransaction[];
}
