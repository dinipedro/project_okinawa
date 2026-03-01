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
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';
import { LineupSlot } from './lineup-slot.entity';

/**
 * Lineup Entity - Event lineups for Club & Balada
 */
@Entity('lineups')
@Index('idx_lineup_restaurant', ['restaurant_id'])
@Index('idx_lineup_event_date', ['event_date'])
export class Lineup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'date' })
  event_date: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  event_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover_image_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @OneToMany(() => LineupSlot, (slot) => slot.lineup, { cascade: true })
  slots: LineupSlot[];
}
