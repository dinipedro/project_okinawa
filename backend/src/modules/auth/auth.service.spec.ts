import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { Profile } from '../users/entities/profile.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { UserCredential } from '../identity/entities/user-credential.entity';
import { UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import { EmailService } from '@/common/services/email.service';
import { TokenBlacklistService } from '../identity/services/token-blacklist.service';
import { AuditLogService } from '../identity/services/audit-log.service';
import { CredentialService } from '../identity/services/credential.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let profileRepository: Repository<Profile>;
  let resetTokenRepository: Repository<PasswordResetToken>;
  let emailService: EmailService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '1234567890',
    avatar_url: null,
    is_active: true,
    preferences: {
      password: 'hashedPassword123',
    },
    roles: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockResetTokenRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockEmailService = {
    sendPasswordResetEmail: jest.fn(),
    sendPasswordChangedEmail: jest.fn(),
  };

  const mockCredentialRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  const mockTokenBlacklistService = {
    addToBlacklist: jest.fn(),
    isBlacklisted: jest.fn().mockResolvedValue(false),
    isTokenBlacklisted: jest.fn().mockResolvedValue(false),
    blacklistToken: jest.fn().mockResolvedValue(undefined),
  };

  const mockAuditLogService = {
    log: jest.fn().mockResolvedValue(undefined),
    logFailedLogin: jest.fn().mockResolvedValue(undefined),
    logSuccessfulLogin: jest.fn().mockResolvedValue(undefined),
    logPasswordChange: jest.fn().mockResolvedValue(undefined),
    logPasswordReset: jest.fn().mockResolvedValue(undefined),
    logLogin: jest.fn().mockResolvedValue(undefined),
    logLogout: jest.fn().mockResolvedValue(undefined),
    logTokenRefresh: jest.fn().mockResolvedValue(undefined),
  };

  const mockCredentialService = {
    createCredential: jest.fn().mockResolvedValue({ id: 'cred-1' }),
    validateCredential: jest.fn().mockResolvedValue(true),
    updatePassword: jest.fn().mockResolvedValue(undefined),
    getCredential: jest.fn().mockResolvedValue({ password_hash: 'hashedPassword123' }),
    verifyPassword: jest.fn().mockResolvedValue({ valid: true, needsUpgrade: false }),
    changePassword: jest.fn().mockResolvedValue({ success: true }),
    hasPassword: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: mockResetTokenRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: getRepositoryToken(UserCredential),
          useValue: mockCredentialRepository,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
        {
          provide: CredentialService,
          useValue: mockCredentialService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    profileRepository = module.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
    resetTokenRepository = module.get<Repository<PasswordResetToken>>(
      getRepositoryToken(PasswordResetToken),
    );
    emailService = module.get<EmailService>(EmailService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        full_name: 'New User',
      };

      mockProfileRepository.findOne.mockResolvedValue(null);
      mockProfileRepository.create.mockReturnValue({
        ...mockUser,
        email: registerDto.email,
        full_name: registerDto.full_name,
      });
      mockProfileRepository.save.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        full_name: registerDto.full_name,
      });
      mockJwtService.sign.mockReturnValue('mock-access-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        full_name: 'Existing User',
      };

      mockProfileRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockProfileRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const userWithPassword = {
        ...mockUser,
        preferences: { password: 'hashedPassword123' },
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockProfileRepository.findOne.mockResolvedValue(userWithPassword);
      mockJwtService.sign.mockReturnValue('mock-access-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException with invalid email', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword!',
      };

      const userWithPassword = {
        ...mockUser,
        preferences: { password: 'hashedPassword123' },
      };

      mockProfileRepository.findOne.mockResolvedValue(userWithPassword);
      mockCredentialService.verifyPassword.mockResolvedValueOnce({ valid: false, reason: 'invalid_password', attemptsRemaining: 4 });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if account is inactive', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const inactiveUser = {
        ...mockUser,
        is_active: false,
        preferences: { password: 'hashedPassword123' },
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockProfileRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should create a password reset token and send email', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        email: 'test@example.com',
      };

      const mockToken = {
        id: '1',
        user_id: mockUser.id,
        token: 'reset_token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        is_used: false,
        created_at: new Date(),
      };

      mockProfileRepository.findOne.mockResolvedValue(mockUser);
      mockResetTokenRepository.update.mockResolvedValue({ affected: 0 });
      mockResetTokenRepository.create.mockReturnValue(mockToken);
      mockResetTokenRepository.save.mockResolvedValue(mockToken);
      mockResetTokenRepository.delete.mockResolvedValue({ affected: 0 });
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toHaveProperty('message');
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { email: resetPasswordDto.email },
      });
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should not throw error if email does not exist (security)', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        email: 'nonexistent@example.com',
      };

      mockProfileRepository.findOne.mockResolvedValue(null);

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toHaveProperty('message');
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('confirmResetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const confirmResetDto: ConfirmResetPasswordDto = {
        token: 'valid_token',
        new_password: 'NewPassword123!',
      };

      const mockToken = {
        id: '1',
        user_id: mockUser.id,
        token: 'valid_token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        is_used: false,
      };

      mockResetTokenRepository.findOne.mockResolvedValue(mockToken);
      mockProfileRepository.findOne.mockResolvedValue(mockUser);
      mockResetTokenRepository.save.mockResolvedValue({ ...mockToken, is_used: true });
      mockCredentialService.changePassword.mockResolvedValueOnce({ success: true });
      mockEmailService.sendPasswordChangedEmail.mockResolvedValue(undefined);

      const result = await service.confirmResetPassword(confirmResetDto);

      expect(result).toHaveProperty('success', true);
      expect(mockCredentialService.changePassword).toHaveBeenCalled();
      expect(mockEmailService.sendPasswordChangedEmail).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user with roles', async () => {
      mockProfileRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser(mockUser.id);

      expect(result).toHaveProperty('id', mockUser.id);
      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).toHaveProperty('full_name', mockUser.full_name);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ['roles', 'roles.restaurant'],
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.getCurrentUser('999')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login - additional cases', () => {
    it('should throw UnauthorizedException if user has no password', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const userNoPassword = {
        ...mockUser,
        preferences: {},
      };

      mockProfileRepository.findOne.mockResolvedValue(userNoPassword);
      mockCredentialService.verifyPassword.mockResolvedValueOnce({ valid: false, reason: 'no_credential' });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('confirmResetPassword - additional cases', () => {
    it('should throw BadRequestException if token is expired', async () => {
      const confirmResetDto: ConfirmResetPasswordDto = {
        token: 'expired_token',
        new_password: 'NewPassword123!',
      };

      const expiredToken = {
        id: '1',
        user_id: mockUser.id,
        token: 'expired_token',
        expires_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        is_used: false,
      };

      mockResetTokenRepository.findOne.mockResolvedValue(expiredToken);

      await expect(service.confirmResetPassword(confirmResetDto)).rejects.toThrow(
        'Reset token has expired',
      );
    });

    it('should throw BadRequestException if token is invalid', async () => {
      const confirmResetDto: ConfirmResetPasswordDto = {
        token: 'invalid_token',
        new_password: 'NewPassword123!',
      };

      mockResetTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.confirmResetPassword(confirmResetDto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });

    it('should throw NotFoundException if user not found for reset', async () => {
      const confirmResetDto: ConfirmResetPasswordDto = {
        token: 'valid_token',
        new_password: 'NewPassword123!',
      };

      const mockToken = {
        id: '1',
        user_id: 'nonexistent_user',
        token: 'valid_token',
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        is_used: false,
      };

      mockResetTokenRepository.findOne.mockResolvedValue(mockToken);
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.confirmResetPassword(confirmResetDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token with valid refresh token', async () => {
      const validRefreshToken = 'valid_refresh_token';
      const payload = {
        sub: mockUser.id,
        email: mockUser.email,
        jti: 'test-jti-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJwtService.decode.mockReturnValue(payload);
      mockJwtService.verify.mockReturnValue(payload);
      mockProfileRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new_access_token');

      const result = await service.refreshToken(validRefreshToken);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(mockJwtService.decode).toHaveBeenCalledWith(validRefreshToken);
      expect(mockTokenBlacklistService.isTokenBlacklisted).toHaveBeenCalledWith('test-jti-123');
    });

    it('should throw UnauthorizedException if user not found during refresh', async () => {
      const validRefreshToken = 'valid_refresh_token';
      const payload = {
        sub: '999',
        email: 'test@example.com',
        jti: 'test-jti-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJwtService.decode.mockReturnValue(payload);
      mockJwtService.verify.mockReturnValue(payload);
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(validRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if account is inactive during refresh', async () => {
      const validRefreshToken = 'valid_refresh_token';
      const payload = {
        sub: mockUser.id,
        email: mockUser.email,
        jti: 'test-jti-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const inactiveUser = {
        ...mockUser,
        is_active: false,
      };

      mockJwtService.decode.mockReturnValue(payload);
      mockJwtService.verify.mockReturnValue(payload);
      mockProfileRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(service.refreshToken(validRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if refresh token is invalid (no JTI)', async () => {
      const invalidRefreshToken = 'invalid_refresh_token';

      // Token without JTI
      mockJwtService.decode.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
      });

      await expect(service.refreshToken(invalidRefreshToken)).rejects.toThrow(
        'Invalid token format',
      );
    });

    it('should throw UnauthorizedException if token is blacklisted', async () => {
      const blacklistedToken = 'blacklisted_refresh_token';
      const payload = {
        sub: mockUser.id,
        email: mockUser.email,
        jti: 'blacklisted-jti',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJwtService.decode.mockReturnValue(payload);
      mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValueOnce(true);

      await expect(service.refreshToken(blacklistedToken)).rejects.toThrow(
        'Token has been revoked',
      );
    });
  });

  describe('update', () => {
    it('should successfully update password', async () => {
      const updateDto = {
        current_password: 'OldPassword123!',
        password: 'NewPassword123!',
      };

      const userWithPassword = {
        ...mockUser,
        preferences: { password: 'hashedOldPassword' },
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockProfileRepository.findOne.mockResolvedValue(userWithPassword);
      mockProfileRepository.save.mockResolvedValue(userWithPassword);
      mockEmailService.sendPasswordChangedEmail.mockResolvedValue(undefined);

      const result = await service.update(mockUser.id, updateDto);

      expect(result).toHaveProperty('message', 'Authentication details updated successfully');
      expect(mockEmailService.sendPasswordChangedEmail).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const updateDto = {
        password: 'NewPassword123!',
      };

      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if current password not provided', async () => {
      const updateDto = {
        password: 'NewPassword123!',
      };

      mockProfileRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.update(mockUser.id, updateDto)).rejects.toThrow(
        'Current password is required to change password',
      );
    });

    it('should throw UnauthorizedException if no password is set', async () => {
      const updateDto = {
        current_password: 'OldPassword123!',
        password: 'NewPassword123!',
      };

      const userNoPassword = {
        ...mockUser,
        preferences: {},
      };

      mockProfileRepository.findOne.mockResolvedValue(userNoPassword);
      mockCredentialService.verifyPassword.mockResolvedValueOnce({ valid: false, reason: 'no_credential' });
      // No legacy password in preferences, so bcrypt.compare won't be called

      await expect(service.update(mockUser.id, updateDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      const updateDto = {
        current_password: 'WrongPassword!',
        password: 'NewPassword123!',
      };

      const userWithPassword = {
        ...mockUser,
        preferences: { password: 'hashedOldPassword' },
      };

      mockProfileRepository.findOne.mockResolvedValue(userWithPassword);
      mockCredentialService.verifyPassword.mockResolvedValueOnce({ valid: false, reason: 'invalid_password' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.update(mockUser.id, updateDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should successfully update email', async () => {
      const updateDto = {
        email: 'newemail@example.com',
      };

      mockProfileRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockProfileRepository.save.mockResolvedValue({
        ...mockUser,
        email: updateDto.email,
      });

      const result = await service.update(mockUser.id, updateDto);

      expect(result).toHaveProperty('email', updateDto.email);
      expect(result).toHaveProperty('message', 'Authentication details updated successfully');
    });

    it('should throw ConflictException if email already in use', async () => {
      const updateDto = {
        email: 'existing@example.com',
      };

      const existingUser = {
        id: 'different_id',
        email: 'existing@example.com',
      };

      mockProfileRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(existingUser);

      await expect(service.update(mockUser.id, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should call update method', async () => {
      const updateDto = {
        email: 'newemail@example.com',
      };

      mockProfileRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockProfileRepository.save.mockResolvedValue({
        ...mockUser,
        email: updateDto.email,
      });

      const result = await service.updateProfile(mockUser.id, updateDto);

      expect(result).toHaveProperty('email', updateDto.email);
    });
  });
});
