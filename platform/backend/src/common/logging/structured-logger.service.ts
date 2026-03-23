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
    const log: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: typeof contextOrData === 'string' ? contextOrData : this.context,
      data: {
        ...StructuredLoggerService.globalContext,
        ...(typeof contextOrData === 'object' ? contextOrData : {}),
      },
    };

    if (stack) {
      log.stack = stack;
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
        `${color}${log.timestamp} ${level.toUpperCase()} ${contextStr} ${message}${dataStr}\x1b[0m`,
      );
      if (stack) {
        console.log(`${color}${stack}\x1b[0m`);
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

    return sanitized;
  }
}
