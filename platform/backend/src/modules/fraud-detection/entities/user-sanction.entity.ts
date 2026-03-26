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

export enum SanctionType {
  WARNING = 'warning',
  PARTIAL_SUSPENSION = 'partial_suspension',
  FULL_SUSPENSION = 'full_suspension',
  PERMANENT_BAN = 'permanent_ban',
}

@Entity('user_sanctions')
@Index(['user_id'])
@Index(['sanction_type'])
@Index(['active'])
@Index(['defense_deadline'])
@Index(['created_at'])
export class UserSanction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'enum', enum: SanctionType })
  sanction_type: SanctionType;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'jsonb', default: {} })
  evidence: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  notice_sent_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  defense_deadline: Date;

  @Column({ type: 'boolean', default: false })
  defense_submitted: boolean;

  @Column({ type: 'text', nullable: true })
  defense_text: string;

  @Column('uuid', { nullable: true })
  reviewed_by: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewed_at: Date;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: Profile;
}
