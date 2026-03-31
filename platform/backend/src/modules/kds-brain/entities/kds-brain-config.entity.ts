import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('kds_brain_configs')
@Unique(['restaurant_id'])
export class KdsBrainConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  restaurant_id: string;

  @Column({ type: 'varchar', length: 20, default: 'on_ready' })
  course_gap_mode: string; // 'on_ready' | 'timed'

  @Column({ type: 'int', default: 0 })
  course_gap_minutes: number;

  @Column({ type: 'int', default: 3 })
  delivery_buffer_minutes: number;

  @Column({ type: 'boolean', default: true })
  auto_accept_delivery: boolean;

  @Column({ type: 'boolean', default: true })
  sound_enabled: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.8 })
  sound_volume: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
