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
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Profile } from '../../users/entities/profile.entity';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
  BLOCKED = 'blocked',
}

@Entity('tables')
@Index('idx_table_restaurant_status', ['restaurant_id', 'status'])
export class RestaurantTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column()
  table_number: string;

  @Column({ type: 'int' })
  seats: number;

  @Column({ type: 'enum', enum: TableStatus, default: TableStatus.AVAILABLE })
  status: TableStatus;

  @Column({ nullable: true })
  section: string;

  @Column('uuid', { nullable: true })
  assigned_waiter_id: string;

  @Column({ type: 'int', nullable: true })
  position_x: number;

  @Column({ type: 'int', nullable: true })
  position_y: number;

  @Column({ nullable: true })
  qr_code: string;

  @Column({ type: 'varchar', length: 20, default: 'square' })
  shape: string; // 'square' | 'round' | 'rectangle' | 'bar'

  @Column({ type: 'int', default: 1 })
  width: number;

  @Column({ type: 'int', default: 1 })
  height: number;

  @Column({ type: 'timestamptz', nullable: true })
  occupied_since: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Profile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_waiter_id' })
  assigned_waiter: Profile;
}
