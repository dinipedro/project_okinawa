import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('prep_time_suggestions')
export class PrepTimeSuggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'uuid' })
  menu_item_id: string;

  @Column({ type: 'uuid', nullable: true })
  station_id: string | null;

  @Column({ type: 'varchar', length: 255 })
  menu_item_name: string;

  @Column({ type: 'int' })
  current_prep_minutes: number;

  @Column({ type: 'int' })
  suggested_prep_minutes: number;

  @Column({ type: 'int' })
  sample_size: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  confidence_score: number; // 0-100

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // 'pending' | 'accepted' | 'rejected'

  @Column({ type: 'timestamp', nullable: true })
  decided_at: Date | null;

  @Column({ type: 'varchar', nullable: true })
  decided_by: string | null;

  @CreateDateColumn()
  created_at: Date;
}
