import * as Sentry from '@sentry/react-native';

/**
 * Sentry Configuration for Mobile Apps
 * Error tracking and performance monitoring
 */

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';
const ENVIRONMENT = process.env.EXPO_PUBLIC_ENV || 'development';

/**
 * Initialize Sentry for error tracking
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not configured. Skipping Sentry initialization.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,

    // Enable automatic session tracking
    enableAutoSessionTracking: true,

    // Session timeout in milliseconds (30 minutes)
    sessionTrackingIntervalMillis: 30000,

    // Performance monitoring - sample 10% in production, 100% in dev
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Enable native crash tracking
    enableNative: true,

    // Enable JavaScript error tracking
    enableNativeCrashHandling: true,

    // Capture all network requests
    enableCaptureFailedRequests: true,

    // Attach stack traces to messages
    attachStacktrace: true,

    // Normalize depth for breadcrumbs
    normalizeDepth: 10,

    // Max breadcrumbs to keep in memory
    maxBreadcrumbs: 100,

    // BeforeSend hook to filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['authorization'];
        delete event.request.headers['Cookie'];
        delete event.request.headers['cookie'];
      }

      // Remove password from event data
      if (event.extra) {
        if (typeof event.extra === 'object') {
          const sanitized = { ...event.extra };
          if ('password' in sanitized) delete sanitized.password;
          if ('token' in sanitized) delete sanitized.token;
          event.extra = sanitized;
        }
      }

      return event;
    },

    // Before breadcrumb hook
    beforeBreadcrumb(breadcrumb, hint) {
      // Don't log breadcrumbs with sensitive data
      if (breadcrumb.category === 'console') {
        return null;
      }

      // Filter navigation breadcrumbs
      if (breadcrumb.category === 'navigation') {
        return breadcrumb;
      }

      return breadcrumb;
    },

    // Integrations
    integrations: [
      new Sentry.ReactNativeTracing({
        // Trace navigation changes
        routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),

        // Track component render times
        enableUserInteractionTracing: true,

        // Track fetch and XHR requests
        traceFetch: true,
        traceXHR: true,

        // Trace only these origins
        tracingOrigins: ['localhost', /^\//],
      }),
    ],
  });

  console.log('✅ Sentry initialized successfully');
}

/**
 * Manually capture an exception
 * @param error - Error to capture
 * @param context - Additional context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
}

/**
 * Manually capture a message
 * @param message - Message to capture
 * @param level - Severity level
 * @param context - Additional context
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>,
) {
  Sentry.captureMessage(message, {
    level,
    contexts: context ? { custom: context } : undefined,
  });
}

/**
 * Set user context
 * @param user - User information
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
} | null) {
  Sentry.setUser(user);
}

/**
 * Add breadcrumb
 * @param message - Breadcrumb message
 * @param category - Breadcrumb category
 * @param level - Severity level
 * @param data - Additional data
 */
export function addBreadcrumb(
  message: string,
  category: string = 'custom',
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>,
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

/**
 * Set custom context
 * @param name - Context name
 * @param context - Context data
 */
export function setContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}

/**
 * Set tag
 * @param key - Tag key
 * @param value - Tag value
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Wrap root component with Sentry error boundary
 */
export const SentryWrapper = Sentry.wrap;

export default Sentry;
