import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from '@/modules/users/entities/profile.entity';

export enum IncidentType {
  DATA_BREACH = 'data_breach',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SYSTEM_COMPROMISE = 'system_compromise',
  DDOS = 'ddos',
  MALWARE = 'malware',
  INSIDER_THREAT = 'insider_threat',
  OTHER = 'other',
}

export enum IncidentSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum IncidentStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  ERADICATED = 'eradicated',
  RECOVERED = 'recovered',
  CLOSED = 'closed',
}

@Entity('security_incidents')
@Index(['severity'])
@Index(['status'])
@Index(['detected_at'])
export class SecurityIncident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: IncidentType,
  })
  incident_type: IncidentType;

  @Column({
    type: 'enum',
    enum: IncidentSeverity,
  })
  severity: IncidentSeverity;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', default: 0 })
  affected_users_count: number;

  @Column({ type: 'text', array: true, default: '{}' })
  affected_data_types: string[];

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.DETECTED,
  })
  status: IncidentStatus;

  @Column({ type: 'timestamp' })
  detected_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  contained_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @Column({ type: 'timestamp' })
  response_deadline: Date;

  @Column({ type: 'boolean', default: false })
  anpd_notified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  anpd_notified_at: Date;

  @Column({ type: 'boolean', default: false })
  users_notified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  users_notified_at: Date;

  @Column({ type: 'text', nullable: true })
  root_cause: string;

  @Column({ type: 'text', nullable: true })
  remediation_steps: string;

  @Column({ type: 'uuid' })
  reported_by: string;

  @Column({ type: 'uuid', nullable: true })
  assigned_to: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'reported_by' })
  reporter: Profile;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee: Profile;
}
