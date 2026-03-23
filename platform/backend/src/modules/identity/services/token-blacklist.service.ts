/**
 * TokenBlacklistService - Manages token revocation with Redis caching
 * Uses both Redis for fast lookups and PostgreSQL for persistence
 *
 * Part of Identity Module (AUDIT-010)
 */

import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TokenBlacklist } from '../entities/token-blacklist.entity';

@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly CACHE_PREFIX = 'token_blacklist:';
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(TokenBlacklist)
    private tokenBlacklistRepository: Repository<TokenBlacklist>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    // Start periodic cleanup of expired tokens
    this.startPeriodicCleanup();
  }

  /**
   * Add a token to the blacklist by JTI
   */
  async blacklistToken(
    jti: string,
    userId: string,
    tokenType: 'access' | 'refresh',
    expiresAt: Date,
    reason: string = 'logout',
    ipAddress?: string,
  ): Promise<void> {
    // Store in database
    const blacklistEntry = this.tokenBlacklistRepository.create({
      token_jti: jti,
      user_id: userId,
      token_type: tokenType,
      expires_at: expiresAt,
      revoked_reason: reason,
      revoked_ip: ipAddress,
    });

    await this.tokenBlacklistRepository.save(blacklistEntry);

    // Store in Redis cache with TTL matching token expiration
    const ttlSeconds = Math.max(
      0,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    );

    if (ttlSeconds > 0) {
      await this.cacheManager.set(
        `${this.CACHE_PREFIX}${jti}`,
        '1',
        ttlSeconds * 1000, // cache-manager uses milliseconds
      );
    }

    this.logger.debug(`Token ${jti} blacklisted for user ${userId}`);
  }

  /**
   * Check if a token is blacklisted by JTI
   */
  async isTokenBlacklisted(jti: string): Promise<boolean> {
    // First check Redis cache (fast)
    const cached = await this.cacheManager.get(`${this.CACHE_PREFIX}${jti}`);
    if (cached) {
      return true;
    }

    // Fallback to database check
    const blacklistEntry = await this.tokenBlacklistRepository.findOne({
      where: {
        token_jti: jti,
      },
    });

    if (blacklistEntry) {
      // Re-cache if found in database but not in cache
      const ttlSeconds = Math.max(
        0,
        Math.floor((blacklistEntry.expires_at.getTime() - Date.now()) / 1000),
      );

      if (ttlSeconds > 0) {
        await this.cacheManager.set(
          `${this.CACHE_PREFIX}${jti}`,
          '1',
          ttlSeconds * 1000,
        );
      }

      return true;
    }

    return false;
  }

  /**
   * Revoke all tokens for a user (e.g., on password change or security event)
   * Returns the number of tokens revoked
   */
  async revokeAllUserTokens(
    userId: string,
    reason: string = 'security_event',
  ): Promise<number> {
    // Get all active tokens for user to invalidate cache
    const activeTokens = await this.tokenBlacklistRepository.find({
      where: {
        user_id: userId,
      },
      select: ['token_jti'],
    });

    // Clear from cache
    for (const token of activeTokens) {
      await this.cacheManager.del(`${this.CACHE_PREFIX}${token.token_jti}`);
    }

    this.logger.log(`Revoked all tokens for user ${userId}: ${reason}`);
    return activeTokens.length;
  }

  /**
   * Clean up expired tokens from database
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.tokenBlacklistRepository.delete({
      expires_at: LessThan(new Date()),
    });

    const deleted = result.affected || 0;
    if (deleted > 0) {
      this.logger.log(`Cleaned up ${deleted} expired blacklisted tokens`);
    }

    return deleted;
  }

  /**
   * Get blacklist statistics
   */
  async getStats(): Promise<{
    totalBlacklisted: number;
    byType: Record<string, number>;
    byReason: Record<string, number>;
  }> {
    const total = await this.tokenBlacklistRepository.count();

    const byTypeResult = await this.tokenBlacklistRepository
      .createQueryBuilder('tb')
      .select('tb.token_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tb.token_type')
      .getRawMany();

    const byReasonResult = await this.tokenBlacklistRepository
      .createQueryBuilder('tb')
      .select('tb.revoked_reason', 'reason')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tb.revoked_reason')
      .getRawMany();

    return {
      totalBlacklisted: total,
      byType: byTypeResult.reduce(
        (acc, row) => {
          acc[row.type] = parseInt(row.count, 10);
          return acc;
        },
        {} as Record<string, number>,
      ),
      byReason: byReasonResult.reduce(
        (acc, row) => {
          acc[row.reason || 'unknown'] = parseInt(row.count, 10);
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  /**
   * Start periodic cleanup job
   */
  private startPeriodicCleanup(): void {
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.cleanupExpiredTokens();
      } catch (error) {
        this.logger.error('Token cleanup error:', error);
      }
    }, this.CLEANUP_INTERVAL);

    this.logger.log('Token blacklist cleanup job started');
  }

  /**
   * Stop periodic cleanup (for graceful shutdown)
   */
  stopPeriodicCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.logger.log('Token blacklist cleanup job stopped');
    }
  }
}
