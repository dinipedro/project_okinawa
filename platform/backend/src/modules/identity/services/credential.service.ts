/**
 * CredentialService - Manages user credentials securely
 * Part of Identity Module (AUDIT-010)
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserCredential } from '../entities/user-credential.entity';

export interface PasswordVerificationResult {
  valid: boolean;
  locked: boolean;
  attemptsRemaining: number;
}

export interface PasswordChangeResult {
  success: boolean;
  message: string;
}

@Injectable()
export class CredentialService {
  private readonly SALT_ROUNDS = 12;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 30;
  private readonly PASSWORD_HISTORY_SIZE = 5;

  constructor(
    @InjectRepository(UserCredential)
    private credentialRepository: Repository<UserCredential>,
    private dataSource: DataSource,
  ) {}

  /**
   * Create credentials for a new user
   */
  async createCredential(userId: string, password: string): Promise<UserCredential> {
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    const credential = this.credentialRepository.create({
      user_id: userId,
      password_hash: passwordHash,
      password_changed_at: new Date(),
      password_history: [passwordHash],
    });

    return this.credentialRepository.save(credential);
  }

  /**
   * Verify password and handle failed attempts
   * Uses pessimistic locking to prevent race conditions
   */
  async verifyPassword(
    userId: string,
    password: string,
    ipAddress?: string,
  ): Promise<PasswordVerificationResult> {
    return this.dataSource.transaction(async (manager) => {
      const credential = await manager.findOne(UserCredential, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!credential) {
        return { valid: false, locked: false, attemptsRemaining: 0 };
      }

      // Check if account is locked
      if (credential.locked_until && credential.locked_until > new Date()) {
        return { valid: false, locked: true, attemptsRemaining: 0 };
      }

      // Reset lock if lockout period has passed
      if (credential.locked_until && credential.locked_until <= new Date()) {
        credential.locked_until = null;
        credential.failed_login_attempts = 0;
      }

      const isValid = await bcrypt.compare(password, credential.password_hash);

      if (isValid) {
        await manager.update(
          UserCredential,
          { user_id: userId },
          {
            failed_login_attempts: 0,
            locked_until: null,
            last_login_at: new Date(),
            last_login_ip: ipAddress || null,
          },
        );

        return {
          valid: true,
          locked: false,
          attemptsRemaining: this.MAX_LOGIN_ATTEMPTS,
        };
      }

      // Increment failed attempts
      const newAttempts = credential.failed_login_attempts + 1;
      const shouldLock = newAttempts >= this.MAX_LOGIN_ATTEMPTS;

      let lockUntil: Date | null = null;
      if (shouldLock) {
        lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + this.LOCKOUT_DURATION_MINUTES);
      }

      await manager.update(
        UserCredential,
        { user_id: userId },
        {
          failed_login_attempts: newAttempts,
          locked_until: lockUntil,
        },
      );

      return {
        valid: false,
        locked: shouldLock,
        attemptsRemaining: Math.max(0, this.MAX_LOGIN_ATTEMPTS - newAttempts),
      };
    });
  }

  /**
   * Change password with history check (AUDIT-007)
   */
  async changePassword(
    userId: string,
    newPassword: string,
  ): Promise<PasswordChangeResult> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (!credential) {
      throw new BadRequestException('User credentials not found');
    }

    // Check if new password was used recently
    if (credential.password_history) {
      for (const oldHash of credential.password_history) {
        const matches = await bcrypt.compare(newPassword, oldHash);
        if (matches) {
          return {
            success: false,
            message: `Cannot reuse any of your last ${this.PASSWORD_HISTORY_SIZE} passwords`,
          };
        }
      }
    }

    const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password history
    const history = credential.password_history || [];
    history.unshift(newPasswordHash);
    if (history.length > this.PASSWORD_HISTORY_SIZE) {
      history.pop();
    }

    credential.password_hash = newPasswordHash;
    credential.password_history = history;
    credential.password_changed_at = new Date();
    credential.failed_login_attempts = 0;
    credential.locked_until = null;

    await this.credentialRepository.save(credential);

    return { success: true, message: 'Password changed successfully' };
  }

  /**
   * Get credential by user ID
   */
  async getCredential(userId: string): Promise<UserCredential | null> {
    return this.credentialRepository.findOne({
      where: { user_id: userId },
    });
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (!credential) return false;
    return credential.locked_until !== null && credential.locked_until > new Date();
  }

  /**
   * Unlock account manually (admin function)
   */
  async unlockAccount(userId: string): Promise<void> {
    await this.credentialRepository.update(
      { user_id: userId },
      {
        locked_until: null,
        failed_login_attempts: 0,
      },
    );
  }

  /**
   * Get days since last password change
   */
  async getDaysSincePasswordChange(userId: string): Promise<number | null> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (!credential || !credential.password_changed_at) {
      return null;
    }

    const now = new Date();
    const diff = now.getTime() - credential.password_changed_at.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Migrate password from preferences to credential table
   */
  async migrateFromPreferences(userId: string, passwordHash: string): Promise<void> {
    const existing = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (existing) return;

    const credential = this.credentialRepository.create({
      user_id: userId,
      password_hash: passwordHash,
      password_changed_at: new Date(),
      password_history: [passwordHash],
    });

    await this.credentialRepository.save(credential);
  }
}
