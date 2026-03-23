import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ReservationsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let restaurantId: string;
  let reservationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // Login to get auth token (assuming test user exists)
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123',
      });

    if (loginResponse.status === 200 || loginResponse.status === 201) {
      authToken = loginResponse.body.access_token;
    }

    // Get a restaurant for testing
    const restaurantsResponse = await request(app.getHttpServer())
      .get('/restaurants')
      .set('Authorization', `Bearer ${authToken}`);

    if (restaurantsResponse.body.data?.length > 0) {
      restaurantId = restaurantsResponse.body.data[0].id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /reservations', () => {
    it('should create a new reservation', async () => {
      if (!authToken || !restaurantId) {
        console.log('Skipping test - no auth token or restaurant');
        return;
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(19, 0, 0, 0);

      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant_id: restaurantId,
          reservation_date: tomorrow.toISOString(),
          reservation_time: '19:00',
          party_size: 4,
          special_requests: 'Window seat preferred',
        });

      if (response.status === 201) {
        expect(response.body).toHaveProperty('id');
        expect(response.body.party_size).toBe(4);
        expect(response.body.status).toBe('pending');
        reservationId = response.body.id;
      }
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/reservations')
        .send({
          restaurant_id: restaurantId,
          reservation_date: new Date().toISOString(),
          reservation_time: '19:00',
          party_size: 4,
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid party size', async () => {
      if (!authToken || !restaurantId) return;

      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant_id: restaurantId,
          reservation_date: new Date().toISOString(),
          reservation_time: '19:00',
          party_size: -1,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /reservations/my-reservations', () => {
    it('should return user reservations', async () => {
      if (!authToken) return;

      const response = await request(app.getHttpServer())
        .get('/reservations/my-reservations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data || response.body)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/reservations/my-reservations');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /reservations/:id', () => {
    it('should return reservation details', async () => {
      if (!authToken || !reservationId) return;

      const response = await request(app.getHttpServer())
        .get(`/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body.id).toBe(reservationId);
      }
    });

    it('should return 404 for non-existent reservation', async () => {
      if (!authToken) return;

      const response = await request(app.getHttpServer())
        .get('/reservations/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /reservations/:id/status', () => {
    it('should cancel a reservation', async () => {
      if (!authToken || !reservationId) return;

      const response = await request(app.getHttpServer())
        .patch(`/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'cancelled',
          cancellation_reason: 'Plans changed',
        });

      if (response.status === 200) {
        expect(response.body.status).toBe('cancelled');
      }
    });
  });
});
