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
import { Reservation } from './reservation.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
}

@Entity('reservation_guests')
@Index('idx_reservation_guest_reservation', ['reservation_id'])
@Index('idx_reservation_guest_user', ['guest_user_id'])
@Index('idx_reservation_guest_status', ['status'])
@Unique('UQ_reservation_guest_user', ['reservation_id', 'guest_user_id'])
export class ReservationGuest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reservation_id: string;

  @Column('uuid', { nullable: true })
  guest_user_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  guest_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  guest_phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  guest_email: string;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;

  @Column({ type: 'boolean', default: false })
  is_host: boolean;

  @Column({ type: 'uuid', nullable: true })
  invited_by: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  invite_method: string; // 'app', 'sms', 'email', 'link'

  @Column({ type: 'text', nullable: true })
  invite_token: string;

  @CreateDateColumn()
  invited_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  responded_at: Date;

  @Column({ type: 'boolean', default: false })
  has_arrived: boolean;

  @Column({ type: 'timestamp', nullable: true })
  arrived_at: Date;

  @Column({ type: 'boolean', default: false })
  requires_host_approval: boolean;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Reservation, (reservation) => reservation.guests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'guest_user_id' })
  guest_user: Profile;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'invited_by' })
  inviter: Profile;
}
