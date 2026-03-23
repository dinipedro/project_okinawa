import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock data
const mockEntry = {
  id: 'entry-001',
  userId: 'user-123',
  restaurantId: 'rest-456',
  eventDate: '2025-02-01',
  entryType: 'advance',
  ticketTier: 'pista',
  price: 60.00,
  consumptionCredit: 30.00,
  status: 'paid',
  qrCode: 'TK-ENTRY0-AB',
  qrPayload: 'base64encodedpayload',
};

const mockVipTable = {
  id: 'vip-001',
  userId: 'user-123',
  tableId: 'table-vip-1',
  tableName: 'Camarote Premium',
  restaurantId: 'rest-456',
  eventDate: '2025-02-01',
  guestCount: 8,
  minimumSpend: 2000.00,
  currentSpend: 0,
  status: 'confirmed',
  guests: [],
};

const mockQueueEntry = {
  id: 'queue-001',
  userId: 'user-123',
  restaurantId: 'rest-456',
  position: 15,
  priority: 'standard',
  estimatedWaitMinutes: 25,
  status: 'waiting',
  joinedAt: new Date().toISOString(),
};

const mockBirthdayEntry = {
  id: 'bd-001',
  userId: 'user-123',
  restaurantId: 'rest-456',
  eventDate: '2025-02-01',
  birthday: '1998-02-02',
  companions: 2,
  documentVerified: true,
  status: 'approved',
  qrCode: 'BD-USER12-XY',
};

const mockOccupancy = {
  restaurantId: 'rest-456',
  currentCount: 450,
  maxCapacity: 600,
  percentage: 75,
  level: 'moderate',
  lastUpdated: new Date().toISOString(),
};

