/**
 * Biometric Token Entity
 * 
 * Stores biometric authentication tokens for quick device login.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('biometric_tokens')
export class BiometricToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index('idx_biometric_user_id')
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index('idx_biometric_device_id')
  device_id: string;

  @Column({ type: 'varchar', length: 64 })
  @Index('idx_biometric_token_hash')
  token_hash: string;

  @Column({ type: 'varchar', length: 20 })
  biometric_type: string; // 'face_id' | 'touch_id' | 'fingerprint'

  @Column({ type: 'text', nullable: true })
  public_key: string | null; // For asymmetric verification

  @Column({ type: 'timestamp' })
  @Index('idx_biometric_expires_at')
  expires_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  device_info: {
    platform: string;
    model?: string;
    os_version?: string;
  } | null;

  @Column({ type: 'boolean', default: false })
  is_revoked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  revoked_at: Date | null;

  @Column({ type: 'varchar', nullable: true })
  revoke_reason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  last_used_at: Date | null;

  @Column({ type: 'varchar', nullable: true })
  ip_address: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
