import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Restaurants (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let restaurantId: string;

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
        email: 'owner@okinawa.com',
        password: 'password123',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/restaurants (GET)', () => {
    it('should get all restaurants', () => {
      return request(app.getHttpServer())
        .get('/restaurants')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          restaurantId = res.body[0].id;
        });
    });

    it('should filter restaurants by city', () => {
      return request(app.getHttpServer())
        .get('/restaurants?city=São Paulo')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((restaurant: any) => {
            expect(restaurant.city).toBe('São Paulo');
          });
        });
    });

    it('should filter restaurants by service_type', () => {
      return request(app.getHttpServer())
        .get('/restaurants?service_type=fine_dining')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((restaurant: any) => {
            expect(restaurant.service_type).toBe('fine_dining');
          });
        });
    });
  });

  describe('/restaurants/:id (GET)', () => {
    it('should get restaurant by id', () => {
      return request(app.getHttpServer())
        .get(`/restaurants/${restaurantId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('description');
          expect(res.body).toHaveProperty('address');
        });
    });

    it('should return 404 for non-existent restaurant', () => {
      return request(app.getHttpServer())
        .get('/restaurants/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('/restaurants (POST)', () => {
    it('should create a new restaurant', () => {
      const timestamp = Date.now();
      return request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test Restaurant ${timestamp}`,
          description: 'A test restaurant',
          address: 'Test Street, 123',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01000-000',
          phone: '+55 11 1234-5678',
          email: `restaurant${timestamp}@example.com`,
          service_type: 'quick_service',
          cuisine_types: ['Brazilian'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(`Test Restaurant ${timestamp}`);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/restaurants')
        .send({
          name: 'Test Restaurant',
          description: 'A test restaurant',
          address: 'Test Street, 123',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01000-000',
          phone: '+55 11 1234-5678',
          email: 'test@example.com',
          service_type: 'quick_service',
        })
        .expect(401);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Incomplete Restaurant',
        })
        .expect(400);
    });
  });
});
