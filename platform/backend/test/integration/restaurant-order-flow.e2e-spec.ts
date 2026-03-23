import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Restaurant Order Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let restaurantId: string;
  let menuItemId: string;
  let orderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login first
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Test123!@#' });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create restaurant', () => {
    return request(app.getHttpServer())
      .post('/restaurants')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Restaurant',
        description: 'A test restaurant',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        phone: '1234567890',
        email: 'restaurant@test.com',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        restaurantId = res.body.id;
      });
  });

  it('should create menu item', () => {
    return request(app.getHttpServer())
      .post('/menu-items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        restaurant_id: restaurantId,
        name: 'Test Pizza',
        description: 'Delicious test pizza',
        price: 19.99,
        category: 'Pizza',
        is_available: true,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        menuItemId = res.body.id;
      });
  });

  it('should create order', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        restaurant_id: restaurantId,
        items: [
          {
            menu_item_id: menuItemId,
            quantity: 2,
            unit_price: 19.99,
          },
        ],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        orderId = res.body.id;
      });
  });

  it('should get order details', () => {
    return request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(orderId);
        expect(res.body.items).toBeDefined();
      });
  });
});
