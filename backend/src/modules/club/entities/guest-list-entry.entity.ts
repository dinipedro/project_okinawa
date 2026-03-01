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
import { GuestListStatus } from '@/common/enums';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

/**
 * GuestListEntry Entity - Guest list for Club & Balada
 */
@Entity('guest_list_entries')
@Index('idx_guest_list_restaurant', ['restaurant_id'])
@Index('idx_guest_list_user', ['user_id'])
@Index('idx_guest_list_event_date', ['event_date'])
@Index('idx_guest_list_status', ['status'])
export class GuestListEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'date' })
  event_date: Date;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int', default: 1 })
  party_size: number;

  @Column('uuid', { nullable: true })
  promoter_id: string; // Promoter who added them

  @Column({
    type: 'enum',
    enum: GuestListStatus,
    default: GuestListStatus.ACTIVE,
  })
  status: GuestListStatus;

  @Column({ type: 'varchar', length: 100, unique: true })
  qr_code: string;

  @Column({ type: 'timestamp', nullable: true })
  used_at: Date;

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

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'promoter_id' })
  promoter: Profile;
}
