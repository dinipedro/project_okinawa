import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { VipTableGuestStatus } from '@/common/enums';
import { VipTableReservation } from './vip-table-reservation.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { ClubEntry } from './club-entry.entity';

/**
 * VipTableGuest Entity - Guests of VIP table reservations
 * Reuses patterns from ReservationGuest
 */
@Entity('vip_table_guests')
@Index('idx_vip_guest_reservation', ['reservation_id'])
@Index('idx_vip_guest_user', ['user_id'])
@Index('idx_vip_guest_status', ['status'])
@Unique('UQ_vip_table_guest_user', ['reservation_id', 'user_id'])
export class VipTableGuest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reservation_id: string;

  @Column('uuid', { nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text' })
  invite_token: string;

  @Column({
    type: 'enum',
    enum: VipTableGuestStatus,
    default: VipTableGuestStatus.PENDING,
  })
  status: VipTableGuestStatus;

  @Column('uuid', { nullable: true })
  entry_id: string; // Entry generated when confirmed

  // Credit brought by this guest
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  credit_contribution: number;

  @CreateDateColumn()
  invited_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  responded_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  checked_in_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => VipTableReservation, (reservation) => reservation.guests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: VipTableReservation;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => ClubEntry, { nullable: true })
  @JoinColumn({ name: 'entry_id' })
  entry: ClubEntry;
}
