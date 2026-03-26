import { Injectable } from '@nestjs/common';

/**
 * Histogram bucket boundaries for response time tracking (in seconds).
 * Follows Prometheus best practices for HTTP request durations.
 */
const DEFAULT_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

/**
 * Database query duration buckets (in seconds).
 */
const DB_BUCKETS = [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 5];

interface HistogramData {
  buckets: Map<number, number>;
  sum: number;
  count: number;
  bucketBoundaries: number[];
}

interface CounterData {
  value: number;
  labels: Map<string, number>;
}

/**
 * MetricsService - Lightweight Prometheus metrics without external dependencies.
 *
 * Tracks:
 * - http_request_duration_seconds (histogram)
 * - http_requests_total (counter)
 * - websocket_connections_active (gauge)
 * - db_query_duration_seconds (histogram)
 * - process uptime, memory usage (standard process metrics)
 */
@Injectable()
export class MetricsService {
  /** http_requests_total - keyed by "method|route|status_code" */
  private httpRequestsTotal = new Map<string, number>();

  /** http_request_duration_seconds - keyed by "method|route|status_code" */
  private httpDurationHistograms = new Map<string, HistogramData>();

  /** websocket_connections_active gauge */
  private wsConnectionsActive = 0;

  /** db_query_duration_seconds - keyed by "operation" */
  private dbDurationHistograms = new Map<string, HistogramData>();

