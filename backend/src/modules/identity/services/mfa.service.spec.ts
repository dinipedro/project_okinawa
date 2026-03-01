/**
 * MfaService Tests
 * Tests for Multi-Factor Authentication including TOTP setup,
 * verification, and backup codes
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { AuditLogService } from './audit-log.service';
import { UserCredential } from '../entities/user-credential.entity';
import { AuditAction } from '../entities/audit-log.entity';

describe('MfaService', () => {
  let service: MfaService;
  let credentialRepository: jest.Mocked<Repository<UserCredential>>;
  let auditLogService: jest.Mocked<AuditLogService>;

  const mockCredential: Partial<UserCredential> = {
    id: 'cred-123',
    user_id: 'user-123',
    password_hash: 'hashed_password',
    mfa_enabled: false,
    mfa_secret: null,
    mfa_backup_codes: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MfaService,
        {
          provide: getRepositoryToken(UserCredential),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: AuditLogService,
          useValue: {
            log: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<MfaService>(MfaService);
    credentialRepository = module.get(getRepositoryToken(UserCredential));
    auditLogService = module.get(AuditLogService);

    jest.clearAllMocks();
  });

  describe('setupMfa', () => {
    it('should generate secret, QR code URL, and backup codes', async () => {
      credentialRepository.findOne.mockResolvedValue(mockCredential as UserCredential);
      credentialRepository.save.mockResolvedValue({} as UserCredential);

      const result = await service.setupMfa('user-123');

      expect(result.secret).toBeDefined();
      expect(result.secret.length).toBeGreaterThan(0);
      expect(result.qrCodeUrl).toContain('otpauth://totp/');
      expect(result.qrCodeUrl).toContain('user-123');
      expect(result.backupCodes).toHaveLength(10);
      expect(result.backupCodes[0]).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/);
    });

    it('should throw if user credentials not found', async () => {
      credentialRepository.findOne.mockResolvedValue(null);

      await expect(service.setupMfa('nonexistent')).rejects.toThrow(BadRequestException);
    });

    it('should throw if MFA is already enabled', async () => {
      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        mfa_enabled: true,
      } as UserCredential);

      await expect(service.setupMfa('user-123')).rejects.toThrow(BadRequestException);
    });

    it('should store hashed backup codes', async () => {
      credentialRepository.findOne.mockResolvedValue(mockCredential as UserCredential);
      credentialRepository.save.mockResolvedValue({} as UserCredential);

      await service.setupMfa('user-123');

      expect(credentialRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          mfa_secret: expect.any(String),
          mfa_backup_codes: expect.arrayContaining([expect.any(String)]),
        }),
      );

      // Verify backup codes are hashed (64 char hex)
      const savedCall = credentialRepository.save.mock.calls[0][0] as UserCredential;
      expect(savedCall.mfa_backup_codes?.[0]).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('enableMfa', () => {
    beforeEach(() => {
      // Mock credential with secret setup
      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        mfa_secret: 'JBSWY3DPEHPK3PXP', // Valid base32 secret
      } as UserCredential);
    });

    it('should throw if MFA setup not initiated', async () => {
      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        mfa_secret: null,
      } as UserCredential);

      await expect(service.enableMfa('user-123', '123456')).rejects.toThrow(BadRequestException);
    });

    it('should throw if MFA is already enabled', async () => {
      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        mfa_enabled: true,
        mfa_secret: 'JBSWY3DPEHPK3PXP',
      } as UserCredential);

      await expect(service.enableMfa('user-123', '123456')).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException for invalid TOTP code', async () => {
      await expect(service.enableMfa('user-123', '000000')).rejects.toThrow(UnauthorizedException);
    });

    it('should log MFA enabled action on success', async () => {
      // We need to generate a valid TOTP code for the test
      // For simplicity, we'll mock the private verifyTotp method
      const mockVerifyTotp = jest.spyOn(service as any, 'verifyTotp').mockReturnValue(true);
      credentialRepository.save.mockResolvedValue({} as UserCredential);

      const result = await service.enableMfa('user-123', '123456', '192.168.1.1', 'Mozilla/5.0');

      expect(result.success).toBe(true);
      expect(result.backupCodes).toHaveLength(10);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'user-123',
        action: AuditAction.MFA_ENABLED,
        entityType: 'user',
        entityId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        success: true,
      });

      mockVerifyTotp.mockRestore();
    });
  });

  describe('disableMfa', () => {
    const validatePassword = jest.fn();

    beforeEach(() => {
      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        mfa_enabled: true,
        mfa_secret: 'JBSWY3DPEHPK3PXP',
        mfa_backup_codes: [],
      } as UserCredential);
      validatePassword.mockResolvedValue(true);
    });

    it('should throw if MFA is not enabled', async () => {
      credentialRepository.findOne.mockResolvedValue(mockCredential as UserCredential);

      await expect(
        service.disableMfa('user-123', 'password', '123456', validatePassword),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if password is invalid', async () => {
      validatePassword.mockResolvedValue(false);

      await expect(
        service.disableMfa('user-123', 'wrong_password', '123456', validatePassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if TOTP and backup code are invalid', async () => {
      await expect(
        service.disableMfa('user-123', 'password', '000000', validatePassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should disable MFA and log action on success', async () => {
      const mockVerifyTotp = jest.spyOn(service as any, 'verifyTotp').mockReturnValue(true);
      credentialRepository.save.mockResolvedValue({} as UserCredential);

      const result = await service.disableMfa(
        'user-123',
        'password',
        '123456',
        validatePassword,
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(result.success).toBe(true);
      expect(credentialRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          mfa_enabled: false,
          mfa_secret: null,
          mfa_backup_codes: null,
        }),
      );
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'user-123',
        action: AuditAction.MFA_DISABLED,
        entityType: 'user',
        entityId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        success: true,
      });

      mockVerifyTotp.mockRestore();
    });
  });

  describe('verifyMfaCode', () => {
    it('should return false if MFA is not enabled', async () => {
      credentialRepository.findOne.mockResolvedValue(mockCredential as UserCredential);

      const result = await service.verifyMfaCode('user-123', '123456');

      expect(result).toBe(false);
    });

    it('should return false if credential not found', async () => {
      credentialRepository.findOne.mockResolvedValue(null);

      const result = await service.verifyMfaCode('nonexistent', '123456');

      expect(result).toBe(false);
    });

    it('should return true for valid TOTP code', async () => {
      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        mfa_enabled: true,
        mfa_secret: 'JBSWY3DPEHPK3PXP',
      } as UserCredential);

      const mockVerifyTotp = jest.spyOn(service as any, 'verifyTotp').mockReturnValue(true);

      const result = await service.verifyMfaCode('user-123', '123456');

      expect(result).toBe(true);
      mockVerifyTotp.mockRestore();
    });

    it('should return true for valid backup code and remove it', async () => {
      const hashedCode = 'a'.repeat(64); // Mock hashed backup code
      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        mfa_enabled: true,
        mfa_secret: 'JBSWY3DPEHPK3PXP',
        mfa_backup_codes: [hashedCode],
      } as UserCredential);
      credentialRepository.save.mockResolvedValue({} as UserCredential);

      const mockVerifyTotp = jest.spyOn(service as any, 'verifyTotp').mockReturnValue(false);
      const mockHashCode = jest.spyOn(service as any, 'hashBackupCode').mockReturnValue(hashedCode);

      const result = await service.verifyMfaCode('user-123', 'ABCD-EFGH');

      expect(result).toBe(true);
      expect(credentialRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          mfa_backup_codes: [],
        }),
      );

      mockVerifyTotp.mockRestore();
      mockHashCode.mockRestore();
    });
  });

  describe('isMfaEnabled', () => {
    it('should return true if MFA is enabled', async () => {
      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        mfa_enabled: true,
      } as UserCredential);

      const result = await service.isMfaEnabled('user-123');

      expect(result).toBe(true);
    });

    it('should return false if MFA is not enabled', async () => {
      credentialRepository.findOne.mockResolvedValue(mockCredential as UserCredential);

      const result = await service.isMfaEnabled('user-123');

      expect(result).toBe(false);
    });

    it('should return false if credential not found', async () => {
      credentialRepository.findOne.mockResolvedValue(null);

      const result = await service.isMfaEnabled('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should generate new backup codes and log action', async () => {
      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        mfa_enabled: true,
        mfa_secret: 'JBSWY3DPEHPK3PXP',
      } as UserCredential);
      credentialRepository.save.mockResolvedValue({} as UserCredential);

      const mockVerifyTotp = jest.spyOn(service as any, 'verifyTotp').mockReturnValue(true);

      const result = await service.regenerateBackupCodes('user-123', '123456', '192.168.1.1');

      expect(result).toHaveLength(10);
      expect(result[0]).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/);
      expect(auditLogService.log).toHaveBeenCalledWith({
        userId: 'user-123',
        action: AuditAction.MFA_BACKUP_REGENERATED,
        entityType: 'user',
        entityId: 'user-123',
        ipAddress: '192.168.1.1',
        userAgent: undefined,
        success: true,
      });

      mockVerifyTotp.mockRestore();
    });

    it('should throw if MFA is not enabled', async () => {
      credentialRepository.findOne.mockResolvedValue(mockCredential as UserCredential);

      await expect(service.regenerateBackupCodes('user-123', '123456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw for invalid TOTP code', async () => {
      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        mfa_enabled: true,
        mfa_secret: 'JBSWY3DPEHPK3PXP',
      } as UserCredential);

      await expect(service.regenerateBackupCodes('user-123', '000000')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('TOTP generation and verification', () => {
    it('should generate valid base32 secret', async () => {
      credentialRepository.findOne.mockResolvedValue(mockCredential as UserCredential);
      credentialRepository.save.mockResolvedValue({} as UserCredential);

      const result = await service.setupMfa('user-123');

      // Base32 alphabet check
      expect(result.secret).toMatch(/^[A-Z2-7]+$/);
      expect(result.secret.length).toBe(32); // 20 bytes = 32 base32 chars
    });

    it('should generate correct QR code URL format', async () => {
      credentialRepository.findOne.mockResolvedValue(mockCredential as UserCredential);
      credentialRepository.save.mockResolvedValue({} as UserCredential);

      const result = await service.setupMfa('user-123');

      expect(result.qrCodeUrl).toMatch(
        /^otpauth:\/\/totp\/Okinawa:user-123\?secret=[A-Z2-7]+&issuer=Okinawa&algorithm=SHA1&digits=6&period=30$/,
      );
    });
  });
});
