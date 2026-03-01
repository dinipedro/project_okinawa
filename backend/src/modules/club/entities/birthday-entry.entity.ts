import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

export type BirthdayEntryStatus = 'pending' | 'approved' | 'used' | 'expired' | 'rejected';

@Entity('club_birthday_entries')
export class BirthdayEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @Column({ type: 'date' })
  event_date: Date;

  @Column({ type: 'date' })
  birth_date: Date;

  @Column({ type: 'varchar', length: 20 })
  document_type: string; // 'cpf', 'rg', 'passport'

  @Column({ type: 'varchar', length: 50 })
  document_number: string;

  @Column({ type: 'varchar', nullable: true })
  document_photo_url: string;

  @Column({ type: 'int', default: 0 })
  companions_allowed: number;

  @Column({ type: 'int', default: 0 })
  companions_registered: number;

  @Column({ type: 'boolean', default: false })
  free_entry: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount_percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  credit_amount: number;

  @Column({ type: 'varchar', unique: true })
  qr_code: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: BirthdayEntryStatus;

  @Column({ type: 'varchar', nullable: true })
  rejection_reason: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  used_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  companions: Array<{
    name: string;
    document_number?: string;
    checked_in?: boolean;
  }>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
