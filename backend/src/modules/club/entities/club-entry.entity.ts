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
import { ClubEntryPurchaseType, ClubEntryStatus } from '@/common/enums';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

/**
 * ClubEntry Entity - Entry tickets for Club & Balada
 */
@Entity('club_entries')
@Index('idx_club_entry_restaurant', ['restaurant_id'])
@Index('idx_club_entry_user', ['user_id'])
@Index('idx_club_entry_event_date', ['event_date'])
@Index('idx_club_entry_status', ['status'])
@Index('idx_club_entry_qr', ['qr_code'])
export class ClubEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'date' })
  event_date: Date;

  @Column({ type: 'varchar', length: 100 })
  variation_id: string; // References cover_charge_variations config

  @Column({ type: 'varchar', length: 100, nullable: true })
  variation_name: string; // Denormalized for display

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  credit_amount: number; // Credit generated from entry

  @Column({
    type: 'enum',
    enum: ClubEntryPurchaseType,
    default: ClubEntryPurchaseType.ADVANCE,
  })
  purchase_type: ClubEntryPurchaseType;

  @Column({ type: 'varchar', length: 100, unique: true })
  qr_code: string;

  @Column({
    type: 'enum',
    enum: ClubEntryStatus,
    default: ClubEntryStatus.ACTIVE,
  })
  status: ClubEntryStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transaction_id: string;

  @Column({ type: 'timestamp', nullable: true })
  used_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;
}
