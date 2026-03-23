import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Orders (e2e)', () => {
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'customer1@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.access_token;

    // Get restaurant and menu item
    const restaurantsResponse = await request(app.getHttpServer())
      .get('/restaurants');
    restaurantId = restaurantsResponse.body[0].id;

    const menuResponse = await request(app.getHttpServer())
      .get(`/menu-items?restaurant_id=${restaurantId}`);
    menuItemId = menuResponse.body[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/orders (POST)', () => {
    it('should create a new order', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant_id: restaurantId,
          items: [
            {
              menu_item_id: menuItemId,
              quantity: 2,
              special_instructions: 'No wasabi please',
            },
          ],
          special_instructions: 'Please deliver to table 5',
          tip_amount: 10.00,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('total_amount');
          expect(res.body).toHaveProperty('subtotal_amount');
          expect(res.body).toHaveProperty('tax_amount');
          expect(res.body).toHaveProperty('tip_amount');
          expect(res.body.tip_amount).toBe(10.00);
          expect(res.body.items).toHaveLength(1);
          orderId = res.body.id;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          restaurant_id: restaurantId,
          items: [
            {
              menu_item_id: menuItemId,
              quantity: 1,
            },
          ],
        })
        .expect(401);
    });

    it('should fail with empty items', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant_id: restaurantId,
          items: [],
        })
        .expect(400);
    });

    it('should calculate correct totals', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant_id: restaurantId,
          items: [
            {
              menu_item_id: menuItemId,
              quantity: 1,
            },
          ],
          tip_amount: 5.00,
        })
        .expect(201)
        .expect((res) => {
          const subtotal = res.body.subtotal_amount;
          const tax = res.body.tax_amount;
          const tip = res.body.tip_amount;
          const total = res.body.total_amount;

          expect(tax).toBe(subtotal * 0.1);
          expect(tip).toBe(5.00);
          expect(total).toBe(subtotal + tax + tip);
        });
    });
  });

  describe('/orders (GET)', () => {
    it('should get all orders for current user', () => {
      return request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/orders')
        .expect(401);
    });
  });

  describe('/orders/:id (GET)', () => {
    it('should get order by id', () => {
      return request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe(orderId);
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('restaurant');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .expect(401);
    });
  });

  describe('/orders/:id (PATCH)', () => {
    it('should update order status', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'confirmed',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('confirmed');
        });
    });

    it('should fail with invalid status', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'invalid_status',
        })
        .expect(400);
    });
  });
});
