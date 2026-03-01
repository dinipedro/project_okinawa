# OWASP Top 10 Compliance Checklist

> Last Updated: 2026-02-24
> Assessed against: OWASP Top 10 2021

## Summary

| ID | Category | Status | Score |
|---|---|---|---|
| A01 | Broken Access Control | ✅ Covered | 8/10 |
| A02 | Cryptographic Failures | ✅ Covered | 9/10 |
| A03 | Injection | ✅ Covered | 9/10 |
| A04 | Insecure Design | ✅ Covered | 8/10 |
| A05 | Security Misconfiguration | ✅ Covered | 9/10 |
| A06 | Vulnerable Components | ✅ Covered | 8/10 |
| A07 | Auth Failures | ✅ Covered | 9/10 |
| A08 | Data Integrity Failures | ✅ Covered | 8/10 |
| A09 | Logging & Monitoring | ✅ Covered | 9/10 |
| A10 | SSRF | ✅ Covered | 9/10 |

**Overall OWASP Score: 8.6/10**

---

## A01 — Broken Access Control

### Controls Implemented
- [x] RBAC with 7 distinct roles (Customer, Waiter, Bartender, Chef, Maître, Manager, Admin)
- [x] Restaurant-scoped permissions (users can only access their assigned restaurants)
- [x] `RolesGuard` applied to all sensitive endpoints
- [x] `RestaurantOwnerGuard` prevents cross-tenant data access
- [x] JWT `sub` claim validated against resource ownership
- [x] Admin Dashboard requires ADMIN/MANAGER role
- [x] CORS configured per-environment (no wildcards in production)

### Evidence
- `backend/src/common/guards/restaurant-owner.guard.ts`
- `backend/src/modules/auth/guards/roles.guard.ts`
- `backend/src/modules/auth/guards/jwt-auth.guard.ts`

---

## A02 — Cryptographic Failures

### Controls Implemented
- [x] bcrypt with cost factor 12 for password hashing
- [x] SHA-256 HMAC for CSRF tokens and QR code signatures
- [x] `crypto.randomBytes(32)` for all token generation
- [x] `crypto.timingSafeEqual` for CSRF comparison (prevents timing attacks)
- [x] `crypto.randomUUID()` for JTI generation
- [x] `crypto.randomInt()` for OTP codes (not Math.random)
- [x] JWT algorithm explicitly set to HS256 (prevents algorithm confusion)
- [x] No default secrets — app fails to start without proper JWT_SECRET (min 32 chars)
- [x] Database SSL supported via `DATABASE_SSL=true`
- [x] OTP codes stored as SHA-256 hashes (never plaintext)

---

## A03 — Injection

### Controls Implemented
- [x] TypeORM parameterized queries (no raw SQL with user input)
- [x] `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`
- [x] class-validator decorators on all DTOs
- [x] `transform: true` with `enableImplicitConversion` for type safety
- [x] No `eval()`, `Function()`, or `child_process.exec()` with user input

---

## A04 — Insecure Design

### Controls Implemented
- [x] Identity module separated from Auth module (AUDIT-010)
- [x] Credentials stored in dedicated `user_credentials` table
- [x] Password history prevents reuse of last 5 passwords
- [x] Account lockout after repeated failed attempts
- [x] Password reset tokens single-use with 30min expiry
- [x] Email enumeration prevented (reset always returns same message)
- [x] Refresh token rotation with automatic blacklisting

---

## A05 — Security Misconfiguration

### Controls Implemented
- [x] Swagger/OpenAPI disabled in production (`SWAGGER_ENABLED !== 'true'`)
- [x] Environment validation via Joi schema at startup (fail-fast)
- [x] No default database credentials
- [x] Docker containers with required env vars (`?` operator)
- [x] `synchronize: false` in TypeORM (prevents schema drift)
- [x] Non-root Docker user (`USER node`)
- [x] Alpine base images (minimal attack surface)
- [x] Helmet.js for security headers
- [x] `contentSecurityPolicy` configured with explicit directives
- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Frame-Options` via `frameSrc: ["'none'"]`

---

## A06 — Vulnerable Components

### Controls Implemented
- [x] `npm audit` in CI pipeline
- [x] Dependabot configured (`.github/dependabot.yml`)
- [x] Hardcoded secrets scanning in CI
- [x] Node.js 20 LTS (active support)
- [x] PostgreSQL 16, Redis 7 (current stable)

### Note
CI audit uses `|| true` to not block builds — acceptable for development phase.
**Production recommendation:** Change to `--audit-level=critical` without fallthrough.

---

## A07 — Identification and Authentication Failures

### Controls Implemented
- [x] JWT access tokens: 15 minute expiry
- [x] JWT refresh tokens: 7 day expiry with rotation
- [x] JTI-based token blacklisting (Redis + PostgreSQL)
- [x] Account lockout after failed attempts
- [x] Multi-Factor Authentication (TOTP) support
- [x] Password policy: 8+ chars, uppercase, lowercase, digit, special char
- [x] Password expiry guard (90 days, 14-day warning)
- [x] IP-based rate limiting on auth endpoints (5 req/15min)
- [x] Brute force protection via `ip-rate-limit.guard.ts`
- [x] Social auth validates issuer + audience + expiration
- [x] OTP rate limiting (60s cooldown, 5 max attempts)

---

## A08 — Software and Data Integrity Failures

### Controls Implemented
- [x] CSRF double-submit cookie pattern
- [x] CSRF token rotation per request
- [x] `SameSite=strict` on cookies
- [x] `HttpOnly` on all security cookies
- [x] `Secure` flag in production
- [x] Idempotency service via `X-Idempotency-Key` header
- [x] QR code HMAC-SHA256 signatures prevent URL tampering

---

## A09 — Security Logging and Monitoring Failures

### Controls Implemented
- [x] `StructuredLoggerService` with JSON output in production
- [x] `LoggingInterceptor` as global `APP_INTERCEPTOR`
- [x] Correlation ID (`X-Request-ID`) propagated through request lifecycle
- [x] Trace ID (`X-Trace-ID`) for distributed tracing
- [x] Sensitive data sanitized from logs (password, token, secret, credit_card, otp, code)
- [x] `AuditLogService` records all auth events (login, logout, register, MFA, OTP)
- [x] Sentry integration for error tracking
- [x] Worker health heartbeat file for monitoring

---

## A10 — Server-Side Request Forgery (SSRF)

### Controls Implemented
- [x] No user-controlled URLs used in server-side requests
- [x] Google token validation uses fixed endpoint (`oauth2.googleapis.com`)
- [x] Apple token validation uses fixed endpoint (`appleid.apple.com`)
- [x] CORS origin validation rejects malformed URLs
- [x] HTTP origins rejected in production CORS
