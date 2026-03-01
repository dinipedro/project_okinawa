/**
 * Okinawa Performance Profiling Configuration
 * 
 * Tools and utilities for measuring app performance.
 * 
 * @module shared/config/performance
 */

export const PERFORMANCE_CONFIG = {
  // Performance thresholds (in milliseconds)
  thresholds: {
    screenLoad: 300,      // Max time for screen to render
    apiCall: 2000,        // Max API response time
    animation: 16,        // Target frame time (60fps)
    startup: 3000,        // App cold start time
    interaction: 100,     // Touch response time
  },
  
  // Metrics to track
  metrics: [
    'time_to_interactive',
    'first_contentful_paint',
    'largest_contentful_paint',
    'cumulative_layout_shift',
    'api_response_time',
    'memory_usage',
    'battery_impact',
  ],
  
  // Profiling enabled in development only
  enabled: __DEV__,
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  marks: new Map<string, number>(),
  
  start(label: string): void {
    this.marks.set(label, Date.now());
  },
  
  end(label: string): number {
    const start = this.marks.get(label);
    if (!start) return 0;
    const duration = Date.now() - start;
    this.marks.delete(label);
    if (PERFORMANCE_CONFIG.enabled) {
      console.log(`[Performance] ${label}: ${duration}ms`);
    }
    return duration;
  },
  
  measure(label: string, fn: () => void): number {
    this.start(label);
    fn();
    return this.end(label);
  },
  
  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  },
};

declare const __DEV__: boolean;
export default performanceMonitor;