  /**
   * Record an HTTP request with its duration and status.
   */
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationSeconds: number,
  ): void {
    const key = `${method}|${route}|${statusCode}`;

    // Increment counter
    const current = this.httpRequestsTotal.get(key) || 0;
    this.httpRequestsTotal.set(key, current + 1);

    // Record in histogram
    this.recordHistogram(this.httpDurationHistograms, key, durationSeconds, DEFAULT_BUCKETS);
  }

  /**
   * Record a database query duration.
   */
  recordDbQuery(operation: string, durationSeconds: number): void {
    this.recordHistogram(this.dbDurationHistograms, operation, durationSeconds, DB_BUCKETS);
  }

  /**
   * Increment the active WebSocket connections gauge.
   */
  incrementWsConnections(): void {
    this.wsConnectionsActive++;
  }

  /**
   * Decrement the active WebSocket connections gauge.
   */
  decrementWsConnections(): void {
    if (this.wsConnectionsActive > 0) {
      this.wsConnectionsActive--;
    }
  }

  /**
   * Set the active WebSocket connections gauge to a specific value.
   */
  setWsConnections(count: number): void {
    this.wsConnectionsActive = Math.max(0, count);
  }

  /**
   * Returns all metrics in Prometheus text exposition format.
   * See: https://prometheus.io/docs/instrumenting/exposition_formats/
   */
  getMetrics(): string {
    const lines: string[] = [];
    const now = Date.now();

    // --- http_requests_total (counter) ---
    lines.push('# HELP http_requests_total Total number of HTTP requests');
    lines.push('# TYPE http_requests_total counter');
    for (const [key, value] of this.httpRequestsTotal) {
      const [method, route, statusCode] = key.split('|');
      lines.push(
        `http_requests_total{method="${method}",route="${this.escapeLabel(route)}",status_code="${statusCode}"} ${value}`,
      );
    }

    // --- http_request_duration_seconds (histogram) ---
    lines.push('# HELP http_request_duration_seconds HTTP request duration in seconds');
    lines.push('# TYPE http_request_duration_seconds histogram');
    for (const [key, hist] of this.httpDurationHistograms) {
      const [method, route, statusCode] = key.split('|');
      const labelBase = `method="${method}",route="${this.escapeLabel(route)}",status_code="${statusCode}"`;
      lines.push(...this.formatHistogram('http_request_duration_seconds', labelBase, hist));
    }

    // --- websocket_connections_active (gauge) ---
    lines.push('# HELP websocket_connections_active Number of active WebSocket connections');
    lines.push('# TYPE websocket_connections_active gauge');
    lines.push(`websocket_connections_active ${this.wsConnectionsActive}`);

    // --- db_query_duration_seconds (histogram) ---
    lines.push('# HELP db_query_duration_seconds Database query duration in seconds');
    lines.push('# TYPE db_query_duration_seconds histogram');
    for (const [operation, hist] of this.dbDurationHistograms) {
      const labelBase = `operation="${this.escapeLabel(operation)}"`;
      lines.push(...this.formatHistogram('db_query_duration_seconds', labelBase, hist));
    }

    // --- Process metrics ---
    lines.push(...this.getProcessMetrics());

    // Trailing newline required by Prometheus format
    lines.push('');
    return lines.join('\n');
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private recordHistogram(
    store: Map<string, HistogramData>,
    key: string,
    value: number,
    bucketBoundaries: number[],
  ): void {
    let hist = store.get(key);
    if (!hist) {
      hist = {
        buckets: new Map<number, number>(),
        sum: 0,
        count: 0,
        bucketBoundaries,
      };
      // Initialize buckets
      for (const b of bucketBoundaries) {
        hist.buckets.set(b, 0);
      }
      store.set(key, hist);
    }

    hist.sum += value;
    hist.count++;

    // Cumulative histogram: increment all buckets where value <= boundary
    for (const boundary of hist.bucketBoundaries) {
      if (value <= boundary) {
        hist.buckets.set(boundary, (hist.buckets.get(boundary) || 0) + 1);
      }
    }
  }

  private formatHistogram(
    metricName: string,
    labelBase: string,
    hist: HistogramData,
  ): string[] {
    const lines: string[] = [];
    for (const boundary of hist.bucketBoundaries) {
      const count = hist.buckets.get(boundary) || 0;
      lines.push(
        `${metricName}_bucket{${labelBase},le="${boundary}"} ${count}`,
      );
    }
    // +Inf bucket always equals total count
    lines.push(`${metricName}_bucket{${labelBase},le="+Inf"} ${hist.count}`);
    lines.push(`${metricName}_sum{${labelBase}} ${hist.sum}`);
    lines.push(`${metricName}_count{${labelBase}} ${hist.count}`);
    return lines;
  }

  private getProcessMetrics(): string[] {
    const lines: string[] = [];
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    // process_uptime_seconds
    lines.push('# HELP process_uptime_seconds Process uptime in seconds');
    lines.push('# TYPE process_uptime_seconds gauge');
    lines.push(`process_uptime_seconds ${uptime}`);

    // process_resident_memory_bytes
    lines.push('# HELP process_resident_memory_bytes Resident memory size in bytes');
    lines.push('# TYPE process_resident_memory_bytes gauge');
    lines.push(`process_resident_memory_bytes ${memUsage.rss}`);

    // process_heap_used_bytes
    lines.push('# HELP process_heap_used_bytes Process heap used in bytes');
    lines.push('# TYPE process_heap_used_bytes gauge');
    lines.push(`process_heap_used_bytes ${memUsage.heapUsed}`);

    // process_heap_total_bytes
    lines.push('# HELP process_heap_total_bytes Process heap total in bytes');
    lines.push('# TYPE process_heap_total_bytes gauge');
    lines.push(`process_heap_total_bytes ${memUsage.heapTotal}`);

    // process_external_memory_bytes
    lines.push('# HELP process_external_memory_bytes Process external memory in bytes');
    lines.push('# TYPE process_external_memory_bytes gauge');
    lines.push(`process_external_memory_bytes ${memUsage.external}`);

    // nodejs_active_handles_total (if available)
    if (typeof (process as any)._getActiveHandles === 'function') {
      const handles = (process as any)._getActiveHandles().length;
      lines.push('# HELP nodejs_active_handles_total Number of active handles');
      lines.push('# TYPE nodejs_active_handles_total gauge');
      lines.push(`nodejs_active_handles_total ${handles}`);
    }

    // nodejs_active_requests_total (if available)
    if (typeof (process as any)._getActiveRequests === 'function') {
      const requests = (process as any)._getActiveRequests().length;
      lines.push('# HELP nodejs_active_requests_total Number of active requests');
      lines.push('# TYPE nodejs_active_requests_total gauge');
      lines.push(`nodejs_active_requests_total ${requests}`);
    }

    return lines;
  }

  /**
   * Escape special characters in label values per Prometheus spec.
   * Backslash, double-quote, and newline must be escaped.
   */
  private escapeLabel(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
  }
}
