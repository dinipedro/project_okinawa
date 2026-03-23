import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UserCredential } from '../entities/user-credential.entity';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class MfaService {
  private readonly TOTP_WINDOW = 1; // Allow 1 step before/after current
  private readonly TOTP_STEP = 30; // 30 seconds per TOTP step

  constructor(
    @InjectRepository(UserCredential)
    private credentialRepository: Repository<UserCredential>,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Generate MFA secret and backup codes for user
   */
  async setupMfa(userId: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  }> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (!credential) {
      throw new BadRequestException('User credentials not found');
    }

    if (credential.mfa_enabled) {
      throw new BadRequestException('MFA is already enabled');
    }

    // Generate new secret (base32 encoded)
    const secret = this.generateSecret();
    const backupCodes = this.generateBackupCodes(10);

    // Store pending MFA setup (not yet enabled)
    credential.mfa_secret = secret;
    credential.mfa_backup_codes = backupCodes.map(code =>
      crypto.createHash('sha256').update(code).digest('hex')
    );
    await this.credentialRepository.save(credential);

    // Generate QR code URL for authenticator apps
    const qrCodeUrl = this.generateQrCodeUrl(secret, userId);

    return {
      secret,
      qrCodeUrl,
      backupCodes,
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
  ): Promise<{ success: boolean; message: string }> {
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

    // Log MFA enable
    await this.auditLogService.log({
      userId,
      action: 'mfa_enabled',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      success: true,
    });

    return {
      success: true,
      message: 'MFA enabled successfully',
    };
  }

  /**
   * Disable MFA
   */
  async disableMfa(
    userId: string,
    password: string,
    totpCode: string,
    validatePassword: (userId: string, password: string) => Promise<boolean>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string }> {
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
      throw new UnauthorizedException('Invalid TOTP code');
    }

    // Disable MFA
    credential.mfa_enabled = false;
    credential.mfa_secret = null;
    credential.mfa_backup_codes = [];
    await this.credentialRepository.save(credential);

    // Log MFA disable
    await this.auditLogService.log({
      userId,
      action: 'mfa_disabled',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      success: true,
    });

    return {
      success: true,
      message: 'MFA disabled successfully',
    };
  }

  /**
   * Verify TOTP code during login
   */
  async verifyMfaCode(userId: string, totpCode: string): Promise<boolean> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (!credential || !credential.mfa_enabled || !credential.mfa_secret) {
      return true; // MFA not enabled, skip verification
    }

    // Try TOTP first
    if (this.verifyTotp(credential.mfa_secret, totpCode)) {
      return true;
    }

    // Try backup codes
    if (credential.mfa_backup_codes && credential.mfa_backup_codes.length > 0) {
      const hashedCode = crypto.createHash('sha256').update(totpCode).digest('hex');
      const backupIndex = credential.mfa_backup_codes.indexOf(hashedCode);

      if (backupIndex !== -1) {
        // Remove used backup code
        credential.mfa_backup_codes.splice(backupIndex, 1);
        await this.credentialRepository.save(credential);
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user has MFA enabled
   */
  async isMfaEnabled(userId: string): Promise<boolean> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
      select: ['mfa_enabled'],
    });
    return credential?.mfa_enabled ?? false;
  }

  /**
   * Generate backup codes for account recovery
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

    const backupCodes = this.generateBackupCodes(10);
    credential.mfa_backup_codes = backupCodes.map(code =>
      crypto.createHash('sha256').update(code).digest('hex')
    );
    await this.credentialRepository.save(credential);

    // Log backup code regeneration
    await this.auditLogService.log({
      userId,
      action: 'mfa_backup_codes_regenerated',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
      success: true,
    });

    return backupCodes;
  }

  // ============ Private Helper Methods ============

  private generateSecret(): string {
    // Generate 20 bytes of random data and encode as base32
    const buffer = crypto.randomBytes(20);
    return this.base32Encode(buffer);
  }

  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  private generateQrCodeUrl(secret: string, userId: string): string {
    const issuer = encodeURIComponent('Okinawa');
    const account = encodeURIComponent(userId);
    return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=${this.TOTP_STEP}`;
  }

  private verifyTotp(secret: string, code: string): boolean {
    const currentTime = Math.floor(Date.now() / 1000);

    // Check current and adjacent time windows
    for (let i = -this.TOTP_WINDOW; i <= this.TOTP_WINDOW; i++) {
      const timeStep = Math.floor(currentTime / this.TOTP_STEP) + i;
      const expectedCode = this.generateTotp(secret, timeStep);

      if (this.secureCompare(code, expectedCode)) {
        return true;
      }
    }

    return false;
  }

  private generateTotp(secret: string, timeStep: number): string {
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(timeStep));

    const decodedSecret = this.base32Decode(secret);
    const hmac = crypto.createHmac('sha1', decodedSecret);
    hmac.update(buffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let value = 0;

    for (const byte of buffer) {
      value = (value << 8) | byte;
      bits += 8;

      while (bits >= 5) {
        bits -= 5;
        result += alphabet[(value >> bits) & 0x1f];
      }
    }

    if (bits > 0) {
      result += alphabet[(value << (5 - bits)) & 0x1f];
    }

    return result;
  }

  private base32Decode(encoded: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes: number[] = [];
    let bits = 0;
    let value = 0;

    for (const char of encoded.toUpperCase()) {
      const index = alphabet.indexOf(char);
      if (index === -1) continue;

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        bits -= 8;
        bytes.push((value >> bits) & 0xff);
      }
    }

    return Buffer.from(bytes);
  }

  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}
