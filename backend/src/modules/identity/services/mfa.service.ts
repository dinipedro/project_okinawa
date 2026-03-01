/**
 * MfaService - Multi-Factor Authentication Service
 * Handles TOTP-based MFA setup, verification, and backup codes
 *
 * Part of Identity Module (AUDIT-010)
 */

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UserCredential } from '../entities/user-credential.entity';
import { AuditLogService } from './audit-log.service';
import { AuditAction } from '../entities/audit-log.entity';

// TOTP configuration
const TOTP_CONFIG = {
  DIGITS: 6,
  PERIOD: 30, // seconds
  ALGORITHM: 'SHA1',
  ISSUER: 'Okinawa',
};

@Injectable()
export class MfaService {
  constructor(
    @InjectRepository(UserCredential)
    private credentialRepository: Repository<UserCredential>,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Generate MFA secret and QR code URL
   */
  async setupMfa(userId: string): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (!credential) {
      throw new BadRequestException('User credentials not found');
    }

    if (credential.mfa_enabled) {
      throw new BadRequestException('MFA is already enabled');
    }

    // Generate secret
    const secret = this.generateSecret();

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Store secret temporarily (not enabled yet)
    credential.mfa_secret = secret;
    credential.mfa_backup_codes = backupCodes.map(code => this.hashBackupCode(code));
    await this.credentialRepository.save(credential);

    // Generate QR code URL
    const qrCodeUrl = this.generateQrCodeUrl(secret, userId);

    return {
      secret,
      qrCodeUrl,
      backupCodes, // Return plain codes only on setup
    };
  }

  /**
   * Enable MFA after verifying TOTP code
   */
  async enableMfa(
    userId: string,
    totpCode: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; backupCodes: string[] }> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (!credential || !credential.mfa_secret) {
      throw new BadRequestException('MFA setup not initiated');
    }

    if (credential.mfa_enabled) {
      throw new BadRequestException('MFA is already enabled');
    }

    // Verify TOTP code
    const isValid = this.verifyTotp(credential.mfa_secret, totpCode);
    if (!isValid) {
      throw new UnauthorizedException('Invalid TOTP code');
    }

    // Enable MFA
    credential.mfa_enabled = true;
    await this.credentialRepository.save(credential);

    // Log the action
    await this.auditLogService.log({
      userId,
      action: AuditAction.MFA_ENABLED,
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      success: true,
    });

    // Generate new backup codes for user to save
    const backupCodes = this.generateBackupCodes();
    credential.mfa_backup_codes = backupCodes.map(code => this.hashBackupCode(code));
    await this.credentialRepository.save(credential);

    return { success: true, backupCodes };
  }

  /**
   * Disable MFA (requires password and TOTP verification)
   */
  async disableMfa(
    userId: string,
    password: string,
    totpCode: string,
    validatePassword: (userId: string, password: string) => Promise<boolean>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean }> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (!credential || !credential.mfa_enabled) {
      throw new BadRequestException('MFA is not enabled');
    }

    // Verify password
    const isPasswordValid = await validatePassword(userId, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Verify TOTP code
    const isValid = this.verifyTotp(credential.mfa_secret!, totpCode);
    if (!isValid) {
      // Try backup codes
      const backupValid = await this.verifyBackupCode(userId, totpCode);
      if (!backupValid) {
        throw new UnauthorizedException('Invalid TOTP or backup code');
      }
    }

    // Disable MFA
    credential.mfa_enabled = false;
    credential.mfa_secret = null;
    credential.mfa_backup_codes = null;
    await this.credentialRepository.save(credential);

    // Log the action
    await this.auditLogService.log({
      userId,
      action: AuditAction.MFA_DISABLED,
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      success: true,
    });

    return { success: true };
  }

  /**
   * Verify MFA code (TOTP or backup code)
   */
  async verifyMfaCode(userId: string, code: string): Promise<boolean> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (!credential || !credential.mfa_enabled || !credential.mfa_secret) {
      return false;
    }

    // Try TOTP first
    if (this.verifyTotp(credential.mfa_secret, code)) {
      return true;
    }

    // Try backup code
    return this.verifyBackupCode(userId, code);
  }

  /**
   * Check if MFA is enabled for user
   */
  async isMfaEnabled(userId: string): Promise<boolean> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    return credential?.mfa_enabled ?? false;
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(
    userId: string,
    totpCode: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string[]> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (!credential || !credential.mfa_enabled) {
      throw new BadRequestException('MFA is not enabled');
    }

    // Verify TOTP code
    const isValid = this.verifyTotp(credential.mfa_secret!, totpCode);
    if (!isValid) {
      throw new UnauthorizedException('Invalid TOTP code');
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes();
    credential.mfa_backup_codes = backupCodes.map(code => this.hashBackupCode(code));
    await this.credentialRepository.save(credential);

    // Log the action
    await this.auditLogService.log({
      userId,
      action: AuditAction.MFA_BACKUP_REGENERATED,
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      success: true,
    });

    return backupCodes;
  }

  // ============ Private Helper Methods ============

  /**
   * Generate a secure MFA secret
   */
  private generateSecret(): string {
    const buffer = crypto.randomBytes(20);
    return this.base32Encode(buffer);
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }

  /**
   * Hash a backup code for storage
   */
  private hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code.replace('-', '')).digest('hex');
  }

  /**
   * Verify a backup code
   */
  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (!credential || !credential.mfa_backup_codes) {
      return false;
    }

    const hashedCode = this.hashBackupCode(code);
    const index = credential.mfa_backup_codes.indexOf(hashedCode);

    if (index === -1) {
      return false;
    }

    // Remove used backup code
    credential.mfa_backup_codes.splice(index, 1);
    await this.credentialRepository.save(credential);

    return true;
  }

  /**
   * Generate QR code URL for authenticator apps
   */
  private generateQrCodeUrl(secret: string, userId: string): string {
    const issuer = encodeURIComponent(TOTP_CONFIG.ISSUER);
    const account = encodeURIComponent(userId);
    return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=${TOTP_CONFIG.ALGORITHM}&digits=${TOTP_CONFIG.DIGITS}&period=${TOTP_CONFIG.PERIOD}`;
  }

  /**
   * Verify TOTP code
   */
  private verifyTotp(secret: string, code: string, window: number = 1): boolean {
    const now = Math.floor(Date.now() / 1000);

    for (let i = -window; i <= window; i++) {
      const counter = Math.floor((now + i * TOTP_CONFIG.PERIOD) / TOTP_CONFIG.PERIOD);
      const expectedCode = this.generateTotp(secret, counter);
      if (expectedCode === code) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate TOTP code for a given counter
   */
  private generateTotp(secret: string, counter: number): string {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(counter));

    const key = this.base32Decode(secret);
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(buffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const code =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    return (code % Math.pow(10, TOTP_CONFIG.DIGITS)).toString().padStart(TOTP_CONFIG.DIGITS, '0');
  }

  /**
   * Base32 encode
   */
  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let value = 0;

    for (const byte of buffer) {
      value = (value << 8) | byte;
      bits += 8;

      while (bits >= 5) {
        result += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      result += alphabet[(value << (5 - bits)) & 31];
    }

    return result;
  }

  /**
   * Base32 decode
   */
  private base32Decode(encoded: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const result: number[] = [];
    let bits = 0;
    let value = 0;

    for (const char of encoded.toUpperCase()) {
      const index = alphabet.indexOf(char);
      if (index === -1) continue;

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        result.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(result);
  }
}
