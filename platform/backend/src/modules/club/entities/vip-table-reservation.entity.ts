import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { VipTableReservationStatus } from '@/common/enums';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { VipTableGuest } from './vip-table-guest.entity';
import { VipTableTab } from './vip-table-tab.entity';

/**
 * VipTableReservation Entity - VIP table/camarote reservations
 * Extends patterns from Reservation entity
 */
@Entity('vip_table_reservations')
@Index('idx_vip_reservation_restaurant', ['restaurant_id'])
@Index('idx_vip_reservation_host', ['host_user_id'])
@Index('idx_vip_reservation_event_date', ['event_date'])
@Index('idx_vip_reservation_status', ['status'])
export class VipTableReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'varchar', length: 100 })
  table_type_id: string; // References table_types config

  @Column('uuid', { nullable: true })
  table_id: string; // Specific table assigned

  @Column('uuid')
  host_user_id: string;

  @Column({ type: 'date' })
  event_date: Date;

  @Column({ type: 'int' })
  party_size: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minimum_spend: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deposit_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deposit_credit: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deposit_transaction_id: string;

  @Column({
    type: 'enum',
    enum: VipTableReservationStatus,
    default: VipTableReservationStatus.PENDING_CONFIRMATION,
  })
  status: VipTableReservationStatus;

  @Column({ type: 'timestamp', nullable: true })
  confirmation_deadline: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmed_at: Date;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date;

  @Column({ type: 'text', nullable: true })
  invite_token: string;

  @Column({ type: 'text', nullable: true })
  special_requests: string;

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
  @JoinColumn({ name: 'host_user_id' })
  host: Profile;

  @OneToMany(() => VipTableGuest, (guest) => guest.reservation, { cascade: true })
  guests: VipTableGuest[];

  @OneToMany(() => VipTableTab, (tab) => tab.reservation, { cascade: true })
  tabs: VipTableTab[];
}
