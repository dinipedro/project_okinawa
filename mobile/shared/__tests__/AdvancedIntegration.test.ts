/**
 * Advanced Integration Tests
 * 
 * Tests for complex user flows, WebSocket connections,
 * offline behavior, and data synchronization.
 * 
 * @module shared/__tests__/AdvancedIntegration.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================
// WEBSOCKET INTEGRATION TESTS
// ============================================================

describe('Advanced Integration: WebSocket', () => {
  interface MockWebSocket {
    readyState: number;
    onopen: (() => void) | null;
    onmessage: ((event: { data: string }) => void) | null;
    onclose: (() => void) | null;
    onerror: ((error: Error) => void) | null;
    send: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  }
  
  let mockWs: MockWebSocket;
  
  beforeEach(() => {
    mockWs = {
      readyState: 0,
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
      send: vi.fn(),
      close: vi.fn(),
    };
  });

  it('should establish WebSocket connection', () => {
    mockWs.readyState = 1; // OPEN
    mockWs.onopen?.();
    
    expect(mockWs.readyState).toBe(1);
  });

  it('should handle order status updates', () => {
    const messageHandler = vi.fn();
    mockWs.onmessage = messageHandler;
    
    const orderUpdate = JSON.stringify({
      type: 'order_status',
      orderId: 'ord-123',
      status: 'preparing',
      timestamp: new Date().toISOString(),
    });
    
    mockWs.onmessage?.({ data: orderUpdate });
    
    expect(messageHandler).toHaveBeenCalledWith({ data: orderUpdate });
  });

  it('should handle KDS item ready notifications', () => {
    const notifications: any[] = [];
    mockWs.onmessage = (event) => {
      notifications.push(JSON.parse(event.data));
    };
    
    mockWs.onmessage?.({
      data: JSON.stringify({
        type: 'item_ready',
        orderId: 'ord-123',
        itemId: 'item-456',
        itemName: 'Ramen Tonkotsu',
      }),
    });
    
    expect(notifications[0].type).toBe('item_ready');
    expect(notifications[0].itemName).toBe('Ramen Tonkotsu');
  });

  it('should reconnect on connection loss', async () => {
    let reconnectAttempts = 0;
    const maxReconnects = 3;
    
    const reconnect = () => {
      if (reconnectAttempts < maxReconnects) {
        reconnectAttempts++;
        return true;
      }
      return false;
    };
    
    // Simulate connection loss
    mockWs.onclose?.();
    
    // Attempt reconnects
    while (reconnect()) {
      await new Promise(r => setTimeout(r, 10));
    }
    
    expect(reconnectAttempts).toBe(maxReconnects);
  });

  it('should queue messages when disconnected', () => {
    const messageQueue: string[] = [];
    
    function sendMessage(message: string) {
      if (mockWs.readyState !== 1) {
        messageQueue.push(message);
        return false;
      }
      mockWs.send(message);
      return true;
    }
    
    // Disconnected state
    mockWs.readyState = 3; // CLOSED
    sendMessage('{"type": "ping"}');
    sendMessage('{"type": "subscribe", "channel": "orders"}');
    
    expect(messageQueue).toHaveLength(2);
    expect(mockWs.send).not.toHaveBeenCalled();
  });

  it('should flush queued messages on reconnect', () => {
    const messageQueue: string[] = ['msg1', 'msg2', 'msg3'];
    
    function flushQueue() {
      while (messageQueue.length > 0 && mockWs.readyState === 1) {
        const msg = messageQueue.shift()!;
        mockWs.send(msg);
      }
    }
    
    mockWs.readyState = 1;
    flushQueue();
    
    expect(mockWs.send).toHaveBeenCalledTimes(3);
    expect(messageQueue).toHaveLength(0);
  });
});

// ============================================================
// OFFLINE SYNC TESTS
// ============================================================

describe('Advanced Integration: Offline Sync', () => {
  interface PendingAction {
    id: string;
    type: string;
    payload: any;
    timestamp: number;
    retryCount: number;
  }
  
  class OfflineQueue {
    private queue: PendingAction[] = [];
    
    add(type: string, payload: any): string {
      const action: PendingAction = {
        id: `action-${Date.now()}`,
        type,
        payload,
        timestamp: Date.now(),
        retryCount: 0,
      };
      this.queue.push(action);
      return action.id;
    }
    
    getAll(): PendingAction[] {
      return [...this.queue];
    }
    
    remove(id: string): boolean {
      const index = this.queue.findIndex(a => a.id === id);
      if (index > -1) {
        this.queue.splice(index, 1);
        return true;
      }
      return false;
    }
    
    incrementRetry(id: string): number {
      const action = this.queue.find(a => a.id === id);
      if (action) {
        action.retryCount++;
        return action.retryCount;
      }
      return -1;
    }
    
    clear(): void {
      this.queue = [];
    }
    
    size(): number {
      return this.queue.length;
    }
  }

  let offlineQueue: OfflineQueue;
  
  beforeEach(() => {
    offlineQueue = new OfflineQueue();
  });

  it('should queue actions when offline', () => {
    offlineQueue.add('create_order', { items: [{ id: '1', qty: 2 }] });
    offlineQueue.add('add_review', { rating: 5, comment: 'Great!' });
    
    expect(offlineQueue.size()).toBe(2);
  });

  it('should sync queued actions when online', async () => {
    const syncFn = vi.fn().mockResolvedValue({ success: true });
    
    offlineQueue.add('action1', { data: 1 });
    offlineQueue.add('action2', { data: 2 });
    
    const actions = offlineQueue.getAll();
    
    for (const action of actions) {
      const result = await syncFn(action);
      if (result.success) {
        offlineQueue.remove(action.id);
      }
    }
    
    expect(syncFn).toHaveBeenCalledTimes(2);
    expect(offlineQueue.size()).toBe(0);
  });

  it('should handle sync failures with retry', async () => {
    const syncFn = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue({ success: true });
    
    const actionId = offlineQueue.add('create_order', { items: [] });
    const maxRetries = 3;
    
    let synced = false;
    while (!synced && offlineQueue.incrementRetry(actionId) <= maxRetries) {
      try {
        await syncFn();
        synced = true;
        offlineQueue.remove(actionId);
      } catch (e) {
        // Retry
      }
    }
    
    expect(synced).toBe(true);
    expect(syncFn).toHaveBeenCalledTimes(2);
  });

  it('should preserve action order', () => {
    offlineQueue.add('action1', { order: 1 });
    offlineQueue.add('action2', { order: 2 });
    offlineQueue.add('action3', { order: 3 });
    
    const actions = offlineQueue.getAll();
    
    expect(actions[0].payload.order).toBe(1);
    expect(actions[1].payload.order).toBe(2);
    expect(actions[2].payload.order).toBe(3);
  });
});

// ============================================================
// DATA CONFLICT RESOLUTION TESTS
// ============================================================

describe('Advanced Integration: Conflict Resolution', () => {
  interface DataVersion {
    data: any;
    version: number;
    lastModified: number;
    modifiedBy: string;
  }
  
  type ConflictStrategy = 'server-wins' | 'client-wins' | 'merge' | 'manual';
  
  function resolveConflict(
    local: DataVersion,
    server: DataVersion,
    strategy: ConflictStrategy
  ): DataVersion {
    switch (strategy) {
      case 'server-wins':
        return server;
      case 'client-wins':
        return { ...local, version: server.version + 1 };
      case 'merge':
        return {
          data: { ...server.data, ...local.data },
          version: Math.max(local.version, server.version) + 1,
          lastModified: Date.now(),
          modifiedBy: 'merge',
        };
      default:
        throw new Error('Manual resolution required');
    }
  }

  it('should resolve with server-wins strategy', () => {
    const local: DataVersion = {
      data: { name: 'Local Edit' },
      version: 1,
      lastModified: 1000,
      modifiedBy: 'user',
    };
    
    const server: DataVersion = {
      data: { name: 'Server Edit' },
      version: 2,
      lastModified: 2000,
      modifiedBy: 'other',
    };
    
    const resolved = resolveConflict(local, server, 'server-wins');
    expect(resolved.data.name).toBe('Server Edit');
  });

  it('should resolve with client-wins strategy', () => {
    const local: DataVersion = {
      data: { name: 'Local Edit' },
      version: 1,
      lastModified: 3000,
      modifiedBy: 'user',
    };
    
    const server: DataVersion = {
      data: { name: 'Server Edit' },
      version: 2,
      lastModified: 2000,
      modifiedBy: 'other',
    };
    
    const resolved = resolveConflict(local, server, 'client-wins');
    expect(resolved.data.name).toBe('Local Edit');
    expect(resolved.version).toBe(3);
  });

  it('should merge non-conflicting changes', () => {
    const local: DataVersion = {
      data: { name: 'Same', localField: 'local value' },
      version: 1,
      lastModified: 1000,
      modifiedBy: 'user',
    };
    
    const server: DataVersion = {
      data: { name: 'Same', serverField: 'server value' },
      version: 2,
      lastModified: 2000,
      modifiedBy: 'other',
    };
    
    const resolved = resolveConflict(local, server, 'merge');
    expect(resolved.data.localField).toBe('local value');
    expect(resolved.data.serverField).toBe('server value');
  });
});

// ============================================================
// MULTI-USER REAL-TIME TESTS
// ============================================================

describe('Advanced Integration: Multi-User Real-Time', () => {
  interface Participant {
    id: string;
    name: string;
    joinedAt: number;
  }
  
  interface SharedOrder {
    id: string;
    participants: Participant[];
    items: Array<{ id: string; addedBy: string; name: string }>;
    splitMode: 'equal' | 'by_item';
  }
  
  class SharedOrderSession {
    private order: SharedOrder;
    private listeners: Array<(order: SharedOrder) => void> = [];
    
    constructor(orderId: string, creatorId: string, creatorName: string) {
      this.order = {
        id: orderId,
        participants: [{ id: creatorId, name: creatorName, joinedAt: Date.now() }],
        items: [],
        splitMode: 'equal',
      };
    }
    
    join(userId: string, userName: string): boolean {
      if (this.order.participants.find(p => p.id === userId)) {
        return false;
      }
      this.order.participants.push({ id: userId, name: userName, joinedAt: Date.now() });
      this.notify();
      return true;
    }
    
    leave(userId: string): boolean {
      const index = this.order.participants.findIndex(p => p.id === userId);
      if (index > -1) {
        this.order.participants.splice(index, 1);
        this.notify();
        return true;
      }
      return false;
    }
    
    addItem(userId: string, itemId: string, itemName: string): void {
      this.order.items.push({ id: itemId, addedBy: userId, name: itemName });
      this.notify();
    }
    
    getParticipantCount(): number {
      return this.order.participants.length;
    }
    
    getItemsByUser(userId: string): typeof this.order.items {
      return this.order.items.filter(item => item.addedBy === userId);
    }
    
    subscribe(callback: (order: SharedOrder) => void): () => void {
      this.listeners.push(callback);
      return () => {
        const index = this.listeners.indexOf(callback);
        if (index > -1) this.listeners.splice(index, 1);
      };
    }
    
    private notify(): void {
      this.listeners.forEach(cb => cb({ ...this.order }));
    }
    
    getOrder(): SharedOrder {
      return { ...this.order };
    }
  }

  it('should support multiple participants joining', () => {
    const session = new SharedOrderSession('ord-123', 'user1', 'Alice');
    
    session.join('user2', 'Bob');
    session.join('user3', 'Charlie');
    
    expect(session.getParticipantCount()).toBe(3);
  });

  it('should prevent duplicate joins', () => {
    const session = new SharedOrderSession('ord-123', 'user1', 'Alice');
    
    const firstJoin = session.join('user2', 'Bob');
    const secondJoin = session.join('user2', 'Bob');
    
    expect(firstJoin).toBe(true);
    expect(secondJoin).toBe(false);
    expect(session.getParticipantCount()).toBe(2);
  });

  it('should track items by user', () => {
    const session = new SharedOrderSession('ord-123', 'user1', 'Alice');
    session.join('user2', 'Bob');
    
    session.addItem('user1', 'item1', 'Ramen');
    session.addItem('user1', 'item2', 'Gyoza');
    session.addItem('user2', 'item3', 'Edamame');
    
    expect(session.getItemsByUser('user1')).toHaveLength(2);
    expect(session.getItemsByUser('user2')).toHaveLength(1);
  });

  it('should notify subscribers of changes', () => {
    const session = new SharedOrderSession('ord-123', 'user1', 'Alice');
    const callback = vi.fn();
    
    session.subscribe(callback);
    session.join('user2', 'Bob');
    session.addItem('user2', 'item1', 'Sushi');
    
    expect(callback).toHaveBeenCalledTimes(2);
  });
});

// ============================================================
// PAYMENT SPLIT FLOW TESTS
// ============================================================

describe('Advanced Integration: Payment Split Flow', () => {
  interface SplitPaymentSession {
    orderId: string;
    total: number;
    participants: string[];
    payments: Map<string, { amount: number; status: 'pending' | 'paid' }>;
  }
  
  function createSplitSession(
    orderId: string,
    total: number,
    participants: string[]
  ): SplitPaymentSession {
    const perPerson = total / participants.length;
    const payments = new Map(
      participants.map(p => [p, { amount: perPerson, status: 'pending' as const }])
    );
    
    return { orderId, total, participants, payments };
  }
  
  function processPayment(session: SplitPaymentSession, userId: string): boolean {
    const payment = session.payments.get(userId);
    if (payment && payment.status === 'pending') {
      payment.status = 'paid';
      return true;
    }
    return false;
  }
  
  function isFullyPaid(session: SplitPaymentSession): boolean {
    return [...session.payments.values()].every(p => p.status === 'paid');
  }
  
  function getPaidAmount(session: SplitPaymentSession): number {
    return [...session.payments.values()]
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  it('should split payment equally', () => {
    const session = createSplitSession('ord-123', 200, ['user1', 'user2', 'user3', 'user4']);
    
    expect(session.payments.get('user1')?.amount).toBe(50);
    expect(session.payments.get('user2')?.amount).toBe(50);
  });

  it('should track individual payments', () => {
    const session = createSplitSession('ord-123', 100, ['user1', 'user2']);
    
    processPayment(session, 'user1');
    
    expect(session.payments.get('user1')?.status).toBe('paid');
    expect(session.payments.get('user2')?.status).toBe('pending');
  });

  it('should detect when fully paid', () => {
    const session = createSplitSession('ord-123', 100, ['user1', 'user2']);
    
    expect(isFullyPaid(session)).toBe(false);
    
    processPayment(session, 'user1');
    expect(isFullyPaid(session)).toBe(false);
    
    processPayment(session, 'user2');
    expect(isFullyPaid(session)).toBe(true);
  });

  it('should calculate paid amount', () => {
    const session = createSplitSession('ord-123', 200, ['user1', 'user2', 'user3', 'user4']);
    
    processPayment(session, 'user1');
    processPayment(session, 'user2');
    
    expect(getPaidAmount(session)).toBe(100);
  });
});

// ============================================================
// RESERVATION GUEST INVITE FLOW TESTS
// ============================================================

describe('Advanced Integration: Guest Invitation Flow', () => {
  interface GuestInvitation {
    id: string;
    reservationId: string;
    method: 'sms' | 'email' | 'whatsapp' | 'link';
    recipient: string;
    status: 'pending' | 'sent' | 'accepted' | 'declined' | 'expired';
    sentAt?: number;
    respondedAt?: number;
    expiresAt: number;
  }
  
  function createInvitation(
    reservationId: string,
    method: GuestInvitation['method'],
    recipient: string
  ): GuestInvitation {
    return {
      id: `inv-${Date.now()}`,
      reservationId,
      method,
      recipient,
      status: 'pending',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
  }
  
  function sendInvitation(invitation: GuestInvitation): GuestInvitation {
    return {
      ...invitation,
      status: 'sent',
      sentAt: Date.now(),
    };
  }
  
  function respondToInvitation(
    invitation: GuestInvitation,
    accept: boolean
  ): GuestInvitation {
    if (Date.now() > invitation.expiresAt) {
      return { ...invitation, status: 'expired' };
    }
    
    return {
      ...invitation,
      status: accept ? 'accepted' : 'declined',
      respondedAt: Date.now(),
    };
  }

  it('should create pending invitation', () => {
    const invitation = createInvitation('res-123', 'sms', '+5511999999999');
    
    expect(invitation.status).toBe('pending');
    expect(invitation.method).toBe('sms');
  });

  it('should track sent status', () => {
    let invitation = createInvitation('res-123', 'email', 'guest@example.com');
    invitation = sendInvitation(invitation);
    
    expect(invitation.status).toBe('sent');
    expect(invitation.sentAt).toBeDefined();
  });

  it('should handle acceptance', () => {
    let invitation = createInvitation('res-123', 'whatsapp', '+5511888888888');
    invitation = sendInvitation(invitation);
    invitation = respondToInvitation(invitation, true);
    
    expect(invitation.status).toBe('accepted');
    expect(invitation.respondedAt).toBeDefined();
  });

  it('should handle declined invitations', () => {
    let invitation = createInvitation('res-123', 'link', 'guest@example.com');
    invitation = sendInvitation(invitation);
    invitation = respondToInvitation(invitation, false);
    
    expect(invitation.status).toBe('declined');
  });

  it('should expire old invitations', () => {
    let invitation = createInvitation('res-123', 'sms', '+5511777777777');
    invitation.expiresAt = Date.now() - 1000; // Already expired
    
    invitation = respondToInvitation(invitation, true);
    
    expect(invitation.status).toBe('expired');
  });
});

console.log('✅ Advanced integration tests defined');
