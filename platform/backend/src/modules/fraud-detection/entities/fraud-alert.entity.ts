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

export enum AlertType {
  VELOCITY = 'velocity',
  GEOGRAPHIC = 'geographic',
  CHARGEBACK = 'chargeback',
  MULTI_ACCOUNT = 'multi_account',
  REVIEW_MANIPULATION = 'review_manipulation',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  PENDING = 'pending',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

@Entity('fraud_alerts')
@Index(['user_id'])
@Index(['alert_type'])
@Index(['severity'])
@Index(['status'])
@Index(['created_at'])
export class FraudAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'enum', enum: AlertType })
  alert_type: AlertType;

  @Column({ type: 'enum', enum: AlertSeverity })
  severity: AlertSeverity;

  @Column({ type: 'jsonb', default: {} })
  details: Record<string, any>;

  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.PENDING })
  status: AlertStatus;

  @Column('uuid', { nullable: true })
  resolved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'resolved_by' })
  resolver: Profile;
}