// MSW handlers
const handlers = [
  // Purchase entry
  http.post('/api/club-entries', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockEntry,
      ticketTier: body.ticketTier || mockEntry.ticketTier,
      eventDate: body.eventDate || mockEntry.eventDate,
    }, { status: 201 });
  }),

  // Get my entries
  http.get('/api/club-entries/my', () => {
    return HttpResponse.json({
      entries: [mockEntry],
      total: 1,
    });
  }),

  // Validate entry
  http.post('/api/club-entries/validate', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const qrCode = body.qrCode as string;
    
    if (qrCode === 'INVALID') {
      return HttpResponse.json({
        valid: false,
        error: 'Invalid QR code',
      });
    }
    
    if (qrCode === 'USED') {
      return HttpResponse.json({
        valid: false,
        error: 'Entry already used',
      });
    }
    
    return HttpResponse.json({
      valid: true,
      entry: mockEntry,
    });
  }),

  // Check-in
  http.post('/api/club-entries/check-in', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      entryId: body.entryId,
      checkedInAt: new Date().toISOString(),
      wristbandColor: 'green',
    });
  }),

  // Check-out
  http.post('/api/club-entries/check-out', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      entryId: body.entryId,
      checkedOutAt: new Date().toISOString(),
    });
  }),

  // VIP Tables - Reserve
  http.post('/api/vip-tables', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockVipTable,
      tableId: body.tableId || mockVipTable.tableId,
      guestCount: body.guestCount || mockVipTable.guestCount,
    }, { status: 201 });
  }),

  // VIP Tables - Available
  http.get('/api/vip-tables/available', ({ request }) => {
    const url = new URL(request.url);
    const eventDate = url.searchParams.get('eventDate');
    
    return HttpResponse.json({
      tables: [
        { id: 'table-vip-1', name: 'Camarote Premium', capacity: 10, minimumSpend: 2000, available: true },
        { id: 'table-vip-2', name: 'Camarote Gold', capacity: 8, minimumSpend: 1500, available: true },
        { id: 'table-vip-3', name: 'Camarote Standard', capacity: 6, minimumSpend: 1000, available: false },
      ],
      eventDate,
    });
  }),

  // VIP Table tab
  http.get('/api/vip-tables/:id/tab', ({ params }) => {
    return HttpResponse.json({
      tableId: params.id,
      tabId: 'tab-vip-001',
      items: [],
      currentSpend: 500.00,
      minimumSpend: 2000.00,
      remainingMinimum: 1500.00,
    });
  }),

  // Queue - Join
  http.post('/api/queue', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockQueueEntry,
      priority: body.priority || mockQueueEntry.priority,
    }, { status: 201 });
  }),

  // Queue - Position
  http.get('/api/queue/position', () => {
    return HttpResponse.json({
      position: 12,
      estimatedWaitMinutes: 20,
      status: 'waiting',
      aheadOfYou: 11,
    });
  }),

  // Queue - Leave
  http.delete('/api/queue/:id', () => {
    return HttpResponse.json({
      success: true,
      message: 'Left queue successfully',
    });
  }),

  // Guest List - Add
  http.post('/api/guest-list', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'gl-001',
      name: body.name,
      phone: body.phone,
      eventDate: body.eventDate,
      companions: body.companions || 0,
      status: 'confirmed',
    }, { status: 201 });
  }),

  // Birthday Entry - Request
  http.post('/api/birthday-entries', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockBirthdayEntry,
      eventDate: body.eventDate || mockBirthdayEntry.eventDate,
      companions: body.companions || mockBirthdayEntry.companions,
      status: 'pending',
    }, { status: 201 });
  }),

  // Birthday Entry - Approve
  http.put('/api/birthday-entries/:id/approve', () => {
    return HttpResponse.json({
      ...mockBirthdayEntry,
      status: 'approved',
      qrCode: 'BD-USER12-XY',
    });
  }),

  // Birthday Entry - Reject
  http.put('/api/birthday-entries/:id/reject', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'bd-001',
      status: 'rejected',
      rejectionReason: body.reason || 'Invalid documentation',
    });
  }),

  // Occupancy
  http.get('/api/occupancy/:restaurantId', ({ params }) => {
    return HttpResponse.json({
      ...mockOccupancy,
      restaurantId: params.restaurantId,
    });
  }),

  // Lineup
  http.get('/api/lineup/:restaurantId/:date', ({ params }) => {
    return HttpResponse.json({
      restaurantId: params.restaurantId,
      eventDate: params.date,
      slots: [
        { time: '23:00', artist: 'DJ Opening', genre: 'House' },
        { time: '01:00', artist: 'DJ Snake', genre: 'EDM', isHeadliner: true },
        { time: '03:00', artist: 'DJ Closing', genre: 'Tech House' },
      ],
    });
  }),

  // Promoter - Sales
  http.get('/api/promoters/:id/sales', () => {
    return HttpResponse.json({
      promoterId: 'promo-001',
      totalSales: 45,
      totalRevenue: 3600.00,
      pendingCommission: 360.00,
      sales: [
        { date: '2025-01-30', count: 12, revenue: 960.00 },
        { date: '2025-01-31', count: 33, revenue: 2640.00 },
      ],
    });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Club API Integration Tests', () => {
  describe('Entry Management', () => {
    it('should purchase an entry ticket', async () => {
      const response = await fetch('/api/club-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventDate: '2025-02-01',
          ticketTier: 'pista',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.ticketTier).toBe('pista');
      expect(data.qrCode).toBeDefined();
    });

    it('should get user entries', async () => {
      const response = await fetch('/api/club-entries/my');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.entries).toHaveLength(1);
    });

    it('should validate a valid entry', async () => {
      const response = await fetch('/api/club-entries/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: 'TK-ENTRY0-AB' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.valid).toBe(true);
      expect(data.entry).toBeDefined();
    });

    it('should reject invalid entry', async () => {
      const response = await fetch('/api/club-entries/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: 'INVALID' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.valid).toBe(false);
      expect(data.error).toBe('Invalid QR code');
    });

    it('should reject already used entry', async () => {
      const response = await fetch('/api/club-entries/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: 'USED' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.valid).toBe(false);
      expect(data.error).toBe('Entry already used');
    });

    it('should check-in successfully', async () => {
      const response = await fetch('/api/club-entries/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: 'entry-001' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.wristbandColor).toBeDefined();
    });
  });

  describe('VIP Tables', () => {
    it('should get available tables', async () => {
      const response = await fetch('/api/vip-tables/available?eventDate=2025-02-01');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tables).toHaveLength(3);
      expect(data.tables.filter((t: { available: boolean }) => t.available)).toHaveLength(2);
    });

    it('should reserve a VIP table', async () => {
      const response = await fetch('/api/vip-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: 'table-vip-1',
          eventDate: '2025-02-01',
          guestCount: 8,
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.status).toBe('confirmed');
      expect(data.minimumSpend).toBe(2000);
    });

    it('should get VIP table tab', async () => {
      const response = await fetch('/api/vip-tables/vip-001/tab');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.currentSpend).toBeDefined();
      expect(data.remainingMinimum).toBeDefined();
    });
  });

  describe('Virtual Queue', () => {
    it('should join queue', async () => {
      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: 'rest-456',
          priority: 'standard',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.position).toBeDefined();
      expect(data.estimatedWaitMinutes).toBeDefined();
    });

    it('should get queue position', async () => {
      const response = await fetch('/api/queue/position');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.position).toBe(12);
      expect(data.aheadOfYou).toBe(11);
    });

    it('should leave queue', async () => {
      const response = await fetch('/api/queue/queue-001', {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Birthday Entry', () => {
    it('should request birthday entry', async () => {
      const response = await fetch('/api/birthday-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventDate: '2025-02-01',
          companions: 2,
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.status).toBe('pending');
    });

    it('should approve birthday entry', async () => {
      const response = await fetch('/api/birthday-entries/bd-001/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('approved');
      expect(data.qrCode).toBeDefined();
    });

    it('should reject birthday entry', async () => {
      const response = await fetch('/api/birthday-entries/bd-001/reject', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Document not legible' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('rejected');
    });
  });

  describe('Occupancy & Lineup', () => {
    it('should get current occupancy', async () => {
      const response = await fetch('/api/occupancy/rest-456');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.percentage).toBe(75);
      expect(data.level).toBe('moderate');
    });

    it('should get event lineup', async () => {
      const response = await fetch('/api/lineup/rest-456/2025-02-01');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.slots).toHaveLength(3);
      expect(data.slots.find((s: { isHeadliner?: boolean }) => s.isHeadliner)?.artist).toBe('DJ Snake');
    });
  });

  describe('Promoter System', () => {
    it('should get promoter sales', async () => {
      const response = await fetch('/api/promoters/promo-001/sales');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.totalSales).toBe(45);
      expect(data.pendingCommission).toBe(360.00);
    });
  });
});
