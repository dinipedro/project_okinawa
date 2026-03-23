import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

/**
 * Sensitive fields that should never be logged to Sentry
 */
const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'current_password',
  'new_password',
  'confirm_password',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'cookie',
  'secret',
  'mfa_secret',
  'api_key',
  'apiKey',
  'card_number',
  'cardNumber',
  'cvv',
  'cvc',
  'pin',
  'ssn',
  'credit_card',
  'creditCard',
];

/**
 * Sensitive headers that should not be logged
 */
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
  'x-access-token',
  'x-refresh-token',
];

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  /**
   * Sanitize an object by removing sensitive fields
   */
  private sanitizeObject(obj: any, depth: number = 0): any {
    if (depth > 5) return '[MAX_DEPTH]';
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item, depth + 1));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Sanitize headers by removing sensitive ones
   */
  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    if (!headers) return {};
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    // Only handle HTTP contexts
    if (host.getType() !== 'http') {
      return super.catch(exception, host);
    }

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Guard against undefined response (connection closed, etc.)
    if (!response || typeof response.status !== 'function') {
      Sentry.captureException(exception);
      return;
    }

    // Sanitize request data before sending to Sentry
    const sanitizedHeaders = this.sanitizeHeaders(request.headers || {});
    const sanitizedBody = this.sanitizeObject(request.body);
    const sanitizedQuery = this.sanitizeObject(request.query);

    // Add sanitized request context to Sentry
    Sentry.setContext('request', {
      method: request.method,
      url: request.url,
      headers: sanitizedHeaders,
      body: sanitizedBody,
      query: sanitizedQuery,
      params: request.params,
    });

    // Add user context if available (only safe fields)
    if (request.user) {
      Sentry.setUser({
        id: request.user.id,
        email: request.user.email,
        username: request.user.full_name,
      });
    }

    // Add tags
    Sentry.setTags({
      environment: process.env.NODE_ENV || 'development',
      method: request.method,
      url: request.url,
    });

    // Add additional context for better debugging
    Sentry.setContext('route', {
      path: request.path,
      baseUrl: request.baseUrl,
      originalUrl: request.originalUrl,
      protocol: request.protocol,
      hostname: request.hostname,
    });

    // Add timing context if available
    if (request._startTime) {
      const duration = Date.now() - request._startTime;
      Sentry.setContext('performance', {
        duration,
        unit: 'ms',
      });
    }

    // Add request metadata
    Sentry.setContext('request_metadata', {
      contentType: request.headers['content-type'],
      contentLength: request.headers['content-length'],
      acceptLanguage: request.headers['accept-language'],
      userAgent: request.headers['user-agent'],
    });

    // Capture exception in Sentry
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      // Add exception context
      Sentry.setContext('http_exception', {
        status,
        message: typeof response === 'string' ? response : (response as any)?.message,
        name: exception.name,
      });

      // Only capture 500+ errors in Sentry (not 4xx)
      if (status >= 500) {
        Sentry.captureException(exception);
      }
    } else {
      // Add error context for non-HTTP exceptions
      const err = exception as Error;
      Sentry.setContext('exception', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack?.split('\n').slice(0, 5).join('\n'), // First 5 lines of stack
      });
      // Capture all non-HTTP exceptions
      Sentry.captureException(exception);
    }

    // Call default exception handler with protection against missing applicationRef
    try {
      super.catch(exception, host);
    } catch (superError) {
      // If super.catch fails (e.g., applicationRef is undefined), handle manually
      if (exception instanceof HttpException) {
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        response.status(status).json(exceptionResponse);
      } else {
        response.status(500).json({
          statusCode: 500,
          message: 'Internal server error',
        });
      }
    }
  }
}
