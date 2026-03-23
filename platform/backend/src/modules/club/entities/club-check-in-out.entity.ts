import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { ClubEntry } from './club-entry.entity';

/**
 * ClubCheckInOut Entity - Track check-in/out for capacity management
 */
@Entity('club_check_in_outs')
@Index('idx_check_in_restaurant', ['restaurant_id'])
@Index('idx_check_in_user', ['user_id'])
@Index('idx_check_in_date', ['check_in_at'])
export class ClubCheckInOut {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  entry_id: string;

  @Column({ type: 'timestamp' })
  check_in_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  check_out_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => ClubEntry, { nullable: true })
  @JoinColumn({ name: 'entry_id' })
  entry: ClubEntry;
}
