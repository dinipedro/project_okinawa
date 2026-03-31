import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('prep_analytics')
@Index(['restaurant_id', 'station_id'])
@Index(['menu_item_id'])
@Index(['recorded_at'])
export class PrepAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'uuid' })
  station_id: string;

  @Column({ type: 'uuid' })
  menu_item_id: string;

  @Column({ type: 'uuid' })
  order_item_id: string;

  @Column({ type: 'int' })
  expected_prep_minutes: number;

  @Column({ type: 'int', nullable: true })
  actual_prep_minutes: number | null;

  @Column({ type: 'boolean', default: false })
  was_late: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  shift: string | null; // 'lunch' | 'dinner' | 'late_night'

  @Column({ type: 'varchar', length: 20, nullable: true })
  source: string | null; // 'noowe' | 'ifood' | 'rappi' | 'ubereats'

  @Column({ type: 'varchar', length: 20, nullable: true })
  day_of_week: string | null;

  @CreateDateColumn()
  recorded_at: Date;
}
