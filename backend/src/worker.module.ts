/**
 * WorkerModule — Minimal module for background job processing
 *
 * Only imports modules that contain Bull processors (@Processor/@Process).
 * Does NOT import HTTP controllers or API-only modules.
 *
 * This ensures the worker process has minimal memory footprint
 * and only loads what's needed for queue processing.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { typeOrmConfig } from './config/typeorm.config';
import { redisConfig } from './config/redis.config';
import { validationSchema, validationOptions } from './config/validation.config';

// Only modules that have Bull processors
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CommonModule } from './common/common.module';
import { IdentityModule } from './modules/identity/identity.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      validationSchema,
      validationOptions,
    }),

    // Database (workers need DB access for job processing)
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
    }),

    // Redis & Queue (same connection as API server)
    BullModule.forRootAsync({
      useFactory: redisConfig,
    }),

    // Common utilities (logging, caching, etc.)
    CommonModule,

    // Identity (needed for user lookups in notifications)
    IdentityModule,

    // Modules with Bull processors
    NotificationsModule,
    AnalyticsModule,
  ],
})
export class WorkerModule {}
