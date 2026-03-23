/**
 * IpRateLimitGuard Tests
 * Tests for IP-based rate limiting with Redis caching
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  IpRateLimitGuard,
  IP_RATE_LIMIT_KEY,
  SKIP_IP_RATE_LIMIT_KEY,
  IpRateLimitConfig,
  checkIpRateLimit,
} from './ip-rate-limit.guard';

describe('IpRateLimitGuard', () => {
  let guard: IpRateLimitGuard;
  let reflector: jest.Mocked<Reflector>;
  let cacheManager: jest.Mocked<Cache>;

  const mockExecutionContext = (
    ip: string = '192.168.1.1',
    method: string = 'GET',
    path: string = '/api/test',
  ): ExecutionContext => {
    const mockResponse = {
      setHeader: jest.fn(),
    };

    const mockRequest = {
      ip,
      method,
      path,
      headers: {},
      socket: { remoteAddress: ip },
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IpRateLimitGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
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

    guard = module.get<IpRateLimitGuard>(IpRateLimitGuard);
    reflector = module.get(Reflector);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow request if skip decorator is present', async () => {
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === SKIP_IP_RATE_LIMIT_KEY) return true;
        return undefined;
      });

      const context = mockExecutionContext();
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(cacheManager.get).not.toHaveBeenCalled();
    });

    it('should allow request when under rate limit', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      cacheManager.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(50); // Under default limit of 100

      const context = mockExecutionContext();
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should increment request count on each call', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      cacheManager.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(10); // Current count

      const context = mockExecutionContext();
      await guard.canActivate(context);

      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('ip_rate:192.168.1.1'),
        11,
        expect.any(Number),
      );
    });

    it('should throw 429 when rate limit exceeded', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      cacheManager.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(100); // At default limit

      const context = mockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
    });

    it('should block IP after exceeding limit', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      cacheManager.get
        .mockResolvedValueOnce(null) // Not blocked (first check)
        .mockResolvedValueOnce(100); // At limit (count check)

      const context = mockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(HttpException);

      // Verify block was set
      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('blocked'),
        true,
        expect.any(Number),
      );
    });

    it('should throw if IP is already blocked', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      cacheManager.get.mockResolvedValueOnce(true); // Blocked

      const context = mockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.TOO_MANY_REQUESTS,
        }),
      );
    });

    it('should use custom rate limit config from decorator', async () => {
      const customConfig: IpRateLimitConfig = {
        limit: 5,
        windowSeconds: 30,
        blockDurationSeconds: 120,
      };

      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === IP_RATE_LIMIT_KEY) return customConfig;
        return undefined;
      });
      cacheManager.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(5); // At custom limit

      const context = mockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(HttpException);
    });

    it('should set rate limit headers on response', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      cacheManager.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(50); // Current count

      const context = mockExecutionContext();
      const response = context.switchToHttp().getResponse();

      await guard.canActivate(context);

      expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
      expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
      expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from X-Forwarded-For header', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      cacheManager.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(0); // Current count

      const context = mockExecutionContext();
      const request = context.switchToHttp().getRequest();
      request.headers['x-forwarded-for'] = '10.0.0.1, 192.168.1.1';

      await guard.canActivate(context);

      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('10.0.0.1'),
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should extract IP from X-Real-IP header', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      cacheManager.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(0); // Current count

      const context = mockExecutionContext();
      const request = context.switchToHttp().getRequest();
      request.headers['x-real-ip'] = '172.16.0.1';

      await guard.canActivate(context);

      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('172.16.0.1'),
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should normalize IPv6-mapped IPv4 addresses', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      cacheManager.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(0); // Current count

      const context = mockExecutionContext('::ffff:192.168.1.1');

      await guard.canActivate(context);

      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('192.168.1.1'),
        expect.any(Number),
        expect.any(Number),
      );
    });
  });

  describe('rate limit per endpoint', () => {
    it('should track limits separately per endpoint', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      // Mock for first context
      cacheManager.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(0) // Current count
        // Mock for second context
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(0); // Current count

      const context1 = mockExecutionContext('192.168.1.1', 'GET', '/api/users');
      const context2 = mockExecutionContext('192.168.1.1', 'GET', '/api/orders');

      await guard.canActivate(context1);
      await guard.canActivate(context2);

      const calls = cacheManager.set.mock.calls;
      const keys = calls.map((call) => call[0]);

      expect(keys[0]).toContain('/api/users');
      expect(keys[1]).toContain('/api/orders');
    });
  });
});

describe('checkIpRateLimit helper', () => {
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(() => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as jest.Mocked<Cache>;
  });

  it('should allow request when under limit', async () => {
    cacheManager.get
      .mockResolvedValueOnce(null) // Not blocked
      .mockResolvedValueOnce(50); // Current count

    const result = await checkIpRateLimit(cacheManager, '192.168.1.1', '/api/test');

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(49);
  });

  it('should block request when at limit', async () => {
    cacheManager.get
      .mockResolvedValueOnce(null) // Not blocked
      .mockResolvedValueOnce(100); // At limit

    const result = await checkIpRateLimit(cacheManager, '192.168.1.1', '/api/test');

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeDefined();
  });

  it('should return blocked status if IP is already blocked', async () => {
    cacheManager.get.mockResolvedValueOnce(true); // Blocked

    const result = await checkIpRateLimit(cacheManager, '192.168.1.1', '/api/test');

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should use custom config', async () => {
    cacheManager.get
      .mockResolvedValueOnce(null) // Not blocked
      .mockResolvedValueOnce(5); // At custom limit

    const result = await checkIpRateLimit(cacheManager, '192.168.1.1', '/api/test', {
      limit: 5,
      windowSeconds: 60,
    });

    expect(result.allowed).toBe(false);
  });
});
