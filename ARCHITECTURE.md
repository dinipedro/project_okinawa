# Architecture Documentation

> **Bilingual Documentation** — This document is available in both English and Portuguese.
> **Documentação Bilíngue** — Este documento está disponível em inglês e português.

---

## Table of Contents

- [English](#english)
  - [Overview](#overview)
  - [Platform Components](#platform-components)
  - [System Architecture](#system-architecture)
  - [Technology Stack](#technology-stack)
  - [Backend Architecture](#backend-architecture)
  - [Identity Module](#identity-module)
  - [Common Module & Cross-Cutting Concerns](#common-module--cross-cutting-concerns)
  - [Mobile Architecture](#mobile-architecture)
  - [Authentication System](#authentication-system)
  - [Order Management System](#order-management-system)
  - [Payment System](#payment-system)
  - [Reservation System](#reservation-system)
  - [Real-time Communication](#real-time-communication)
  - [Kitchen Display System (KDS)](#kitchen-display-system-kds)
  - [Table Management](#table-management-system)
  - [Club & Nightlife Module](#club--nightlife-module)
  - [Loyalty & Rewards](#loyalty--rewards-system)
  - [Security Architecture](#security-architecture)
  - [Data Architecture](#data-architecture)
  - [Caching Strategy](#caching-strategy)
  - [Testing Strategy](#testing-strategy)
  - [Deployment Architecture](#deployment-architecture)
  - [Scalability Roadmap](#scalability-roadmap)
  - [Development Patterns](#development-patterns)
- [Português](#português)

---

# English

## Overview

Project Okinawa is a comprehensive **in-person experience platform** designed to modernize and optimize hospitality operations. Unlike food delivery applications, Okinawa focuses exclusively on **physical dining and entertainment experiences**, creating seamless connections between customers and establishments through technology.

The platform supports **11 distinct service types** — from fine dining and casual restaurants to nightclubs and food trucks — each with tailored feature sets controlled by **26 feature flags** that adapt the entire user experience dynamically.

## Platform Components

| Component | Technology | Description |
|-----------|------------|-------------|
| **Client Mobile App** | React Native / Expo | Customer-facing app for discovery, ordering, reservations, and payments |
| **Restaurant Mobile App** | React Native / Expo | Staff management app with KDS, floor management, and analytics |
| **Backend API** | NestJS | Scalable REST API with real-time WebSocket support (26 modules) |
| **Background Workers** | Bull / Redis | Standalone process for jobs, notifications, and scheduled tasks |
| **Preview System** | React / Vite | Interactive web-based prototype for validating flows (62+ screens) |

### Key Capabilities

| Capability | Description |
|------------|-------------|
| **Order Management** | Complete order lifecycle from placement to delivery with real-time tracking |
| **Table Management** | Real-time floor plan with drag-and-drop status tracking |
| **Reservation System** | Advanced booking with guest management and invitation flows |
| **Digital Payments** | Wallet system with Apple Pay, Google Pay, PIX, TAP to Pay, and cards |
| **Split Payment** | 4 flexible modes: Individual, Equal, Selective, Fixed Amount |
| **Loyalty Program** | Points-based rewards with tier progression (Bronze → Silver → Gold → Platinum) |
| **Kitchen Display (KDS)** | Gesture-based KDS with SLA monitoring for kitchen and bar |
| **Analytics** | Comprehensive business intelligence with multi-format exportable reports |
| **Multi-role RBAC** | 6-tier access control: Owner, Manager, Maître, Chef, Waiter, Barman |
| **Club & Nightlife** | Guest lists, VIP tables, queues, lineups, promoters, occupancy tracking |
| **Quick Actions** | Context-aware FAB for rapid task execution |

### Service Type Differentiation (11 Types)

| Service Type | Reservations | Queue | Geolocation | Digital Tab | Tickets | Occupancy |
|--------------|:------------:|:-----:|:-----------:|:-----------:|:-------:|:---------:|
| Fine Dining | ✓ | ✓ | - | ✓ | - | - |
| Quick Service | - | ✓ | - | - | - | - |
| Fast Casual | - | ✓ | - | ✓ | - | - |
| Café / Bakery | - | - | - | ✓ | - | - |
| Buffet | ✓ | ✓ | - | - | - | - |
| Drive-Thru | - | - | ✓ | - | - | - |
| Food Truck | - | - | ✓ | - | - | - |
| Chef's Table | ✓ | - | - | ✓ | - | - |
| Casual Dining | ✓ | ✓ | - | ✓ | - | - |
| Pub & Bar | - | - | - | ✓ | - | - |
| Club & Nightlife | - | ✓ | - | ✓ | ✓ | ✓ |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                      │
├─────────────────────┬─────────────────────┬─────────────────────────┤
│   Client App        │   Restaurant App    │   Preview System        │
│   (React Native)    │   (React Native)    │   (React / Vite)        │
└─────────┬───────────┴─────────┬───────────┴─────────────────────────┘
          │                     │
          ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  CDN / WAF / DDoS Protection                         │
│                  (CloudFront / Cloudflare)                            │
├─────────────────────────────────────────────────────────────────────┤
│                  API GATEWAY / LOAD BALANCER                         │
│                  (NGINX / AWS ALB — TLS 1.3)                         │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────────┐
          │                   │                       │
          ▼                   ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   REST API      │   │   WebSocket     │   │   Worker        │
│   (NestJS)      │   │   Gateway       │   │   Process       │
│   Port: 3000    │   │   (Socket.IO)   │   │   (Bull/Redis)  │
│                 │   │                 │   │   Standalone     │
│   26 Modules    │   │   Redis Adapter │   │   Healthcheck    │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   PostgreSQL    │   │     Redis       │   │   Twilio /      │
│   16.x          │   │   7.x           │   │   SendGrid      │
│   (Primary DB)  │   │   (Cache/Queue/ │   │   (SMS/Email)   │
│                 │   │    Pub/Sub)     │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

### Process Isolation Strategy

The architecture follows a strict process isolation model:

| Process | Entry Point | Purpose | Healthcheck |
|---------|-------------|---------|-------------|
| **API** | `main.ts` | HTTP + WebSocket requests | `/health` |
| **Worker** | `worker.ts` | Background jobs, notifications, scheduled tasks | Dedicated endpoint |

Worker processes have independent graceful shutdown handlers and do not share event loops with the API, ensuring that long-running jobs never impact API latency.

### Request Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      REQUEST PROCESSING PIPELINE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐          │
│  │ Incoming │──▶│   CORS   │──▶│  Helmet  │──▶│   CSRF   │          │
│  │ Request  │   │  Check   │   │ Headers  │   │  Token   │          │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘          │
│                                                     │                 │
│                                                     ▼                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐          │
│  │ Logging  │◀──│   Auth   │◀──│  Roles   │◀──│ Validate │          │
│  │Interceptor   │  Guard   │   │  Guard   │   │   Pipe   │          │
│  │ (DI)     │   └──────────┘   └──────────┘   └──────────┘          │
│  └──────────┘                                                         │
│       │                                                               │
│       ▼                                                               │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐          │
│  │  Rate    │──▶│Controller│──▶│  Service │──▶│Repository│          │
│  │  Limiter │   └──────────┘   └──────────┘   └──────────┘          │
│  └──────────┘                                       │                 │
│                                                     ▼                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │        Response (Transform / Cache / Tracing / Idempotency)   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | NestJS | 10.4.x | Modular API framework |
| Runtime | Node.js | 20.x | JavaScript runtime |
| Language | TypeScript | 5.8.x | Type-safe development |
| ORM | TypeORM | 0.3.x | Database abstraction |
| Database | PostgreSQL | 16.x | Primary data store |
| Cache | Redis | 7.x | Caching, sessions, pub/sub |
| Queue | Bull | 4.x | Background job processing |
| Auth | Passport + JWT | Latest | Authentication with JTI blacklisting |
| Docs | Swagger/OpenAPI | 8.x | API documentation (development only) |
| Monitoring | Sentry | 10.x | Error tracking |
| Tracing | TracingModule | — | Distributed tracing with configurable sampling |
| Logging | StructuredLoggerService | — | JSON structured logging with correlation IDs |
| Idempotency | IdempotencyService | — | Request deduplication via `X-Idempotency-Key` |

### Mobile

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React Native | 0.74.x | Cross-platform mobile |
| Platform | Expo | 51.x | Development toolchain |
| Navigation | React Navigation | 6.x | Screen routing |
| State | React Query | 5.x | Server state management |
| UI | React Native Paper | 5.x | Material Design components |
| Forms | React Hook Form | 7.x | Form management |
| Validation | Zod | 4.x | Schema validation |
| HTTP | Axios | 1.7.x | API client |
| Real-time | Socket.IO Client | 4.x | WebSocket communication |
| Testing | Vitest | 3.x | Unit and integration tests |

---

## Backend Architecture

### Module Structure (26 Modules)

```
backend/src/
├── app.module.ts              # Root module
├── main.ts                    # API entry point
├── worker.ts                  # Worker process entry point
├── common/                    # Shared utilities (@Global)
│   ├── cache/                # Redis cache service + CacheConfigModule
│   ├── decorators/           # @CurrentUser, @Roles, @Idempotent
│   ├── dto/                  # Shared DTOs (pagination, response)
│   ├── enums/                # Role, OrderStatus, PaymentStatus
│   ├── filters/              # GlobalExceptionFilter
│   ├── guards/               # JwtAuthGuard, RolesGuard, OwnershipGuard
│   ├── middleware/           # CORS, CSRF, RequestId
│   ├── pipes/                # ValidationPipe config
│   ├── services/             # TranslationService, EmailService
│   ├── tracing/              # TracingModule.forRoot() — distributed tracing
│   ├── logging/              # StructuredLoggerService, LoggingInterceptor
│   └── idempotency/          # IdempotencyService
├── config/                    # Configuration
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── throttler.config.ts
│   └── validation.config.ts
├── modules/                   # Feature modules (26 total)
│   ├── identity/             # Canonical identity source
│   ├── auth/                 # Authentication (depends on Identity)
│   ├── users/                # User profiles
│   ├── restaurants/          # Restaurant management
│   ├── menu-items/           # Menu & categories
│   ├── orders/               # Order lifecycle
│   ├── payments/             # Payment processing & wallet
│   ├── reservations/         # Booking & guest management
│   ├── tables/               # Floor plan & table status
│   ├── tabs/                 # Digital tab system
│   ├── reviews/              # Customer reviews
│   ├── tips/                 # Tipping system
│   ├── favorites/            # User favorites
│   ├── notifications/        # Push/SMS/email notifications
│   ├── loyalty/              # Loyalty program & rewards
│   ├── analytics/            # Business intelligence
│   ├── events/               # Event bus (WebSocket)
│   ├── club/                 # Nightlife (12 entities)
│   ├── financial/            # Financial reports & exports
│   ├── hr/                   # Staff scheduling & attendance
│   ├── queue/                # Virtual queue system
│   ├── kds/                  # Kitchen Display System
│   ├── menu-categories/      # Menu organization
│   ├── modifiers/            # Menu item modifiers
│   ├── settings/             # Restaurant settings
│   └── uploads/              # File upload management
└── migrations/               # Database migrations
```

### Module Pattern

Each module follows a consistent structure:

```
module-name/
├── dto/                   # Data Transfer Objects
│   ├── create-*.dto.ts
│   └── update-*.dto.ts
├── entities/              # TypeORM entities
│   └── *.entity.ts
├── guards/                # Module-specific guards
├── helpers/               # Business logic helpers (Injectable)
├── services/              # Sub-services
├── module-name.controller.ts
├── module-name.service.ts
├── module-name.module.ts
├── module-name.gateway.ts  # WebSocket gateway (if real-time)
├── module-name.controller.spec.ts
└── module-name.service.spec.ts
```

### Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MODULE DEPENDENCY GRAPH                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   @Global Modules (available everywhere):                             │
│   ┌─────────────┐   ┌─────────────────┐                              │
│   │ CommonModule │   │ IdentityModule  │                              │
│   │ (7 services) │   │ (5 services)    │                              │
│   └──────┬──────┘   └────────┬────────┘                              │
│          │                   │                                        │
│          └───────────┬───────┘                                        │
│                      ▼                                                │
│   ┌──────────────────────────────────┐                                │
│   │          AuthModule              │                                │
│   │  (depends on IdentityModule)     │                                │
│   └──────────────┬───────────────────┘                                │
│                  │                                                    │
│    ┌─────────────┼─────────────────────────────────┐                 │
│    │             │                                 │                  │
│    ▼             ▼                                 ▼                  │
│ ┌────────┐  ┌──────────┐  ┌────────────┐  ┌────────────┐            │
│ │Orders  │  │Reservat. │  │   Tabs     │  │   Club     │            │
│ │Module  │  │Module    │  │  Module    │  │  Module    │            │
│ └───┬────┘  └────┬─────┘  └────┬───────┘  └────┬───────┘            │
│     │            │             │               │                     │
│     └────────────┴─────────────┴───────────────┘                     │
│                          │                                            │
│              ┌───────────┼───────────┐                                │
│              ▼           ▼           ▼                                │
│         ┌────────┐  ┌────────┐  ┌────────────┐                       │
│         │Events  │  │Notif.  │  │  Loyalty   │                       │
│         │Module  │  │Module  │  │  Module    │                       │
│         └────────┘  └────────┘  └────────────┘                       │
│                                                                       │
│   Circular dependencies resolved with forwardRef():                   │
│   Orders ↔ Reservations, Orders ↔ Tables                             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Identity Module

The Identity Module is the **canonical source of truth** for all credential management, separating identity concerns from authentication logic.

```typescript
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserCredential,
      TokenBlacklist,
      AuditLog,
      PasswordResetToken,
    ]),
    CacheModule.register(),
  ],
  providers: [
    CredentialService,      // Password hashing (bcrypt cost 12), validation
    MfaService,             // TOTP-based MFA with recovery codes
    TokenBlacklistService,  // JTI-based Redis + PostgreSQL blacklisting
    AuditLogService,        // Security event logging
    PasswordPolicyService,  // History tracking (last 5), complexity rules
  ],
  exports: [
    CredentialService,
    MfaService,
    TokenBlacklistService,
    AuditLogService,
    PasswordPolicyService,
    TypeOrmModule,
  ],
})
export class IdentityModule {}
```

### Identity Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| `UserCredential` | `user_credentials` | Hashed passwords, password history |
| `TokenBlacklist` | `token_blacklist` | JTI-based token revocation |
| `AuditLog` | `audit_logs` | Security events with IP, user agent, action |
| `PasswordResetToken` | `password_reset_tokens` | Time-limited reset tokens |

### Token Blacklisting Strategy (Hybrid)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TOKEN BLACKLIST (HYBRID)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   REDIS (Hot Path — millisecond lookup)                               │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Key: blacklist:{jti}                                        │   │
│   │  TTL: matches token expiry                                   │   │
│   │  Purpose: Real-time validation on every request              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                            │                                         │
│                            ▼ (async write)                           │
│   POSTGRESQL (Cold Path — audit & persistence)                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Table: token_blacklist                                      │   │
│   │  Columns: jti, user_id, reason, expires_at, created_at       │   │
│   │  Purpose: Audit trail, Redis failure fallback                │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Common Module & Cross-Cutting Concerns

```typescript
@Global()
@Module({
  imports: [
    CacheConfigModule,
    TracingModule.forRoot({
      serviceName: 'okinawa-api',
      enabled: process.env.NODE_ENV === 'production',
      samplingRate: 0.1,
    }),
  ],
  providers: [
    TranslationService,
    EmailService,
    CacheService,
    StructuredLoggerService,
    IdempotencyService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [
    TranslationService, EmailService, CacheService,
    StructuredLoggerService, IdempotencyService,
    CacheConfigModule, TracingModule,
  ],
})
export class CommonModule {}
```

### Cross-Cutting Services

| Service | Purpose | Key Features |
|---------|---------|--------------|
| `StructuredLoggerService` | JSON structured logging | Correlation IDs, request context, log levels |
| `LoggingInterceptor` | Automatic request/response logging | DI-injected via `APP_INTERCEPTOR`, timing, status codes |
| `TracingModule` | Distributed tracing | Configurable sampling rate, span export via structured logger |
| `IdempotencyService` | Request deduplication | `X-Idempotency-Key` header, Redis-backed |
| `CacheService` | Multi-level caching | Redis-backed, pattern invalidation, TTL management |
| `TranslationService` | Internationalization | PT, EN, ES support |
| `EmailService` | Transactional email | SendGrid integration |

### Structured Logging Format

```json
{
  "timestamp": "2025-02-24T10:30:00.000Z",
  "level": "info",
  "message": "Order created",
  "context": "OrdersService",
  "correlationId": "req-uuid-123",
  "metadata": {
    "orderId": "order-uuid",
    "userId": "user-uuid",
    "restaurantId": "rest-uuid",
    "duration": 45
  }
}
```

---

## Mobile Architecture

### Monorepo Structure

```
mobile/
├── apps/
│   ├── client/                    # Customer app (37 screens)
│   │   └── src/
│   │       ├── screens/
│   │       │   ├── auth/          # Welcome, PhoneAuth, BiometricEnroll
│   │       │   ├── home/          # HomeScreen
│   │       │   ├── explore/       # ExploreScreen, RestaurantDetail
│   │       │   ├── orders/        # OrderScreen, OrderHistory, OrderTracking
│   │       │   ├── reservations/  # ReservationScreen, GuestInvite
│   │       │   ├── payments/      # UnifiedPaymentV2, SplitPayment
│   │       │   └── profile/       # ProfileScreen, Settings, Loyalty
│   │       ├── components/        # App-specific components
│   │       ├── navigation/        # Navigation configuration
│   │       └── services/          # Re-exports from shared
│   └── restaurant/                # Staff app (24 screens)
│       └── src/
│           ├── screens/
│           │   ├── auth/          # Staff login, RestaurantSelector
│           │   ├── dashboard/     # RoleDashboardV2 (role-adaptive)
│           │   ├── kds/           # KitchenDisplayV2, BarKDS (swipe gestures)
│           │   ├── orders/        # Order management, PaymentTracking
│           │   ├── reservations/  # Reservation management
│           │   ├── tables/        # Floor plan (interactive)
│           │   ├── menu/          # Menu management
│           │   ├── financial/     # Reports & multi-format exports
│           │   └── hr/            # Staff management & scheduling
│           ├── components/        # QuickActionsFAB, RestaurantSwitcher
│           └── navigation/        # Role-based drawer navigation
└── shared/                        # Single source of truth
    ├── components/                # 16 reusable UI components
    │   ├── auth/                  # OTPInput, PhoneInput, BiometricPrompt
    │   ├── ui/                    # Button, Card, Input, Modal
    │   └── navigation/            # TabBar, DrawerContent
    ├── hooks/                     # useAuth, useSocket, useRestaurant, useServiceTypeFeatures
    ├── services/                  # API (centralized), auth, socket
    │   ├── api.ts                 # ← All API calls centralized here
    │   ├── auth.ts
    │   └── socket.ts
    ├── contexts/                  # React contexts
    │   ├── AuthContext.tsx
    │   ├── RestaurantContext.tsx
    │   ├── CartContext.tsx
    │   └── ServiceTypeContext.tsx  # 26 feature flags for 11 service types
    ├── config/
    │   ├── analytics.ts
    │   ├── navigation-animations.ts
    │   └── theme.ts
    ├── i18n/                      # Translations (en, pt, es)
    ├── utils/
    ├── validation/                # Zod schemas
    └── types/
```

### State Management Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT LAYERS                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   REACT QUERY (Server State)                                          │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │  • Orders, Restaurants, Reservations, Notifications          │    │
│   │  • Automatic caching, refetching, and invalidation           │    │
│   │  • Background updates and optimistic mutations               │    │
│   └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│   CONTEXT API (UI/App State)                                          │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │  • AuthContext: User session, tokens, biometric status       │    │
│   │  • CartContext: Cart items, totals, modifiers                │    │
│   │  • RestaurantContext: Current restaurant, service type       │    │
│   │  • ServiceTypeContext: 26 feature flags for UI adaptation    │    │
│   │  • ThemeContext: Light/dark mode preferences                 │    │
│   └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│   LOCAL STATE (Component State)                                       │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │  • Form inputs, modal visibility, loading states             │    │
│   │  • Animation triggers, scroll position                       │    │
│   └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Authentication System

### Passwordless-First Strategy

| Method | Type | Details |
|--------|------|---------|
| Social Login | Primary | Google OAuth 2.0, Apple Sign-In (RSA-SHA256 JWKS verification) |
| Phone OTP | Primary | SMS/WhatsApp via Twilio (6 digits, 5 min TTL) |
| Biometrics | Primary | Face ID / Touch ID (asymmetric keys in Secure Enclave) |
| Email + Password | Fallback | Optional (bcrypt cost 12, last 5 password history) |

### JWT Policy

| Property | Access Token | Refresh Token |
|----------|:------------:|:-------------:|
| Expiration | 15 minutes | 7 days |
| JTI (unique ID) | ✓ (UUID) | ✓ (UUID) |
| Family (rotation detection) | — | ✓ |
| Blacklisting | Redis + PostgreSQL | Redis + PostgreSQL |

```typescript
// JWT Payload Structure
{
  sub: 'user-id',
  email: 'user@example.com',
  jti: 'unique-token-identifier',   // UUID — enables precise revocation
  family: 'token-family-id',        // Refresh only — rotation detection
  iat: timestamp,
  exp: timestamp
}
```

### OAuth Providers

| Provider | Token Validation | Security |
|----------|------------------|----------|
| **Google OAuth 2.0** | `oauth2.googleapis.com/tokeninfo` | OpenID Connect compliant |
| **Apple Sign In** | Apple JWKS (RSA-SHA256 public keys) | Privacy-focused, key rotation |

**Apple Sign-In Verification Chain:**
1. Fetch JWKS from `https://appleid.apple.com/auth/keys`
2. Match key by `kid` header claim
3. Verify signature using RSA-SHA256 public key
4. Validate `iss`, `aud`, `exp` claims
5. Extract user data (email only on first login)

### Multi-Restaurant Identity

A single identity (email/phone) works across multiple establishments. The same staff member can be a Waiter at Restaurant A and an Owner at Restaurant B, without re-authentication. The UI provides a Restaurant Selector post-login and a Switcher in the header.

### Role-Based Access Control (6-Tier RBAC)

| Tier | Role | Permissions |
|:----:|------|-------------|
| 1 | **OWNER** | Full control — all operations, financial access, staff management |
| 2 | **MANAGER** | Operations & approval — order cancellations, refunds, reports |
| 3 | **MAÎTRE** | Reservations, floor plan, queue management, guest check-in |
| 4 | **CHEF** | Kitchen KDS — view food orders, update preparation status |
| 5 | **WAITER** | Table service — view orders, update status, manage assigned tables |
| 6 | **BARMAN** | Bar KDS — view drink orders, update preparation status |

Sensitive actions (cancellations, refunds) require explicit MANAGER or OWNER approval.

---

## Order Management System

### Order Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ORDER STATE MACHINE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   PENDING ──▶ CONFIRMED ──▶ PREPARING ──▶ READY ──▶ DELIVERED       │
│      │            │                                                   │
│      ▼            ▼                                                   │
│   CANCELLED    CANCELLED                                              │
│   (by user)    (by manager)                                           │
│                                                                       │
│   Helpers (Injectable):                                               │
│   • OrderItemHelper — item management, modifiers                     │
│   • OrderGuestHelper — guest association, split prep                 │
│   • OrderStatusHelper — state transitions, validation                │
│   • OrderCalculationHelper — totals, taxes, discounts                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Payment System

### Payment Methods

| Method | Status | Details |
|--------|:------:|---------|
| Credit/Debit Card | ✓ | Tokenized processing |
| Apple Pay | ✓ | Native integration |
| Google Pay | ✓ | Native integration |
| PIX | ✓ | Brazilian instant payment |
| TAP to Pay | ✓ | NFC-based contactless |
| Okinawa Wallet | ✓ | In-app balance with top-up |

### Split Payment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SPLIT PAYMENT MODES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   1. INDIVIDUAL           2. EQUAL                                    │
│   ┌─────────────┐        ┌─────────────┐                             │
│   │ Each pays   │        │ Total ÷ N   │                             │
│   │ for their   │        │ people      │                             │
│   │ own items   │        │             │                             │
│   └─────────────┘        └─────────────┘                             │
│                                                                       │
│   3. SELECTIVE            4. FIXED AMOUNT                             │
│   ┌─────────────┐        ┌─────────────┐                             │
│   │ Select      │        │ Each person │                             │
│   │ specific    │        │ pays a set  │                             │
│   │ items       │        │ amount      │                             │
│   └─────────────┘        └─────────────┘                             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Reservation System

### Entry Points

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RESERVATION ENTRY POINTS                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   │
│   │   RESERVATION   │   │    WALK-IN      │   │  VIRTUAL QUEUE  │   │
│   │  Book ahead     │   │  Arrive and     │   │  Join waitlist  │   │
│   │  Select date,   │   │  check-in       │   │  with priority  │   │
│   │  time, guests   │   │  immediately    │   │  options        │   │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘   │
│           │                     │                     │              │
│           └─────────────────────┼─────────────────────┘              │
│                                 ▼                                    │
│                    ┌─────────────────────────┐                       │
│                    │   TABLE ASSIGNMENT      │                       │
│                    │   by Maître / System    │                       │
│                    └────────────┬────────────┘                       │
│                                 ▼                                    │
│                    ┌─────────────────────────┐                       │
│                    │   SERVICE BEGINS        │                       │
│                    │   Order & Payment Flow  │                       │
│                    └─────────────────────────┘                       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Guest Invitation Flow

- Primary guest creates reservation
- Invites guests via in-app notification or SMS
- **Tertiary invites** (guest invites guest) require primary guest approval
- Guests can pre-order and split payments

---

## Real-time Communication

### WebSocket Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WEBSOCKET ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   CLIENT APPS ──────────▶ SOCKET.IO SERVER                           │
│                           ┌─────────────────────────────┐           │
│                           │  Auth Middleware (JWT)       │           │
│                           │  Room Manager                │           │
│                           │  Redis Adapter (Pub/Sub)     │           │
│                           └─────────────────────────────┘           │
│                                                                       │
│   ROOMS:                                                              │
│   • order:{orderId}         — Order status updates                    │
│   • table:{tableId}         — Table events                           │
│   • restaurant:{id}         — Restaurant-wide broadcasts             │
│   • kds:{restaurantId}      — Kitchen display updates                │
│   • bar:{restaurantId}      — Bar display updates                    │
│   • queue:{restaurantId}    — Queue position updates                 │
│   • tab:{tabId}             — Tab item/payment updates               │
│   • club:{restaurantId}     — Club occupancy/VIP updates             │
│   • reservation:{id}        — Guest check-in notifications           │
│                                                                       │
│   WebSocket Gateways:                                                 │
│   • EventsGateway (central hub)                                      │
│   • OrdersGateway                                                    │
│   • TabsGateway                                                      │
│   • QueueGateway (Club module)                                       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Kitchen Display System (KDS)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    KDS ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌─────────────────────────┐   ┌─────────────────────────┐         │
│   │     KITCHEN KDS         │   │      BAR KDS            │         │
│   │                         │   │                         │         │
│   │  • Food items only      │   │  • Drink items only     │         │
│   │  • Swipe gestures       │   │  • Swipe gestures       │         │
│   │  • SLA timer (color)    │   │  • SLA timer (color)    │         │
│   │  • Chef role access     │   │  • Barman role access   │         │
│   │                         │   │                         │         │
│   │  Swipe RIGHT = Done     │   │  Swipe RIGHT = Done     │         │
│   │  Swipe LEFT = Priority  │   │  Swipe LEFT = Priority  │         │
│   │  Hold = Cancel (needs   │   │  Hold = Cancel (needs   │         │
│   │    MANAGER approval)    │   │    MANAGER approval)    │         │
│   │                         │   │                         │         │
│   └─────────────────────────┘   └─────────────────────────┘         │
│                                                                       │
│   SLA Colors:                                                         │
│   🟢 Green  = Within target    (0–5 min)                             │
│   🟡 Yellow = Approaching SLA  (5–10 min)                            │
│   🔴 Red    = SLA breached     (10+ min)                             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Table Management System

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TABLE STATUS MACHINE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   AVAILABLE ──▶ RESERVED ──▶ OCCUPIED ──▶ CLEANING ──▶ AVAILABLE    │
│       │              │           │                                    │
│       └──────────────┘           └──▶ MAINTENANCE                    │
│       (walk-in seats                                                  │
│        directly)                                                      │
│                                                                       │
│   Status Colors:                                                      │
│   🟢 Available   🔵 Reserved   🔴 Occupied                          │
│   🟡 Cleaning    ⚫ Maintenance                                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Club & Nightlife Module

The Club module manages **12 entities** for nightlife operations:

| Feature | Service | Real-time |
|---------|---------|:---------:|
| Entry Management | ClubEntriesService | — |
| Guest Lists | GuestListService | — |
| VIP Table Reservations | VipTableReservationsService | — |
| VIP Table Tabs (minimum spend) | VipTableTabsService | ✓ |
| Real-time Queue | QueueService + QueueGateway | ✓ |
| DJ/Artist Lineups | LineupService | — |
| Occupancy Tracking | OccupancyService | ✓ |
| Birthday Management | BirthdayEntryService | — |
| Promoter Sales & Payments | PromoterService | — |
| QR Code Validation | QrCodeService | — |

---

## Loyalty & Rewards System

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LOYALTY TIER SYSTEM                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   BRONZE (0+) ──▶ SILVER (500+) ──▶ GOLD (2000+) ──▶ PLATINUM (5000+)│
│                                                                       │
│   Points Earning:                                                     │
│   • R$1 spent = 1 point                                              │
│   • Bonus for reviews, referrals, streaks                            │
│                                                                       │
│   Rewards:                                                            │
│   • Bronze: Basic rewards                                            │
│   • Silver: Priority reservations, 5% bonus                          │
│   • Gold: VIP access, 10% bonus, exclusive events                    │
│   • Platinum: Personal concierge, 20% bonus, early access            │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Defense in Depth (7 Layers)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   LAYER 1: TRANSPORT                                                  │
│   • HTTPS only (TLS 1.3), certificate pinning, HSTS                  │
│                                                                       │
│   LAYER 2: AUTHENTICATION                                             │
│   • JWT HS256 with JTI blacklisting (Redis + PostgreSQL hybrid)      │
│   • Token rotation with family tracking                               │
│   • Apple RSA-SHA256 public key verification                         │
│   • Biometric (device-bound asymmetric keys)                         │
│                                                                       │
│   LAYER 3: AUTHORIZATION                                              │
│   • 6-tier RBAC: OWNER > MANAGER > MAÎTRE > CHEF > WAITER > BARMAN  │
│   • Restaurant-scoped permissions (no cross-tenant access)           │
│   • Resource ownership validation                                     │
│                                                                       │
│   LAYER 4: INPUT VALIDATION                                           │
│   • class-validator with whitelist: true                              │
│   • SQL injection prevention via TypeORM parameterized queries       │
│   • XSS protection via Helmet CSP                                    │
│                                                                       │
│   LAYER 5: RATE LIMITING                                              │
│   • Global: 100 req/min per IP                                       │
│   • Auth: 10 req/min per IP                                          │
│   • Sensitive: 5 req/min per user                                    │
│                                                                       │
│   LAYER 6: CSRF PROTECTION                                            │
│   • Double-submit cookie (httpOnly)                                   │
│   • Required secrets from environment (no fallbacks)                 │
│   • SameSite=Strict, Origin/Referer validation                       │
│                                                                       │
│   LAYER 7: AUDIT & MONITORING                                         │
│   • StructuredLoggerService with correlation IDs                     │
│   • AuditLogService for security events                              │
│   • Sentry for error monitoring                                       │
│   • TracingModule for distributed tracing                            │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

> For the full security documentation, see [SECURITY.md](./SECURITY.md).

---

## Data Architecture

### Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIP DIAGRAM                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌──────────────┐                                                   │
│   │   Profile    │◀────────────────────────────────────┐            │
│   │   (User)     │                                     │            │
│   └──────┬───────┘                                     │            │
│          │                                             │            │
│    ┌─────┴──────┬───────────────┐                      │            │
│    │            │               │                      │            │
│    ▼            ▼               ▼                      │            │
│ ┌────────┐ ┌──────────┐ ┌─────────────┐  ┌────────┐  │            │
│ │UserRole│ │Biometric │ │UserCredential│  │ Wallet │◀─┘            │
│ └───┬────┘ │Token     │ │(Identity)   │  └───┬────┘               │
│     │      └──────────┘ └─────────────┘      │                     │
│     ▼                                        ▼                     │
│ ┌──────────────┐              ┌─────────────────────┐              │
│ │  Restaurant  │              │ WalletTransaction   │              │
│ └──────┬───────┘              └─────────────────────┘              │
│        │                                                            │
│   ┌────┴────┬──────────┬──────────┬──────────┐                     │
│   ▼         ▼          ▼          ▼          ▼                     │
│ ┌─────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐           │
│ │Table│ │MenuItem│ │ Order  │ │Reserv. │ │ ClubEntry  │           │
│ └──┬──┘ └────────┘ └───┬────┘ └───┬────┘ └────────────┘           │
│    │                    │          │                                │
│    │    ┌───────────────┤          │                                │
│    │    │               │          │                                │
│    │    ▼               ▼          ▼                                │
│    │ ┌─────────┐  ┌─────────┐ ┌────────────────┐                   │
│    │ │OrderItem│  │ Payment │ │ReservationGuest│                   │
│    │ └─────────┘  └────┬────┘ └────────────────┘                   │
│    │                   │                                            │
│    │                   ▼                                            │
│    │            ┌──────────────┐                                    │
│    │            │ PaymentSplit │                                    │
│    │            └──────────────┘                                    │
│    ▼                                                                │
│ ┌──────────────┐                                                    │
│ │  OrderGuest  │                                                    │
│ └──────────────┘                                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Database Schema (35+ Tables)

| Category | Tables | Description |
|----------|--------|-------------|
| **Identity** | user_credentials, token_blacklist, audit_logs, password_reset_tokens | Credential management |
| **Users** | profiles, user_roles, biometric_tokens | User management |
| **Auth** | otp_tokens | Authentication data |
| **Restaurant** | restaurants, restaurant_tables, restaurant_settings | Configuration |
| **Menu** | menu_items, menu_categories, menu_modifiers, modifier_groups | Menu management |
| **Orders** | orders, order_items, order_guests, order_history | Order lifecycle |
| **Tabs** | tabs, tab_members, tab_items, tab_payments | Digital tab system |
| **Payments** | wallets, wallet_transactions, payments, payment_splits, payment_methods | Financial |
| **Reservations** | reservations, reservation_guests, virtual_queue | Booking |
| **Club** | club_entries, guest_list_entries, vip_table_reservations, vip_table_guests, vip_table_tabs, vip_table_tab_items, queue_entries, lineups, lineup_slots, club_check_in_outs, birthday_entries, promoters, promoter_sales, promoter_payments | Nightlife |
| **Engagement** | reviews, tips, notifications, favorites | Customer engagement |
| **Loyalty** | loyalty_programs, loyalty_memberships, points_transactions | Rewards |
| **HR** | staff_schedules, attendance_logs | Human resources |
| **Happy Hour** | happy_hour_schedules, waiter_calls | Tab features |

---

## Caching Strategy

### Multi-Level Cache Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CACHING ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   L1: APPLICATION CACHE (In-Memory)                                  │
│   • Config values (TTL: 5 min)                                       │
│   • Static lookups (TTL: 10 min)                                     │
│                                                                       │
│   L2: REDIS CACHE                                                    │
│   • Token blacklist (TTL: token expiry)                              │
│   • Rate limit counters (TTL: window)                                │
│   • Session data (TTL: 24h)                                          │
│   • Restaurant menus (TTL: 5 min)                                    │
│   • User preferences (TTL: 1h)                                       │
│   • Idempotency keys (TTL: 24h)                                     │
│                                                                       │
│   L3: DATABASE QUERY CACHE (TypeORM)                                 │
│   • Complex queries (TTL: 1 min)                                     │
│   • Aggregate computations (TTL: 5 min)                              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Testing Strategy

### Test Pyramid

```
                    ╱╲
                   ╱  ╲         E2E Tests (10%)
                  ╱    ╲        Full user flows, critical paths
                 ╱──────╲
                ╱        ╲      Integration Tests (30%)
               ╱          ╲     API endpoints, service interactions
              ╱────────────╲
             ╱              ╲   Unit Tests (60%)
            ╱                ╲  Helpers, pure functions, components
           ╱──────────────────╲

   Coverage Target: 95%+ | 850+ tests
```

### Testing Tools

| Tool | Purpose |
|------|---------|
| Vitest | Unit and integration tests |
| Supertest | HTTP endpoint testing |
| MSW | API mocking for frontend |
| Testing Library | Component testing |
| Socket.IO Client | WebSocket testing |

---

## Deployment Architecture

### Multi-Stage Docker

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
USER node
WORKDIR /app
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

ENV JWT_SECRET=${JWT_SECRET:?JWT_SECRET is required}
ENV DB_HOST=${DB_HOST:?DB_HOST is required}

CMD ["node", "dist/main.js"]
```

### Production Infrastructure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRODUCTION INFRASTRUCTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   CDN (CloudFront)                                                   │
│       ▼                                                              │
│   Load Balancer (AWS ALB) — TLS termination, health checks           │
│       ▼                                                              │
│   ┌──────────────────┐   ┌──────────────────┐                       │
│   │  API Container   │   │  Worker Container │                      │
│   │  (Auto-scaling)  │   │  (Independent)    │                      │
│   └────────┬─────────┘   └────────┬──────────┘                      │
│            │                      │                                  │
│   ┌────────┴──────────────────────┴─────────┐                       │
│   │           Managed Services               │                      │
│   │  ┌─────────┐  ┌──────┐  ┌────────────┐  │                      │
│   │  │ RDS     │  │Redis │  │ S3 (files) │  │                      │
│   │  │ (PG 16) │  │(7.x) │  │            │  │                      │
│   │  └─────────┘  └──────┘  └────────────┘  │                      │
│   └──────────────────────────────────────────┘                       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Scalability Roadmap

| Phase | Action | Status |
|-------|--------|--------|
| 1 | Process isolation (API vs Worker) | ✅ Complete |
| 2 | Redis adapter for WebSocket horizontal scaling | ✅ Complete |
| 3 | Migrate social providers from JSONB to dedicated table | 📋 Planned |
| 4 | Database read replicas | 📋 Planned |
| 5 | Horizontal API scaling (stateless JWT) | 📋 Planned |
| 6 | Event-driven architecture (CQRS for analytics) | 📋 Planned |

---

## Development Patterns

| Pattern | Where | Purpose |
|---------|-------|---------|
| Repository Pattern | TypeORM entities | Data access abstraction |
| Service Layer | All modules | Business logic isolation |
| Helper Pattern | Orders, Club | Complex business logic extraction |
| Gateway Pattern | WebSocket modules | Real-time event management |
| Guard Pattern | Auth, Roles, Ownership | Authorization enforcement |
| Interceptor Pattern | Logging, Tracing | Cross-cutting concerns (DI) |
| Module Pattern | NestJS modules | Feature encapsulation |
| forwardRef | Orders ↔ Reservations | Circular dependency resolution |
| Global Module | Common, Identity | Cross-module service sharing |

---

# Português

## Visão Geral

O Project Okinawa é uma plataforma abrangente de **experiência presencial** projetada para modernizar e otimizar operações de hospitalidade. Diferente de aplicativos de delivery, o Okinawa foca exclusivamente em **experiências físicas de refeição e entretenimento**, criando conexões fluidas entre clientes e estabelecimentos através da tecnologia.

A plataforma suporta **11 tipos de serviço distintos** — de fine dining e restaurantes casuais a casas noturnas e food trucks — cada um com conjuntos de funcionalidades adaptados e controlados por **26 feature flags** que ajustam toda a experiência do usuário dinamicamente.

### Componentes da Plataforma

| Componente | Tecnologia | Descrição |
|------------|------------|-----------|
| **App Mobile Cliente** | React Native / Expo | App para clientes — descoberta, pedidos, reservas e pagamentos |
| **App Mobile Restaurante** | React Native / Expo | App para equipe — KDS, gestão de salão e analytics |
| **API Backend** | NestJS | API REST escalável com suporte WebSocket em tempo real (26 módulos) |
| **Workers em Background** | Bull / Redis | Processo standalone para jobs, notificações e tarefas agendadas |
| **Sistema Preview** | React / Vite | Protótipo web interativo para validação de fluxos (62+ telas) |

### Tipos de Serviço (11 Tipos)

| Tipo de Serviço | Reservas | Fila | Geolocalização | Tab Digital | Ingressos | Ocupação |
|-----------------|:--------:|:----:|:--------------:|:-----------:|:---------:|:--------:|
| Fine Dining | ✓ | ✓ | - | ✓ | - | - |
| Quick Service | - | ✓ | - | - | - | - |
| Fast Casual | - | ✓ | - | ✓ | - | - |
| Café / Padaria | - | - | - | ✓ | - | - |
| Buffet | ✓ | ✓ | - | - | - | - |
| Drive-Thru | - | - | ✓ | - | - | - |
| Food Truck | - | - | ✓ | - | - | - |
| Chef's Table | ✓ | - | - | ✓ | - | - |
| Casual Dining | ✓ | ✓ | - | ✓ | - | - |
| Pub & Bar | - | - | - | ✓ | - | - |
| Club & Balada | - | ✓ | - | ✓ | ✓ | ✓ |

### Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTES                                      │
├─────────────────────┬─────────────────────┬─────────────────────────┤
│   App Cliente       │   App Restaurante   │   Sistema Preview       │
│   (React Native)    │   (React Native)    │   (React / Vite)        │
└─────────┬───────────┴─────────┬───────────┴─────────────────────────┘
          │                     │
          ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  CDN / WAF / Proteção DDoS                           │
├─────────────────────────────────────────────────────────────────────┤
│                  API GATEWAY / LOAD BALANCER (TLS 1.3)               │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────────┐
          ▼                   ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   REST API      │   │   WebSocket     │   │   Worker        │
│   (NestJS)      │   │   Gateway       │   │   (Standalone)  │
│   26 Módulos    │   │   (Socket.IO)   │   │   Bull/Redis    │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   PostgreSQL    │   │     Redis       │   │   Twilio /      │
│   16.x          │   │   7.x           │   │   SendGrid      │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

### Módulo de Identidade

O módulo Identity é a **fonte canônica de verdade** para todas as credenciais de usuário, blacklisting de tokens e logs de auditoria.

| Serviço | Propósito |
|---------|-----------|
| `CredentialService` | Hashing de senhas (bcrypt custo 12), validação, histórico |
| `MfaService` | MFA baseado em TOTP com códigos de recuperação |
| `TokenBlacklistService` | Blacklisting JTI via Redis + PostgreSQL (híbrido) |
| `AuditLogService` | Log de eventos de segurança |
| `PasswordPolicyService` | Histórico (últimas 5), regras de complexidade |

### Módulo Common (Cross-Cutting)

| Serviço | Propósito |
|---------|-----------|
| `StructuredLoggerService` | Logging JSON estruturado com correlation IDs |
| `LoggingInterceptor` | Logging automático de request/response (DI via `APP_INTERCEPTOR`) |
| `TracingModule` | Tracing distribuído com sampling configurável |
| `IdempotencyService` | Deduplicação de requisições via `X-Idempotency-Key` |
| `CacheService` | Cache multi-nível com Redis |
| `TranslationService` | i18n (PT, EN, ES) |
| `EmailService` | Email transacional via SendGrid |

### Autenticação (Passwordless-First)

| Método | Tipo | Detalhes |
|--------|------|---------|
| Social Login | Primário | Google OAuth 2.0, Apple Sign-In (RSA-SHA256) |
| Phone OTP | Primário | SMS/WhatsApp via Twilio (6 dígitos, 5 min TTL) |
| Biometria | Primário | Face ID/Touch ID (chaves assimétricas no Secure Enclave) |
| Email + Senha | Fallback | Opcional (bcrypt custo 12, histórico de 5 senhas) |

### Política JWT

| Propriedade | Access Token | Refresh Token |
|-------------|:------------:|:-------------:|
| Expiração | 15 minutos | 7 dias |
| JTI | ✓ (UUID) | ✓ (UUID) |
| Family (detecção de rotação) | — | ✓ |
| Blacklisting | Redis + PostgreSQL | Redis + PostgreSQL |

### RBAC (6 Níveis)

| Nível | Papel | Permissões |
|:-----:|-------|------------|
| 1 | **OWNER** | Controle total — todas as operações |
| 2 | **MANAGER** | Operações & aprovação — cancelamentos, reembolsos |
| 3 | **MAÎTRE** | Reservas, mapa do salão, gestão de fila |
| 4 | **CHEF** | KDS Cozinha — pedidos de comida |
| 5 | **WAITER** | Serviço de mesa — pedidos, status |
| 6 | **BARMAN** | KDS Bar — pedidos de bebidas |

### Identidade Multi-Restaurante

Uma única identidade (email/telefone) funciona em múltiplos estabelecimentos. O mesmo staff pode ser Garçom no Restaurante A e Proprietário no Restaurante B, sem re-autenticação. A UI oferece um Seletor de Restaurante pós-login e um Switcher no header.

### Módulo Club & Nightlife (12 Entidades)

| Feature | Serviço | Tempo Real |
|---------|---------|:----------:|
| Entradas | ClubEntriesService | — |
| Listas de Convidados | GuestListService | — |
| Reservas VIP | VipTableReservationsService | — |
| Tabs VIP (gasto mínimo) | VipTableTabsService | ✓ |
| Fila em Tempo Real | QueueService + QueueGateway | ✓ |
| Lineups DJ/Artistas | LineupService | — |
| Controle de Ocupação | OccupancyService | ✓ |
| Aniversários | BirthdayEntryService | — |
| Promoters (vendas e pagamentos) | PromoterService | — |
| Validação QR Code | QrCodeService | — |

### Estratégia de Testes

```
   850+ testes | 95%+ cobertura

   E2E (10%) — Fluxos completos de usuário
   Integração (30%) — Endpoints de API, interações de serviço
   Unitários (60%) — Helpers, funções puras, componentes
```

### Roadmap de Escalabilidade

| Fase | Ação | Status |
|------|------|--------|
| 1 | Isolamento de processo (API vs Worker) | ✅ Completo |
| 2 | Redis adapter para scaling horizontal de WebSocket | ✅ Completo |
| 3 | Migrar social providers de JSONB para tabela dedicada | 📋 Planejado |
| 4 | Read replicas de banco de dados | 📋 Planejado |
| 5 | Scaling horizontal de API (JWT stateless) | 📋 Planejado |
| 6 | Arquitetura event-driven (CQRS para analytics) | 📋 Planejado |

---

**Document Version:** 3.1
**Last Updated:** February 2025

**Versão do Documento:** 3.1
**Última Atualização:** Fevereiro 2025

**Built with ❤️ by the Project Okinawa team**
