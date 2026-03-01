/**
 * TokenBlacklist entity - Stores revoked/blacklisted JWT tokens
 * Used for implementing secure logout and token revocation
 *
 * Part of Identity Module (AUDIT-010)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('token_blacklist')
@Index(['token_jti'])
@Index(['expires_at'])
export class TokenBlacklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  token_jti: string; // JWT ID claim

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 20, default: 'access' })
  token_type: 'access' | 'refresh';

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'varchar', nullable: true })
  revoked_reason: string;

  @Column({ type: 'varchar', nullable: true })
  revoked_ip: string;

  @CreateDateColumn()
  created_at: Date;
}
