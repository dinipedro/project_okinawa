/**
 * AUDIT-008: IP-based Rate Limiting Guard with Redis
 * Provides enhanced protection against DDoS and brute-force attacks
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Request } from 'express';

// Decorator metadata keys
export const IP_RATE_LIMIT_KEY = 'ipRateLimit';
export const SKIP_IP_RATE_LIMIT_KEY = 'skipIpRateLimit';

// Rate limit configuration interface
export interface IpRateLimitConfig {
  /** Maximum requests per window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Block duration in seconds when limit is exceeded */
  blockDurationSeconds?: number;
  /** Custom key prefix for this endpoint */
  keyPrefix?: string;
}

// Default configurations
const DEFAULT_CONFIG: IpRateLimitConfig = {
  limit: 100,
  windowSeconds: 60,
  blockDurationSeconds: 300, // 5 minutes
};

const STRICT_CONFIG: IpRateLimitConfig = {
  limit: 10,
  windowSeconds: 60,
  blockDurationSeconds: 600, // 10 minutes
};

// Decorator to apply IP rate limit
export function IpRateLimit(config: Partial<IpRateLimitConfig> = {}) {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    if (descriptor) {
      Reflect.defineMetadata(IP_RATE_LIMIT_KEY, finalConfig, descriptor.value);
    } else {
      Reflect.defineMetadata(IP_RATE_LIMIT_KEY, finalConfig, target);
    }
    return descriptor ? descriptor : target;
  };
}

// Decorator to skip IP rate limit
export function SkipIpRateLimit() {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(SKIP_IP_RATE_LIMIT_KEY, true, descriptor.value);
    } else {
      Reflect.defineMetadata(SKIP_IP_RATE_LIMIT_KEY, true, target);
    }
    return descriptor ? descriptor : target;
  };
}

// Strict rate limit for sensitive endpoints
export function StrictIpRateLimit(overrides: Partial<IpRateLimitConfig> = {}) {
  return IpRateLimit({ ...STRICT_CONFIG, ...overrides });
}

@Injectable()
export class IpRateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if rate limit should be skipped
    const skipRateLimit = this.reflector.getAllAndOverride<boolean>(
      SKIP_IP_RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipRateLimit) {
      return true;
    }

    // Get rate limit config
    const config = this.reflector.getAllAndOverride<IpRateLimitConfig>(
      IP_RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    ) || DEFAULT_CONFIG;

    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(request);
    const endpoint = `${request.method}:${request.path}`;

    // Create cache keys
    const keyPrefix = config.keyPrefix || 'ip_rate';
    const countKey = `${keyPrefix}:${clientIp}:${endpoint}`;
    const blockKey = `${keyPrefix}:blocked:${clientIp}`;

    // Check if IP is blocked
    const isBlocked = await this.cacheManager.get<boolean>(blockKey);
    if (isBlocked) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Your IP has been temporarily blocked due to excessive requests',
          error: 'Too Many Requests',
          retryAfter: config.blockDurationSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Get current request count
    const currentCount = (await this.cacheManager.get<number>(countKey)) || 0;

    if (currentCount >= config.limit) {
      // Block the IP
      if (config.blockDurationSeconds) {
        await this.cacheManager.set(
          blockKey,
          true,
          config.blockDurationSeconds * 1000,
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded. Maximum ${config.limit} requests per ${config.windowSeconds} seconds`,
          error: 'Too Many Requests',
          limit: config.limit,
          windowSeconds: config.windowSeconds,
          retryAfter: config.blockDurationSeconds || config.windowSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment request count
    await this.cacheManager.set(
      countKey,
      currentCount + 1,
      config.windowSeconds * 1000,
    );

    // Add rate limit headers to response
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', config.limit);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, config.limit - currentCount - 1));
    response.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + config.windowSeconds);

    return true;
  }

  /**
   * Extract client IP from request, handling proxies
   */
  private getClientIp(request: Request): string {
    // Check X-Forwarded-For header (common for proxies/load balancers)
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      // Take the first IP (original client)
      const ips = forwarded.split(',').map((ip) => ip.trim());
      if (ips[0]) {
        return this.normalizeIp(ips[0]);
      }
    }

    // Check X-Real-IP header (Nginx)
    const realIp = request.headers['x-real-ip'];
    if (typeof realIp === 'string') {
      return this.normalizeIp(realIp);
    }

    // Fallback to socket address
    const socketIp = request.ip || request.socket?.remoteAddress;
    return this.normalizeIp(socketIp || 'unknown');
  }

  /**
   * Normalize IP address format
   */
  private normalizeIp(ip: string): string {
    // Remove IPv6 prefix for IPv4-mapped addresses
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    return ip;
  }
}

/**
 * Helper to manually check and increment rate limit
 * Useful for custom rate limiting logic in services
 */
export async function checkIpRateLimit(
  cacheManager: Cache,
  ip: string,
  endpoint: string,
  config: IpRateLimitConfig = DEFAULT_CONFIG,
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
  const keyPrefix = config.keyPrefix || 'ip_rate';
  const countKey = `${keyPrefix}:${ip}:${endpoint}`;
  const blockKey = `${keyPrefix}:blocked:${ip}`;

  // Check if blocked
  const isBlocked = await cacheManager.get<boolean>(blockKey);
  if (isBlocked) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: config.blockDurationSeconds,
    };
  }

  const currentCount = (await cacheManager.get<number>(countKey)) || 0;

  if (currentCount >= config.limit) {
    if (config.blockDurationSeconds) {
      await cacheManager.set(blockKey, true, config.blockDurationSeconds * 1000);
    }
    return {
      allowed: false,
      remaining: 0,
      retryAfter: config.blockDurationSeconds || config.windowSeconds,
    };
  }

  await cacheManager.set(countKey, currentCount + 1, config.windowSeconds * 1000);

  return {
    allowed: true,
    remaining: config.limit - currentCount - 1,
  };
}
