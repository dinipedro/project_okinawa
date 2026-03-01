import { BullModuleOptions } from '@nestjs/bull';

export const redisConfig = (): BullModuleOptions => {
  const useTls = process.env.REDIS_TLS === 'true' || process.env.REDIS_URL?.startsWith('rediss://');

  return {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      // TLS configuration for production Redis (e.g., AWS ElastiCache, Redis Cloud)
      ...(useTls && {
        tls: {
          rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
        },
      }),
      // Connection options
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
      connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  };
};
