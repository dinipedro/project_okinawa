import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum ShiftStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum StaffRole {
  CHEF = 'chef',
  SOUS_CHEF = 'sous_chef',
  LINE_COOK = 'line_cook',
  PREP_COOK = 'prep_cook',
  WAITER = 'waiter',
  WAITRESS = 'waitress',
  HOST = 'host',
  HOSTESS = 'hostess',
  BARTENDER = 'bartender',
  BARBACK = 'barback',
  BUSSER = 'busser',
  DISHWASHER = 'dishwasher',
  MANAGER = 'manager',
  ASSISTANT_MANAGER = 'assistant_manager',
  CASHIER = 'cashier',
  DELIVERY = 'delivery',
  OTHER = 'other',
}

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  staff_id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'enum', enum: StaffRole, nullable: true })
  role: StaffRole;

  @Column({ type: 'enum', enum: ShiftStatus, default: ShiftStatus.SCHEDULED })
  status: ShiftStatus;

  @Column({ type: 'time', nullable: true })
  actual_start_time: string;

  @Column({ type: 'time', nullable: true })
  actual_end_time: string;

  @Column({ type: 'int', nullable: true })
  break_minutes: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  is_overtime: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourly_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_pay: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'staff_id' })
  staff: Profile;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
