/**
 * CredentialService Tests
 * Tests for user credential management including password verification,
 * account locking, and password history
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { UserCredential } from '../entities/user-credential.entity';

// Mock bcrypt
jest.mock('bcrypt');

describe('CredentialService', () => {
  let service: CredentialService;
  let credentialRepository: jest.Mocked<Repository<UserCredential>>;
  let dataSource: jest.Mocked<DataSource>;
  let mockEntityManager: jest.Mocked<EntityManager>;

  const mockCredential: Partial<UserCredential> = {
    id: 'cred-123',
    user_id: 'user-123',
    password_hash: 'hashed_password',
    failed_login_attempts: 0,
    locked_until: null,
    password_changed_at: new Date(),
    password_history: ['old_hash_1', 'old_hash_2'],
    mfa_enabled: false,
    mfa_secret: null,
    mfa_backup_codes: null,
    last_login_at: null,
    last_login_ip: null,
  };

  beforeEach(async () => {
    mockEntityManager = {
      findOne: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialService,
        {
          provide: getRepositoryToken(UserCredential),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((callback) => callback(mockEntityManager)),
          },
        },
      ],
    }).compile();

    service = module.get<CredentialService>(CredentialService);
    credentialRepository = module.get(getRepositoryToken(UserCredential));
    dataSource = module.get(DataSource);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createCredential', () => {
    it('should create a new credential with hashed password', async () => {
      const userId = 'user-123';
      const password = 'SecureP@ss123';
      const hashedPassword = 'bcrypt_hashed_password';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      credentialRepository.create.mockReturnValue({
        user_id: userId,
        password_hash: hashedPassword,
        password_changed_at: expect.any(Date),
        password_history: [hashedPassword],
      } as UserCredential);
      credentialRepository.save.mockResolvedValue({
        id: 'cred-new',
        user_id: userId,
        password_hash: hashedPassword,
      } as UserCredential);

      const result = await service.createCredential(userId, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(credentialRepository.create).toHaveBeenCalledWith({
        user_id: userId,
        password_hash: hashedPassword,
        password_changed_at: expect.any(Date),
        password_history: [hashedPassword],
      });
      expect(result.user_id).toBe(userId);
    });
  });

  describe('verifyPassword', () => {
    it('should return valid=true when password matches', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockCredential as UserCredential);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyPassword('user-123', 'correct_password');

      expect(result.valid).toBe(true);
      expect(result.locked).toBe(false);
      expect(result.attemptsRemaining).toBe(5);
    });

    it('should return valid=false and decrement attempts when password is wrong', async () => {
      mockEntityManager.findOne.mockResolvedValue({
        ...mockCredential,
        failed_login_attempts: 2,
      } as UserCredential);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.verifyPassword('user-123', 'wrong_password');

      expect(result.valid).toBe(false);
      expect(result.locked).toBe(false);
      expect(result.attemptsRemaining).toBe(2); // 5 - 3
      expect(mockEntityManager.update).toHaveBeenCalledWith(
        UserCredential,
        { user_id: 'user-123' },
        expect.objectContaining({
          failed_login_attempts: 3,
        }),
      );
    });

    it('should lock account after max failed attempts', async () => {
      mockEntityManager.findOne.mockResolvedValue({
        ...mockCredential,
        failed_login_attempts: 4,
      } as UserCredential);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.verifyPassword('user-123', 'wrong_password');

      expect(result.valid).toBe(false);
      expect(result.locked).toBe(true);
      expect(result.attemptsRemaining).toBe(0);
      expect(mockEntityManager.update).toHaveBeenCalledWith(
        UserCredential,
        { user_id: 'user-123' },
        expect.objectContaining({
          failed_login_attempts: 5,
          locked_until: expect.any(Date),
        }),
      );
    });

    it('should return locked=true if account is currently locked', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);

      mockEntityManager.findOne.mockResolvedValue({
        ...mockCredential,
        locked_until: futureDate,
      } as UserCredential);

      const result = await service.verifyPassword('user-123', 'any_password');

      expect(result.valid).toBe(false);
      expect(result.locked).toBe(true);
      expect(result.attemptsRemaining).toBe(0);
    });

    it('should reset lock if lockout period has passed', async () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);

      mockEntityManager.findOne.mockResolvedValue({
        ...mockCredential,
        locked_until: pastDate,
        failed_login_attempts: 5,
      } as UserCredential);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyPassword('user-123', 'correct_password');

      expect(result.valid).toBe(true);
      expect(result.locked).toBe(false);
    });

    it('should return valid=false if credential not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      const result = await service.verifyPassword('nonexistent', 'password');

      expect(result.valid).toBe(false);
      expect(result.locked).toBe(false);
      expect(result.attemptsRemaining).toBe(0);
    });

    it('should record IP address on successful login', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockCredential as UserCredential);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.verifyPassword('user-123', 'correct_password', '192.168.1.1');

      expect(mockEntityManager.update).toHaveBeenCalledWith(
        UserCredential,
        { user_id: 'user-123' },
        expect.objectContaining({
          last_login_ip: '192.168.1.1',
        }),
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const newPassword = 'NewSecureP@ss123';
      const newHash = 'new_bcrypt_hash';

      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        password_history: [],
      } as UserCredential);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHash);
      credentialRepository.save.mockResolvedValue({} as UserCredential);

      const result = await service.changePassword('user-123', newPassword);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password changed successfully');
      expect(credentialRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password_hash: newHash,
          password_history: [newHash],
        }),
      );
    });

    it('should reject password if it matches history', async () => {
      const oldPassword = 'OldPassword123';

      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        password_history: ['hash1', 'hash2', 'hash3'],
      } as UserCredential);
      // First match in history
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.changePassword('user-123', oldPassword);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot reuse');
    });

    it('should throw BadRequestException if credential not found', async () => {
      credentialRepository.findOne.mockResolvedValue(null);

      await expect(service.changePassword('nonexistent', 'password')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should maintain password history with max 5 entries', async () => {
      const newHash = 'new_hash';
      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        password_history: ['h1', 'h2', 'h3', 'h4', 'h5'],
      } as UserCredential);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHash);
      credentialRepository.save.mockResolvedValue({} as UserCredential);

      await service.changePassword('user-123', 'NewPassword123');

      expect(credentialRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password_history: [newHash, 'h1', 'h2', 'h3', 'h4'],
        }),
      );
    });
  });

  describe('getCredential', () => {
    it('should return credential for existing user', async () => {
      credentialRepository.findOne.mockResolvedValue(mockCredential as UserCredential);

      const result = await service.getCredential('user-123');

      expect(result).toEqual(mockCredential);
    });

    it('should return null for non-existing user', async () => {
      credentialRepository.findOne.mockResolvedValue(null);

      const result = await service.getCredential('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('isAccountLocked', () => {
    it('should return true if account is locked', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);

      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        locked_until: futureDate,
      } as UserCredential);

      const result = await service.isAccountLocked('user-123');

      expect(result).toBe(true);
    });

    it('should return false if account is not locked', async () => {
      credentialRepository.findOne.mockResolvedValue(mockCredential as UserCredential);

      const result = await service.isAccountLocked('user-123');

      expect(result).toBe(false);
    });

    it('should return false if lock has expired', async () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);

      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        locked_until: pastDate,
      } as UserCredential);

      const result = await service.isAccountLocked('user-123');

      expect(result).toBe(false);
    });

    it('should return false if user not found', async () => {
      credentialRepository.findOne.mockResolvedValue(null);

      const result = await service.isAccountLocked('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('unlockAccount', () => {
    it('should unlock account and reset failed attempts', async () => {
      await service.unlockAccount('user-123');

      expect(credentialRepository.update).toHaveBeenCalledWith(
        { user_id: 'user-123' },
        {
          locked_until: null,
          failed_login_attempts: 0,
        },
      );
    });
  });

  describe('getDaysSincePasswordChange', () => {
    it('should return correct number of days', async () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        password_changed_at: tenDaysAgo,
      } as UserCredential);

      const result = await service.getDaysSincePasswordChange('user-123');

      expect(result).toBe(10);
    });

    it('should return null if credential not found', async () => {
      credentialRepository.findOne.mockResolvedValue(null);

      const result = await service.getDaysSincePasswordChange('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null if password_changed_at is not set', async () => {
      credentialRepository.findOne.mockResolvedValue({
        ...mockCredential,
        password_changed_at: null,
      } as unknown as UserCredential);

      const result = await service.getDaysSincePasswordChange('user-123');

      expect(result).toBeNull();
    });
  });

  describe('migrateFromPreferences', () => {
    it('should create credential if not exists', async () => {
      credentialRepository.findOne.mockResolvedValue(null);
      credentialRepository.create.mockReturnValue({} as UserCredential);
      credentialRepository.save.mockResolvedValue({} as UserCredential);

      await service.migrateFromPreferences('user-123', 'existing_hash');

      expect(credentialRepository.create).toHaveBeenCalledWith({
        user_id: 'user-123',
        password_hash: 'existing_hash',
        password_changed_at: expect.any(Date),
        password_history: ['existing_hash'],
      });
      expect(credentialRepository.save).toHaveBeenCalled();
    });

    it('should not create if credential already exists', async () => {
      credentialRepository.findOne.mockResolvedValue(mockCredential as UserCredential);

      await service.migrateFromPreferences('user-123', 'existing_hash');

      expect(credentialRepository.create).not.toHaveBeenCalled();
      expect(credentialRepository.save).not.toHaveBeenCalled();
    });
  });
});
