import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'ok' | 'error';
  tags: Record<string, string | number | boolean>;
  logs: SpanLog[];
}

export interface SpanLog {
  timestamp: number;
  message: string;
  fields?: Record<string, unknown>;
}

export interface TracingOptions {
  serviceName: string;
  enabled?: boolean;
  samplingRate?: number;
  exporterEndpoint?: string;
}

@Injectable()
export class TracingService {
  private readonly logger = new Logger(TracingService.name);
  private readonly activeSpans = new Map<string, Span>();
  private readonly completedSpans: Span[] = [];
  private readonly options: TracingOptions;
  private readonly enabled: boolean;

  constructor(@Inject('TRACING_OPTIONS') options: TracingOptions) {
    this.options = options;
    this.enabled = options.enabled !== false;

    if (this.enabled) {
      this.logger.log(`Tracing enabled for service: ${options.serviceName}`);
    }
  }

  startSpan(operationName: string, parentSpanId?: string): Span {
    const traceId = parentSpanId
      ? this.getSpan(parentSpanId)?.traceId || this.generateId()
      : this.generateId();

    const span: Span = {
      traceId,
      spanId: this.generateId(),
      parentSpanId,
      operationName,
      startTime: Date.now(),
      status: 'ok',
      tags: {
        'service.name': this.options.serviceName,
      },
      logs: [],
    };

    this.activeSpans.set(span.spanId, span);
    return span;
  }

  endSpan(spanId: string, status: 'ok' | 'error' = 'ok'): Span | undefined {
    const span = this.activeSpans.get(spanId);
    if (!span) {
      this.logger.warn(`Span not found: ${spanId}`);
      return undefined;
    }

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    this.activeSpans.delete(spanId);
    this.completedSpans.push(span);

    // Export span if enabled
    if (this.enabled) {
      this.exportSpan(span);
    }

    return span;
  }

  getSpan(spanId: string): Span | undefined {
    return this.activeSpans.get(spanId);
  }

  addTag(spanId: string, key: string, value: string | number | boolean): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }

  addLog(spanId: string, message: string, fields?: Record<string, unknown>): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: Date.now(),
        message,
        fields,
      });
    }
  }

  async trace<T>(
    operationName: string,
    fn: (span: Span) => Promise<T>,
    parentSpanId?: string,
  ): Promise<T> {
    const span = this.startSpan(operationName, parentSpanId);

    try {
      const result = await fn(span);
      this.endSpan(span.spanId, 'ok');
      return result;
    } catch (error) {
      this.addLog(span.spanId, 'error', { error: (error as Error).message });
      this.endSpan(span.spanId, 'error');
      throw error;
    }
  }

  private generateId(): string {
    return uuidv4().replace(/-/g, '').substring(0, 16);
  }

  private exportSpan(span: Span): void {
    // In production, this would send to Jaeger, Zipkin, or similar
    // For now, log structured trace data
    if (process.env.NODE_ENV === 'production') {
      this.logger.log(JSON.stringify({
        type: 'trace',
        ...span,
      }));
    } else if (process.env.LOG_TRACES === 'true') {
      this.logger.debug(
        `Span: ${span.operationName} [${span.duration}ms] ${span.status}`,
        {
          traceId: span.traceId,
          spanId: span.spanId,
          parentSpanId: span.parentSpanId,
        },
      );
    }
  }

  // Middleware helper to extract trace context from headers
  extractTraceContext(headers: Record<string, string>): { traceId?: string; spanId?: string } {
    return {
      traceId: headers['x-trace-id'] || headers['traceparent']?.split('-')[1],
      spanId: headers['x-span-id'] || headers['traceparent']?.split('-')[2],
    };
  }

  // Helper to create trace headers for outgoing requests
  createTraceHeaders(span: Span): Record<string, string> {
    return {
      'x-trace-id': span.traceId,
      'x-span-id': span.spanId,
      traceparent: `00-${span.traceId}-${span.spanId}-01`,
    };
  }
}
