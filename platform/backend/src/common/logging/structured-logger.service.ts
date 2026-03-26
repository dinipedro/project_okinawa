import { Injectable, LoggerService, Scope } from '@nestjs/common';

export interface LogContext {
  requestId?: string;
  userId?: string;
  restaurantId?: string;
  traceId?: string;
  spanId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}

export interface StructuredLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: string;
  data?: LogContext;
  stack?: string;
}

// ============================================================
// PII SANITIZATION PATTERNS (LGPD Compliance)
// ============================================================

/**
 * Regex patterns for detecting and masking PII in log output.
 * These run on serialized log data to prevent accidental PII leakage.
 */
const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string | ((match: string, ...groups: string[]) => string); label: string }> = [
  {
    // Email addresses: john.doe@example.com → j***@example.com
    pattern: /([a-zA-Z0-9._%+-])([a-zA-Z0-9._%+-]*)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    replacement: (_match: string, first: string, _rest: string, domain: string) =>
      `${first}***@${domain}`,
    label: 'email',
  },
  {
    // Brazilian CPF: 123.456.789-01 → ***.***.***-01
    pattern: /\d{3}\.\d{3}\.\d{3}-(\d{2})/g,
    replacement: (_match: string, lastTwo: string) => `***.***.***-${lastTwo}`,
    label: 'cpf_formatted',
  },
  {
    // CPF without formatting: 12345678901 (11 consecutive digits, not part of longer number)
    // Only match standalone 11-digit sequences that look like CPFs
    pattern: /(?<!\d)\d{9}(\d{2})(?!\d)/g,
    replacement: (_match: string, lastTwo: string) => `*********${lastTwo}`,
    label: 'cpf_unformatted',
  },
  {
    // Brazilian phone: +5511999991234 → +55***1234
    pattern: /(\+55)\d{6,7}(\d{4})/g,
    replacement: (_match: string, prefix: string, lastFour: string) =>
      `${prefix}***${lastFour}`,
    label: 'phone_br',
  },
  {
    // International phone with +: +1234567890 → +1***7890
    pattern: /(\+\d{1,3})\d{4,8}(\d{4})/g,
    replacement: (_match: string, prefix: string, lastFour: string) =>
      `${prefix}***${lastFour}`,
    label: 'phone_intl',
  },
];

/**
 * Sanitize a string value by masking PII patterns.
 * Applied to log messages and serialized data before output.
 */
function sanitizePII(value: string): string {
  let result = value;
  for (const { pattern, replacement } of PII_PATTERNS) {
    // Reset lastIndex for global regex
    pattern.lastIndex = 0;
    result = result.replace(pattern, replacement as any);
  }
  return result;
}

/**
 * Deep-sanitize an object by masking PII in all string values.
 */
function sanitizeObjectPII(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizePII(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObjectPII(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizePII(item)
          : item && typeof item === 'object'
            ? sanitizeObjectPII(item as Record<string, unknown>)
            : item,
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Export for testing
export { sanitizePII, sanitizeObjectPII, PII_PATTERNS };

@Injectable({ scope: Scope.TRANSIENT })
export class StructuredLoggerService implements LoggerService {
  private context?: string;
  private static globalContext: LogContext = {};

  setContext(context: string): void {
    this.context = context;
  }

  static setGlobalContext(context: LogContext): void {
    StructuredLoggerService.globalContext = {
      ...StructuredLoggerService.globalContext,
      ...context,
    };
  }

  log(message: string, context?: string | LogContext): void {
    this.writeLog('info', message, context);
  }

  error(message: string, trace?: string, context?: string | LogContext): void {
    this.writeLog('error', message, context, trace);
  }

  warn(message: string, context?: string | LogContext): void {
    this.writeLog('warn', message, context);
  }

  debug(message: string, context?: string | LogContext): void {
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      this.writeLog('debug', message, context);
    }
  }

  verbose(message: string, context?: string | LogContext): void {
    this.debug(message, context);
  }

  private writeLog(
    level: StructuredLog['level'],
    message: string,
    contextOrData?: string | LogContext,
    stack?: string,
  ): void {
    // Sanitize the message for PII before logging
    const sanitizedMessage = sanitizePII(message);

    const rawData = {
      ...StructuredLoggerService.globalContext,
      ...(typeof contextOrData === 'object' ? contextOrData : {}),
    };

    // Deep-sanitize all data values for PII
    const sanitizedData = Object.keys(rawData).length > 0
      ? sanitizeObjectPII(rawData) as LogContext
      : rawData;

    const log: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message: sanitizedMessage,
      context: typeof contextOrData === 'string' ? contextOrData : this.context,
      data: sanitizedData,
    };

    if (stack) {
      log.stack = sanitizePII(stack);
    }

    // Remove empty data object
    if (log.data && Object.keys(log.data).length === 0) {
      delete log.data;
    }

    // Output as JSON in production, pretty print in development
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(log));
    } else {
      const color = this.getColor(level);
      const contextStr = log.context ? `[${log.context}]` : '';
      const dataStr = log.data ? ` ${JSON.stringify(log.data)}` : '';
      console.log(
        `${color}${log.timestamp} ${level.toUpperCase()} ${contextStr} ${sanitizedMessage}${dataStr}\x1b[0m`,
      );
      if (stack) {
        console.log(`${color}${sanitizePII(stack)}\x1b[0m`);
      }
    }
  }

  private getColor(level: StructuredLog['level']): string {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    };
    return colors[level] || '\x1b[0m';
  }
}

// Logging interceptor for automatic request/response logging
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable as InterceptorInjectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@InterceptorInjectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(StructuredLoggerService) private readonly logger: StructuredLoggerService,
  ) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, headers } = request;
    const requestId = headers['x-request-id'] || uuidv4();
    const traceId = headers['x-trace-id'] || requestId;
    const userId = request.user?.id;

    // Set request ID on request object for downstream use
    request.requestId = requestId;

    // Propagate correlation headers to response
    response.setHeader('X-Request-ID', requestId);
    response.setHeader('X-Trace-ID', traceId);

    const startTime = Date.now();

    this.logger.log(`Incoming ${method} ${url}`, {
      requestId,
      traceId,
      userId,
      method,
      path: url,
      body: this.sanitizeBody(body),
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;

          this.logger.log(`Completed ${method} ${url}`, {
            requestId,
            traceId,
            userId,
            method,
            path: url,
            statusCode: response.statusCode,
            duration,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.error(`Failed ${method} ${url}: ${error.message}`, error.stack, {
            requestId,
            traceId,
            userId,
            method,
            path: url,
            statusCode: error.status || 500,
            duration,
            error: error.message,
          });
        },
      }),
    );
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body) return body;

    const sensitiveFields = [
      'password', 'current_password', 'new_password',
      'token', 'refresh_token', 'access_token',
      'secret', 'authorization', 'credit_card',
      'card_number', 'cvv', 'otp', 'code',
    ];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Apply PII masking to remaining string values (email, phone, CPF)
    return sanitizeObjectPII(sanitized);
  }
}
