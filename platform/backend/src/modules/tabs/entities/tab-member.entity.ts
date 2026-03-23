import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { TabMemberRole, TabMemberStatus } from '@/common/enums';
import { Tab } from './tab.entity';
import { Profile } from '@/modules/users/entities/profile.entity';

/**
 * TabMember Entity - Members of a group tab
 * Reuses patterns from OrderGuest and ReservationGuest
 */
@Entity('tab_members')
@Index('idx_tab_member_tab', ['tab_id'])
@Index('idx_tab_member_user', ['user_id'])
@Index('idx_tab_member_status', ['status'])
@Unique('UQ_tab_member_user', ['tab_id', 'user_id'])
export class TabMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tab_id: string;

  @Column('uuid')
  user_id: string;

  @Column({
    type: 'enum',
    enum: TabMemberRole,
    default: TabMemberRole.MEMBER,
  })
  role: TabMemberRole;

  @Column({
    type: 'enum',
    enum: TabMemberStatus,
    default: TabMemberStatus.ACTIVE,
  })
  status: TabMemberStatus;

  // Individual consumption tracking
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount_consumed: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount_paid: number;

  // Credits brought by this member
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  credit_contribution: number;

  @CreateDateColumn()
  joined_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  left_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Tab, (tab) => tab.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tab_id' })
  tab: Tab;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'user_id' })
  user: Profile;
}
