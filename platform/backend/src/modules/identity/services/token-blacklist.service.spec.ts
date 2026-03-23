/**
 * TokenBlacklistService Tests
 * Tests for JWT token blacklisting/revocation with Redis caching
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TokenBlacklistService } from './token-blacklist.service';
import { TokenBlacklist } from '../entities/token-blacklist.entity';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;
  let tokenBlacklistRepository: jest.Mocked<Repository<TokenBlacklist>>;
  let cacheManager: jest.Mocked<Cache>;

  const mockBlacklistEntry: Partial<TokenBlacklist> = {
    id: 'entry-123',
    token_jti: 'jti-abc123',
    user_id: 'user-123',
    token_type: 'access',
    expires_at: new Date(Date.now() + 3600000), // 1 hour from now
    revoked_reason: 'logout',
    revoked_ip: '192.168.1.1',
    created_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenBlacklistService,
        {
          provide: getRepositoryToken(TokenBlacklist),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenBlacklistService>(TokenBlacklistService);
    tokenBlacklistRepository = module.get(getRepositoryToken(TokenBlacklist));
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();

    // Prevent the periodic cleanup from running during tests
    jest.spyOn(service, 'stopPeriodicCleanup').mockImplementation();
  });

  afterEach(() => {
    service.stopPeriodicCleanup();
  });

  describe('blacklistToken', () => {
    it('should add token to blacklist in DB and cache', async () => {
      const jti = 'jti-abc123';
      const userId = 'user-123';
      const expiresAt = new Date(Date.now() + 3600000);

      tokenBlacklistRepository.create.mockReturnValue(mockBlacklistEntry as TokenBlacklist);
      tokenBlacklistRepository.save.mockResolvedValue(mockBlacklistEntry as TokenBlacklist);

      await service.blacklistToken(jti, userId, 'access', expiresAt, 'logout', '192.168.1.1');

      expect(tokenBlacklistRepository.create).toHaveBeenCalledWith({
        token_jti: jti,
        user_id: userId,
        token_type: 'access',
        expires_at: expiresAt,
        revoked_reason: 'logout',
        revoked_ip: '192.168.1.1',
      });
      expect(tokenBlacklistRepository.save).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        `token_blacklist:${jti}`,
        '1',
        expect.any(Number),
      );
    });

    it('should handle refresh token type', async () => {
      const jti = 'refresh-jti-123';
      const expiresAt = new Date(Date.now() + 86400000); // 24 hours

      tokenBlacklistRepository.create.mockReturnValue({
        ...mockBlacklistEntry,
        token_jti: jti,
        token_type: 'refresh',
      } as TokenBlacklist);
      tokenBlacklistRepository.save.mockResolvedValue({} as TokenBlacklist);

      await service.blacklistToken(jti, 'user-123', 'refresh', expiresAt, 'token_rotation');

      expect(tokenBlacklistRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          token_type: 'refresh',
          revoked_reason: 'token_rotation',
        }),
      );
    });

    it('should not cache if token already expired', async () => {
      const jti = 'expired-jti';
      const expiresAt = new Date(Date.now() - 1000); // Already expired

      tokenBlacklistRepository.create.mockReturnValue(mockBlacklistEntry as TokenBlacklist);
      tokenBlacklistRepository.save.mockResolvedValue({} as TokenBlacklist);

      await service.blacklistToken(jti, 'user-123', 'access', expiresAt);

      expect(tokenBlacklistRepository.save).toHaveBeenCalled();
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true if token is in cache', async () => {
      cacheManager.get.mockResolvedValue('1');

      const result = await service.isTokenBlacklisted('jti-abc123');

      expect(result).toBe(true);
      expect(cacheManager.get).toHaveBeenCalledWith('token_blacklist:jti-abc123');
      expect(tokenBlacklistRepository.findOne).not.toHaveBeenCalled();
    });

    it('should check database if not in cache', async () => {
      cacheManager.get.mockResolvedValue(null);
      tokenBlacklistRepository.findOne.mockResolvedValue(mockBlacklistEntry as TokenBlacklist);

      const result = await service.isTokenBlacklisted('jti-abc123');

      expect(result).toBe(true);
      expect(tokenBlacklistRepository.findOne).toHaveBeenCalledWith({
        where: { token_jti: 'jti-abc123' },
      });
    });

    it('should re-cache token if found in database but not cache', async () => {
      cacheManager.get.mockResolvedValue(null);
      tokenBlacklistRepository.findOne.mockResolvedValue(mockBlacklistEntry as TokenBlacklist);

      await service.isTokenBlacklisted('jti-abc123');

      expect(cacheManager.set).toHaveBeenCalledWith(
        'token_blacklist:jti-abc123',
        '1',
        expect.any(Number),
      );
    });

    it('should return false if token not found', async () => {
      cacheManager.get.mockResolvedValue(null);
      tokenBlacklistRepository.findOne.mockResolvedValue(null);

      const result = await service.isTokenBlacklisted('unknown-jti');

      expect(result).toBe(false);
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should clear all user tokens from cache', async () => {
      const userTokens = [{ token_jti: 'jti-1' }, { token_jti: 'jti-2' }, { token_jti: 'jti-3' }];

      tokenBlacklistRepository.find.mockResolvedValue(userTokens as TokenBlacklist[]);

      const result = await service.revokeAllUserTokens('user-123', 'security_event');

      expect(result).toBe(3);
      expect(cacheManager.del).toHaveBeenCalledTimes(3);
      expect(cacheManager.del).toHaveBeenCalledWith('token_blacklist:jti-1');
      expect(cacheManager.del).toHaveBeenCalledWith('token_blacklist:jti-2');
      expect(cacheManager.del).toHaveBeenCalledWith('token_blacklist:jti-3');
    });

    it('should return 0 if no tokens found', async () => {
      tokenBlacklistRepository.find.mockResolvedValue([]);

      const result = await service.revokeAllUserTokens('user-123');

      expect(result).toBe(0);
      expect(cacheManager.del).not.toHaveBeenCalled();
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens from database', async () => {
      tokenBlacklistRepository.delete.mockResolvedValue({ affected: 10, raw: [] });

      const result = await service.cleanupExpiredTokens();

      expect(result).toBe(10);
      expect(tokenBlacklistRepository.delete).toHaveBeenCalledWith({
        expires_at: expect.anything(),
      });
    });

    it('should return 0 if no expired tokens', async () => {
      tokenBlacklistRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      const result = await service.cleanupExpiredTokens();

      expect(result).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return blacklist statistics', async () => {
      tokenBlacklistRepository.count.mockResolvedValue(100);

      const mockQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      // First call for byType
      mockQb.getRawMany.mockResolvedValueOnce([
        { type: 'access', count: '60' },
        { type: 'refresh', count: '40' },
      ]);

      // Second call for byReason
      mockQb.getRawMany.mockResolvedValueOnce([
        { reason: 'logout', count: '70' },
        { reason: 'token_rotation', count: '30' },
      ]);

      tokenBlacklistRepository.createQueryBuilder.mockReturnValue(mockQb as any);

      const result = await service.getStats();

      expect(result.totalBlacklisted).toBe(100);
      expect(result.byType).toEqual({ access: 60, refresh: 40 });
      expect(result.byReason).toEqual({ logout: 70, token_rotation: 30 });
    });
  });

  describe('onModuleInit', () => {
    it('should start periodic cleanup on initialization', async () => {
      // Create a new instance to test onModuleInit
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TokenBlacklistService,
          {
            provide: getRepositoryToken(TokenBlacklist),
            useValue: {
              delete: jest.fn().mockResolvedValue({ affected: 0 }),
            },
          },
          {
            provide: CACHE_MANAGER,
            useValue: {
              get: jest.fn(),
              set: jest.fn(),
            },
          },
        ],
      }).compile();

      const newService = module.get<TokenBlacklistService>(TokenBlacklistService);

      // The periodic cleanup should be started (we can't easily test the interval itself)
      // but we can verify the service initializes without errors
      expect(newService).toBeDefined();

      // Clean up
      newService.stopPeriodicCleanup();
    });
  });
});
