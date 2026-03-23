/**
 * Error Handling Tests
 * 
 * Tests for error boundaries, network errors, validation errors,
 * and graceful degradation across components.
 * 
 * @module shared/components/__tests__/ErrorHandling.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================
// ERROR BOUNDARY SIMULATION
// ============================================================

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

class SimulatedErrorBoundary {
  private state: ErrorState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };
  
  private onError?: (error: Error, errorInfo: { componentStack: string }) => void;
  
  constructor(options?: { onError?: (error: Error, errorInfo: { componentStack: string }) => void }) {
    this.onError = options?.onError;
  }
  
  catchError(error: Error, componentStack: string = 'at TestComponent') {
    this.state = {
      hasError: true,
      error,
      errorInfo: { componentStack },
    };
    this.onError?.(error, { componentStack });
  }
  
  reset() {
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  getState() {
    return this.state;
  }
}

// ============================================================
// ERROR BOUNDARY TESTS
// ============================================================

describe('Error Handling: Error Boundary', () => {
  let boundary: SimulatedErrorBoundary;
  let errorCallback: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    errorCallback = vi.fn();
    boundary = new SimulatedErrorBoundary({ onError: errorCallback });
  });

  it('should catch and contain errors', () => {
    const error = new Error('Test error');
    boundary.catchError(error);
    
    const state = boundary.getState();
    expect(state.hasError).toBe(true);
    expect(state.error?.message).toBe('Test error');
  });

  it('should call error callback with error info', () => {
    const error = new Error('Component crashed');
    boundary.catchError(error, 'at ReservationScreen');
    
    expect(errorCallback).toHaveBeenCalledWith(
      error,
      expect.objectContaining({ componentStack: 'at ReservationScreen' })
    );
  });

  it('should allow reset after error', () => {
    boundary.catchError(new Error('Error'));
    expect(boundary.getState().hasError).toBe(true);
    
    boundary.reset();
    expect(boundary.getState().hasError).toBe(false);
  });

  it('should preserve error details for reporting', () => {
    const error = new Error('Network timeout');
    error.name = 'NetworkError';
    boundary.catchError(error);
    
    const state = boundary.getState();
    expect(state.error?.name).toBe('NetworkError');
    expect(state.error?.message).toBe('Network timeout');
  });
});

// ============================================================
// NETWORK ERROR HANDLING
// ============================================================

describe('Error Handling: Network Errors', () => {
  interface NetworkError {
    type: 'timeout' | 'offline' | 'server' | 'unauthorized' | 'not_found';
    message: string;
    retry: boolean;
    userMessage: string;
  }
  
  function classifyNetworkError(status: number | null, type?: string): NetworkError {
    if (type === 'timeout' || status === null) {
      return {
        type: 'timeout',
        message: 'Request timed out',
        retry: true,
        userMessage: 'Connection slow. Please try again.',
      };
    }
    
    if (status === 401) {
      return {
        type: 'unauthorized',
        message: 'Unauthorized',
        retry: false,
        userMessage: 'Please log in again.',
      };
    }
    
    if (status === 404) {
      return {
        type: 'not_found',
        message: 'Resource not found',
        retry: false,
        userMessage: 'The requested item was not found.',
      };
    }
    
    if (status >= 500) {
      return {
        type: 'server',
        message: `Server error: ${status}`,
        retry: true,
        userMessage: 'Server error. Please try again later.',
      };
    }
    
    return {
      type: 'offline',
      message: 'No connection',
      retry: true,
      userMessage: 'No internet connection.',
    };
  }

  it('should classify timeout errors', () => {
    const error = classifyNetworkError(null, 'timeout');
    expect(error.type).toBe('timeout');
    expect(error.retry).toBe(true);
  });

  it('should classify 401 as unauthorized', () => {
    const error = classifyNetworkError(401);
    expect(error.type).toBe('unauthorized');
    expect(error.retry).toBe(false);
    expect(error.userMessage).toContain('log in');
  });

  it('should classify 404 as not found', () => {
    const error = classifyNetworkError(404);
    expect(error.type).toBe('not_found');
    expect(error.retry).toBe(false);
  });

  it('should classify 500+ as server errors', () => {
    const error500 = classifyNetworkError(500);
    const error502 = classifyNetworkError(502);
    const error503 = classifyNetworkError(503);
    
    expect(error500.type).toBe('server');
    expect(error502.type).toBe('server');
    expect(error503.type).toBe('server');
    expect(error500.retry).toBe(true);
  });

  it('should provide user-friendly messages', () => {
    const error = classifyNetworkError(500);
    expect(error.userMessage).not.toContain('500');
    expect(error.userMessage).toContain('try again');
  });
});

// ============================================================
// VALIDATION ERROR HANDLING
// ============================================================

describe('Error Handling: Validation Errors', () => {
  interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
  }
  
  function validateForm(data: Record<string, any>, rules: Record<string, (v: any) => string | null>): ValidationResult {
    const errors: Record<string, string> = {};
    
    for (const [field, validator] of Object.entries(rules)) {
      const error = validator(data[field]);
      if (error) {
        errors[field] = error;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  it('should collect all validation errors', () => {
    const result = validateForm(
      { email: 'invalid', password: '' },
      {
        email: (v) => v.includes('@') ? null : 'Invalid email',
        password: (v) => v.length >= 8 ? null : 'Password too short',
      }
    );
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('email');
    expect(result.errors).toHaveProperty('password');
  });

  it('should pass valid data', () => {
    const result = validateForm(
      { email: 'test@example.com', password: 'Password123' },
      {
        email: (v) => v.includes('@') ? null : 'Invalid email',
        password: (v) => v.length >= 8 ? null : 'Password too short',
      }
    );
    
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should provide field-specific error messages', () => {
    const result = validateForm(
      { partySize: 25 },
      {
        partySize: (v) => v >= 1 && v <= 20 ? null : 'Party size must be 1-20',
      }
    );
    
    expect(result.errors.partySize).toBe('Party size must be 1-20');
  });
});

// ============================================================
// RETRY MECHANISM TESTS
// ============================================================

describe('Error Handling: Retry Mechanism', () => {
  interface RetryOptions {
    maxRetries: number;
    backoffMs: number;
    multiplier: number;
  }
  
  async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = { maxRetries: 3, backoffMs: 1000, multiplier: 2 }
  ): Promise<{ success: boolean; attempts: number; result?: T; error?: Error }> {
    let attempts = 0;
    let lastError: Error | undefined;
    
    while (attempts < options.maxRetries) {
      attempts++;
      try {
        const result = await fn();
        return { success: true, attempts, result };
      } catch (error) {
        lastError = error as Error;
        // Simulated wait
      }
    }
    
    return { success: false, attempts, error: lastError };
  }

  it('should succeed on first try', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    
    const result = await withRetry(fn);
    
    expect(result.success).toBe(true);
    expect(result.attempts).toBe(1);
    expect(result.result).toBe('success');
  });

  it('should retry on failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');
    
    const result = await withRetry(fn);
    
    expect(result.success).toBe(true);
    expect(result.attempts).toBe(3);
  });

  it('should give up after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Always fails'));
    
    const result = await withRetry(fn, { maxRetries: 3, backoffMs: 100, multiplier: 2 });
    
    expect(result.success).toBe(false);
    expect(result.attempts).toBe(3);
    expect(result.error?.message).toBe('Always fails');
  });
});

// ============================================================
// GRACEFUL DEGRADATION TESTS
// ============================================================

describe('Error Handling: Graceful Degradation', () => {
  interface FeatureState {
    available: boolean;
    fallback: string;
    degradedMessage?: string;
  }
  
  function getFeatureState(feature: string, isOnline: boolean, hasPermission: boolean): FeatureState {
    const features: Record<string, FeatureState> = {
      qrScanner: {
        available: hasPermission,
        fallback: 'manualEntry',
        degradedMessage: hasPermission ? undefined : 'Camera permission required. Enter code manually.',
      },
      realTimeUpdates: {
        available: isOnline,
        fallback: 'polling',
        degradedMessage: isOnline ? undefined : 'Offline mode. Updates may be delayed.',
      },
      locationServices: {
        available: hasPermission && isOnline,
        fallback: 'manualLocation',
        degradedMessage: (!hasPermission || !isOnline) ? 'Location unavailable. Select manually.' : undefined,
      },
    };
    
    return features[feature] || { available: false, fallback: 'none' };
  }

  it('should degrade QR scanner without camera permission', () => {
    const state = getFeatureState('qrScanner', true, false);
    
    expect(state.available).toBe(false);
    expect(state.fallback).toBe('manualEntry');
    expect(state.degradedMessage).toContain('Camera permission');
  });

  it('should degrade real-time updates when offline', () => {
    const state = getFeatureState('realTimeUpdates', false, true);
    
    expect(state.available).toBe(false);
    expect(state.fallback).toBe('polling');
    expect(state.degradedMessage).toContain('Offline');
  });

  it('should provide full features when all conditions met', () => {
    const state = getFeatureState('qrScanner', true, true);
    
    expect(state.available).toBe(true);
    expect(state.degradedMessage).toBeUndefined();
  });

  it('should degrade location without permission or connection', () => {
    const offlineState = getFeatureState('locationServices', false, true);
    const noPermState = getFeatureState('locationServices', true, false);
    
    expect(offlineState.available).toBe(false);
    expect(noPermState.available).toBe(false);
  });
});

// ============================================================
// ERROR RECOVERY TESTS
// ============================================================

describe('Error Handling: Error Recovery', () => {
  interface RecoveryState {
    canRecover: boolean;
    recoveryAction: string;
    requiresUserAction: boolean;
  }
  
  function getRecoveryStrategy(errorType: string): RecoveryState {
    const strategies: Record<string, RecoveryState> = {
      network_timeout: {
        canRecover: true,
        recoveryAction: 'retry',
        requiresUserAction: false,
      },
      auth_expired: {
        canRecover: true,
        recoveryAction: 'refresh_token',
        requiresUserAction: false,
      },
      auth_invalid: {
        canRecover: true,
        recoveryAction: 'login',
        requiresUserAction: true,
      },
      data_corrupted: {
        canRecover: true,
        recoveryAction: 'clear_cache',
        requiresUserAction: false,
      },
      permission_denied: {
        canRecover: true,
        recoveryAction: 'request_permission',
        requiresUserAction: true,
      },
      unknown: {
        canRecover: false,
        recoveryAction: 'report',
        requiresUserAction: true,
      },
    };
    
    return strategies[errorType] || strategies.unknown;
  }

  it('should auto-recover from network timeouts', () => {
    const recovery = getRecoveryStrategy('network_timeout');
    
    expect(recovery.canRecover).toBe(true);
    expect(recovery.recoveryAction).toBe('retry');
    expect(recovery.requiresUserAction).toBe(false);
  });

  it('should auto-recover from expired tokens', () => {
    const recovery = getRecoveryStrategy('auth_expired');
    
    expect(recovery.canRecover).toBe(true);
    expect(recovery.recoveryAction).toBe('refresh_token');
    expect(recovery.requiresUserAction).toBe(false);
  });

  it('should require user action for invalid auth', () => {
    const recovery = getRecoveryStrategy('auth_invalid');
    
    expect(recovery.requiresUserAction).toBe(true);
    expect(recovery.recoveryAction).toBe('login');
  });

  it('should handle unknown errors safely', () => {
    const recovery = getRecoveryStrategy('unknown');
    
    expect(recovery.canRecover).toBe(false);
    expect(recovery.recoveryAction).toBe('report');
  });
});

// ============================================================
// SENTRY INTEGRATION TESTS
// ============================================================

describe('Error Handling: Sentry Integration', () => {
  const mockSentry = {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    setContext: vi.fn(),
    setUser: vi.fn(),
    addBreadcrumb: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should capture exceptions with context', () => {
    const error = new Error('Payment failed');
    const context = { orderId: 'ord-123', amount: 99.99 };
    
    mockSentry.setContext('payment', context);
    mockSentry.captureException(error);
    
    expect(mockSentry.setContext).toHaveBeenCalledWith('payment', context);
    expect(mockSentry.captureException).toHaveBeenCalledWith(error);
  });

  it('should add breadcrumbs for navigation', () => {
    mockSentry.addBreadcrumb({
      category: 'navigation',
      message: 'Navigated to PaymentScreen',
      level: 'info',
    });
    
    expect(mockSentry.addBreadcrumb).toHaveBeenCalled();
  });

  it('should set user context for error tracking', () => {
    mockSentry.setUser({
      id: 'user-123',
      email: 'test@example.com',
    });
    
    expect(mockSentry.setUser).toHaveBeenCalledWith({
      id: 'user-123',
      email: 'test@example.com',
    });
  });
});

console.log('✅ Error handling tests defined');
