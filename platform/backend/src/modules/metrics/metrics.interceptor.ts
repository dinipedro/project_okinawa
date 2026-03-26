import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

/**
 * MetricsInterceptor - Records HTTP request duration and status for Prometheus.
 *
 * Applied globally via APP_INTERCEPTOR to automatically track every request.
 * Captures method, route pattern, status code, and response time.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Only handle HTTP contexts (skip WebSocket, RPC, etc.)
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const startTime = process.hrtime.bigint();

    // Derive the route pattern from the controller metadata when possible,
    // falling back to the raw URL path (without query string).
    const route = this.getRoutePattern(context, request);

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const durationNs = Number(process.hrtime.bigint() - startTime);
          const durationSeconds = durationNs / 1e9;

          this.metricsService.recordHttpRequest(method, route, statusCode, durationSeconds);
        },
        error: (error) => {
          const statusCode = error?.status || error?.statusCode || 500;
          const durationNs = Number(process.hrtime.bigint() - startTime);
          const durationSeconds = durationNs / 1e9;

          this.metricsService.recordHttpRequest(method, route, statusCode, durationSeconds);
        },
      }),
    );
  }

  /**
   * Attempts to build a route pattern like "GET /api/v1/orders/:id" from
   * controller and handler metadata. Falls back to the raw URL path
   * (stripping query strings) so cardinality stays manageable.
   */
  private getRoutePattern(context: ExecutionContext, request: any): string {
    // Express stores the matched route pattern on req.route
    if (request.route?.path) {
      const routePath = request.route.path;
      return typeof routePath === 'string' ? routePath : routePath.toString();
    }

    // Fallback: use the URL path without query string
    const url: string = request.originalUrl || request.url || '/';
    const pathOnly = url.split('?')[0];

    // Normalise dynamic segments: replace UUIDs and numeric IDs with `:id`
    // to prevent high-cardinality label explosion
    return pathOnly
      .replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        ':id',
      )
      .replace(/\/\d+(?=\/|$)/g, '/:id');
  }
}
