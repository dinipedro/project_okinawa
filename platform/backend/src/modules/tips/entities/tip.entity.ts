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
import { Profile } from '../../users/entities/profile.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum TipStatus {
  PENDING = 'pending',
  DISTRIBUTED = 'distributed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum TipType {
  DIRECT = 'direct',
  POOLED = 'pooled',
  PERCENTAGE = 'percentage',
  SPLIT = 'split',
}

@Entity('tips')
@Index('idx_tip_customer', ['customer_id'])
@Index('idx_tip_restaurant', ['restaurant_id'])
@Index('idx_tip_staff', ['staff_id'])
@Index('idx_tip_order', ['order_id'])
@Index('idx_tip_status', ['status'])
@Index('idx_tip_created', ['created_at'])
@Index('idx_tip_restaurant_staff', ['restaurant_id', 'staff_id'])
export class Tip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  customer_id: string;

  @Column('uuid')
  restaurant_id: string;

  @Column('uuid', { nullable: true })
  staff_id: string;

  @Column('uuid', { nullable: true })
  order_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: TipType, default: TipType.DIRECT })
  tip_type: TipType;

  @Column({ type: 'enum', enum: TipStatus, default: TipStatus.PENDING })
  status: TipStatus;

  @Column({ type: 'timestamp', nullable: true })
  distributed_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  distribution_details: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'customer_id' })
  customer: Profile;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'staff_id' })
  staff: Profile;
}
