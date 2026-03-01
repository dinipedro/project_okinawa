import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth MFA (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserEmail: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Register a test user for MFA tests
    const timestamp = Date.now();
    testUserEmail = `mfa-test${timestamp}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testUserEmail,
        password: 'SecurePassword123!',
        full_name: 'MFA Test User',
      });

    authToken = registerResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/mfa/status (GET)', () => {
    it('should return MFA status (disabled by default)', () => {
      return request(app.getHttpServer())
        .get('/auth/mfa/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('mfa_enabled');
          expect(res.body.mfa_enabled).toBe(false);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/auth/mfa/status')
        .expect(401);
    });
  });

  describe('/auth/mfa/setup (POST)', () => {
    it('should initiate MFA setup and return secret', () => {
      return request(app.getHttpServer())
        .post('/auth/mfa/setup')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('secret');
          expect(res.body).toHaveProperty('qrCodeUrl');
          expect(res.body).toHaveProperty('backupCodes');
          expect(res.body.backupCodes).toHaveLength(10);
          expect(res.body.qrCodeUrl).toContain('otpauth://totp/');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/auth/mfa/setup')
        .expect(401);
    });
  });

  describe('/auth/mfa/enable (POST)', () => {
    it('should fail with invalid TOTP code', () => {
      return request(app.getHttpServer())
        .post('/auth/mfa/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ totp_code: '000000' })
        .expect(401);
    });

    it('should fail without TOTP code', () => {
      return request(app.getHttpServer())
        .post('/auth/mfa/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    it('should fail with invalid TOTP code format', () => {
      return request(app.getHttpServer())
        .post('/auth/mfa/enable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ totp_code: '12345' }) // Too short
        .expect(400);
    });
  });

  describe('/auth/mfa/verify (POST)', () => {
    it('should fail with invalid MFA code', () => {
      return request(app.getHttpServer())
        .post('/auth/mfa/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ totp_code: '000000' })
        .expect(401);
    });

    it('should fail without code', () => {
      return request(app.getHttpServer())
        .post('/auth/mfa/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('/auth/mfa/disable (POST)', () => {
    it('should fail when MFA is not enabled', () => {
      return request(app.getHttpServer())
        .post('/auth/mfa/disable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'SecurePassword123!',
          totp_code: '000000',
        })
        .expect(400);
    });

    it('should fail without password', () => {
      return request(app.getHttpServer())
        .post('/auth/mfa/disable')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          totp_code: '000000',
        })
        .expect(400);
    });
  });

  describe('/auth/mfa/backup-codes (POST)', () => {
    it('should fail when MFA is not enabled', () => {
      return request(app.getHttpServer())
        .post('/auth/mfa/backup-codes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ totp_code: '000000' })
        .expect(400);
    });
  });
});

describe('Auth Token Security (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let refreshToken: string;
  let testUserEmail: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Register a test user
    const timestamp = Date.now();
    testUserEmail = `token-test${timestamp}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testUserEmail,
        password: 'SecurePassword123!',
        full_name: 'Token Test User',
      });

    authToken = registerResponse.body.access_token;
    refreshToken = registerResponse.body.refresh_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh tokens with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          // Update tokens for next tests
          authToken = res.body.access_token;
          refreshToken = res.body.refresh_token;
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: 'invalid-token' })
        .expect(401);
    });

    it('should fail with expired/used refresh token (token rotation)', async () => {
      // First refresh
      const firstRefresh = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      const oldRefreshToken = refreshToken;
      refreshToken = firstRefresh.body.refresh_token;

      // Try to use the old refresh token (should be blacklisted)
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: oldRefreshToken })
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout and invalidate tokens', async () => {
      // Login to get fresh tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'SecurePassword123!',
        })
        .expect(200);

      const token = loginResponse.body.access_token;
      const refresh = loginResponse.body.refresh_token;

      // Logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refresh_token: refresh })
        .expect(200);

      // Token should be blacklisted now
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });
});

describe('Auth Password Reset (e2e)', () => {
  let app: INestApplication;
  let testUserEmail: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Register a test user
    const timestamp = Date.now();
    testUserEmail = `reset-test${timestamp}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testUserEmail,
        password: 'SecurePassword123!',
        full_name: 'Reset Test User',
      });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/reset-password (POST)', () => {
    it('should accept valid email (does not reveal if email exists)', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ email: testUserEmail })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('If email exists');
        });
    });

    it('should accept non-existent email (security - no email enumeration)', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('If email exists');
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('/auth/confirm-reset-password (POST)', () => {
    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/confirm-reset-password')
        .send({
          token: 'invalid-token',
          new_password: 'NewPassword123!',
        })
        .expect(400);
    });

    it('should fail with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/confirm-reset-password')
        .send({
          token: 'some-token',
          new_password: '123',
        })
        .expect(400);
    });
  });
});

describe('Auth Rate Limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Login rate limiting', () => {
    it('should rate limit after multiple failed login attempts', async () => {
      const email = 'ratelimit@example.com';
      const requests = [];

      // Make multiple login attempts
      for (let i = 0; i < 6; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email,
              password: 'wrongpassword',
            })
        );
      }

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.some((res) => res.status === 429);

      // At least one request should be rate limited
      expect(tooManyRequests).toBe(true);
    });
  });
});
