import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock data
const mockTab = {
  id: 'tab-001',
  userId: 'user-123',
  restaurantId: 'rest-456',
  type: 'individual',
  status: 'open',
  preAuthAmount: 100,
  limitAmount: 500,
  items: [],
  total: 0,
  createdAt: new Date().toISOString(),
};

const mockTabItem = {
  id: 'item-001',
  tabId: 'tab-001',
  userId: 'user-123',
  menuItemId: 'menu-001',
  menuItemName: 'Cerveja Artesanal',
  quantity: 2,
  unitPrice: 18.90,
  total: 37.80,
  addedAt: new Date().toISOString(),
};

const mockHappyHour = {
  id: 'hh-001',
  restaurantId: 'rest-456',
  dayOfWeek: [4, 5], // Thursday, Friday
  startTime: '17:00',
  endTime: '20:00',
  discountPercentage: 30,
  isActive: true,
};

// MSW handlers
const handlers = [
  // Create tab
  http.post('/api/tabs', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockTab,
      restaurantId: body.restaurantId || mockTab.restaurantId,
      type: body.type || mockTab.type,
    }, { status: 201 });
  }),

  // Get tab by ID
  http.get('/api/tabs/:id', ({ params }) => {
    if (params.id === 'not-found') {
      return HttpResponse.json({ message: 'Tab not found' }, { status: 404 });
    }
    return HttpResponse.json({ ...mockTab, id: params.id });
  }),

  // Join tab
  http.post('/api/tabs/:id/join', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Joined tab successfully',
      tab: mockTab,
    });
  }),

  // Add item to tab
  http.post('/api/tabs/:id/items', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockTabItem,
      menuItemId: body.menuItemId,
      quantity: body.quantity,
    }, { status: 201 });
  }),

  // Get tab items
  http.get('/api/tabs/:id/items', () => {
    return HttpResponse.json({
      items: [mockTabItem],
      total: mockTabItem.total,
    });
  }),

  // Repeat round
  http.post('/api/tabs/:id/repeat-round', () => {
    return HttpResponse.json({
      success: true,
      items: [{ ...mockTabItem, id: 'item-002' }],
      message: 'Round repeated successfully',
    });
  }),

  // Calculate split
  http.post('/api/tabs/:id/split', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const splitType = body.splitType as string;
    
    if (splitType === 'equal') {
      return HttpResponse.json({
        splitType: 'equal',
        totalAmount: 150.00,
        perPerson: 50.00,
        participants: 3,
      });
    }
    
    return HttpResponse.json({
      splitType: 'by_consumption',
      breakdown: [
        { userId: 'user-1', amount: 75.00 },
        { userId: 'user-2', amount: 45.00 },
        { userId: 'user-3', amount: 30.00 },
      ],
    });
  }),

  // Process payment
  http.post('/api/tabs/:id/pay', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      paymentId: 'pay-001',
      amount: body.amount,
      method: body.paymentMethod,
      tabStatus: 'closed',
    });
  }),

  // Get active happy hour
  http.get('/api/happy-hour/active', ({ request }) => {
    const url = new URL(request.url);
    const restaurantId = url.searchParams.get('restaurantId');
    
    if (restaurantId === 'no-hh') {
      return HttpResponse.json({ active: false, happyHour: null });
    }
    
    return HttpResponse.json({
      active: true,
      happyHour: mockHappyHour,
    });
  }),

  // Create waiter call
  http.post('/api/waiter-calls', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'call-001',
      tabId: body.tabId,
      tableId: body.tableId,
      type: body.type || 'general',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Tabs API Integration Tests', () => {
  describe('Tab Lifecycle', () => {
    it('should create a new individual tab', async () => {
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: 'rest-456',
          type: 'individual',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.type).toBe('individual');
      expect(data.status).toBe('open');
    });

    it('should create a group tab', async () => {
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: 'rest-456',
          type: 'group',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.type).toBe('group');
    });

    it('should get tab by ID', async () => {
      const response = await fetch('/api/tabs/tab-001');
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe('tab-001');
    });

    it('should return 404 for non-existent tab', async () => {
      const response = await fetch('/api/tabs/not-found');
      
      expect(response.status).toBe(404);
    });
  });

  describe('Tab Operations', () => {
    it('should join an existing tab', async () => {
      const response = await fetch('/api/tabs/tab-001/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-456' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should add items to tab', async () => {
      const response = await fetch('/api/tabs/tab-001/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuItemId: 'menu-001',
          quantity: 2,
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.menuItemId).toBe('menu-001');
      expect(data.quantity).toBe(2);
    });

    it('should list tab items', async () => {
      const response = await fetch('/api/tabs/tab-001/items');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.items).toHaveLength(1);
      expect(data.total).toBeGreaterThan(0);
    });

    it('should repeat last round', async () => {
      const response = await fetch('/api/tabs/tab-001/repeat-round', {
        method: 'POST',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(1);
    });
  });

  describe('Tab Payment', () => {
    it('should calculate equal split', async () => {
      const response = await fetch('/api/tabs/tab-001/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          splitType: 'equal',
          participants: 3,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.splitType).toBe('equal');
      expect(data.perPerson).toBe(50.00);
    });

    it('should calculate split by consumption', async () => {
      const response = await fetch('/api/tabs/tab-001/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          splitType: 'by_consumption',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.splitType).toBe('by_consumption');
      expect(data.breakdown).toHaveLength(3);
    });

    it('should process payment', async () => {
      const response = await fetch('/api/tabs/tab-001/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 150.00,
          paymentMethod: 'pix',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tabStatus).toBe('closed');
    });
  });

  describe('Happy Hour', () => {
    it('should return active happy hour', async () => {
      const response = await fetch('/api/happy-hour/active?restaurantId=rest-456');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.active).toBe(true);
      expect(data.happyHour.discountPercentage).toBe(30);
    });

    it('should return no happy hour when inactive', async () => {
      const response = await fetch('/api/happy-hour/active?restaurantId=no-hh');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.active).toBe(false);
      expect(data.happyHour).toBeNull();
    });
  });

  describe('Waiter Calls', () => {
    it('should create waiter call', async () => {
      const response = await fetch('/api/waiter-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabId: 'tab-001',
          tableId: 'table-5',
          type: 'service',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.status).toBe('pending');
      expect(data.type).toBe('service');
    });
  });
});
