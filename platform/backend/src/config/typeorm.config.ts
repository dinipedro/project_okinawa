import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Resolve paths that work in both dev (ts-node) and production (compiled js)
 */
const resolveGlob = (relativePath: string): string => {
  const isCompiled = __filename.endsWith('.js');
  return isCompiled
    ? `${__dirname}/../${relativePath}/*{.js}`
    : `${__dirname}/../${relativePath}/*{.ts,.js}`;
};

/**
 * TypeORM configuration for NestJS application
 * All database credentials MUST be provided via environment variables
 * No default values for sensitive data to prevent accidental exposure
 */
export const typeOrmConfig = (): TypeOrmModuleOptions => {
  // Validate required environment variables
  const requiredVars = ['DATABASE_HOST', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
  const missingVars = requiredVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
    throw new Error(
      `Missing required database environment variables: ${missingVars.join(', ')}. ` +
      `Please configure your .env file based on .env.example`,
    );
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [resolveGlob('**/*.entity')],
    migrations: [resolveGlob('database/migrations')],
    // NEVER use synchronize: true in production - it can cause data loss
    synchronize: false,
    logging: process.env.DATABASE_LOGGING === 'true',
    // SSL configuration for production environments
    ssl: process.env.DATABASE_SSL === 'true'
      ? {
          rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
        }
      : false,

    // Connection pooling configuration for production
    extra: {
      // Maximum number of connections in the pool
      max: parseInt(process.env.DATABASE_POOL_MAX || (isProduction ? '20' : '10'), 10),
      // Minimum number of connections in the pool
      min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
      // Maximum time (ms) to wait for a connection from the pool
      connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '10000', 10),
      // Maximum time (ms) a connection can be idle before being closed
      idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000', 10),
      // Enable connection validation before use
      allowExitOnIdle: !isProduction,
    },

    // Auto retry connection on failure
    retryAttempts: isProduction ? 10 : 3,
    retryDelay: 3000,

    // Keep alive for long-running connections
    keepConnectionAlive: true,

    // Cache configuration for better performance
    cache: isProduction
      ? {
          type: 'redis',
          options: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
            db: parseInt(process.env.REDIS_CACHE_DB || '1', 10),
          },
          duration: 60000, // 1 minute cache
        }
      : false,
  };
};

/**
 * DataSource for TypeORM CLI (migrations:generate, migrations:run)
 * Uses the same resolveGlob function to ensure path consistency
 */
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [resolveGlob('**/*.entity')],
  migrations: [resolveGlob('database/migrations')],
  synchronize: false,
  logging: false,
};

export const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
