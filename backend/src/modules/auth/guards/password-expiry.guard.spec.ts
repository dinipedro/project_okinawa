/**
 * PasswordExpiryGuard Tests
 * Tests for password expiration enforcement
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordExpiryGuard } from './password-expiry.guard';
import { UserCredential } from '../entities/user-credential.entity';

describe('PasswordExpiryGuard', () => {
  let guard: PasswordExpiryGuard;
  let reflector: jest.Mocked<Reflector>;
  let credentialRepository: jest.Mocked<Repository<UserCredential>>;

  const mockExecutionContext = (
    userId: string | null = 'user-123',
    path: string = '/api/orders',
  ): ExecutionContext => {
    const mockResponse = {
      setHeader: jest.fn(),
    };

    const mockRequest = {
      user: userId ? { id: userId } : null,
      path,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  const daysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordExpiryGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserCredential),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PasswordExpiryGuard>(PasswordExpiryGuard);
    reflector = module.get(Reflector);
    credentialRepository = module.get(getRepositoryToken(UserCredential));

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow request if skipPasswordExpiry decorator is present', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      const context = mockExecutionContext();
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(credentialRepository.findOne).not.toHaveBeenCalled();
    });

    it('should allow request if no user in request', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);

      const context = mockExecutionContext(null);
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(credentialRepository.findOne).not.toHaveBeenCalled();
    });

    it('should allow request for allowed routes even with expired password', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);

      const allowedRoutes = [
        '/auth/change-password',
        '/auth/logout',
        '/auth/me',
        '/auth/mfa/status',
      ];

      for (const route of allowedRoutes) {
        const context = mockExecutionContext('user-123', route);
        const result = await guard.canActivate(context);

        expect(result).toBe(true);
      }

      expect(credentialRepository.findOne).not.toHaveBeenCalled();
    });

    it('should allow request if password is not expired', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      credentialRepository.findOne.mockResolvedValue({
        password_changed_at: daysAgo(30), // 30 days ago (not expired)
      } as UserCredential);

      const context = mockExecutionContext();
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if password is expired', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      credentialRepository.findOne.mockResolvedValue({
        password_changed_at: daysAgo(100), // 100 days ago (expired)
      } as UserCredential);

      const context = mockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toMatchObject({
        response: expect.objectContaining({
          error: 'PasswordExpired',
          passwordExpired: true,
        }),
      });
    });

    it('should include daysExpired in error response', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      credentialRepository.findOne.mockResolvedValue({
        password_changed_at: daysAgo(95), // 95 days ago (5 days expired)
      } as UserCredential);

      const context = mockExecutionContext();

      try {
        await guard.canActivate(context);
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.response.daysExpired).toBe(5);
      }
    });

    it('should set warning headers when password is close to expiry', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      credentialRepository.findOne.mockResolvedValue({
        password_changed_at: daysAgo(80), // 80 days ago (10 days until expiry)
      } as UserCredential);

      const context = mockExecutionContext();
      const response = context.switchToHttp().getResponse();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(response.setHeader).toHaveBeenCalledWith('X-Password-Expiring', 'true');
      expect(response.setHeader).toHaveBeenCalledWith('X-Password-Days-Remaining', '10');
    });

    it('should not set warning headers if not within warning period', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      credentialRepository.findOne.mockResolvedValue({
        password_changed_at: daysAgo(50), // 50 days ago (40 days until expiry)
      } as UserCredential);

      const context = mockExecutionContext();
      const response = context.switchToHttp().getResponse();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(response.setHeader).not.toHaveBeenCalled();
    });

    it('should allow request if credential has no password_changed_at', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      credentialRepository.findOne.mockResolvedValue({
        password_changed_at: null,
      } as unknown as UserCredential);

      const context = mockExecutionContext();
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow request if no credential found', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      credentialRepository.findOne.mockResolvedValue(null);

      const context = mockExecutionContext();
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should query credential with correct user ID', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      credentialRepository.findOne.mockResolvedValue({
        password_changed_at: daysAgo(30),
      } as UserCredential);

      const context = mockExecutionContext('user-abc-123');
      await guard.canActivate(context);

      expect(credentialRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: 'user-abc-123' },
        select: ['password_changed_at'],
      });
    });
  });

  describe('password expiry boundary cases', () => {
    it('should allow access at exactly 89 days', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      credentialRepository.findOne.mockResolvedValue({
        password_changed_at: daysAgo(89),
      } as UserCredential);

      const context = mockExecutionContext();
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should block access at exactly 90 days', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      credentialRepository.findOne.mockResolvedValue({
        password_changed_at: daysAgo(90),
      } as UserCredential);

      const context = mockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should set warning at exactly 76 days (14 days remaining)', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      credentialRepository.findOne.mockResolvedValue({
        password_changed_at: daysAgo(76), // 14 days until expiry
      } as UserCredential);

      const context = mockExecutionContext();
      const response = context.switchToHttp().getResponse();

      await guard.canActivate(context);

      expect(response.setHeader).toHaveBeenCalledWith('X-Password-Expiring', 'true');
      expect(response.setHeader).toHaveBeenCalledWith('X-Password-Days-Remaining', '14');
    });

    it('should not set warning at 75 days (15 days remaining)', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      credentialRepository.findOne.mockResolvedValue({
        password_changed_at: daysAgo(75), // 15 days until expiry
      } as UserCredential);

      const context = mockExecutionContext();
      const response = context.switchToHttp().getResponse();

      await guard.canActivate(context);

      expect(response.setHeader).not.toHaveBeenCalled();
    });
  });

  describe('allowed routes', () => {
    it('should allow /auth/change-password even with expired password', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      // Don't even need to mock credential - should exit early

      const context = mockExecutionContext('user-123', '/api/auth/change-password');
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(credentialRepository.findOne).not.toHaveBeenCalled();
    });

    it('should allow nested routes containing allowed paths', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);

      const context = mockExecutionContext('user-123', '/api/v1/auth/me/profile');
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
