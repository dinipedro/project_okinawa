import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('cook_stations')
@Index('idx_cook_station_restaurant', ['restaurant_id'])
export class CookStation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10, default: 'kitchen' })
  type: 'kitchen' | 'bar';

  @Column({ type: 'varchar', length: 10, nullable: true })
  emoji: string;

  @Column({ type: 'int', default: 15 })
  late_threshold_minutes: number;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
