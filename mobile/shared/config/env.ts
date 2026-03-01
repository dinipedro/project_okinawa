/**
 * Okinawa Environment Configuration
 * 
 * Centralized environment configuration for both Client and Restaurant apps.
 * This file serves as the single source of truth for all environment-dependent values.
 * 
 * PRODUCTION DEPLOYMENT INSTRUCTIONS:
 * 1. Copy this file and rename to env.production.ts
 * 2. Update all URLs and keys with production values
 * 3. Update the build configuration to use the production file
 * 
 * @module shared/config/env
 */

// React Native global __DEV__ type declaration
declare const __DEV__: boolean;

/**
 * Environment type definition
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Current environment based on React Native's __DEV__ flag
 * Override this for staging builds
 */
export const CURRENT_ENV: Environment = __DEV__ ? 'development' : 'production';

/**
 * Environment-specific configuration interface
 */
interface EnvironmentConfig {
  // API Configuration
  API_BASE_URL: string;
  API_TIMEOUT_MS: number;
  
  // WebSocket Configuration
  WS_URL: string;
  WS_RECONNECT_INTERVAL_MS: number;
  
  // Authentication
  AUTH_TOKEN_EXPIRY_DAYS: number;
  AUTH_REFRESH_TOKEN_EXPIRY_DAYS: number;
  
  // External Services
  SENTRY_DSN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_API_KEY: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  
  // Analytics
  ANALYTICS_ENABLED: boolean;
  ANALYTICS_DEBUG: boolean;
  
  // Feature Flags
  FEATURES: {
    BIOMETRIC_AUTH: boolean;
    PUSH_NOTIFICATIONS: boolean;
    OFFLINE_MODE: boolean;
    AI_FEATURES: boolean;
    GEOLOCATION: boolean;
  };
  
  // App Store
  APP_STORE_URL: string;
  PLAY_STORE_URL: string;
  
  // Support
  SUPPORT_EMAIL: string;
  SUPPORT_PHONE: string;
  PRIVACY_POLICY_URL: string;
  TERMS_OF_SERVICE_URL: string;
}

/**
 * Development environment configuration
 */
const developmentConfig: EnvironmentConfig = {
  // API Configuration
  API_BASE_URL: 'http://localhost:3000',
  API_TIMEOUT_MS: 30000,
  
  // WebSocket Configuration
  WS_URL: 'ws://localhost:3000',
  WS_RECONNECT_INTERVAL_MS: 5000,
  
  // Authentication
  AUTH_TOKEN_EXPIRY_DAYS: 7,
  AUTH_REFRESH_TOKEN_EXPIRY_DAYS: 30,
  
  // External Services (use test/sandbox keys in development)
  SENTRY_DSN: '', // Leave empty to disable in development
  FIREBASE_PROJECT_ID: 'okinawa-dev',
  FIREBASE_APP_ID: '1:123456789:ios:dev_app_id',
  FIREBASE_API_KEY: 'AIzaSy_DEVELOPMENT_KEY_REPLACE_ME',
  FIREBASE_MESSAGING_SENDER_ID: '123456789',
  
  // Analytics
  ANALYTICS_ENABLED: false,
  ANALYTICS_DEBUG: true,
  
  // Feature Flags
  FEATURES: {
    BIOMETRIC_AUTH: true,
    PUSH_NOTIFICATIONS: false, // Disable in dev to avoid noise
    OFFLINE_MODE: true,
    AI_FEATURES: true,
    GEOLOCATION: true,
  },
  
  // App Store (placeholder URLs)
  APP_STORE_URL: 'https://apps.apple.com/app/okinawa-client/id0000000000',
  PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.okinawa.client',
  
  // Support
  SUPPORT_EMAIL: 'support@okinawa.dev',
  SUPPORT_PHONE: '+55 11 99999-9999',
  PRIVACY_POLICY_URL: 'https://okinawa.dev/privacy',
  TERMS_OF_SERVICE_URL: 'https://okinawa.dev/terms',
};

/**
 * Staging environment configuration
 */
