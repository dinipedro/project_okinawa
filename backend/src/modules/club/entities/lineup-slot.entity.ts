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
import { ArtistType } from '@/common/enums';
import { Lineup } from './lineup.entity';

/**
 * LineupSlot Entity - Individual slots in a lineup
 */
@Entity('lineup_slots')
@Index('idx_lineup_slot_lineup', ['lineup_id'])
@Index('idx_lineup_slot_time', ['start_time'])
export class LineupSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  lineup_id: string;

  @Column({ type: 'varchar', length: 200 })
  artist_name: string;

  @Column({
    type: 'enum',
    enum: ArtistType,
    default: ArtistType.GUEST_DJ,
  })
  artist_type: ArtistType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photo_url: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  stage: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  genre: string;

  @Column({ type: 'boolean', default: false })
  is_headliner: boolean;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Lineup, (lineup) => lineup.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lineup_id' })
  lineup: Lineup;
}
