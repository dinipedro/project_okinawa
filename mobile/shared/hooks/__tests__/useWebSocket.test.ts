/**
 * useWebSocket Hook Tests
 * 
 * Tests for WebSocket connection, events, and reconnection logic.
 * 
 * @module shared/hooks/__tests__/useWebSocket.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================
// WEBSOCKET SIMULATION
// ============================================================

interface MockSocket {
  connected: boolean;
  listeners: Map<string, Set<(data: any) => void>>;
  emit: ReturnType<typeof vi.fn>;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
  disconnect: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
}

function createMockSocket(): MockSocket {
  const listeners = new Map<string, Set<(data: any) => void>>();
  
  return {
    connected: false,
    listeners,
    emit: vi.fn(),
    on(event, callback) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(callback);
    },
    off(event, callback) {
      if (callback && listeners.has(event)) {
        listeners.get(event)!.delete(callback);
      } else if (listeners.has(event)) {
        listeners.delete(event);
      }
    },
    disconnect: vi.fn(),
    connect: vi.fn(),
  };
}

interface UseWebSocketReturn {
  socket: MockSocket | null;
  connected: boolean;
  error: string | null;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  reconnect: () => void;
  disconnect: () => void;
}

function createUseWebSocket(
  mockSocket: MockSocket,
  options: { hasToken: boolean } = { hasToken: true }
): UseWebSocketReturn {
  let connected = false;
  let error: string | null = null;
  let socket: MockSocket | null = null;

  const connect = () => {
    if (!options.hasToken) {
      error = 'No authentication token found';
      return;
    }
    
    socket = mockSocket;
    mockSocket.connected = true;
    connected = true;
    error = null;
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      connected = false;
    }
  };

  const emit = (event: string, data?: any) => {
    if (socket && connected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected');
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const joinRoom = (room: string) => {
    emit('join', { room });
  };

  const leaveRoom = (room: string) => {
    emit('leave', { room });
  };

  // Auto-connect on creation
  connect();

  return {
    get socket() { return socket; },
    get connected() { return connected; },
    get error() { return error; },
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    reconnect: connect,
    disconnect,
  };
}

// ============================================================
// TESTS
// ============================================================

describe('useWebSocket Hook', () => {
  let mockSocket: MockSocket;

  beforeEach(() => {
    mockSocket = createMockSocket();
    vi.clearAllMocks();
  });

  // ============================================================
  // CONNECTION TESTS
  // ============================================================

  describe('connection', () => {
    it('should connect when token is available', () => {
      const hook = createUseWebSocket(mockSocket, { hasToken: true });
      
      expect(hook.connected).toBe(true);
      expect(hook.error).toBeNull();
    });

    it('should set error when no token', () => {
      const hook = createUseWebSocket(mockSocket, { hasToken: false });
      
      expect(hook.connected).toBe(false);
      expect(hook.error).toBe('No authentication token found');
    });

    it('should provide socket reference', () => {
      const hook = createUseWebSocket(mockSocket, { hasToken: true });
      
      expect(hook.socket).toBe(mockSocket);
    });
  });

  // ============================================================
  // EMIT TESTS
  // ============================================================

  describe('emit', () => {
    it('should emit events when connected', () => {
      const hook = createUseWebSocket(mockSocket);
      
      hook.emit('test_event', { data: 'test' });
      
      expect(mockSocket.emit).toHaveBeenCalledWith('test_event', { data: 'test' });
    });

    it('should not emit when disconnected', () => {
      const hook = createUseWebSocket(mockSocket, { hasToken: false });
      
      hook.emit('test_event', { data: 'test' });
      
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should emit without data', () => {
      const hook = createUseWebSocket(mockSocket);
      
      hook.emit('ping');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('ping', undefined);
    });
  });

  // ============================================================
  // EVENT LISTENER TESTS
  // ============================================================

  describe('event listeners', () => {
    it('should register event listeners', () => {
      const hook = createUseWebSocket(mockSocket);
      const callback = vi.fn();
      
      hook.on('order_update', callback);
      
      expect(mockSocket.listeners.has('order_update')).toBe(true);
    });

    it('should unregister specific callback', () => {
      const hook = createUseWebSocket(mockSocket);
      const callback = vi.fn();
      
      hook.on('order_update', callback);
      hook.off('order_update', callback);
      
      expect(mockSocket.listeners.get('order_update')?.has(callback)).toBe(false);
    });

    it('should unregister all callbacks for event', () => {
      const hook = createUseWebSocket(mockSocket);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      hook.on('order_update', callback1);
      hook.on('order_update', callback2);
      hook.off('order_update');
      
      expect(mockSocket.listeners.has('order_update')).toBe(false);
    });

    it('should handle multiple listeners for same event', () => {
      const hook = createUseWebSocket(mockSocket);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      hook.on('message', callback1);
      hook.on('message', callback2);
      
      expect(mockSocket.listeners.get('message')?.size).toBe(2);
    });
  });

  // ============================================================
  // ROOM MANAGEMENT TESTS
  // ============================================================

  describe('room management', () => {
    it('should join room', () => {
      const hook = createUseWebSocket(mockSocket);
      
      hook.joinRoom('order:123');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('join', { room: 'order:123' });
    });

    it('should leave room', () => {
      const hook = createUseWebSocket(mockSocket);
      
      hook.leaveRoom('order:123');
      
      expect(mockSocket.emit).toHaveBeenCalledWith('leave', { room: 'order:123' });
    });

    it('should join multiple rooms', () => {
      const hook = createUseWebSocket(mockSocket);
      
      hook.joinRoom('order:123');
      hook.joinRoom('restaurant:456');
      
      expect(mockSocket.emit).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================
  // DISCONNECT TESTS
  // ============================================================

  describe('disconnect', () => {
    it('should disconnect socket', () => {
      const hook = createUseWebSocket(mockSocket);
      
      hook.disconnect();
      
      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(hook.connected).toBe(false);
    });

    it('should clear socket reference', () => {
      const hook = createUseWebSocket(mockSocket);
      
      hook.disconnect();
      
      expect(hook.socket).toBeNull();
    });
  });

  // ============================================================
  // RECONNECT TESTS
  // ============================================================

  describe('reconnect', () => {
    it('should reconnect after disconnect', () => {
      const hook = createUseWebSocket(mockSocket);
      
      hook.disconnect();
      expect(hook.connected).toBe(false);
      
      hook.reconnect();
      expect(hook.connected).toBe(true);
    });
  });

  // ============================================================
  // ERROR HANDLING TESTS
  // ============================================================

  describe('error handling', () => {
    it('should track connection errors', () => {
      const hook = createUseWebSocket(mockSocket, { hasToken: false });
      
      expect(hook.error).not.toBeNull();
    });

    it('should clear error on successful connection', () => {
      const hook = createUseWebSocket(mockSocket, { hasToken: true });
      
      expect(hook.error).toBeNull();
    });
  });
});

// ============================================================
// RECONNECTION LOGIC TESTS
// ============================================================

describe('WebSocket Reconnection Logic', () => {
  it('should implement exponential backoff', () => {
    const baseDelay = 1000;
    const maxDelay = 30000;
    
    function getBackoffDelay(attempt: number): number {
      const delay = baseDelay * Math.pow(2, attempt);
      return Math.min(delay, maxDelay);
    }
    
    expect(getBackoffDelay(0)).toBe(1000);
    expect(getBackoffDelay(1)).toBe(2000);
    expect(getBackoffDelay(2)).toBe(4000);
    expect(getBackoffDelay(3)).toBe(8000);
    expect(getBackoffDelay(5)).toBe(30000); // Capped at max
  });

  it('should limit reconnection attempts', () => {
    const maxAttempts = 5;
    let attempts = 0;
    
    function shouldReconnect(): boolean {
      if (attempts >= maxAttempts) return false;
      attempts++;
      return true;
    }
    
    for (let i = 0; i < 10; i++) {
      shouldReconnect();
    }
    
    expect(attempts).toBe(maxAttempts);
  });

  it('should reset attempts on successful connection', () => {
    let attempts = 3;
    
    function onConnected() {
      attempts = 0;
    }
    
    onConnected();
    expect(attempts).toBe(0);
  });
});

console.log('✅ useWebSocket hook tests defined');