const stagingConfig: EnvironmentConfig = {
  // API Configuration
  API_BASE_URL: 'https://api-staging.okinawa.com',
  API_TIMEOUT_MS: 30000,
  
  // WebSocket Configuration
  WS_URL: 'wss://api-staging.okinawa.com',
  WS_RECONNECT_INTERVAL_MS: 5000,
  
  // Authentication
  AUTH_TOKEN_EXPIRY_DAYS: 7,
  AUTH_REFRESH_TOKEN_EXPIRY_DAYS: 30,
  
  // External Services
  SENTRY_DSN: 'https://YOUR_STAGING_SENTRY_DSN@sentry.io/PROJECT_ID',
  FIREBASE_PROJECT_ID: 'okinawa-staging',
  FIREBASE_APP_ID: '1:123456789:ios:staging_app_id',
  FIREBASE_API_KEY: 'AIzaSy_STAGING_KEY_REPLACE_ME',
  FIREBASE_MESSAGING_SENDER_ID: '123456789',
  
  // Analytics
  ANALYTICS_ENABLED: true,
  ANALYTICS_DEBUG: true,
  
  // Feature Flags
  FEATURES: {
    BIOMETRIC_AUTH: true,
    PUSH_NOTIFICATIONS: true,
    OFFLINE_MODE: true,
    AI_FEATURES: true,
    GEOLOCATION: true,
  },
  
  // App Store (placeholder URLs)
  APP_STORE_URL: 'https://apps.apple.com/app/okinawa-client/id0000000000',
  PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.okinawa.client',
  
  // Support
  SUPPORT_EMAIL: 'support@okinawa.com',
  SUPPORT_PHONE: '+55 11 99999-9999',
  PRIVACY_POLICY_URL: 'https://staging.okinawa.com/privacy',
  TERMS_OF_SERVICE_URL: 'https://staging.okinawa.com/terms',
};

/**
 * Production environment configuration
 * 
 * ⚠️ IMPORTANT: Update these values before production deployment!
 */
const productionConfig: EnvironmentConfig = {
  // API Configuration
  // TODO: Replace with actual production API URL
  API_BASE_URL: 'https://api.okinawa.com',
  API_TIMEOUT_MS: 30000,
  
  // WebSocket Configuration
  // TODO: Replace with actual production WebSocket URL
  WS_URL: 'wss://api.okinawa.com',
  WS_RECONNECT_INTERVAL_MS: 5000,
  
  // Authentication
  AUTH_TOKEN_EXPIRY_DAYS: 7,
  AUTH_REFRESH_TOKEN_EXPIRY_DAYS: 30,
  
  // External Services
  // TODO: Replace with actual production Sentry DSN
  SENTRY_DSN: 'https://YOUR_PRODUCTION_SENTRY_DSN@sentry.io/PROJECT_ID',
  
  // TODO: Replace with actual Firebase production credentials
  FIREBASE_PROJECT_ID: 'okinawa-production',
  FIREBASE_APP_ID: '1:123456789:ios:production_app_id',
  FIREBASE_API_KEY: 'AIzaSy_PRODUCTION_KEY_REPLACE_ME',
  FIREBASE_MESSAGING_SENDER_ID: '123456789',
  
  // Analytics
  ANALYTICS_ENABLED: true,
  ANALYTICS_DEBUG: false,
  
  // Feature Flags
  FEATURES: {
    BIOMETRIC_AUTH: true,
    PUSH_NOTIFICATIONS: true,
    OFFLINE_MODE: true,
    AI_FEATURES: true,
    GEOLOCATION: true,
  },
  
  // App Store
  // TODO: Replace with actual App Store URLs after publishing
  APP_STORE_URL: 'https://apps.apple.com/app/okinawa-client/id0000000000',
  PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.okinawa.client',
  
  // Support
  SUPPORT_EMAIL: 'support@okinawa.com',
  SUPPORT_PHONE: '+55 11 99999-9999',
  PRIVACY_POLICY_URL: 'https://okinawa.com/privacy',
  TERMS_OF_SERVICE_URL: 'https://okinawa.com/terms',
};

/**
 * Environment configuration map
 */
const configs: Record<Environment, EnvironmentConfig> = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

/**
 * Get the current environment configuration
 */
export const getEnvConfig = (): EnvironmentConfig => {
  return configs[CURRENT_ENV];
};

/**
 * Current environment configuration (singleton)
 */
export const ENV = getEnvConfig();

/**
 * Helper to check if running in development
 */
export const isDevelopment = CURRENT_ENV === 'development';

/**
 * Helper to check if running in production
 */
export const isProduction = CURRENT_ENV === 'production';

/**
 * Helper to check if running in staging
 */
export const isStaging = CURRENT_ENV === 'staging';

/**
 * Security validation for production builds
 */
if (isProduction) {
  // Ensure HTTPS is used in production
  if (!ENV.API_BASE_URL.startsWith('https://')) {
    throw new Error('SECURITY ERROR: Production API must use HTTPS');
  }
  
  // Ensure WebSocket Secure is used in production
  if (!ENV.WS_URL.startsWith('wss://')) {
    throw new Error('SECURITY ERROR: Production WebSocket must use WSS');
  }
  
  // Warn if Sentry is not configured
  if (!ENV.SENTRY_DSN || ENV.SENTRY_DSN.includes('YOUR_')) {
    console.warn('WARNING: Sentry DSN is not configured for production');
  }
  
  // Warn if Firebase is not configured
  if (ENV.FIREBASE_API_KEY.includes('REPLACE_ME')) {
    console.warn('WARNING: Firebase is not properly configured for production');
  }
}

export default ENV;
