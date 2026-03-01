import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Decorator key to skip transformation for specific endpoints
 */
export const SKIP_TRANSFORM_KEY = 'skipTransform';

/**
 * Decorator key to skip sanitization for specific endpoints
 */
export const SKIP_SANITIZE_KEY = 'skipSanitize';

/**
 * Sensitive fields that should be redacted from responses
 */
const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'current_password',
  'new_password',
  'confirm_password',
  'token',
  'reset_token',
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
  'social_security',
  'credit_card',
  'creditCard',
  'private_key',
  'encryption_key',
];

/**
 * Recursively sanitize an object by redacting sensitive fields
 */
function sanitizeData(data: unknown, depth: number = 0): unknown {
  if (depth > 10) return data; // Prevent infinite recursion
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * TransformResponseInterceptor - Ensures consistent API response format
 *
 * All successful responses will be wrapped in:
 * {
 *   success: true,
 *   data: <original response>,
 *   meta: {
 *     timestamp: <ISO timestamp>,
 *     path: <request path>,
 *     method: <HTTP method>
 *   }
 * }
 */
@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    // Check if transformation should be skipped
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

    // Check if sanitization should be skipped
    const skipSanitize = this.reflector.getAllAndOverride<boolean>(
      SKIP_SANITIZE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const { method, url, query } = request;

    return next.handle().pipe(
      map((data) => {
        // Apply sanitization unless explicitly skipped
        const sanitizedData = skipSanitize ? data : sanitizeData(data);

        // If data is already in the correct format, don't wrap it again
        if (
          sanitizedData &&
          typeof sanitizedData === 'object' &&
          'success' in sanitizedData &&
          'data' in sanitizedData
        ) {
          return sanitizedData;
        }

        // Build meta information
        const meta: ApiResponse<T>['meta'] = {
          timestamp: new Date().toISOString(),
          path: url,
          method,
        };

        // Add pagination meta if response contains pagination info
        if (sanitizedData && typeof sanitizedData === 'object') {
          // Check for common pagination patterns
          if ('items' in sanitizedData && 'total' in sanitizedData) {
            const page = parseInt(query.page, 10) || 1;
            const limit = parseInt(query.limit, 10) || 10;
            const typedData = sanitizedData as { items: unknown; total: number };
            meta.pagination = {
              page,
              limit,
              total: typedData.total,
              totalPages: Math.ceil(typedData.total / limit),
            };
            // Return items as data
            return {
              success: true,
              data: typedData.items,
              meta,
            };
          }

          // Check for array with count
          if (Array.isArray(sanitizedData) && query.page !== undefined) {
            const page = parseInt(query.page, 10) || 1;
            const limit = parseInt(query.limit, 10) || 10;
            meta.pagination = {
              page,
              limit,
              total: sanitizedData.length,
              totalPages: Math.ceil(sanitizedData.length / limit),
            };
          }
        }

        return {
          success: true,
          data: sanitizedData,
          meta,
        };
      }),
    );
  }
}
