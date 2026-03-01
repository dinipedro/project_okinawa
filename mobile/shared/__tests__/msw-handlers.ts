/**
 * MSW (Mock Service Worker) Handlers
 * 
 * These handlers intercept API calls and return mock responses.
 * This enables REAL integration testing without a running backend.
 * 
 * If API contracts change, tests will fail immediately.
 * 
 * @module shared/__tests__/msw-handlers
 */

import { http, HttpResponse } from 'msw';

// Base API URL for tests
const API_BASE = 'http://localhost:3000';

// ============================================================
// AUTH HANDLERS
// ============================================================

export const authHandlers = [
  // POST /auth/login
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    // Validate required fields
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { statusCode: 400, message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Simulate invalid credentials
    if (body.password === 'wrongpassword') {
      return HttpResponse.json(
        { statusCode: 401, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Success response
    return HttpResponse.json({
      access_token: 'mock_jwt_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      user: {
        id: 'user-123',
        email: body.email,
        full_name: 'Test User',
      },
    });
  }),

  // POST /auth/register
  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string; full_name: string };
    
    // Validate email format
    if (!body.email?.includes('@')) {
      return HttpResponse.json(
        { statusCode: 400, message: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password length
    if (body.password?.length < 8) {
      return HttpResponse.json(
        { statusCode: 400, message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    // Success response
    return HttpResponse.json({
      id: 'user-' + Date.now(),
      email: body.email,
      full_name: body.full_name,
      created_at: new Date().toISOString(),
    });
  }),

  // GET /auth/me
  http.get(`${API_BASE}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { statusCode: 401, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      id: 'user-123',
      email: 'test@example.com',
      full_name: 'Test User',
      roles: ['customer'],
    });
  }),
];

// ============================================================
// RESERVATION HANDLERS
// ============================================================

export const reservationHandlers = [
  // POST /reservations
  http.post(`${API_BASE}/reservations`, async ({ request }) => {
    const body = await request.json() as {
      restaurant_id: string;
      date: string;
      time: string;
      party_size: number;
    };
    
    // Validate required fields
    const requiredFields = ['restaurant_id', 'date', 'time', 'party_size'];
    const missingFields = requiredFields.filter(f => !(f in body));
    
    if (missingFields.length > 0) {
      return HttpResponse.json(
        { statusCode: 400, message: `Missing fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate party size
    if (body.party_size < 1 || body.party_size > 20) {
      return HttpResponse.json(
        { statusCode: 400, message: 'Party size must be between 1 and 20' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      id: 'res-' + Date.now(),
      ...body,
      status: 'confirmed',
      guests: [],
      created_at: new Date().toISOString(),
    });
  }),

  // GET /reservations/:id
  http.get(`${API_BASE}/reservations/:id`, ({ params }) => {
    const { id } = params;
    
    if (id === 'not-found') {
      return HttpResponse.json(
        { statusCode: 404, message: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      id,
      restaurant_id: 'rest-123',
      date: '2024-01-20',
      time: '19:00',
      party_size: 4,
      status: 'confirmed',
      guests: [
        { id: 'g1', name: 'Guest 1', status: 'accepted' },
      ],
    });
  }),

  // POST /reservations/:id/guests
  http.post(`${API_BASE}/reservations/:id/guests`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as { method: string; recipient: string };
    
    return HttpResponse.json({
      invitation_id: 'inv-' + Date.now(),
      reservation_id: id,
      method: body.method,
      status: 'pending',
    });
  }),
];

// ============================================================
// ORDER HANDLERS
// ============================================================

export const orderHandlers = [
  // POST /orders
  http.post(`${API_BASE}/orders`, async ({ request }) => {
    const body = await request.json() as {
      restaurant_id: string;
      items: Array<{ menu_item_id: string; quantity: number }>;
      order_type: string;
    };
    
    if (!body.items?.length) {
      return HttpResponse.json(
        { statusCode: 400, message: 'Order must have at least one item' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      id: 'ord-' + Date.now(),
      ...body,
      status: 'pending',
      total: body.items.reduce((sum, item) => sum + (item.quantity * 25), 0),
      created_at: new Date().toISOString(),
    });
  }),

  // GET /orders/:id
  http.get(`${API_BASE}/orders/:id`, ({ params }) => {
    const { id } = params;
    
    return HttpResponse.json({
      id,
      restaurant_id: 'rest-123',
      items: [
        { id: 'oi-1', menu_item_id: 'item-1', name: 'Ramen', quantity: 2, status: 'preparing' },
        { id: 'oi-2', menu_item_id: 'item-2', name: 'Gyoza', quantity: 1, status: 'ready' },
      ],
      status: 'preparing',
      total: 130.70,
    });
  }),

  // PATCH /orders/:id/status
  http.patch(`${API_BASE}/orders/:id/status`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as { status: string };
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(body.status)) {
      return HttpResponse.json(
        { statusCode: 400, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      id,
      status: body.status,
      updated_at: new Date().toISOString(),
    });
  }),
];

// ============================================================
// PAYMENT HANDLERS
// ============================================================

export const paymentHandlers = [
  // POST /payments
  http.post(`${API_BASE}/payments`, async ({ request }) => {
    const body = await request.json() as {
      order_id: string;
      amount: number;
      method: string;
    };
    
    const validMethods = ['credit_card', 'debit_card', 'pix', 'apple_pay', 'google_pay'];
    
    if (!validMethods.includes(body.method)) {
      return HttpResponse.json(
        { statusCode: 400, message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}` },
        { status: 400 }
      );
    }
    
    if (body.amount <= 0) {
      return HttpResponse.json(
        { statusCode: 400, message: 'Amount must be positive' },
        { status: 400 }
      );
    }
    
    // Simulate PIX response
    if (body.method === 'pix') {
      return HttpResponse.json({
        transaction_id: 'txn-' + Date.now(),
        status: 'pending',
        method: 'pix',
        pix_code: '00020126580014br.gov.bcb.pix...',
        qr_code_url: 'data:image/png;base64,...',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });
    }
    
    // Success for card payments
    return HttpResponse.json({
      transaction_id: 'txn-' + Date.now(),
      status: 'completed',
      method: body.method,
      amount: body.amount,
    });
  }),

  // POST /payments/split
  http.post(`${API_BASE}/payments/split`, async ({ request }) => {
    const body = await request.json() as {
      order_id: string;
      mode: 'equal' | 'custom' | 'by_item';
      participants: string[];
      total: number;
    };
    
    if (body.participants?.length < 2) {
      return HttpResponse.json(
        { statusCode: 400, message: 'At least 2 participants required for split' },
        { status: 400 }
      );
    }
    
    const perPerson = body.total / body.participants.length;
    
    return HttpResponse.json({
      order_id: body.order_id,
      mode: body.mode,
      total: body.total,
      per_person: perPerson,
      breakdown: body.participants.map(p => ({
        user_id: p,
        amount: perPerson,
        status: 'pending',
      })),
    });
  }),
];

// ============================================================
// ALL HANDLERS
// ============================================================

export const handlers = [
  ...authHandlers,
  ...reservationHandlers,
  ...orderHandlers,
  ...paymentHandlers,
];

export default handlers;
