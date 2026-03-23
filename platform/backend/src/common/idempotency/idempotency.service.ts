import { Injectable, ConflictException, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface IdempotencyRecord {
  key: string;
  status: 'processing' | 'completed' | 'failed';
  response?: unknown;
  createdAt: number;
  expiresAt: number;
}

export interface IdempotencyOptions {
  ttl?: number; // Time to live in milliseconds
  lockTimeout?: number; // Lock timeout for processing state
}

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_LOCK_TIMEOUT = 60 * 1000; // 60 seconds

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly keyPrefix = 'idempotency:';

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async checkAndLock(
    key: string,
    options: IdempotencyOptions = {},
  ): Promise<{ isNew: boolean; existingResponse?: unknown }> {
    const fullKey = this.buildKey(key);
    const ttl = options.ttl || DEFAULT_TTL;
    const lockTimeout = options.lockTimeout || DEFAULT_LOCK_TIMEOUT;

    try {
      // Check for existing record
      const existing = await this.cacheManager.get<IdempotencyRecord>(fullKey);

      if (existing) {
        // If completed, return the cached response
        if (existing.status === 'completed') {
          this.logger.debug(`Idempotency HIT (completed): ${key}`);
          return { isNew: false, existingResponse: existing.response };
        }

        // If processing and not expired, throw conflict
        if (existing.status === 'processing') {
          const isExpired = Date.now() > existing.createdAt + lockTimeout;
          if (!isExpired) {
            this.logger.warn(`Idempotency conflict (processing): ${key}`);
            throw new ConflictException(
              'Request is already being processed. Please wait.',
            );
          }
          // Lock expired, allow retry
          this.logger.debug(`Idempotency lock expired, allowing retry: ${key}`);
        }

        // If failed, allow retry
        if (existing.status === 'failed') {
          this.logger.debug(`Idempotency retry (failed): ${key}`);
        }
      }

      // Create new processing record
      const record: IdempotencyRecord = {
        key,
        status: 'processing',
        createdAt: Date.now(),
        expiresAt: Date.now() + ttl,
      };

      await this.cacheManager.set(fullKey, record, ttl);
      this.logger.debug(`Idempotency LOCK acquired: ${key}`);

      return { isNew: true };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Idempotency check failed: ${error}`);
      // Allow processing if cache fails (fail-open)
      return { isNew: true };
    }
  }

  async complete(key: string, response: unknown, ttl?: number): Promise<void> {
    const fullKey = this.buildKey(key);
    const finalTtl = ttl || DEFAULT_TTL;

    try {
      const record: IdempotencyRecord = {
        key,
        status: 'completed',
        response,
        createdAt: Date.now(),
        expiresAt: Date.now() + finalTtl,
      };

      await this.cacheManager.set(fullKey, record, finalTtl);
      this.logger.debug(`Idempotency completed: ${key}`);
    } catch (error) {
      this.logger.error(`Idempotency complete failed: ${error}`);
    }
  }

  async fail(key: string): Promise<void> {
    const fullKey = this.buildKey(key);

    try {
      const existing = await this.cacheManager.get<IdempotencyRecord>(fullKey);
      if (existing) {
        existing.status = 'failed';
        await this.cacheManager.set(fullKey, existing, DEFAULT_TTL);
        this.logger.debug(`Idempotency marked as failed: ${key}`);
      }
    } catch (error) {
      this.logger.error(`Idempotency fail marking failed: ${error}`);
    }
  }

  async remove(key: string): Promise<void> {
    const fullKey = this.buildKey(key);
    try {
      await this.cacheManager.del(fullKey);
      this.logger.debug(`Idempotency removed: ${key}`);
    } catch (error) {
      this.logger.error(`Idempotency remove failed: ${error}`);
    }
  }

  private buildKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }
}

// Decorator for idempotent operations
import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENCY_KEY = 'idempotency_key';
export const Idempotent = (keyExtractor?: string) =>
  SetMetadata(IDEMPOTENCY_KEY, keyExtractor || 'x-idempotency-key');
