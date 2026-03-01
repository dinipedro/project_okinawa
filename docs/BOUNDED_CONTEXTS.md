# Bounded Contexts — Architecture Documentation

> Last updated: 2026-02-24
> Status: Living Document — evolves with the platform

---

## Overview

Project Okinawa follows a **Modular Monolith** architecture with clearly defined Bounded Contexts. Each context encapsulates a cohesive domain with its own entities, services, and business rules. The current 26 NestJS modules are organized into **7 Bounded Contexts**.

This document maps the current domain boundaries and defines the evolution strategy toward potential microservice extraction.

---

## Bounded Context Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PROJECT OKINAWA                               │
│                     Modular Monolith (NestJS)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  IDENTITY &  │  │  RESTAURANT  │  │    ORDER MANAGEMENT     │   │
│  │    AUTH      │  │  MANAGEMENT  │  │                          │   │
│  │             │──│             │──│  Orders                  │   │
│  │  Auth       │  │  Restaurants │  │  Menu Items              │   │
│  │  Identity   │  │  Tables      │  │  Tabs                   │   │
│  │  Users      │  │  QR Code     │  │                          │   │
│  │  User Roles │  │              │  │                          │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
│         │                 │                    │                      │
│         ▼                 ▼                    ▼                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  FINANCIAL   │  │  ENGAGEMENT  │  │    ENTERTAINMENT        │   │
│  │             │  │             │  │                          │   │
│  │  Payments   │  │  Loyalty     │  │  Club (Nightlife)       │   │
│  │  Tips       │  │  Reviews     │  │  Events                 │   │
│  │  Financial  │  │  Favorites   │  │                          │   │
│  │             │  │  Reservations│  │                          │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
│         │                 │                    │                      │
│         └────────────┬────┘────────────────────┘                     │
│                      ▼                                               │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │               PLATFORM SERVICES (Cross-Cutting)              │    │
│  │                                                              │    │
│  │  Notifications │ Analytics │ AI │ Webhooks │ HR │ i18n      │    │
│  │  Health        │ Common    │                                 │    │
│  └──────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Context Details

### 1. Identity & Authentication Context

**Modules:** `auth`, `identity`, `users`, `user-roles`

**Responsibility:** User lifecycle, authentication, authorization, credential management

| Concern | Module | Description |
|---------|--------|-------------|
| Login/Register | `auth` | JWT, OAuth, OTP, Biometric |
| Credentials | `identity` | Password hashing, MFA, token blacklist |
| Profiles | `users` | User data, preferences |
| Permissions | `user-roles` | RBAC with 6-tier hierarchy |

**Key Entities:** `Profile`, `UserCredential`, `AuditLog`, `TokenBlacklist`, `OTPToken`, `BiometricToken`

**Aggregate Root:** `Profile`

**Events Published:** `UserRegistered`, `UserLoggedIn`, `PasswordChanged`, `AccountLocked`

---

### 2. Restaurant Management Context

**Modules:** `restaurants`, `tables`, `qr-code`

**Responsibility:** Establishment configuration, floor management, table lifecycle

| Concern | Module | Description |
|---------|--------|-------------|
| Restaurant CRUD | `restaurants` | Service type config, settings |
| Floor Plan | `tables` | Table status, layout |
| Access Points | `qr-code` | Table/menu QR generation |

**Aggregate Root:** `Restaurant`

**Events Published:** `TableStatusChanged`, `RestaurantConfigured`

---

### 3. Order Management Context

**Modules:** `orders`, `menu-items`, `tabs`

**Responsibility:** Full order lifecycle from placement to completion

| Concern | Module | Description |
|---------|--------|-------------|
| Order Processing | `orders` | Create, update, track, KDS |
| Product Catalog | `menu-items` | Items, categories, modifiers |
| Open Tabs | `tabs` | Bar/pub running tabs |

**Aggregate Root:** `Order`

**Events Published:** `OrderCreated`, `OrderStatusChanged`, `OrderCompleted`, `TabOpened`, `TabClosed`

---

### 4. Financial Context

**Modules:** `payments`, `tips`, `financial`

**Responsibility:** All monetary transactions, wallet, split payments, reporting

| Concern | Module | Description |
|---------|--------|-------------|
| Transactions | `payments` | Wallet, split, gateway |
| Gratuity | `tips` | Tip distribution |
| Reports | `financial` | Revenue, P&L, exports |

**Aggregate Root:** `Payment`

**Events Published:** `PaymentProcessed`, `WalletCredited`, `TipDistributed`

---

### 5. Engagement Context

**Modules:** `reservations`, `loyalty`, `reviews`, `favorites`

**Responsibility:** Customer relationship, bookings, loyalty program

| Concern | Module | Description |
|---------|--------|-------------|
| Bookings | `reservations` | Guest management, calendar |
| Rewards | `loyalty` | Points, tiers, redemption |
| Feedback | `reviews` | Ratings, photos |
| Preferences | `favorites` | Saved restaurants |

**Aggregate Root:** `Reservation`

