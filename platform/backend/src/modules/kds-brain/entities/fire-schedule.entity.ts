import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('fire_schedules')
@Index('idx_fire_schedule_fire_at_unfired', ['fire_at'], { where: '"fired" = false' })
@Index('idx_fire_schedule_order', ['order_id'])
@Index('idx_fire_schedule_station_fired', ['station_id', 'fired'])
export class FireSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'uuid' })
  order_item_id: string;

  @Column({ type: 'uuid' })
  station_id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  course: string;

  @Column({ type: 'timestamp', nullable: true })
  fire_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expected_ready_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  actual_ready_at: Date | null;

  @Column({ type: 'boolean', default: false })
  fired: boolean;

  @Column({ type: 'varchar', length: 20, default: 'auto' })
  fire_mode: string; // 'auto' | 'manual' | 'immediate'

  @CreateDateColumn()
  created_at: Date;
}
