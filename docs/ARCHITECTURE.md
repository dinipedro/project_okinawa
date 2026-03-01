# Architecture Document / Documento de Arquitetura

> **Version**: 2.1.0  
> **Last Updated**: February 2025  
> **Language**: Bilingual (EN/PT)  
> **Status**: Active Development

---

## Table of Contents / Índice

- [Overview / Visão Geral](#overview)
- [System Architecture / Arquitetura do Sistema](#system-architecture)
- [Technology Stack / Stack Tecnológica](#technology-stack)
- [Backend Architecture / Arquitetura do Backend](#backend-architecture)
- [Mobile Architecture / Arquitetura Mobile](#mobile-architecture)
- [Database Design / Design do Banco de Dados](#database-design)
- [API Design / Design da API](#api-design)
- [Real-time Communication / Comunicação em Tempo Real](#real-time-communication)
- [Caching Strategy / Estratégia de Cache](#caching-strategy)
- [Security Architecture / Arquitetura de Segurança](#security-architecture)
- [Infrastructure / Infraestrutura](#infrastructure)
- [Service Types / Tipos de Serviço](#service-types)
- [UX Optimizations / Otimizações de UX](#ux-optimizations)
- [Scalability Considerations / Considerações de Escalabilidade](#scalability-considerations)

---

## Overview

Project Okinawa is a comprehensive **in-person restaurant experience platform** built with a modern, scalable architecture. The system follows a client-server model with real-time capabilities, featuring two mobile applications (customer and restaurant staff) backed by a robust API.

### Design Principles

1. **Modularity**: Feature-based module organization for maintainability
2. **Scalability**: Horizontal scaling support through stateless services
3. **Security**: Defense in depth with multiple security layers (AUDIT-010 compliant)
4. **Real-time**: WebSocket support for live updates with room-based broadcasting
5. **Type Safety**: End-to-end TypeScript with Zod schema validation
6. **Testability**: Dependency injection enabling unit testing (850+ tests, 95%+ coverage)
7. **Service-Type-First**: Dynamic feature adaptation based on establishment type

### Key Metrics

| Metric | Value |
|--------|-------|
| Backend Modules | 26 |
| Client Screens | 37 |
| Restaurant Screens | 25 |
| Preview Screens | 62 |
| Database Tables | 31 |
| Test Coverage | 95%+ |
| Service Types | 11 |

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                      │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │  Client App     │    │  Restaurant App │    │  Admin Panel    │ │
│  │  (React Native) │    │  (React Native) │    │  (Web - Future) │ │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘ │
└───────────┼──────────────────────┼──────────────────────┼──────────┘
            │                      │                      │
            └──────────────────────┼──────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │        API Gateway          │
                    │   (Rate Limiting, CORS)     │
                    └──────────────┬──────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                         BACKEND SERVICES                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    NestJS Application                        │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │   │
│  │  │    Auth     │  │   Orders    │  │  Payments   │  ...     │   │
│  │  │   Module    │  │   Module    │  │   Module    │          │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │              Common Services Layer                   │    │   │
│  │  │  (Guards, Interceptors, Filters, Pipes)             │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
            │                      │                      │
┌───────────▼──────────┐ ┌────────▼────────┐ ┌───────────▼───────────┐
│    PostgreSQL        │ │     Redis       │ │    External Services  │
│    (Primary DB)      │ │  (Cache/Queue)  │ │  (Payment, Push, AI)  │
└──────────────────────┘ └─────────────────┘ └───────────────────────┘
```

### Component Interaction

```
┌──────────────┐     HTTP/WS      ┌──────────────┐
│   Mobile     │◄────────────────►│   Backend    │
│   Apps       │                  │   API        │
└──────────────┘                  └──────┬───────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
              ┌─────▼─────┐       ┌─────▼─────┐       ┌─────▼─────┐
              │PostgreSQL │       │   Redis   │       │   Bull    │
              │  Database │       │   Cache   │       │   Queue   │
              └───────────┘       └───────────┘       └───────────┘
```

---

## Technology Stack

### Backend

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 20.x | JavaScript runtime |
| **Framework** | NestJS 10.4.x | Application framework |
| **Language** | TypeScript 5.x | Type safety |
| **Database** | PostgreSQL 16 | Primary data store |
| **ORM** | TypeORM 0.3.x | Database abstraction |
| **Cache** | Redis 7.x | Caching and sessions |
| **Queue** | Bull 4.x | Background jobs |
| **WebSocket** | Socket.IO 4.8.x | Real-time communication |
| **Auth** | Passport + JWT | Authentication |
| **Validation** | class-validator | Input validation |
| **Documentation** | Swagger/OpenAPI | API documentation |

### Mobile

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | React Native 0.74.x | Cross-platform mobile |
| **Platform** | Expo 51.x | Development tooling |
| **Language** | TypeScript 5.x | Type safety |
| **Navigation** | React Navigation 6.x | Screen navigation |
| **UI** | React Native Paper 5.12.x | Material Design components |
| **State** | TanStack Query 5.x | Server state management |
| **Forms** | React Hook Form 7.x | Form handling |
| **Validation** | Zod 4.x | Schema validation |
| **HTTP** | Axios | HTTP client |
| **WebSocket** | Socket.IO Client 4.8.x | Real-time updates |

### DevOps

| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| Docker Compose | Local orchestration |
| GitHub Actions | CI/CD |
| ESLint | Code linting |
| Prettier | Code formatting |
| Jest | Testing framework |

---

## Backend Architecture

### Module Organization

The backend follows NestJS module architecture with 24 feature modules:

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
│
├── common/                 # Shared utilities
│   ├── decorators/        # Custom decorators
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── api-response.decorator.ts
│   ├── filters/           # Exception filters
│   │   ├── http-exception.filter.ts
│   │   └── sentry-exception.filter.ts
│   ├── guards/            # Authorization guards
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── throttler.guard.ts
│   ├── interceptors/      # Response interceptors
│   │   ├── transform-response.interceptor.ts
│   │   └── logging.interceptor.ts
│   ├── middleware/        # HTTP middleware
│   │   └── csrf.middleware.ts
│   ├── pipes/             # Validation pipes
│   ├── services/          # Shared services
│   │   └── email.service.ts
│   └── logging/           # Structured logging
│
├── config/                 # Configuration
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── throttler.config.ts
│   ├── i18n.config.ts
│   ├── sentry.config.ts
│   └── validation.config.ts
│
├── database/               # Database management
│   ├── migrations/        # TypeORM migrations
│   └── seeds/             # Seed data
│
└── modules/                # Feature modules
    ├── auth/              # Authentication
    ├── identity/          # Credential management
    ├── users/             # User profiles
    ├── restaurants/       # Restaurant management
    ├── orders/            # Order processing
    ├── reservations/      # Booking system
    ├── payments/          # Payment processing
    ├── menu-items/        # Menu management
    ├── tables/            # Table management
    ├── reviews/           # Reviews and ratings
    ├── loyalty/           # Loyalty program
    ├── tips/              # Gratuity system
    ├── notifications/     # Push notifications
    ├── financial/         # Financial reports
    ├── hr/                # HR management
    ├── analytics/         # Business analytics
    ├── ai/                # AI integrations
    ├── webhooks/          # External webhooks
    ├── events/            # WebSocket events
    ├── qr-code/           # QR code generation
    ├── favorites/         # User favorites
    ├── user-roles/        # Role management
    ├── health/            # Health checks
    └── i18n/              # Internationalization
```

### Module Structure Pattern

Each feature module follows this structure:

```
modules/orders/
├── dto/
│   ├── create-order.dto.ts
│   ├── update-order.dto.ts
│   └── order-query.dto.ts
├── entities/
│   ├── order.entity.ts
│   ├── order-item.entity.ts
│   └── order-guest.entity.ts
├── helpers/
│   ├── order-calculator.helper.ts
│   ├── kds-formatter.helper.ts
│   └── waiter-stats.helper.ts
├── orders.controller.ts    # HTTP endpoints
├── orders.service.ts       # Business logic
├── orders.module.ts        # Module definition
└── orders.gateway.ts       # WebSocket gateway
```

### Dependency Injection

NestJS uses constructor-based dependency injection:

```typescript
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly loyaltyService: LoyaltyService,
  ) {}
}
```

### Request Lifecycle

```
Request
    │
    ▼
┌───────────────────┐
│    Middleware     │ (CSRF, Cookie Parser, Helmet)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│      Guards       │ (JWT Auth, Roles, Throttler)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Interceptors    │ (Logging, Transform Response)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│      Pipes        │ (Validation, Transform)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│    Controller     │ (Route Handler)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│     Service       │ (Business Logic)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Repository      │ (Data Access)
└─────────┬─────────┘
          │
          ▼
Response
```

---

## Mobile Architecture

### Project Structure

```
mobile/
├── apps/
│   ├── client/                  # Customer application
│   │   ├── src/
│   │   │   ├── App.tsx         # Entry point
│   │   │   ├── components/     # Reusable components
│   │   │   │   ├── common/     # Generic components
│   │   │   │   ├── menu/       # Menu-specific components
│   │   │   │   └── orders/     # Order-specific components
│   │   │   ├── navigation/     # Navigation config
│   │   │   │   ├── index.tsx
│   │   │   │   └── analytics-tracker.ts
│   │   │   ├── screens/        # Screen components
│   │   │   │   ├── auth/       # Authentication screens
│   │   │   │   ├── home/       # Home and explore
│   │   │   │   ├── menu/       # Menu browsing
│   │   │   │   ├── orders/     # Order management
│   │   │   │   ├── cart/       # Shopping cart
│   │   │   │   ├── payment/    # Payment flow
│   │   │   │   ├── reservations/
│   │   │   │   ├── wallet/     # Digital wallet
│   │   │   │   ├── favorites/
│   │   │   │   ├── loyalty/
│   │   │   │   ├── reviews/
│   │   │   │   ├── profile/
│   │   │   │   └── settings/
│   │   │   ├── services/       # API services
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── types/          # TypeScript types
│   │   │   └── theme/          # Design system
│   │   ├── app.json            # Expo config
│   │   └── package.json
│   │
│   └── restaurant/              # Restaurant staff application
│       └── src/
│           ├── App.tsx
│           ├── components/
│           │   ├── dashboard/
│           │   ├── orders/
│           │   ├── reservations/
│           │   ├── tables/
│           │   ├── staff/
│           │   └── menu/
│           ├── navigation/
│           ├── screens/
│           │   ├── auth/
│           │   ├── dashboard/
│           │   ├── kds/         # Kitchen Display
│           │   ├── barman-kds/  # Bar Display
│           │   ├── orders/
│           │   ├── reservations/
│           │   ├── floor-plan/
│           │   ├── menu/
│           │   ├── financial/
│           │   ├── tips/
│           │   ├── staff/
│           │   ├── hr/
│           │   ├── waiter-dashboard/
│           │   ├── maitre-dashboard/
│           │   ├── setup-hub/
│           │   └── settings/
│           ├── services/
│           ├── hooks/
│           ├── types/
│           └── theme/
│
└── shared/                      # Shared between apps
    ├── types/
    └── utils/
```

### Navigation Architecture

**Client App Navigation:**

```
RootNavigator
├── AuthStack
│   ├── WelcomeScreen
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── OnboardingScreen
│
└── MainTabs
    ├── HomeTab
    │   ├── HomeScreen
    │   ├── ExploreScreen
    │   ├── RestaurantScreen
    │   └── MenuScreen
    ├── OrdersTab
    │   ├── OrdersScreen
    │   └── OrderDetailScreen
    ├── ReservationsTab
    │   ├── ReservationsScreen
    │   └── CreateReservationScreen
    └── ProfileTab
        ├── ProfileScreen
        ├── WalletScreen
        ├── FavoritesScreen
        ├── LoyaltyScreen
        └── SettingsScreen
```

**Restaurant App Navigation:**

```
RootNavigator
├── AuthStack
│   └── LoginScreen
│
└── MainDrawer
    ├── DashboardScreen
    ├── KDSScreen
    ├── BarmanKDSScreen
    ├── OrdersScreen
    ├── ReservationsScreen
    ├── FloorPlanScreen
    ├── MenuScreen
    ├── FinancialScreen
    ├── TipsScreen
    ├── StaffScreen
    ├── HRScreen
    ├── WaiterDashboard
    ├── MaitreDashboard
    ├── SetupHubScreen
    └── SettingsScreen
```

### State Management

Using TanStack Query for server state:

```typescript
// Query hook
export function useOrders(restaurantId: string) {
  return useQuery({
    queryKey: ['orders', restaurantId],
    queryFn: () => ordersApi.getByRestaurant(restaurantId),
    staleTime: 30000,
  });
}

// Mutation hook
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     profiles    │────<│   user_roles    │>────│   restaurants   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ auth_id         │     │ profile_id      │     │ name            │
│ email           │     │ restaurant_id   │     │ address         │
│ full_name       │     │ role            │     │ phone           │
│ phone           │     │ created_at      │     │ status          │
│ avatar_url      │     └─────────────────┘     │ settings        │
│ created_at      │                             └────────┬────────┘
│ updated_at      │                                      │
└─────────────────┘                                      │
        │                                                │
        │     ┌─────────────────┐     ┌─────────────────┼──────────────┐
        │     │     orders      │     │                 │              │
        │     ├─────────────────┤     │    ┌───────────┴───────────┐  │
        └────>│ id              │     │    │  restaurant_tables     │  │
              │ customer_id     │<────┼────├────────────────────────┤  │
              │ restaurant_id   │>────┘    │ id                     │  │
              │ table_id        │>─────────│ restaurant_id          │  │
              │ status          │          │ number                 │  │
              │ total           │          │ capacity               │  │
              │ created_at      │          │ status                 │  │
              └────────┬────────┘          └────────────────────────┘  │
                       │                                               │
        ┌──────────────┘                                               │
        │                                                              │
        ▼                                                              │
┌─────────────────┐     ┌─────────────────┐                           │
│   order_items   │────>│   menu_items    │<──────────────────────────┘
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ order_id        │     │ restaurant_id   │
│ menu_item_id    │     │ category_id     │
│ quantity        │     │ name            │
│ unit_price      │     │ description     │
│ notes           │     │ price           │
└─────────────────┘     │ image_url       │
                        │ available       │
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  reservations   │────>│   restaurants   │
├─────────────────┤     └─────────────────┘
│ id              │
│ customer_id     │>────┐
│ restaurant_id   │     │
│ table_id        │     │    ┌─────────────────┐
│ date            │     └───>│     profiles    │
│ time            │          └─────────────────┘
│ guests          │
│ status          │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│     wallets     │────>│wallet_transactions
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ profile_id      │     │ wallet_id       │
│ balance         │     │ type            │
│ created_at      │     │ amount          │
└─────────────────┘     │ description     │
                        │ created_at      │
                        └─────────────────┘
```

### Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `profiles` | User profiles | id, auth_id, email, full_name |
| `user_roles` | Role assignments | profile_id, restaurant_id, role |
| `restaurants` | Restaurant data | id, name, address, settings |
| `restaurant_tables` | Physical tables | restaurant_id, number, status |
| `menu_items` | Menu products | restaurant_id, name, price |
| `menu_categories` | Menu organization | restaurant_id, name, order |
| `orders` | Customer orders | customer_id, restaurant_id, status |
| `order_items` | Items in orders | order_id, menu_item_id, quantity |
| `reservations` | Table bookings | customer_id, restaurant_id, date |
| `wallets` | Digital wallets | profile_id, balance |
| `wallet_transactions` | Payment history | wallet_id, type, amount |
| `reviews` | Customer reviews | profile_id, restaurant_id, rating |
| `tips` | Gratuities | order_id, waiter_id, amount |
| `favorites` | Saved restaurants | profile_id, restaurant_id |
| `notifications` | Push notifications | profile_id, type, data |

### Indexes

Performance indexes are created for:

```sql
-- Frequently queried fields
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_menu_items_restaurant_category
  ON menu_items(restaurant_id, category_id);
CREATE INDEX idx_reservations_restaurant_date
  ON reservations(restaurant_id, date);
```

---

## API Design

### RESTful Conventions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/orders` | List orders |
| GET | `/api/v1/orders/:id` | Get single order |
| POST | `/api/v1/orders` | Create order |
| PATCH | `/api/v1/orders/:id` | Update order |
| DELETE | `/api/v1/orders/:id` | Delete order |

### API Response Format

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### Authentication Endpoints

```
POST   /api/v1/auth/register      # New user registration
POST   /api/v1/auth/login         # Email/password login
POST   /api/v1/auth/refresh       # Refresh access token
POST   /api/v1/auth/logout        # Invalidate session
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/google        # Google OAuth
GET    /api/v1/auth/apple         # Apple OAuth
GET    /api/v1/auth/microsoft     # Microsoft OAuth
```

### Module Endpoints

**Restaurants:**
```
GET    /api/v1/restaurants
GET    /api/v1/restaurants/:id
GET    /api/v1/restaurants/:id/menu
GET    /api/v1/restaurants/:id/tables
POST   /api/v1/restaurants
PATCH  /api/v1/restaurants/:id
```

**Orders:**
```
GET    /api/v1/orders
GET    /api/v1/orders/:id
POST   /api/v1/orders
PATCH  /api/v1/orders/:id
PATCH  /api/v1/orders/:id/status
GET    /api/v1/orders/:id/items
POST   /api/v1/orders/:id/items
```

**Reservations:**
```
GET    /api/v1/reservations
GET    /api/v1/reservations/:id
POST   /api/v1/reservations
PATCH  /api/v1/reservations/:id
DELETE /api/v1/reservations/:id
GET    /api/v1/reservations/availability
```

**Payments:**
```
GET    /api/v1/wallets/:id
GET    /api/v1/wallets/:id/transactions
POST   /api/v1/payments
POST   /api/v1/payments/split
```

---

## Real-time Communication

### WebSocket Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│   Mobile App    │◄──────────────────►│   Events        │
│                 │                    │   Gateway       │
└─────────────────┘                    └────────┬────────┘
                                                │
                                    ┌───────────┼───────────┐
                                    │           │           │
                              ┌─────▼─────┐ ┌──▼──┐ ┌──────▼──────┐
                              │  Orders   │ │Redis│ │Notifications│
                              │  Service  │ │Pub/S│ │   Service   │
                              └───────────┘ └─────┘ └─────────────┘
```

### WebSocket Namespaces

| Namespace | Purpose | Events |
|-----------|---------|--------|
| `/orders` | Order updates | `order:created`, `order:updated`, `order:status` |
| `/reservations` | Reservation updates | `reservation:created`, `reservation:updated` |
| `/notifications` | Push notifications | `notification:new` |
| `/tables` | Table status | `table:status`, `table:assigned` |
| `/kds` | Kitchen display | `kds:order`, `kds:ready` |
| `/payments` | Payment events | `payment:split_updated`, `payment:completed` |
| `/queue` | Virtual queue | `queue:position`, `queue:called` |
| `/occupancy` | Venue capacity | `occupancy:update` |
| `/vip-table` | VIP table tabs | `tab:item_added`, `tab:spend_updated` |

### WebSocket Rooms Structure

```typescript
// Room naming conventions for scoped broadcasts
@room('restaurant:{restaurantId}')     // All staff of a restaurant
@room('order:{orderId}')               // Specific order subscribers
@room('table:{tableId}')               // Table-specific events
@room('kds:kitchen:{restaurantId}')    // Kitchen KDS channel
@room('kds:bar:{restaurantId}')        // Bar KDS channel
@room('queue:{restaurantId}')          // Virtual queue updates
@room('occupancy:{restaurantId}')      // Capacity monitoring
@room('vip-table:{tableId}')           // VIP table tab updates
```

### Event Payload Examples

```typescript
// Order status update
@event('order:status')
{
  orderId: string;
  previousStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  newStatus: string;
  updatedAt: Date;
  estimatedTime?: number; // minutes
}

// Split payment update
@event('payment:split_updated')
{
  orderId: string;
  guestId: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  amount: number;
  paymentMethod?: string;
  paidAt?: Date;
}

// KDS order notification
@event('kds:order')
{
  orderId: string;
  tableNumber: number;
  items: Array<{
    name: string;
    quantity: number;
    notes?: string;
    modifiers?: string[];
  }>;
  priority: 'normal' | 'rush' | 'vip';
  createdAt: Date;
  targetPrepTime: number; // seconds
}
```

### Event Flow Example

```
Customer places order
        │
        ▼
┌─────────────────┐
│  OrdersService  │ ──► Save to database
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  EventsGateway  │ ──► Emit 'order:created'
└────────┬────────┘
         │
    ┌────┼────┬────────────┐
    ▼    ▼    ▼            ▼
┌──────┐┌────────┐┌──────────┐┌─────────────┐
│ KDS  ││Waiter  ││Restaurant││Notification │
│ App  ││Screen  ││Dashboard ││  Service    │
└──────┘└────────┘└──────────┘└─────────────┘
```

### Caching Strategy (L1/L2/L3)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Caching Layers                              │
├─────────────────────────────────────────────────────────────────────┤
│  L1: In-Memory Cache (per instance)                                  │
│  ├── TTL: 30 seconds                                                │
│  ├── Use: Hot data, session tokens, computed values                 │
│  └── Implementation: Node.js Map with TTL cleanup                   │
├─────────────────────────────────────────────────────────────────────┤
│  L2: Redis Cache (distributed)                                       │
│  ├── TTL: 5-30 minutes (configurable per key pattern)               │
│  ├── Use: User profiles, menu items, restaurant config              │
│  └── Features: Pub/Sub for invalidation, cluster support            │
├─────────────────────────────────────────────────────────────────────┤
│  L3: PostgreSQL Database                                             │
│  ├── Source of truth                                                │
│  ├── Indexed for common query patterns                              │
│  └── Connection pooling with pgBouncer                              │
└─────────────────────────────────────────────────────────────────────┘
```

```typescript
// Cache key patterns
const cachePatterns = {
  userProfile: 'user:profile:{userId}',           // TTL: 10min
  restaurantMenu: 'restaurant:menu:{restaurantId}', // TTL: 30min
  activeOrders: 'orders:active:{restaurantId}',   // TTL: 1min
  tableStatus: 'tables:status:{restaurantId}',    // TTL: 30sec
  sessionToken: 'session:{sessionId}',            // TTL: 7 days
};

// Cache invalidation triggers
@OnEvent('menu:updated')
async invalidateMenuCache(restaurantId: string) {
  await this.cacheService.delete(`restaurant:menu:${restaurantId}`);
  await this.cacheService.delete(`restaurant:menu:${restaurantId}:*`);
}

---

## Security Architecture

### Authentication Flow

```
┌────────────┐         ┌────────────┐         ┌────────────┐
│   Client   │         │   Backend  │         │  Database  │
└─────┬──────┘         └─────┬──────┘         └─────┬──────┘
      │                      │                      │
      │  POST /auth/login    │                      │
      │─────────────────────>│                      │
      │                      │  Verify credentials  │
      │                      │─────────────────────>│
      │                      │<─────────────────────│
      │                      │                      │
      │                      │  Generate JWT        │
      │                      │                      │
      │  { accessToken,      │                      │
      │    refreshToken }    │                      │
      │<─────────────────────│                      │
      │                      │                      │
      │  GET /orders         │                      │
      │  Authorization:      │                      │
      │  Bearer <token>      │                      │
      │─────────────────────>│                      │
      │                      │  Validate JWT        │
      │                      │  Check blacklist     │
      │                      │─────────────────────>│
      │                      │<─────────────────────│
      │                      │                      │
      │  { orders: [...] }   │                      │
      │<─────────────────────│                      │
```

### Security Layers

```
┌─────────────────────────────────────────────┐
│              Rate Limiting                   │
│         (ThrottlerGuard - 100/min)          │
├─────────────────────────────────────────────┤
│             CSRF Protection                  │
│        (CsrfMiddleware - POST/PUT)          │
├─────────────────────────────────────────────┤
│           JWT Authentication                 │
│            (JwtAuthGuard)                   │
├─────────────────────────────────────────────┤
│         Role-Based Authorization             │
│             (RolesGuard)                    │
├─────────────────────────────────────────────┤
│           Input Validation                   │
│         (ValidationPipe + DTOs)             │
├─────────────────────────────────────────────┤
│            Query Security                    │
│      (TypeORM parameterized queries)        │
└─────────────────────────────────────────────┘
```

---

## Infrastructure

### Docker Configuration

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: okinawa
      POSTGRES_USER: okinawa
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U okinawa"]

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

  backend:
    build:
      context: .
      target: production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      REDIS_HOST: redis
```

### CI/CD Pipeline

```yaml
# GitHub Actions
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
      redis:
        image: redis:7-alpine
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:cov

  backend-build:
    needs: [backend-test]
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - run: docker build -t okinawa-backend .
```

---

## Scalability Considerations

### Horizontal Scaling

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
     ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
     │  Backend 1  │  │  Backend 2  │  │  Backend 3  │
     └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
     ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
     │  PostgreSQL │  │    Redis    │  │Redis Cluster│
     │   Primary   │  │   Primary   │  │  (Pub/Sub)  │
     └─────────────┘  └─────────────┘  └─────────────┘
```

### Performance Optimizations

1. **Database**
   - Connection pooling
   - Read replicas for heavy queries
   - Proper indexing strategy

2. **Caching**
   - Redis for session storage
   - Query result caching
   - API response caching

3. **Background Jobs**
   - Bull queue for async processing
   - Notification delivery
   - Report generation

4. **CDN**
   - Static asset delivery
   - Image optimization
   - Global distribution

---

## Appendix

### Environment Variables

See [.env.example](../backend/.env.example) for complete list.

### API Documentation

Access Swagger documentation at `/docs` when running the backend.

### Database Migrations

Located in `backend/src/database/migrations/`

---

**Document Version:** 1.0
**Last Updated:** December 2025

---

# Documento de Arquitetura

## Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura Backend](#arquitetura-backend)
- [Arquitetura Mobile](#arquitetura-mobile)
- [Design de Banco de Dados](#design-de-banco-de-dados)
- [Design de API](#design-de-api)
- [Comunicação em Tempo Real](#comunicação-em-tempo-real)
- [Arquitetura de Segurança](#arquitetura-de-segurança)
- [Infraestrutura](#infraestrutura)
- [Considerações de Escalabilidade](#considerações-de-escalabilidade)

---

## Visão Geral

O Project Okinawa é uma plataforma completa de gerenciamento de restaurantes construída com uma arquitetura moderna e escalável. O sistema segue um modelo cliente-servidor com capacidades de tempo real, apresentando dois aplicativos mobile (cliente e restaurante) suportados por uma API robusta.

### Princípios de Design

1. **Modularidade**: Organização de módulos baseada em funcionalidades para manutenibilidade
2. **Escalabilidade**: Suporte a escala horizontal através de serviços stateless
3. **Segurança**: Defesa em profundidade com múltiplas camadas de segurança
4. **Tempo Real**: Suporte a WebSocket para atualizações ao vivo
5. **Type Safety**: TypeScript end-to-end para confiabilidade
6. **Testabilidade**: Injeção de dependência permitindo testes unitários

---

## Arquitetura do Sistema

O sistema consiste em três componentes principais:

1. **Apps Mobile** - React Native com Expo
2. **API Backend** - NestJS com TypeORM
3. **Serviços de Dados** - PostgreSQL + Redis

### Fluxo de Dados

```
Cliente Mobile → API Gateway → Backend Services → Database/Cache
                     ↑                ↓
              WebSocket ←──── Events Gateway
```

---

## Stack Tecnológica

### Backend

| Camada | Tecnologia | Propósito |
|--------|------------|-----------|
| Runtime | Node.js 20.x | Ambiente JavaScript |
| Framework | NestJS 10.4.x | Framework de aplicação |
| Linguagem | TypeScript 5.x | Type safety |
| Banco de Dados | PostgreSQL 16 | Armazenamento principal |
| ORM | TypeORM 0.3.x | Abstração de banco |
| Cache | Redis 7.x | Cache e sessões |
| Fila | Bull 4.x | Jobs em background |
| WebSocket | Socket.IO 4.8.x | Comunicação em tempo real |

### Mobile

| Camada | Tecnologia | Propósito |
|--------|------------|-----------|
| Framework | React Native 0.74.x | Mobile cross-platform |
| Plataforma | Expo 51.x | Ferramentas de desenvolvimento |
| Navegação | React Navigation 6.x | Navegação de telas |
| UI | React Native Paper 5.12.x | Componentes Material Design |
| Estado | TanStack Query 5.x | Gerenciamento de estado servidor |

---

## Arquitetura Backend

### Organização de Módulos

O backend segue a arquitetura de módulos NestJS com 24 módulos de funcionalidades:

- **auth** - Autenticação e autorização
- **identity** - Gestão de credenciais
- **users** - Perfis de usuário
- **restaurants** - Gestão de restaurantes
- **orders** - Processamento de pedidos
- **reservations** - Sistema de reservas
- **payments** - Processamento de pagamentos
- **menu-items** - Gestão de cardápio
- **tables** - Gestão de mesas
- **reviews** - Avaliações e notas
- **loyalty** - Programa de fidelidade
- **tips** - Sistema de gorjetas
- **notifications** - Notificações push
- **financial** - Relatórios financeiros
- **hr** - Gestão de RH
- **analytics** - Business analytics
- **ai** - Integrações de IA
- **webhooks** - Webhooks externos
- **events** - Eventos WebSocket
- **qr-code** - Geração de QR code
- **favorites** - Favoritos do usuário
- **user-roles** - Gestão de papéis
- **health** - Health checks
- **i18n** - Internacionalização

### Ciclo de Vida da Requisição

```
Requisição → Middleware → Guards → Interceptors → Pipes → Controller → Service → Repository → Resposta
```

---

## Arquitetura Mobile

### Estrutura de Navegação

**App Cliente:**
- AuthStack (Login, Registro, Onboarding)
- MainTabs (Home, Pedidos, Reservas, Perfil)

**App Restaurante:**
- AuthStack (Login)
- MainDrawer (Dashboard, KDS, Pedidos, Reservas, etc.)

### Gerenciamento de Estado

Usando TanStack Query para estado do servidor com invalidação automática de cache e revalidação otimista.

---

## Design de Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| profiles | Perfis de usuário |
| user_roles | Atribuições de papéis |
| restaurants | Dados do restaurante |
| restaurant_tables | Mesas físicas |
| menu_items | Produtos do cardápio |
| orders | Pedidos de clientes |
| order_items | Itens nos pedidos |
| reservations | Reservas de mesas |
| wallets | Carteiras digitais |
| wallet_transactions | Histórico de pagamentos |

---

## Design de API

### Convenções RESTful

- GET para listagem e busca
- POST para criação
- PATCH para atualização parcial
- DELETE para remoção

### Formato de Resposta

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 100 }
}
```

---

## Comunicação em Tempo Real

### Namespaces WebSocket

| Namespace | Propósito |
|-----------|-----------|
| /orders | Atualizações de pedidos |
| /reservations | Atualizações de reservas |
| /notifications | Notificações push |
| /tables | Status de mesas |
| /kds | Display de cozinha |

---

## Arquitetura de Segurança

### Camadas de Segurança

1. Rate Limiting (100 req/min)
2. Proteção CSRF
3. Autenticação JWT
4. Autorização baseada em papéis
5. Validação de entrada
6. Queries parametrizadas

---

## Infraestrutura

### Configuração Docker

- PostgreSQL 16 Alpine
- Redis 7 Alpine
- Node.js 20 Alpine

### Pipeline CI/CD

- Lint e type check
- Testes unitários
- Testes E2E
- Build de produção
- Deploy automatizado

---

## Entertainment Modules (Pub & Bar / Club & Balada)

### Overview

The platform includes specialized modules for entertainment venues, extending the core restaurant functionality with features tailored for bars, pubs, and nightclubs.

### Pub & Bar Module (TabsModule)

Located at `backend/src/modules/tabs/`, this module manages bar/pub operations:

#### Features

| Feature | Description |
|---------|-------------|
| **Digital Tab** | Individual or group tabs with card pre-authorization |
| **Happy Hour** | Time-based automatic pricing with multiplier rates |
| **Repeat Round** | One-tap reorder of previous drink orders |
| **Tab Split** | Multiple split modes: by consumption, equal, single payer |
| **Waiter Calls** | Digital call system with urgency levels |

#### Entities

```typescript
// Tab - Individual or shared tab
Tab {
  id: string;
  userId: string;
  restaurantId: string;
  status: 'open' | 'pending_payment' | 'closed';
  type: 'individual' | 'group';
  preAuthAmount?: number;
  limitAmount?: number;
  items: TabItem[];
}

// TabItem - Individual consumption
TabItem {
  id: string;
  tabId: string;
  userId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  addedAt: Date;
}
```

#### API Endpoints

```
POST   /tabs                    # Open a new tab
POST   /tabs/:id/join           # Join existing tab (group)
POST   /tabs/:id/items          # Add items to tab
GET    /tabs/:id/items          # List tab items
POST   /tabs/:id/split          # Calculate split
POST   /tabs/:id/pay            # Process payment
GET    /happy-hour/active       # Get active happy hour
POST   /waiter-calls            # Create waiter call
```

### Club & Balada Module (ClubModule)

Located at `backend/src/modules/club/`, this module manages nightclub operations:

#### Features

| Feature | Description |
|---------|-------------|
| **Entry Tickets** | Advance ticket purchases with consumption credits |
| **Guest List** | VIP guest list with free/discounted entries |
| **VIP Tables** | Camarote reservations with minimum spend tracking |
| **Virtual Queue** | Real-time queue with priority levels |
| **Occupancy Tracking** | Live venue capacity monitoring |
| **Lineup** | Artist/DJ schedule management |
| **Birthday Entry** | Free entry with ID verification workflow |
| **Promoter System** | Commission tracking for promoters |
| **QR Code System** | Secure entry validation and wristbands |

#### Core Entities

```typescript
// ClubEntry - Entry ticket
ClubEntry {
  id: string;
  userId: string;
  restaurantId: string;
  eventDate: Date;
  entryType: 'advance' | 'door' | 'guest_list' | 'birthday';
  ticketTier: string;
  price: number;
  consumptionCredit: number;
  status: 'pending' | 'paid' | 'used' | 'cancelled';
  qrCode: string;
}

// VipTableReservation - Camarote booking
VipTableReservation {
  id: string;
  userId: string;
  tableId: string;
  eventDate: Date;
  guestCount: number;
  minimumSpend: number;
  currentSpend: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed';
}

// QueueEntry - Virtual queue position
QueueEntry {
  id: string;
  userId: string;
  restaurantId: string;
  position: number;
  priority: 'standard' | 'vip' | 'ultra_vip';
  estimatedWaitMinutes: number;
  status: 'waiting' | 'called' | 'admitted' | 'no_show';
}

// Promoter - Commission tracking
Promoter {
  id: string;
  userId: string;
  promoterCode: string;
  commissionType: 'percentage' | 'fixed_per_entry' | 'tiered';
  commissionRate: number;
  totalSales: number;
  pendingCommission: number;
}
```

#### API Endpoints

```
# Entry Management
POST   /club-entries            # Purchase entry
GET    /club-entries/my         # My entries
POST   /club-entries/validate   # Validate at door
POST   /club-entries/check-in   # Check in to venue

# VIP Tables
POST   /vip-tables              # Reserve table
GET    /vip-tables/available    # Available tables
PUT    /vip-tables/:id/confirm  # Confirm reservation
GET    /vip-tables/:id/tab      # Get table tab

# Virtual Queue
POST   /queue                   # Join queue
GET    /queue/position          # Get current position
DELETE /queue/:id               # Leave queue

# Guest List
POST   /guest-list              # Add to guest list
GET    /guest-list/event/:date  # Event guest list

# Birthday Entry
POST   /birthday-entries        # Request birthday entry
PUT    /birthday-entries/:id/approve  # Approve request

# Promoters
POST   /promoters               # Register promoter
GET    /promoters/:id/sales     # Get sales
POST   /promoters/:id/payments  # Process payment

# QR Codes
POST   /qr-codes/generate/entry # Generate entry QR
POST   /qr-codes/validate       # Validate QR
```

#### WebSocket Events

```typescript
// Real-time occupancy updates
@room('occupancy:{restaurantId}')
'occupancy:update' → { level: 'low' | 'moderate' | 'high' | 'full', count: number }

// Queue position updates
@room('queue:{restaurantId}')
'queue:position' → { position: number, estimatedWait: number }
'queue:called' → { userId: string }

// VIP table tab updates
@room('vip-table:{tableId}')
'tab:item_added' → { item: TabItem }
'tab:spend_updated' → { currentSpend: number, minimumSpend: number }
```

### Mobile Preview Screens

#### Client App (Club & Balada)

| Screen | Route | Description |
|--------|-------|-------------|
| TicketPurchaseScreen | `/ticket-purchase` | Buy advance tickets |
| QueueScreen | `/club-queue` | Virtual queue position |
| VipTableScreen | `/vip-table` | VIP table booking |
| LineupScreen | `/lineup` | Artist schedule |
| BirthdayEntryRequestScreen | `/birthday-entry-request` | Request free birthday entry |

#### Client App (Pub & Bar)

| Screen | Route | Description |
|--------|-------|-------------|
| TabScreen | `/tab` | Digital tab management |
| TabPaymentScreen | `/tab-payment` | Tab payment and split |

#### Restaurant App (Club Management)

| Screen | Route | Description |
|--------|-------|-------------|
| DoorControlScreen | `/door-control` | QR validation at entrance |
| QueueManagementScreen | `/queue-management` | Queue admission control |
| VipTableManagementScreen | `/vip-table-management` | VIP spend tracking |
| BirthdayApprovalScreen | `/birthday-approval` | Review birthday requests |
| PromoterManagementScreen | `/promoter-management` | Promoter performance & payments |

#### Restaurant App (Pub & Bar Management)

| Screen | Route | Description |
|--------|-------|-------------|
| TabManagementScreen | `/tab-management` | Monitor open tabs |
| WaiterCallsScreen | `/waiter-calls` | Respond to service calls |
| HappyHourManagementScreen | `/happy-hour-management` | Configure pricing schedules |

---

## Considerações de Escalabilidade

### Otimizações de Performance

1. **Banco de Dados** - Connection pooling, read replicas, indexação
2. **Cache** - Redis para sessões e cache de queries
3. **Jobs Background** - Bull queue para processamento assíncrono
4. **CDN** - Entrega de assets estáticos

---

## UX Optimizations / Otimizações de UX

### Implemented Improvements (v2.0)

The platform underwent significant UX simplifications to reduce cognitive load and improve task completion speed.

#### 1. Quick Actions FAB
- **Component**: `QuickActionsFAB.tsx`
- **Purpose**: Context-aware floating action button providing quick access to frequent actions
- **Client Actions**: Call Waiter, New Order, Pay Bill, Drinks
- **Restaurant Actions**: Dynamic based on user role (Owner, Manager, Waiter, Chef, Barman, Maître)
- **Impact**: 66% reduction in taps to complete common actions

#### 2. Unified Payment Screen
- **Component**: `UnifiedPaymentScreenV2.tsx`
- **Purpose**: Single tabbed interface for all payment operations
- **Tabs**: Checkout (with split modes), Split Details, Tip Selection
- **Replaced**: SplitPaymentScreen, SplitByItemScreen, TipScreen
- **Impact**: 75% reduction in payment flow steps (4 screens → 1 screen)

#### 3. Role-Adaptive Dashboard
- **Component**: `RoleDashboardScreenV2.tsx`
- **Purpose**: Dashboard content dynamically adapts to user's role
- **Features**: Role-specific KPIs, quick actions, and alerts
- **Roles**: Owner, Manager, Waiter, Chef, Barman, Maître
- **Impact**: 100% improvement in information relevance

#### 4. KDS with Swipe Gestures
- **Component**: `KitchenDisplayScreenV2.tsx`
- **Purpose**: Touch-friendly kitchen display with gesture support
- **Features**: Swipe left/right to change order status, SLA monitoring with visual alerts
- **Impact**: 50% improvement in order status update efficiency

### Screen Count Reduction

| App | Before | After | Change |
|-----|--------|-------|--------|
| Client | 41 | 37 | -10% |
| Restaurant | 25 | 25 | 0% |
| **Total** | 66 | 62 | -6% |

For detailed implementation information, see `docs/UX_IMPROVEMENT_PROPOSALS.md`.

---

## Staff Order Payment Tracking

### Component: `OrderPaymentTrackingScreenV2.tsx`

**Purpose**: Provides restaurant staff with real-time visibility into guest payments for split transactions.

**Location**: `src/components/mobile-preview-v2/screens/restaurant/OrderPaymentTrackingScreenV2.tsx`

### Features

| Feature | Description |
|---------|-------------|
| **Split Mode Display** | Shows which split mode was selected (Individual, Equal, Selective, Fixed) |
| **Guest Cards** | Expandable cards for each guest with payment details |
| **Real-time Status** | Live status updates (Pending, Processing, Paid, Failed) |
| **Progress Bar** | Visual indicator of total payment completion |
| **Staff Actions** | "Charge Pending" and "Finalize Table" buttons |

### Payment Status Visualization

```typescript
type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed';

// Visual indicators per status
const statusIndicators = {
  pending: { icon: '⏸️', color: 'muted', label: 'Aguardando' },
  processing: { icon: '⏳', color: 'warning', label: 'Processando' },
  paid: { icon: '✅', color: 'success', label: 'Pago' },
  failed: { icon: '❌', color: 'destructive', label: 'Falhou' },
};
```

---

## Design Token Compliance

All UI components MUST use semantic design tokens for theme consistency:

### Required Tokens (from index.css)

| Token Category | Examples |
|----------------|----------|
| **Backgrounds** | `bg-background`, `bg-card`, `bg-muted` |
| **Text** | `text-foreground`, `text-muted-foreground`, `text-primary` |
| **Borders** | `border-border`, `border-input` |
| **Status** | `text-success`, `text-warning`, `text-destructive` |
| **Gradients** | `from-primary to-accent`, `from-background to-muted` |

### Forbidden Patterns

```tsx
// ❌ NEVER use hardcoded colors
<div className="bg-white text-black" />
<div className="bg-[#FF6B35]" />

// ✅ ALWAYS use semantic tokens
<div className="bg-background text-foreground" />
<div className="bg-primary text-primary-foreground" />
```

---

**Versão do Documento:** 2.1.0
**Última Atualização:** Fevereiro 2025