**Events Published:** `ReservationCreated`, `ReservationCheckedIn`, `PointsEarned`, `ReviewSubmitted`

---

### 6. Entertainment Context

**Modules:** `club`, `events`

**Responsibility:** Nightlife-specific features, event management

| Concern | Module | Description |
|---------|--------|-------------|
| Nightclub | `club` | VIP tables, entry, promoters |
| Events | `events` | Event scheduling, tickets |

**Aggregate Root:** `ClubEntry`

**Events Published:** `EventCreated`, `VIPReserved`, `QueueUpdated`

---

### 7. Platform Services (Cross-Cutting)

**Modules:** `notifications`, `analytics`, `ai`, `webhooks`, `hr`, `i18n`, `health`, `common`

**Responsibility:** Shared infrastructure consumed by all contexts

| Concern | Module | Description |
|---------|--------|-------------|
| Alerts | `notifications` | Push, email, SMS |
| BI | `analytics` | Dashboards, metrics |
| Intelligence | `ai` | Recommendations, insights |
| Integration | `webhooks` | External system hooks |
| Staff | `hr` | Scheduling, attendance |
| Localization | `i18n` | PT/EN translations |
| Ops | `health`, `common` | Monitoring, logging, caching |

---

## Module Dependency Matrix

```
                    Identity  Restaurant  Order  Financial  Engagement  Entertainment  Platform
Identity              —          ✗         ✗       ✗          ✗            ✗             ✗
Restaurant            ✓          —         ✗       ✗          ✗            ✗             ✗
Order                 ✓          ✓         —       ✗          ✗            ✗             ✗
Financial             ✓          ✗         ✓       —          ✗            ✗             ✗
Engagement            ✓          ✓         ✗       ✗          —            ✗             ✗
Entertainment         ✓          ✓         ✓       ✓          ✗            —             ✗
Platform              ✓          ✗         ✗       ✗          ✗            ✗             —

✓ = depends on  |  ✗ = no dependency  |  — = self
```

**Key Observation:** Dependencies flow top-down. No circular dependencies exist between contexts.

---

## Anti-Corruption Layers

To maintain context boundaries:

1. **Identity → All:** Shared via `@Global()` `IdentityModule` and JWT guards
2. **Order → Restaurant:** Via `restaurantId` foreign key, not direct entity imports
3. **Financial → Order:** Via `orderId` reference, processes asynchronously
4. **Platform → All:** Horizontal services injected via `@Global()` `CommonModule`

---

## Evolution Strategy: Monolith → Microservices

### Phase 1: Current (Modular Monolith) ✅
- All contexts in single deployable
- Shared database with table-level isolation
- In-process communication

### Phase 2: Extract Workers (In Progress)
- Bull workers in separate process (worker.ts)
- Notifications and analytics processing isolated
- Same database, separate compute

### Phase 3: API Gateway (6-12 months)
- Extract Identity & Auth as standalone service
- Implement API Gateway for routing
- Introduce event bus (Redis Streams or RabbitMQ)

### Phase 4: Full Decomposition (12-24 months)
- Extract Financial context (PCI DSS compliance)
- Extract Order context (highest traffic)
- Per-context databases (CQRS where needed)
- Service mesh for observability

### Extraction Priority (based on scaling needs):

| Priority | Context | Reason |
|----------|---------|--------|
| 1 | Identity & Auth | Security isolation, shared across all services |
| 2 | Financial | PCI compliance, regulatory requirements |
| 3 | Order Management | Highest throughput, independent scaling |
| 4 | Notifications | Already async, natural fit for extraction |
| 5 | Engagement | Lower coupling, can evolve independently |
| 6 | Entertainment | Domain-specific, can be a plugin architecture |

---

## Folder Structure Alignment

Current structure already maps cleanly to bounded contexts:

```
backend/src/modules/
├── auth/            ┐
├── identity/        │ Context: Identity & Auth
├── users/           │
├── user-roles/      ┘
├── restaurants/     ┐
├── tables/          │ Context: Restaurant Management
├── qr-code/         ┘
├── orders/          ┐
├── menu-items/      │ Context: Order Management
├── tabs/            ┘
├── payments/        ┐
├── tips/            │ Context: Financial
├── financial/       ┘
├── reservations/    ┐
├── loyalty/         │ Context: Engagement
├── reviews/         │
├── favorites/       ┘
├── club/            ┐ Context: Entertainment
├── events/          ┘
├── notifications/   ┐
├── analytics/       │
├── ai/              │ Context: Platform Services
├── webhooks/        │
├── hr/              │
├── i18n/            │
├── health/          ┘
```

**No folder reorganization needed.** The current structure already reflects the bounded context boundaries.

---

## Decision Record

| Decision | Rationale |
|----------|-----------|
| Keep modular monolith | <500K users — monolith is simpler, cheaper to operate |
| Global Identity module | Every context needs auth; avoid circular imports |
| Separate worker process | CPU-intensive jobs shouldn't block API latency |
| Table-level isolation | Contexts own their tables; no cross-context direct queries |
| Event-based integration | OrderCompleted → triggers Payment, Notification, Analytics |
