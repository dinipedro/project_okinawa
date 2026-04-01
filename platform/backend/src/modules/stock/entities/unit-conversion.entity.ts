import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('unit_conversions')
@Index('idx_unit_conversions_restaurant', ['restaurant_id'])
export class UnitConversion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  restaurant_id: string;

  @Column({ type: 'uuid', nullable: true })
  ingredient_id: string;

  @Column({ type: 'varchar', length: 20 })
  from_unit: string;

  @Column({ type: 'varchar', length: 20 })
  to_unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  factor: number;

  @CreateDateColumn()
  created_at: Date;
}
