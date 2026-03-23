import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        if (isProduction) {
          return {
            store: await redisStore({
              socket: {
                host: configService.get('REDIS_HOST', 'localhost'),
                port: configService.get('REDIS_PORT', 6379),
              },
              password: configService.get('REDIS_PASSWORD'),
              database: configService.get('REDIS_DB', 0),
            }),
            ttl: 60 * 1000, // 60 seconds default TTL
            max: 1000, // Maximum number of items in cache
          };
        }

        // In-memory cache for development
        return {
          ttl: 60 * 1000,
          max: 100,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule, CacheService],
})
export class CacheConfigModule {}
