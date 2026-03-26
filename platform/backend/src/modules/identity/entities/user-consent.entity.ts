/**
 * UserConsent entity - Stores LGPD consent records
 * Tracks user acceptance of terms, privacy policy, marketing, etc.
 *
 * Part of Identity Module (LGPD compliance)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';

export enum ConsentType {
  TERMS_OF_SERVICE = 'terms_of_service',
  PRIVACY_POLICY = 'privacy_policy',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  GEOLOCATION = 'geolocation',
}

@Entity('user_consents')
@Index(['user_id'])
@Index(['consent_type'])
@Index(['version'])
export class UserConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @Column({
    type: 'enum',
    enum: ConsentType,
  })
  consent_type: ConsentType;

  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  version_hash: string;

  @Column({ type: 'varchar', length: 45 })
  ip_address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_id: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn()
  accepted_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  revoked_at: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
