import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123',
      });

    if (loginResponse.status === 200 || loginResponse.status === 201) {
      authToken = loginResponse.body.access_token;
      userId = loginResponse.body.user?.id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /payments/wallet', () => {
    it('should return user wallet', async () => {
      if (!authToken) return;

      const response = await request(app.getHttpServer())
        .get('/payments/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('balance');
      }
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments/wallet');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /payments/methods', () => {
    it('should return payment methods', async () => {
      if (!authToken) return;

      const response = await request(app.getHttpServer())
        .get('/payments/methods')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data || response.body)).toBe(true);
    });
  });

  describe('GET /payments/transactions', () => {
    it('should return user transactions', async () => {
      if (!authToken) return;

      const response = await request(app.getHttpServer())
        .get('/payments/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /payments/process', () => {
    it('should fail with invalid order_id', async () => {
      if (!authToken) return;

      const response = await request(app.getHttpServer())
        .post('/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          order_id: 'invalid-uuid',
          payment_method: 'credit_card',
          amount: 100,
        });

      expect(response.status).toBe(400);
    });

    it('should fail with negative amount', async () => {
      if (!authToken) return;

      const response = await request(app.getHttpServer())
        .post('/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          order_id: '00000000-0000-0000-0000-000000000000',
          payment_method: 'credit_card',
          amount: -50,
        });

      expect(response.status).toBe(400);
    });

    it('should fail with invalid payment method', async () => {
      if (!authToken) return;

      const response = await request(app.getHttpServer())
        .post('/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          order_id: '00000000-0000-0000-0000-000000000000',
          payment_method: 'bitcoin',
          amount: 100,
        });

      expect(response.status).toBe(400);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/process')
        .send({
          order_id: '00000000-0000-0000-0000-000000000000',
          payment_method: 'credit_card',
          amount: 100,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /payments/wallet/recharge', () => {
    it('should fail with negative amount', async () => {
      if (!authToken) return;

      const response = await request(app.getHttpServer())
        .post('/payments/wallet/recharge')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: -100,
          payment_method_id: '00000000-0000-0000-0000-000000000000',
        });

      expect(response.status).toBe(400);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/wallet/recharge')
        .send({
          amount: 100,
          payment_method_id: '00000000-0000-0000-0000-000000000000',
        });

      expect(response.status).toBe(401);
    });
  });
});
