/**
 * OTP Token Entity
 * 
 * Stores OTP codes for phone verification with security metadata.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('otp_tokens')
export class OTPToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  @Index('idx_otp_phone_number')
  phone_number: string;

  @Column({ type: 'varchar', length: 64 })
  code_hash: string;

  @Column({ type: 'varchar', length: 20 })
  channel: string; // 'whatsapp' | 'sms'

  @Column({ type: 'varchar', length: 20 })
  purpose: string; // 'registration' | 'login' | 'verification'

  @Column({ type: 'timestamp' })
  @Index('idx_otp_expires_at')
  expires_at: Date;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'boolean', default: false })
  is_used: boolean;

  @Column({ type: 'timestamp', nullable: true })
  used_at: Date | null;

  @Column({ type: 'varchar', nullable: true })
  ip_address: string | null;

  @CreateDateColumn()
  created_at: Date;
}
