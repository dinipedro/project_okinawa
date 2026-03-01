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
import { QueueEntryStatus } from '@/common/enums';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

/**
 * QueueEntry Entity - Virtual queue for Club & Balada
 */
@Entity('queue_entries')
@Index('idx_queue_restaurant', ['restaurant_id'])
@Index('idx_queue_user', ['user_id'])
@Index('idx_queue_status', ['status'])
@Index('idx_queue_position', ['restaurant_id', 'position'])
export class QueueEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'int' })
  party_size: number;

  @Column({ type: 'varchar', length: 100 })
  priority_level_id: string; // References queue_priority_levels config

  @Column({ type: 'varchar', length: 50, nullable: true })
  priority_level_name: string; // Denormalized

  @Column({ type: 'int' })
  position: number;

  @Column({ type: 'int' })
  estimated_wait_minutes: number;

  @Column({
    type: 'enum',
    enum: QueueEntryStatus,
    default: QueueEntryStatus.WAITING,
  })
  status: QueueEntryStatus;

  @Column({ type: 'timestamp', nullable: true })
  called_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  entered_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  left_at: Date;

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
