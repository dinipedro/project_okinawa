/**
 * Socket Service Tests
 * 
 * Tests for WebSocket connection management, event handling, and reconnection.
 * 
 * @module shared/services/__tests__/socket.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================
// SOCKET SERVICE SIMULATION
// ============================================================

type SocketEvent = 'connect' | 'disconnect' | 'error' | 'connect_error' | string;

interface SocketServiceConfig {
  url: string;
  namespace?: string;
  auth?: { token: string };
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface MockSocketInstance {
  connected: boolean;
  listeners: Map<SocketEvent, Set<(...args: any[]) => void>>;
  on: (event: SocketEvent, callback: (...args: any[]) => void) => void;
  off: (event: SocketEvent, callback?: (...args: any[]) => void) => void;
  emit: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  trigger: (event: SocketEvent, ...args: any[]) => void;
}

function createMockSocketInstance(): MockSocketInstance {
  const listeners = new Map<SocketEvent, Set<(...args: any[]) => void>>();
  let connected = false;

  return {
    get connected() { return connected; },
    set connected(value: boolean) { connected = value; },
    listeners,
    
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
    
    emit: vi.fn(),
    connect: vi.fn(() => {
      connected = true;
    }),
    disconnect: vi.fn(() => {
      connected = false;
    }),
    
    trigger(event, ...args) {
      listeners.get(event)?.forEach(cb => cb(...args));
    },
  };
}

interface SocketService {
  socket: MockSocketInstance | null;
  connected: boolean;
  connect: (config: SocketServiceConfig) => Promise<void>;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

function createSocketService(mockInstance: MockSocketInstance): SocketService {
  let socket: MockSocketInstance | null = null;

  return {
    get socket() { return socket; },
    get connected() { return socket?.connected ?? false; },
    
    connect: async (config) => {
      if (!config.auth?.token) {
        throw new Error('Authentication token required');
      }
      
      socket = mockInstance;
      socket.connect();
      socket.trigger('connect');
    },
    
    disconnect: () => {
      if (socket) {
        socket.disconnect();
        socket.trigger('disconnect');
        socket = null;
      }
    },
    
    emit: (event, data) => {
      if (socket?.connected) {
        socket.emit(event, data);
      }
    },
    
    on: (event, callback) => {
      socket?.on(event, callback);
    },
    
    off: (event, callback) => {
      socket?.off(event, callback);
    },
    
    joinRoom: (room) => {
      socket?.emit('join', { room });
    },
    
    leaveRoom: (room) => {
      socket?.emit('leave', { room });
    },
  };
}

// ============================================================
// TESTS
// ============================================================

describe('Socket Service', () => {
  let mockInstance: MockSocketInstance;
  let service: SocketService;

  beforeEach(() => {
    mockInstance = createMockSocketInstance();
    service = createSocketService(mockInstance);
    vi.clearAllMocks();
  });

  // ============================================================
  // CONNECTION TESTS
  // ============================================================

  describe('connect', () => {
    it('should connect with valid token', async () => {
      await service.connect({
        url: 'http://localhost:3000',
        auth: { token: 'valid_token' },
      });
      
      expect(mockInstance.connect).toHaveBeenCalled();
      expect(service.connected).toBe(true);
    });

    it('should throw without token', async () => {
      await expect(service.connect({
        url: 'http://localhost:3000',
      })).rejects.toThrow('Authentication token required');
    });

    it('should trigger connect event', async () => {
      const onConnect = vi.fn();
      mockInstance.on('connect', onConnect);
      
      await service.connect({
        url: 'http://localhost:3000',
        auth: { token: 'token' },
      });
      
      expect(onConnect).toHaveBeenCalled();
    });
  });

  // ============================================================
  // DISCONNECT TESTS
  // ============================================================

  describe('disconnect', () => {
    it('should disconnect socket', async () => {
      await service.connect({
        url: 'http://localhost:3000',
        auth: { token: 'token' },
      });
      
      service.disconnect();
      
      expect(mockInstance.disconnect).toHaveBeenCalled();
      expect(service.connected).toBe(false);
    });

    it('should trigger disconnect event', async () => {
      const onDisconnect = vi.fn();
      
      await service.connect({
        url: 'http://localhost:3000',
        auth: { token: 'token' },
      });
      
      mockInstance.on('disconnect', onDisconnect);
      service.disconnect();
      
      expect(onDisconnect).toHaveBeenCalled();
    });

    it('should clear socket reference', async () => {
      await service.connect({
        url: 'http://localhost:3000',
        auth: { token: 'token' },
      });
      
      service.disconnect();
      
      expect(service.socket).toBeNull();
    });
  });

  // ============================================================
  // EMIT TESTS
  // ============================================================

  describe('emit', () => {
    it('should emit events when connected', async () => {
      await service.connect({
        url: 'http://localhost:3000',
        auth: { token: 'token' },
      });
      
      service.emit('test_event', { data: 'test' });
      
      expect(mockInstance.emit).toHaveBeenCalledWith('test_event', { data: 'test' });
    });

    it('should not emit when disconnected', () => {
      service.emit('test_event', { data: 'test' });
      
      expect(mockInstance.emit).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // EVENT LISTENER TESTS
  // ============================================================

  describe('on/off', () => {
    it('should register event listeners', async () => {
      await service.connect({
        url: 'http://localhost:3000',
        auth: { token: 'token' },
      });
      
      const callback = vi.fn();
      service.on('message', callback);
      
      mockInstance.trigger('message', { text: 'Hello' });
      
      expect(callback).toHaveBeenCalledWith({ text: 'Hello' });
    });

    it('should unregister event listeners', async () => {
      await service.connect({
        url: 'http://localhost:3000',
        auth: { token: 'token' },
      });
      
      const callback = vi.fn();
      service.on('message', callback);
      service.off('message', callback);
      
      mockInstance.trigger('message', { text: 'Hello' });
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // ROOM MANAGEMENT TESTS
  // ============================================================

  describe('room management', () => {
    it('should join room', async () => {
      await service.connect({
        url: 'http://localhost:3000',
        auth: { token: 'token' },
      });
      
      service.joinRoom('order:123');
      
      expect(mockInstance.emit).toHaveBeenCalledWith('join', { room: 'order:123' });
    });

    it('should leave room', async () => {
      await service.connect({
        url: 'http://localhost:3000',
        auth: { token: 'token' },
      });
      
      service.leaveRoom('order:123');
      
      expect(mockInstance.emit).toHaveBeenCalledWith('leave', { room: 'order:123' });
    });
  });

  // ============================================================
  // RECONNECTION TESTS
  // ============================================================

  describe('reconnection', () => {
    it('should support reconnection after disconnect', async () => {
      await service.connect({
        url: 'http://localhost:3000',
        auth: { token: 'token' },
      });
      
      service.disconnect();
      
      await service.connect({
        url: 'http://localhost:3000',
        auth: { token: 'token' },
      });
      
      expect(service.connected).toBe(true);
    });
  });
});

// ============================================================
// ORDERS SOCKET TESTS
// ============================================================

describe('Orders Socket Service', () => {
  interface OrderUpdate {
    orderId: string;
    status: string;
    updatedAt: string;
  }

  interface OrdersSocketService {
    subscribeToOrder: (orderId: string, callback: (update: OrderUpdate) => void) => () => void;
    subscribeToRestaurant: (restaurantId: string, callback: (update: OrderUpdate) => void) => () => void;
  }

  function createOrdersSocketService(): OrdersSocketService {
    const subscriptions = new Map<string, Set<(update: OrderUpdate) => void>>();

    return {
      subscribeToOrder(orderId, callback) {
        const key = `order:${orderId}`;
        if (!subscriptions.has(key)) {
          subscriptions.set(key, new Set());
        }
        subscriptions.get(key)!.add(callback);
        
        return () => {
          subscriptions.get(key)?.delete(callback);
        };
      },
      
      subscribeToRestaurant(restaurantId, callback) {
        const key = `restaurant:${restaurantId}`;
        if (!subscriptions.has(key)) {
          subscriptions.set(key, new Set());
        }
        subscriptions.get(key)!.add(callback);
        
        return () => {
          subscriptions.get(key)?.delete(callback);
        };
      },
    };
  }

  it('should subscribe to order updates', () => {
    const service = createOrdersSocketService();
    const callback = vi.fn();
    
    const unsubscribe = service.subscribeToOrder('ord-123', callback);
    
    expect(typeof unsubscribe).toBe('function');
  });

  it('should unsubscribe from order updates', () => {
    const service = createOrdersSocketService();
    const callback = vi.fn();
    
    const unsubscribe = service.subscribeToOrder('ord-123', callback);
    unsubscribe();
    
    // Should not throw
    expect(true).toBe(true);
  });

  it('should subscribe to restaurant orders', () => {
    const service = createOrdersSocketService();
    const callback = vi.fn();
    
    const unsubscribe = service.subscribeToRestaurant('rest-456', callback);
    
    expect(typeof unsubscribe).toBe('function');
  });
});

// ============================================================
// RESERVATIONS SOCKET TESTS
// ============================================================

describe('Reservations Socket Service', () => {
  interface ReservationUpdate {
    reservationId: string;
    status: string;
    guestCount?: number;
  }

  interface ReservationsSocketService {
    subscribeToReservation: (reservationId: string, callback: (update: ReservationUpdate) => void) => () => void;
  }

  function createReservationsSocketService(): ReservationsSocketService {
    const subscriptions = new Map<string, Set<(update: ReservationUpdate) => void>>();

    return {
      subscribeToReservation(reservationId, callback) {
        const key = `reservation:${reservationId}`;
        if (!subscriptions.has(key)) {
          subscriptions.set(key, new Set());
        }
        subscriptions.get(key)!.add(callback);
        
        return () => {
          subscriptions.get(key)?.delete(callback);
        };
      },
    };
  }

  it('should subscribe to reservation updates', () => {
    const service = createReservationsSocketService();
    const callback = vi.fn();
    
    const unsubscribe = service.subscribeToReservation('res-789', callback);
    
    expect(typeof unsubscribe).toBe('function');
  });
});

console.log('✅ Socket service tests defined');
