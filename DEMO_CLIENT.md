# NOOWE — Client Demo Documentation v5.0

> **Enterprise-Grade Technical Specification**
> Interactive Client Demo System (`/demo`)
> Last updated: 2026-03-17 — Deep Audit Edition

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Shared Component Library](#3-shared-component-library)
   - 3.1 [PhoneShell](#31-phoneshell)
   - 3.2 [BottomNav](#32-bottomnav)
   - 3.3 [GuidedHint](#33-guidedhint)
   - 3.4 [ItemIcon](#34-itemicon)
   - 3.5 [ServiceTypeDemo Configuration](#35-servicetypedemo-configuration)
   - 3.6 [JourneyStep & ScreenInfo](#36-journeystep--screeninfo)
4. [DemoContext — Simulation Engine](#4-democontext--simulation-engine)
   - 4.1 [Data Types](#41-data-types)
   - 4.2 [Mock Data Catalog](#42-mock-data-catalog)
   - 4.3 [Context API Surface](#43-context-api-surface)
   - 4.4 [Auto-Simulation Engine](#44-auto-simulation-engine)
5. [Internationalization (i18n)](#5-internationalization-i18n)
6. [Shared Payment System — DemoPayment](#6-shared-payment-system--demopayment)
   - 6.1 [PaymentConfig Interface](#61-paymentconfig-interface)
   - 6.2 [Payment Methods](#62-payment-methods)
   - 6.3 [Tip System](#63-tip-system)
   - 6.4 [Loyalty Points Integration](#64-loyalty-points-integration)
   - 6.5 [Visual Structure](#65-visual-structure)
7. [Order Status Tracking — DemoOrderStatus](#7-order-status-tracking--demoorderstatus)
   - 7.1 [OrderStatusConfig Interface](#71-orderstatusconfig-interface)
   - 7.2 [Preset Steps per Service Type](#72-preset-steps-per-service-type)
   - 7.3 [Status Pipeline Visual](#73-status-pipeline-visual)
   - 7.4 [Help / Call Waiter Integration](#74-help--call-waiter-integration)
8. [Split Bill System — DemoSplitBill](#8-split-bill-system--demosplitbill)
   - 8.1 [SplitBillConfig Interface](#81-splitbillconfig-interface)
   - 8.2 [Four Split Modes](#82-four-split-modes)
   - 8.3 [Person Cards](#83-person-cards)
9. [Payment Success — DemoPaymentSuccess](#9-payment-success--demopaymentsucess)
10. [Food Image System — FoodImages.tsx](#10-food-image-system--foodimagestsx)
11. [Service Type Catalog — 11 Experiences (Deep Audit)](#11-service-type-catalog--11-experiences-deep-audit)
    - 11.1 [Fine Dining — Bistrô Noowe](#111-fine-dining--bistrô-noowe)
    - 11.2 [Quick Service — NOOWE Express](#112-quick-service--noowe-express)
    - 11.3 [Fast Casual — NOOWE Fresh](#113-fast-casual--noowe-fresh)
    - 11.4 [Café & Bakery — Café Noowe](#114-café--bakery--café-noowe)
    - 11.5 [Buffet — Sabores Noowe](#115-buffet--sabores-noowe)
    - 11.6 [Drive-Thru — NOOWE Drive](#116-drive-thru--noowe-drive)
    - 11.7 [Food Truck — Taco Noowe](#117-food-truck--taco-noowe)
    - 11.8 [Chef's Table — Mesa do Chef Noowe](#118-chefs-table--mesa-do-chef-noowe)
    - 11.9 [Casual Dining — Cantina Noowe](#119-casual-dining--cantina-noowe)
    - 11.10 [Pub & Bar — Noowe Tap House](#1110-pub--bar--noowe-tap-house)
    - 11.11 [Club & Balada — NOOWE Club](#1111-club--balada--noowe-club)
12. [Visual Design System](#12-visual-design-system)
13. [File Map & Architecture Diagram](#13-file-map--architecture-diagram)

---

## 1. Executive Summary

The NOOWE Client Demo (`/demo`) is a high-fidelity, fully interactive simulation of the NOOWE consumer mobile application. It demonstrates **11 distinct service-type experiences** — from Fine Dining to Club & Balada — each with its own complete customer journey comprising 6–11 guided stages.

### Key Metrics

| Metric | Value |
|--------|-------|
| Service experiences | 11 |
| Total unique screens | 148+ |
| Interactive actions per experience | 40–80+ |
| Supported languages | 3 (PT / EN / ES) |
| Curated food photos | 100+ (Unsplash CDN) |
| Shared reusable components | 7 |
| Total lines of experience code | ~7,500+ |
| DemoContext simulation entities | 6 types |

### Purpose

Enable stakeholders (investors, restaurant owners, sales teams) to experience the full depth of NOOWE's consumer platform without requiring a live backend or real data. Every interaction is stateful, animated, and contextually accurate.

---

## 2. System Architecture

```
src/
├── components/demo/
│   ├── DemoShared.tsx          — PhoneShell, BottomNav, GuidedHint, ItemIcon, SERVICE_TYPES
│   ├── DemoPayment.tsx         — Shared premium payment panel (310 lines)
│   ├── DemoPaymentSuccess.tsx  — Shared payment confirmation (150 lines)
│   ├── DemoOrderStatus.tsx     — Shared order tracking with per-service pipelines (399 lines)
│   ├── DemoSplitBill.tsx       — Shared split bill with 4 modes (229 lines)
│   ├── DemoI18n.tsx            — Real-time MutationObserver translation engine
│   ├── FoodImages.tsx          — 100+ Unsplash photo URLs + FoodImg component
│   └── experiences/
│       ├── FineDiningDemo.tsx   — 1,205 lines · 18 screens · 11 journey steps
│       ├── QuickServiceDemo.tsx — 621 lines · 9 screens · 8 journey steps
│       ├── FastCasualDemo.tsx   — 618 lines · 12 screens · 7 journey steps
│       ├── CafeBakeryDemo.tsx   — 573 lines · 9 screens · 6 journey steps
│       ├── BuffetDemo.tsx       — 407 lines · 10 screens · 7 journey steps
│       ├── DriveThruDemo.tsx    — 405 lines · 11 screens · 7 journey steps
│       ├── FoodTruckDemo.tsx    — 447 lines · 12 screens · 7 journey steps
│       ├── ChefsTableDemo.tsx   — 506 lines · 13 screens · 9 journey steps
│       ├── CasualDiningDemo.tsx — 776 lines · 15 screens · 9 journey steps
│       ├── PubBarDemo.tsx       — 800 lines · 15 screens · 9 journey steps
│       └── ClubDemo.tsx         — 801 lines · 18 screens · 9 journey steps
├── contexts/
│   └── DemoContext.tsx          — Simulation engine (456 lines)
└── pages/
    └── Demo.tsx                 — Shell orchestrator with journey sidebar
```

### Rendering Pipeline

```
Demo.tsx (Shell)
  ├── Journey Sidebar (left) — progress tracker with 6–11 steps
  ├── PhoneShell (center) — 375×812px iPhone emulator
  │   ├── Status bar (9:41, Wi-Fi, battery)
  │   ├── Content area (scrollable)
  │   └── BottomNav (5 tabs: Explore, Orders, QR, Loyalty, Profile)
  └── Context Sidebar (right) — screen title + description
```

---

## 3. Shared Component Library

### 3.1 PhoneShell

**File:** `DemoShared.tsx` (lines 77–97)
**Dimensions:** 375×812px (iPhone 14 Pro form factor)

Visual anatomy:
- **Outer frame:** `rounded-[3rem]`, `bg-foreground/90`, `shadow-2xl` — simulates device bezel
- **Inner screen:** `rounded-[2.8rem]`, `bg-background`, `overflow-hidden`
- **Status bar:** Height 48px, displays `9:41`, Wi-Fi icon, and battery indicator with green fill
- **Dynamic Island:** `w-28 h-7 bg-foreground/90 rounded-full` centered at top
- **Content area:** `h-[calc(100%-48px-68px)]`, scrollable with `scrollbar-hide`
- **Home indicator:** `w-32 h-1 bg-foreground/30 rounded-full` at bottom

### 3.2 BottomNav

**File:** `DemoShared.tsx` (lines 111–148)
**Type:** `NavTab = 'explore' | 'orders' | 'scan' | 'loyalty' | 'profile'`

| Tab | Icon | Label | Badge |
|-----|------|-------|-------|
| Explore | `Search` | "Explorar" | — |
| Orders | `UtensilsCrossed` | "Pedidos" | `cartCount` |
| QR Code | `QrCode` | "QR Code" | — (elevated FAB) |
| Loyalty | `Gift` | "Fidelidade" | — |
| Profile | `User` | "Perfil" | `notifCount` |

The **QR Code** tab is rendered as an elevated floating action button: `w-11 h-11 -mt-5 rounded-full bg-primary shadow-glow`, lifting it above the nav bar.

Active state: `text-primary` + `font-semibold`. Inactive: `text-muted-foreground`.
Badges render as `w-4 h-4 rounded-full bg-primary text-[9px]` positioned at `-top-1 -right-2`.

### 3.3 GuidedHint

**File:** `DemoShared.tsx` (lines 100–105)

A pulsing contextual hint banner used to guide users through the demo:
- Container: `px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 mb-4 animate-pulse`
- Icon: `Zap` in `w-3.5 h-3.5 text-primary`
- Text: `text-xs text-primary font-medium`
- Can disable pulse via `pulse={false}` prop

### 3.4 ItemIcon

**File:** `DemoShared.tsx` (lines 14–74)

A unified icon system replacing all emojis with consistent Lucide icons in gradient containers. Maps ~60 category keywords (including PT-BR terms like "grelhados", "cervejas") to appropriate icons.

**Size map:**
| Size | Container | Icon |
|------|-----------|------|
| xs | 28×28, rounded-lg | 14×14 |
| sm | 32×32, rounded-lg | 16×16 |
| md | 40×40, rounded-xl | 20×20 |
| lg | 48×48, rounded-xl | 24×24 |
| xl | 64×64, rounded-2xl | 32×32 |
| hero | 80×80, rounded-2xl | 40×40 |

Default gradient: `bg-primary/10`. Icon color: `text-primary`.

### 3.5 ServiceTypeDemo Configuration

**File:** `DemoShared.tsx` (lines 160–172)

Each of the 11 service types is defined as:

```typescript
interface ServiceTypeDemo {
  id: string;       // e.g., 'fine-dining'
  name: string;     // e.g., 'Fine Dining'
  iconCat: string;  // maps to ItemIcon category
  restaurant: string; // e.g., 'Bistrô Noowe'
  tagline: string;  // e.g., 'Experiência gastronômica premium'
  color: string;    // tailwind gradient classes
}
```

**Complete catalog:**

| ID | Name | Restaurant | Icon | Gradient |
|----|------|-----------|------|----------|
| fine-dining | Fine Dining | Bistrô Noowe | wine | rose-900/amber-900 |
| quick-service | Quick Service | NOOWE Express | quick | yellow-500/orange-500 |
| fast-casual | Fast Casual | NOOWE Fresh | salad | green-500/emerald-500 |
| cafe-bakery | Café & Padaria | Café Noowe | coffee | amber-700/orange-800 |
| buffet | Buffet | Sabores Noowe | buffet | orange-500/red-500 |
| drive-thru | Drive-Thru | NOOWE Drive | drive | blue-500/cyan-500 |
| food-truck | Food Truck | Taco Noowe | truck | lime-500/green-500 |
| chefs-table | Chef's Table | Mesa do Chef Noowe | chef | zinc-800/stone-700 |
| casual-dining | Casual Dining | Cantina Noowe | pizza | red-500/orange-500 |
| pub-bar | Pub & Bar | Noowe Tap House | beer | amber-600/yellow-700 |
| club | Club & Balada | NOOWE Club | music | purple-600/pink-600 |

### 3.6 JourneyStep & ScreenInfo

Every experience exports two structures:

```typescript
interface JourneyStep {
  step: number;      // 1-based
  label: string;     // e.g., "Descobrir restaurante"
  screens: string[]; // screens that belong to this step
}

interface ScreenInfo {
  title: string;     // e.g., "Tela Inicial"
  desc: string;      // e.g., "O cliente descobre restaurantes por proximidade..."
}
```

These power the Journey Sidebar (left panel) which highlights the current step and allows clicking to navigate between stages.

---

## 4. DemoContext — Simulation Engine

**File:** `src/contexts/DemoContext.tsx` (456 lines)

### 4.1 Data Types

| Type | Fields | Purpose |
|------|--------|---------|
| `DemoMenuItem` | id, name, description, price, category, image, prepTime, popular?, tags? | Menu item definition |
| `DemoOrderItem` | menuItem, quantity, notes? | Line item in order |
| `DemoOrder` | id, tableNumber, items, status, total, customerName, createdAt, updatedAt, isKitchen?, isBar? | Complete order entity |
| `DemoTable` | id, number, seats, status, customerName?, occupiedSince?, orderTotal? | Table state |
| `DemoReservation` | id, customerName, partySize, time, status, phone, notes? | Reservation entity |
| `DemoNotification` | id, type, message, timestamp, read | Notification entity |
| `DemoAnalytics` | todayRevenue, todayOrders, avgTicket, occupancyRate, topItems, hourlyRevenue, weeklyRevenue, customerSatisfaction, returningCustomers | Dashboard KPIs |
| `OrderStatus` | 'pending' \| 'confirmed' \| 'preparing' \| 'ready' \| 'delivered' \| 'paid' | Order lifecycle |
| `TableStatus` | 'available' \| 'occupied' \| 'reserved' \| 'billing' | Table lifecycle |

### 4.2 Mock Data Catalog

**Restaurant Profile (`DEMO_RESTAURANT`):**
- Name: Bistrô Noowe
- Cuisine: Contemporânea Brasileira
- Rating: 4.8 (342 reviews)
- Price: $$$$
- Address: Rua Oscar Freire, 432 - Jardins, São Paulo
- Hours: Ter-Dom · 12h–15h, 19h–00h
- Features: Wi-Fi, Estacionamento, Acessível, Pet Friendly, Terraço
- Image: Unsplash restaurant interior

**Menu Items (16 total):**

| ID | Category | Name | Price | Prep | Tags |
|----|----------|------|-------|------|------|
| e1 | Entradas | Tartare de Atum | R$ 58 | 8 min | Sem Glúten, Popular |
| e2 | Entradas | Burrata Artesanal | R$ 52 | 6 min | Vegetariano |
| e3 | Entradas | Ceviche Peruano | R$ 48 | 10 min | Sem Glúten |
| e4 | Entradas | Carpaccio de Wagyu | R$ 72 | 7 min | Popular |
| p1 | Pratos Principais | Risoto de Funghi | R$ 82 | 22 min | Vegetariano, Popular |
| p2 | Pratos Principais | Filé ao Molho de Vinho | R$ 118 | 25 min | Popular |
| p3 | Pratos Principais | Salmão Grelhado | R$ 96 | 18 min | Sem Glúten |
| p4 | Pratos Principais | Polvo à Lagareiro | R$ 108 | 20 min | — |
| p5 | Pratos Principais | Ravioli de Lagosta | R$ 124 | 20 min | — |
| d1 | Sobremesas | Petit Gâteau | R$ 42 | 15 min | Popular |
| d2 | Sobremesas | Crème Brûlée | R$ 38 | 5 min | — |
| d3 | Sobremesas | Cheesecake de Frutas | R$ 40 | 5 min | Vegetariano |
| b1 | Bebidas | Gin Tônica Aurora | R$ 38 | 3 min | Popular |
| b2 | Bebidas | Negroni Clássico | R$ 42 | 3 min | — |
| b3 | Bebidas | Vinho Malbec Reserva | R$ 48 | 2 min | — |
| b4 | Bebidas | Água com Gás | R$ 14 | 1 min | — |

**Tables (12 total):**
- T1 (2 seats): Occupied — Maria S., 45 min, R$ 186
- T2 (2 seats): Available
- T3 (4 seats): Occupied — João & Ana, 20 min, R$ 312
- T4 (4 seats): Reserved
- T5 (6 seats): Occupied — Grupo Pedro, 65 min, R$ 548
- T6 (2 seats): Billing — Lucia F., 90 min, R$ 224
- T7 (4 seats): Available
- T8 (8 seats): Occupied — Aniversário, 30 min, R$ 890
- T9 (2 seats): Available
- T10 (4 seats): Occupied — Carlos M., 15 min, R$ 96
- T11 (6 seats): Reserved
- T12 (2 seats): Available

**Reservations (5 total):**
| Customer | Party | Time | Status | Notes |
|----------|-------|------|--------|-------|
| Fernanda Machado | 2 | 19:30 | Confirmed | Aniversário de casamento |
| Roberto Dias | 4 | 20:00 | Confirmed | — |
| Patricia Lemos | 6 | 20:30 | Waiting | Jantar de negócios |
| André Martins | 2 | 21:00 | Confirmed | — |
| Juliana Costa | 8 | 21:30 | Confirmed | Mesa no terraço |

**Initial Orders (5 total):**
- O1: Table 1 (Maria S.) — Preparing — Tartare + Filé + 2× Gin = R$ 186
- O2: Table 3 (João & Ana) — Confirmed — 2× Carpaccio + Risoto + 2× Negroni = R$ 312
- O3: Table 5 (Grupo Pedro) — Delivered — Burrata + Salmão + Petit Gâteau + 4× Vinho = R$ 548
- O4: Table 8 (Aniversário) — Preparing — 4× Ceviche + 4× Polvo + 4× Cheesecake + 4× Gin = R$ 890
- O5: Table 10 (Carlos M.) — Pending — Tartare + Gin = R$ 96 (Bar)

**Analytics:**
- Today Revenue: R$ 12,840
- Today Orders: 47
- Avg Ticket: R$ 273
- Occupancy: 72%
- Customer Satisfaction: 4.8
- Returning Customers: 38%

### 4.3 Context API Surface

```typescript
interface DemoContextType {
  // Read-only data
  restaurant: DEMO_RESTAURANT;
  menu: DemoMenuItem[];
  orders: DemoOrder[];
  tables: DemoTable[];
  reservations: DemoReservation[];
  notifications: DemoNotification[];
  analytics: DemoAnalytics;

  // Cart (client-side)
  cart: CartItem[];
  addToCart: (item: DemoMenuItem, quantity?: number, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;       // computed sum

  // Client actions
  placeOrder: () => DemoOrder | null;  // converts cart → order
  clientActiveOrder: DemoOrder | null; // most recent non-paid order
  loyaltyPoints: number;              // starts at 1250

  // Restaurant actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  markNotificationRead: (notificationId: string) => void;
  unreadNotifications: number;

  // Simulation
  isSimulationRunning: boolean;
  toggleSimulation: () => void;
}
```

### 4.4 Auto-Simulation Engine

When `isSimulationRunning` is true, the context automatically:
1. **Advances order statuses** every 8–15 seconds: pending → confirmed → preparing → ready → delivered
2. **Generates new orders** every 20–30 seconds with random items from the menu
3. **Creates notifications** for each status change (new_order, kitchen_ready, payment)
4. **Updates table occupancy** based on order lifecycle
5. **Picks random customer names** from a pool of 10 Brazilian names

---

## 5. Internationalization (i18n)

**File:** `DemoI18n.tsx`

The translation system uses a **MutationObserver-based runtime engine** that:

1. Watches the entire demo DOM for text node changes
2. Normalizes text (strips whitespace/newlines) and looks up translation keys
3. Falls back to fuzzy matching for dynamic text
4. Protects against recursive loops via `isTranslatingRef`
5. Persists language choice in `localStorage`

**Supported languages:** PT (default), EN, ES
**Translation coverage:** 6,483+ lines of key-value pairs

The `useDemoI18n()` hook exposes:
- `translateText(key: string): string` — manual translation
- `language: 'pt' | 'en' | 'es'` — current language
- `setLanguage(lang)` — switch language

---

## 6. Shared Payment System — DemoPayment

**File:** `DemoPayment.tsx` (310 lines)

### 6.1 PaymentConfig Interface

```typescript
interface PaymentConfig {
  title?: string;          // Header title (default: "Pagamento")
  subtitle?: string;       // e.g., "Mesa 7 · Bistrô Noowe"
  total: string;           // e.g., "R$ 186,00"
  totalLabel?: string;     // e.g., "Total da mesa"
  items: PaymentLineItem[]; // Summary line items
  loyalty?: PaymentLoyalty; // Loyalty points section
  showTip?: boolean;       // Enable tip selector
  defaultTip?: number;     // Default tip % (default: 10)
  tipBase?: number;        // Base value for tip calculation
  fullMethodGrid?: boolean; // 6-method grid vs 2-method list
  infoBanner?: {...};      // Info banner below methods
  ctaLabel?: string;       // CTA button text
  estimatedTime?: string;  // e.g., "12-18 min"
  onBack: () => void;
  onConfirm: () => void;
}
```

### 6.2 Payment Methods

**Full Grid (6 methods):**
| ID | Name | Icon |
|----|------|------|
| pix | PIX | QrCode |
| credit | Crédito | CreditCard |
| apple | Apple Pay | Smartphone |
| google | Google Pay | Smartphone |
| tap | TAP to Pay | Zap |
| wallet | Carteira | Wallet |

**Simple Mode (2 methods):**
| ID | Name | Detail |
|----|------|--------|
| card | Cartão vinculado | •••• 4242 · Visa |
| pix | PIX | Pagamento instantâneo |

### 6.3 Tip System

When `showTip={true}`, renders a 4-option selector: **Sem (0%), 10%, 15%, 20%**.
Each option shows the calculated amount: `R$ {Math.round(tipBase * p / 100)}`.
Selected state: `border-primary bg-primary/10`.

### 6.4 Loyalty Points Integration

When `loyalty` is provided, renders a card with:
- Award icon in `w-11 h-11 rounded-xl bg-accent/10`
- Title: e.g., "340 pontos disponíveis"
- Subtitle: e.g., "Use 200 pts = R$ 10 de desconto"
- Toggle button: "Usar" ↔ "✓ Usado"

### 6.5 Visual Structure

```
┌─────────────────────────────────┐
│ Gradient Header (primary→accent)│
│   ← Back  │  Title  │  R$ Total│
├─────────────────────────────────┤
│ [Loyalty Card]                  │
│ [Tip Selector: 0% 10% 15% 20%] │
│ [Payment Methods Grid/List]     │
│ [Info Banner]                   │
│ [Estimated Time]                │
│ [Summary Card]                  │
│   Subtotal     R$ xxx           │
│   Gorjeta      R$ xx            │
│   ─────────────────             │
│   Total        R$ xxx           │
├─────────────────────────────────┤
│ [CTA: Pagar R$ xxx]            │
└─────────────────────────────────┘
```

---

## 7. Order Status Tracking — DemoOrderStatus

**File:** `DemoOrderStatus.tsx` (399 lines)

### 7.1 OrderStatusConfig Interface

```typescript
interface OrderStatusConfig {
  title?: string;
  subtitle?: string;
  orderCode?: string;       // e.g., "#2847"
  etaRange?: string;        // e.g., "12-18 min"
  progress?: number;        // 0-100 percentage
  steps: OrderStatusStep[]; // Pipeline steps
  activeStep: number;       // 0-based index
  items: OrderStatusItem[]; // Items being tracked
  onBack: () => void;
  actionButton?: {...};
  pickupCode?: string;      // For counter-pickup services
  tableInfo?: {...};        // Table context card
  helpOptions?: string[];   // Help menu items
}
```

### 7.2 Preset Steps per Service Type

Each service type has its own pipeline:

| Service | Steps | Unique Element |
|---------|-------|----------------|
| Fine Dining | Recebido → Preparando → Pronto → Entregue | Chef name per item |
| Quick Service | Recebido → Preparando → Conferência → Pronto | Quality check step |
| Fast Casual | Recebido → Base → Montagem → Qualidade → Pronto | 5-step builder |
| Café & Bakery | Recebido → Preparando → Pronto | 3-step simplified |
| Buffet | Check-in → Pesando → Extras → Completo | Scale integration |
| Drive-Thru | Recebido → Preparando → Pronto → Janela | Window assignment |
| Food Truck | Recebido → Preparando → Pronto | 3-step simplified |
| Chef's Table | Recebido → Empratando → Sommelier → Servido | Sommelier step |
| Casual Dining | Recebido → Preparando → Pronto → Entregue | Standard 4-step |
| Pub & Bar | Recebido → Preparando → Pronto | 3-step bar |
| Club | Recebido → Preparando → Pronto | 3-step club |

### 7.3 Status Pipeline Visual

Each step renders as:
- **Completed:** `bg-white/30` with `Check` icon
- **Active:** `bg-white shadow-lg scale-110` with service icon in `text-primary`
- **Pending:** `bg-white/10` with icon in `text-primary-foreground/50`
- Connector lines: `h-0.5 mx-1 rounded-full` — completed: `bg-white/50`, pending: `bg-white/15`

Item status badges:
| Status | Badge | Border |
|--------|-------|--------|
| ready | `bg-success/10 text-success` | `border-success/30 shadow-success/10` |
| preparing | `bg-primary/10 text-primary` | `border-primary/30 shadow-primary/10` |
| queued/pending | `bg-muted text-muted-foreground` | `border-border` |

### 7.4 Help / Call Waiter Integration

Bottom button: `bg-foreground` with `Bell` icon and "Precisa de ajuda?" text.
Expandable help options (3 default):
1. "Dúvidas sobre o pedido"
2. "Solicitar algo especial"
3. "Reportar problema"

---

## 8. Split Bill System — DemoSplitBill

**File:** `DemoSplitBill.tsx` (229 lines)

### 8.1 SplitBillConfig Interface

```typescript
interface SplitBillConfig {
  title?: string;
  subtitle?: string;
  total: string;
  totalLabel?: string;
  people: SplitPerson[];
  modes?: SplitModeOption[];
  defaultMode?: SplitMode;
  summaryLines?: SplitSummaryLine[];
  yourAmount?: string;
  onBack: () => void;
  onProceed: () => void;
  ctaLabel?: string;
}
```

### 8.2 Four Split Modes

| Mode | Name | Description | Icon |
|------|------|-------------|------|
| individual | Meus Itens | Cada um paga o que pediu | User |
| equal | Partes Iguais | Divide igualmente | Users |
| selective | Por Item | Escolha itens específicos | Receipt |
| fixed | Valor Fixo | Defina quanto pagar | DollarSign |

### 8.3 Person Cards

Each person renders as a scrollable card:
- Avatar: `w-9 h-9 rounded-full` with person's initial or `Check` icon if paid
- Border: `border-success` if paid, `border-primary` if current user, `border-border` otherwise
- Shows name, amount (if set), and "✓ Pago" status

---

## 9. Payment Success — DemoPaymentSuccess

**File:** `DemoPaymentSuccess.tsx` (150 lines)

Renders a centered confirmation screen:
- **Success icon:** `w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/80 shadow-xl`
- **Heading:** `font-display text-2xl font-bold`
- **Summary card:** Line items with highlight support (success/warning/primary)
- **Loyalty reward:** Gift icon + points earned + description
- **Badge:** Optional achievement (e.g., "Selo de família ganho!")
- **Stats row:** Grid of stat cards (e.g., time, drinks, etc.)
- **Actions:** Primary (gradient CTA) + Secondary (border button)

---

## 10. Food Image System — FoodImages.tsx

**File:** `FoodImages.tsx` (193 lines)

### Photo Categories (100+ entries)

| Category | Count | Examples |
|----------|-------|---------|
| Burgers & Fast Food | 9 | burger, burger-double, chicken-burger, fries, nuggets, wrap |
| Milkshakes & Drinks | 7 | milkshake, soda, juice, water, sparkling-water |
| Desserts | 11 | sundae, cookie, brownie, cake, churros, tiramisu, souffle, mousse |
| Coffee & Tea | 8 | espresso, cappuccino, latte, cold-brew, matcha, green-tea, chamomile |
| Bakery | 3 | croissant, pao-queijo, sandwich-caprese |
| Bowls & Healthy | 19 | rice, quinoa, mixed-greens, grilled-chicken, salmon, tofu, avocado |
| Mexican | 6 | taco, burrito, quesadilla, nachos, horchata |
| Italian & Casual | 9 | lasagna, pizza, risotto, parmegiana, bruschetta, pasta |
| Buffet | 3 | grilled-meat, salad-bar, sushi-platter |
| Beer & Drinks | 10 | ipa, stout, wheat-beer, gin-tonic, aperol, moscow-mule |
| Bottles / Club | 5 | vodka, champagne, whisky, tequila, cocktail |
| Wine | 2 | wine-red, wine-glass |
| Fine Dining | 3 | amuse-bouche, wagyu, steak |
| Generic Fallbacks | 3 | food-generic, drink-generic, dessert-generic |

### FoodImg Component

```tsx
<FoodImg id="burger" size="md" alt="Hamburger" />
```

Size map:
| Size | Class | Rounded |
|------|-------|---------|
| xs | w-8 h-8 | rounded-lg |
| sm | w-10 h-10 | rounded-xl |
| md | w-14 h-14 | rounded-xl |
| lg | w-16 h-16 | rounded-2xl |
| xl | w-20 h-20 | rounded-2xl |
| hero | w-28 h-28 | rounded-3xl |
| detail | w-full aspect-square max-h-48 | rounded-2xl |

All images use `loading="lazy"`, `object-cover`, and `shrink-0`.

---

## 11. Service Type Catalog — 11 Experiences (Deep Audit)

---

### 11.1 Fine Dining — Bistrô Noowe

**File:** `FineDiningDemo.tsx` — **1,205 lines** — **18 screens** — **11 journey steps**

#### Journey Steps

| Step | Label | Screens |
|------|-------|---------|
| 1 | Descobrir restaurante | home, restaurant |
| 2 | Escanear QR da mesa | qr-scan |
| 3 | Explorar cardápio | menu, item, ai-harmonization |
| 4 | Montar comanda | comanda |
| 5 | Acompanhar pedido | order-status |
| 6 | Fechar conta & pagar | fechar-conta, payment-success |
| 7 | Programa de fidelidade | loyalty |
| 8 | Reservar mesa | reservations |
| 9 | Fila virtual | virtual-queue |
| 10 | Chamar equipe | call-waiter |
| 11 | Notificações | notifications |

#### Screen-by-Screen Breakdown

**1. HomeScreen** — Discovery hub
- Greeting: "Boa noite" + "Descubra experiências"
- Notification bell with badge (3)
- Search bar (visual only)
- Category pills: Todos, Fine Dining, Casual, Bar, Café
- Featured restaurant card with Unsplash hero image, rating (4.8), cuisine, price range
- Animated "Toque aqui" badge with `Zap` icon
- Quick action grid (4): Escanear, Reservar, Fila Virtual, Cardápio
- "Perto de você" list: 3 restaurants with ItemIcon, distance, rating

**2. NotificationsScreen** — Notification center
- 6 notification types: reservation, invite, queue, loyalty, promo, order
- Each notification: icon with colored background, title, description, timestamp
- Unread notifications: `bg-primary/5 border-primary/15`
- Invite notification includes Accept/Decline buttons
- "Limpar" button to clear all

**3. RestaurantScreen** — Restaurant profile
- Hero image with gradient overlay
- Restaurant name, description, rating, distance, price range
- Operating hours with Clock icon
- Feature tags: Wi-Fi, Estacionamento, Acessível, Pet Friendly, Terraço
- 2-column CTA: "Ver Cardápio" (primary) + "Reservar Mesa" (outline)
- 3-column secondary actions: Escanear QR, Fila Virtual, Chamar Garçom

**4. QRScanScreen** — QR code scanning simulation
- Phase 1 (scanning): 56×56 viewfinder with corner markers, scan line animation (`animate-bounce`), Camera icon, Loader2 spinner
- Auto-transitions after 2.5s via `setTimeout`
- Phase 2 (confirmed): Success circle, "Mesa 7 identificada!", table info (4 seats)
- CTAs: "Abrir Cardápio" + "Chamar Garçom"

**5. CallWaiterScreen** — Discreet staff calling
- 3 call types:
  - Garçom: `HandMetal` icon, `bg-primary/10 text-primary`
  - Sommelier: `Wine` icon, `bg-secondary/10 text-secondary`
  - Ajuda: `HelpCircle` icon, `bg-muted text-muted-foreground`
- Click → Loader2 spinner → 1.5s → Success confirmation
- Shows "O garçom está a caminho" / "O sommelier está a caminho" / "Alguém da equipe irá atendê-lo"
- Estimated time: ~2 min

**6. VirtualQueueScreen** — Virtual queue system
- Phase 1 (join): Queue status card (3 groups), party size selector (1–5+), preference selector (Salão/Terraço/Qualquer)
- Phase 2 (joined): Position indicator (4th), 4 queue entries with position, name, wait time, "isYou" highlight
- "Você receberá uma notificação" message
- "Ver Cardápio Enquanto Espera" CTA

**7. ProfileScreen** — User profile
- User info card: avatar circle, "Usuário Demo", email, loyalty points
- Level card: "Nível Gold", progress bar at 62%, "750 pontos para Platinum"
- Menu items (8): Notificações (badge: 3), Histórico, Reservas, Fidelidade, Pagamentos, Favoritos, Configurações, Ajuda
- Logout button in destructive color

**8. MyOrdersScreen** — Order history
- Active order card (if exists): status badge, restaurant, items count, total, "Acompanhar" link
- Past orders (3): restaurant name, date, total, star rating (1–5)
- Uses DemoContext's `clientActiveOrder`

**9. MenuScreen** — Digital menu
- Sticky header with category tabs (scrollable)
- Quick actions: "Chamar Garçom" + "Harmonização IA"
- Menu items: Unsplash photo (80×80), name, popular badge, description, price, prep time
- Floating cart button: "Ver Comanda (X)" with total
- Uses DemoContext's `menu` and `cart`

**10. AIHarmonizationScreen** — AI-powered pairing
- Phase 1 (preferences): Drink preferences (6 options), dietary restrictions (5), occasion (5)
- Phase 2 (loading): Pulsing Brain icon, "Analisando 430+ combinações", Loader2 spinner
- Auto-transitions after 2s
- Phase 3 (results): "Harmonização Perfeita" card with 98% match badge
  - 4 courses: Entrada (Tartare, R$ 58), Principal (Filé, R$ 118), Vinho (Malbec, R$ 89), Sobremesa (Crème Brûlée, R$ 38)
  - Total: R$ 303
  - "Adicionar Tudo à Comanda" + "Escolher Manualmente"

**11. ItemDetailScreen** — Dish detail
- Hero image (224px height)
- Floating card: name, popular badge, description, tags, prep time
- Quantity selector: −/+ buttons around bold count
- "Adicionar · R$ {price × qty}" CTA
- After adding: "✓ Adicionado!" with Check icon, auto-returns to menu after 800ms

**12. ComandaScreen** — Order review
- Restaurant/table header card
- Empty state: Receipt icon + "Sua comanda está vazia"
- Item list with photo, name, price, quantity controls (−/+)
- "Convidar pessoas para a comanda" button (dashed border)
- Summary: Subtotal + Taxa de serviço (10%) + Total
- "Fechar Conta" CTA (gradient) + "Adicionar mais itens"

**13. OrderStatusScreen** — Real-time tracking (uses DemoOrderStatus)
- Pipeline: Recebido → Preparando → Pronto → Entregue (Fine Dining preset)
- Active step: 1 (Preparando)
- 3 items tracked: Tartare (ready, Chef Marco), Filé (preparing, Chef Ana), Crème Brûlée (pending, Pâtissier)
- Table info: "Mesa 7 · 3 pessoas · Você, Maria e João"
- "Fechar Conta" action on table card

**14. FecharContaScreen** — Bill closing (MOST COMPLEX SCREEN — 300+ lines)
- **Gradient header:** Total da mesa (R$ xxx)
- **People section:** Scrollable cards for 3 guests (Você, Maria Silva ✓Pago, João Santos) + "Convidar" dashed card
- **Invite modal:** Share link (`noowe.app/join/BN-7-2847`), Copy button, SMS/WhatsApp send
- **Pay mode:** Solo (pay all) vs Split (divide)
- **Split modes (4):**
  - Meus Itens: Auto-calculates per-person based on `orderedBy`
  - Partes Iguais: Divides equally among unpaid guests
  - Por Item (Selective): Checkbox per item with expandable "Dividir por todos" option
  - Valor Fixo: −/+ stepper for custom amount
- **Shared items:** Items marked as "÷ todos" with accent border, per-person cost shown
- **Order items (7):** Tartare (Você), Filé (Você), Risoto (Maria), Crème Brûlée (Maria), Salmão (João), Gin (João), Batata Truffle Fries (Mesa)
- **Summary card:** Sua parte + Itens compartilhados + Gorjeta + Pago por outros = Total
- **CTA → DemoPayment:** Transitions to shared payment screen with all calculated values

**15. PaymentSuccessScreen** — Confirmation (uses DemoPaymentSuccess)
- "+19 pts" earned
- "Valor restante da mesa: R$ 97,40"
- "João (pendente): Aguardando" in warning
- Loyalty: "Nível Gold · 1.269 pts · Faltam 731 pts para Platinum"
- Actions: "Ver Programa de Fidelidade" + "Voltar ao Início"

**16. ReservationsScreen** — Reservation flow
- Restaurant info card
- Date selector: Hoje, Amanhã, Sáb 15, Dom 16
- Time selector (8 slots): 19:00–22:30
- Guest selector: 1–6+
- Special requests textarea
- After confirmation: Success circle, reservation code, table preference, invite friends via SMS/WhatsApp, calendar share

**17. LoyaltyScreen** — Loyalty program
- Tier card: Gold level, 1,250 points, progress to Platinum
- Tier ladder: Silver (500) → Gold (1000) → Platinum (2000) → Black (5000)
- Available rewards: Free dessert (500 pts), 15% off (1000 pts), Free dinner (3000 pts)
- Transaction history: Recent point earnings and redemptions
- Stamp card: 7/10 visits completed

**18. Main Component (FineDiningDemo)**
- Screen router: `switch(screen)` over all 18 screens
- State management: `selectedItem` (DemoMenuItem), `screen` (Screen type)
- Bottom nav integration: Maps tabs to screens
- Uses DemoContext for cart, orders, loyalty data

#### Unique Functional Anchors
- **AI Harmonization:** Multi-step AI suggestion engine with 98% match scoring
- **Fechar Conta:** Most sophisticated split bill with 4 modes, shared items, multi-guest tracking
- **Proxy Guest System:** "Convidar pessoas" via share link
- **Sommelier Calling:** Dedicated sommelier call type in CallWaiter

---

### 11.2 Quick Service — NOOWE Express

**File:** `QuickServiceDemo.tsx` — **621 lines** — **9 screens** — **8 journey steps**

#### Journey Steps

| Step | Label | Screens |
|------|-------|---------|
| 1 | Descobrir restaurante | home, restaurant |
| 2 | Skip the Line & menu | menu |
| 3 | Personalizar item | item |
| 4 | Revisar carrinho | cart |
| 5 | Pagamento rápido | payment |
| 6 | Acompanhar preparo | preparing |
| 7 | Retirar pedido | ready |
| 8 | Avaliar & fidelidade | rating |

#### Menu Data (13 items + 3 combos)

**Individual items:** Smash Burger Classic (R$29), Smash Burger Duplo (R$39), Chicken Crispy (R$32), Veggie Smash (R$28), Batata Frita G (R$18), Onion Rings (R$16), Nuggets (R$22), Milkshake Nutella (R$22), Milkshake Oreo (R$22), Refrigerante (R$9), Suco Natural (R$14), Sundae (R$14), Cookie Gigante (R$12)

**Combos:** Classic (R$42, orig R$56), Duplo (R$62, orig R$79), Kids (R$32, orig R$42)

**Customization options:**
- Extras: Bacon (R$6), Cheddar Extra (R$4), Ovo Frito (R$5), Jalapeño (R$3)
- Removals: Cebola, Tomate, Alface, Molho, Picles

#### Key Screens

- **Home:** "Skip the Line" highlight pill, featured NOOWE Express card with live queue (3 min wait)
- **Restaurant:** "Como funciona o Skip the Line" 3-step guide, live queue status (12 orders, 4 preparing), combo previews
- **Menu:** Sticky header with "Skip the Line ativo" badge, categories (Combos first), combo cards with original/discounted prices, cart floating button
- **Item Customization:** Extra toggles with price, removal chips with strikethrough, notes field, quantity selector
- **Cart:** Item list with customization labels, coupon field, estimated time, pickup mode selector
- **Preparing:** Auto-advancing 4-stage pipeline (Recebido → Preparando → Conferência → Pronto), simulated timers at 1s/3s/5.5s/8s, auto-navigates to 'ready' at 9.5s
- **Ready:** Pickup code display (3-digit), speed record comparison, express counter assignment
- **Rating:** Star rating (1–5), tag selector (Velocidade, Sabor, Atendimento, Limpeza, Preço), stamp card progress, points earned

#### Unique Functional Anchors
- **Skip the Line:** Pre-order and pay before arrival
- **Combo System:** 3 combos with original/discounted pricing
- **Item Customization:** Paid extras + ingredient removals
- **4-Stage Prep Tracking:** Conferência (quality check) unique to Quick Service
- **Stamp Card:** Visual progress toward free item

---

### 11.3 Fast Casual — NOOWE Fresh

**File:** `FastCasualDemo.tsx` — **618 lines** — **12 screens** — **7 journey steps**

#### Journey Steps

| Step | Label | Screens |
|------|-------|---------|
| 1 | Descobrir restaurante | home, restaurant |
| 2 | Bowls salvos ou novo | saved-bowls |
| 3 | Montar prato (4 etapas) | builder-base, builder-protein, builder-toppings, builder-sauce |
| 4 | Resumo & alergias | builder-summary, allergies |
| 5 | Pagamento | payment |
| 6 | Preparo em tempo real | prep-tracking |
| 7 | Retirada & avaliação | ready, rating |

#### 4-Step Dish Builder

**Step 1 — Base (5 options):**
| ID | Name | Calories | Carbs | Protein | Fiber |
|----|------|----------|-------|---------|-------|
| rice | Arroz Branco | 200 | 44g | 4g | 1g |
| brown | Arroz Integral | 180 | 38g | 5g | 4g |
| quinoa | Quinoa | 160 | 27g | 8g | 5g |
| salad | Mix de Folhas | 30 | 5g | 2g | 3g |
| wrap | Wrap Integral | 150 | 25g | 4g | 3g |

**Step 2 — Protein (5 options):**
| ID | Name | Calories | Protein | Price | Allergens |
|----|------|----------|---------|-------|-----------|
| chicken | Frango Grelhado | 165 | 31g | R$12 | — |
| beef | Carne Bovina | 250 | 26g | R$16 | — |
| salmon | Salmão Grelhado | 208 | 20g | R$20 | peixe |
| tofu | Tofu Crocante | 144 | 17g | R$10 | soja |
| shrimp | Camarão Salteado | 99 | 24g | R$22 | crustáceo |

**Step 3 — Toppings (9 options, some premium):**
Free: Tomato (5cal), Corn (15cal), Cucumber (3cal), Carrot (8cal), Beet (10cal)
Premium: Edamame (+R$4, soja), Avocado (+R$5), Egg (+R$3, ovo), Cheese (+R$5, lactose)

**Step 4 — Sauce (5 options, max 2):**
Tahini Limão (gergelim), Caesar Light (lactose, ovo), Shoyu & Gengibre (soja), Mostarda & Mel (mostarda), Pesto (castanha, lactose)

#### Real-Time Nutrition Tracking

A `CalBadge` component persists across all builder steps showing:
- Current total calories
- Protein grams
- Running price

#### Key Screens

- **Saved Bowls:** "Meu Bowl de Sempre" (ordered 12x) with "Repetir" button, "Wrap Proteico" (5x), "Criar Novo Bowl" with divider
- **Builder Progress:** 4-segment progress bar (Base → Proteína → Toppings → Molho) with step highlighting
- **Allergies Screen:** Collected allergens displayed as warning badges, confirmation before payment
- **5-Stage Prep Tracking:** Recebido → Base → Montagem → Qualidade → Pronto (unique to Fast Casual)

#### Unique Functional Anchors
- **4-Step Dish Builder:** Sequential base → protein → toppings → sauce selection
- **Real-Time Nutrition:** Running calorie/protein/price counter
- **Saved Bowls:** Re-order favorites with one tap
- **Allergen Collection:** Aggregated across all ingredients with verification screen

---

### 11.4 Café & Bakery — Café Noowe

**File:** `CafeBakeryDemo.tsx` — **573 lines** — **9 screens** — **6 journey steps**

#### Journey Steps

| Step | Label | Screens |
|------|-------|---------|
| 1 | Descobrir café | home, restaurant |
| 2 | Escanear QR da mesa | qr-scan |
| 3 | Modo trabalho | work-mode |
| 4 | Cardápio & personalização | menu, customize |
| 5 | Comanda & refil | comanda |
| 6 | Pagamento | payment, payment-success |

#### Menu Data (14 items across 4 categories)

**Cafés (5):** Espresso R$8, Cappuccino R$16, Café Filtrado R$10 (refil R$5), Latte R$18 (customizable), Cold Brew R$16
**Chás (3):** Chá Verde R$12 (refil), Camomila R$12 (refil), Matcha Latte R$20 (customizable)
**Salgados (3):** Croissant Misto R$14, Pão de Queijo R$12, Sanduíche Caprese R$22
**Doces (3):** Torta de Maçã R$16, Brownie R$14, Cookie & Cream R$12

#### Beverage Customization System

| Option | Values |
|--------|--------|
| Milk | Integral, Desnatado, Aveia, Amêndoas, Coco |
| Size | P (200ml, +R$0), M (350ml, +R$4), G (500ml, +R$8) |
| Flavor | Baunilha, Caramelo, Avelã, Canela (+R$3 each) |
| Temperature | Quente, Morno, Gelado |
| Extra Shot | +R$4 |

#### Key Screens

- **Home Discovery:** Filters: Wi-Fi Rápido, Tomadas, Silencioso, Pet Friendly, Ao Ar Livre. Featured café with Wi-Fi speed (150Mbps), plug availability, noise level
- **Restaurant:** Amenities grid (Wi-Fi/Tomadas/Ruído), features (Refil R$5, Pet Friendly, Estacionamento), live occupancy (45%, "Tranquilo")
- **QR Scan:** Camera viewfinder → Success: "Mesa 3 · Janela", 2 tomadas, Wi-Fi forte. CTAs: "Ativar Modo Trabalho" + "Ir para Cardápio"
- **Work Mode Dashboard:**
  - Session timer (increments every 30s)
  - Wi-Fi card: Network "CafeNoowe_5G", password with copy button, speed 150Mbps (speedtest)
  - Power status: 2 outlets, battery indicator
  - Noise level: "Moderado" with Volume2 icon
  - Quick actions: Pedir Café, Pedir Refil
- **Customize Screen:** Milk selection, size pills, flavor toggles, temperature, extra shot toggle. Price updates in real-time
- **Comanda:** Items with customization badges (e.g., "Leite Aveia · Médio · Gelado · + Caramelo · Shot extra"), refil button for eligible items (R$5 refil)
- **Payment Success:** Stamp card (a cada 10 cafés, o próximo é grátis), session duration

#### Unique Functional Anchors
- **Work Mode:** Wi-Fi password copy, speed display, outlet tracking, noise monitoring, session timer
- **Refil System:** Items marked `refill: true` can generate R$5 refil entries
- **5-Dimension Customization:** Milk + Size + Flavor + Temp + Shot

---

### 11.5 Buffet — Sabores Noowe

**File:** `BuffetDemo.tsx` — **407 lines** — **10 screens** — **7 journey steps**

#### Journey Steps

| Step | Label | Screens |
|------|-------|---------|
| 1 | Descobrir buffet | home, restaurant |
| 2 | Check-in digital | checkin |
| 3 | Estações ao vivo | stations |
| 4 | Balança inteligente | scale, scale-history |
| 5 | Pedir bebidas | drinks |
| 6 | Comanda em tempo real | comanda |
| 7 | Pagamento sem fila | payment, payment-success |

#### Stations Data (6 live stations)

| Station | Status | Items |
|---------|--------|-------|
| Grelhados | Fresh | Fraldinha, Linguiça, Frango |
| Massas | Fresh | Espaguete, Penne, Lasanha |
| Saladas | Fresh | Folhas Mix, Tabule, Grega |
| Acompanhamentos | Replenishing | Arroz, Feijão, Purê, Farofa |
| Sobremesas | Fresh | Pudim, Mousse, Frutas |
| Sushi Bar | Fresh | Salmão, Atum, Philadelphia |

#### Smart Scale Simulation

1. **Idle state:** "Coloque seu prato na balança" + "O app conecta automaticamente via NFC"
2. **Weighing:** Animated circle with weight incrementing (0→485g), pulsing border, "pesando..."
3. **Done:** Green circle, "485g ✓ Registrado", price calculation (485 × R$79.90/kg = R$38.75)
4. **Multi-weigh:** "Pode voltar e pesar mais vezes!" + "Pesar Mais" button
5. **History tracking:** `weighHistory` array accumulates across visits

Price: R$ 79.90/kg. Weight simulation: increments by random(15-65)g every 180ms until 485g.

#### Key Screens

- **Restaurant:** Stats grid (84+ options, R$79.90/kg, Sushi Bar included, 65% occupancy), live alerts (Fraldinha fresh, Arroz replenishing ~3min)
- **Check-in:** Success screen, "Mesa 12 · Comanda SN-012", NFC auto-connect message
- **Stations:** Real-time status per station (Fresh ✓ / ⏳ Reabastecendo), item chips
- **Drinks:** 7 beverages across 5 categories with +/- quantity controls
- **Comanda:** Food by weight + drinks + service charge (10%), all calculated live

#### Unique Functional Anchors
- **Smart Scale (NFC):** Animated weight simulation with multi-weigh support
- **Live Station Status:** Real-time freshness indicators
- **Hybrid Billing:** Weight-based food + per-item drinks + 10% service

---

### 11.6 Drive-Thru — NOOWE Drive

**File:** `DriveThruDemo.tsx` — **405 lines** — **11 screens** — **7 journey steps**

#### Journey Steps

| Step | Label | Screens |
|------|-------|---------|
| 1 | Pedir no caminho | home, restaurant |
| 2 | Montar pedido | menu, customize, cart |
| 3 | Pagamento antecipado | payment |
| 4 | GPS rastreia você | gps-tracking |
| 5 | Geofencing (500m) | geofence |
| 6 | Pista designada | lane-assign |
| 7 | Retirada & avaliação | pickup, done |

#### GPS Tracking Simulation

1. **Distance countdown:** 5.2km → 0.5km, decrements by 0.3km every 350ms
2. **Milestone markers:** 5km (Pedido confirmado), 3km (Cozinha alertada), 1km (Preparo iniciado), 500m (Geofencing ativado)
3. **Circle visualization:** `w-36 h-36 rounded-full bg-blue-500/10 border-4` with distance display
4. **Auto-transition:** At 0.5km → geofence screen → 3s → lane-assign

#### Geofence Trigger

- "GEOFENCE ATIVADO" banner with pulse animation
- "A 500m do NOOWE Drive" with Satellite icon
- "A cozinha finalizou seu pedido agora" message
- Auto-transitions to lane assignment after 3s

#### Lane Assignment

- "Pista 3" with Car icon
- Siga direto para a pista designada
- "Pedido já pago — retire na janela"

#### Key Screens

- **Home:** 4-step flow (Peça → Pague → Dirija → Retire) with icon grid
- **Restaurant:** Stats (1:48 avg window time, 234 pedidos hoje, 98% satisfação)
- **Customize:** Ingredient removal chips, extras with pricing, notes field
- **Cart:** GPS sync banner: "GPS ativado — preparo sincronizado com sua chegada"

#### Unique Functional Anchors
- **GPS Geofencing:** Real-time distance tracking with kitchen trigger at 500m
- **Pre-Payment:** Pay before arrival = no window transaction
- **Lane Assignment:** Specific pickup lane designation
- **1:48 Average:** Showcases speed metrics

---

### 11.7 Food Truck — Taco Noowe

**File:** `FoodTruckDemo.tsx` — **447 lines** — **12 screens** — **7 journey steps**

#### Journey Steps

| Step | Label | Screens |
|------|-------|---------|
| 1 | Descobrir no mapa | home, map |
| 2 | Ver food truck | truck-detail, schedule |
| 3 | Fila virtual | queue |
| 4 | Montar pedido | menu, item-detail, cart |
| 5 | Pagamento | payment |
| 6 | Preparo ao vivo | waiting |
| 7 | Retirada & avaliação | ready, rating |

#### Interactive Map Screen

- Background gradient simulating map
- 3 truck pins: Taco Noowe (800m, primary with pulse), Burger Bros (1.5km, muted), Açaí Tropical (2.1km, muted)
- User location: Blue pulsing circle with "Você" label
- Bottom card: truck name, distance, queue count, estimated time

#### Weekly Schedule

7-day calendar: Mon-Sun with location, hours, and "Aqui agora" badge for today. Location notification toggle.

#### Virtual Queue

- Position indicator: Circle with position number, queue dots (1–8)
- "Enquanto espera" suggestions: Pedido antecipado, Passeie (push notification), Ver cardápio
- Queue auto-decrements every 3s

#### Menu Data (9 items)

Tacos (3): al Pastor R$35, Carnitas R$38, Vegetariano R$30
Burritos (1): Carne Asada R$38
Quesadillas (1): Frango R$28
Petiscos (1): Nachos Supreme R$32
Sobremesas (1): Churros R$18
Bebidas (2): Hibisco R$12, Horchata R$12

#### Unique Functional Anchors
- **Live Map:** GPS visualization with truck pins and user location
- **Weekly Schedule:** 7-day location calendar
- **Virtual Queue:** Position tracking with push notification promise
- **Location Notifications:** Subscribe to truck movement alerts

---

### 11.8 Chef's Table — Mesa do Chef Noowe

**File:** `ChefsTableDemo.tsx` — **506 lines** — **13 screens** — **9 journey steps**

#### Journey Steps

| Step | Label | Screens |
|------|-------|---------|
| 1 | Descobrir experiência | home, detail |
| 2 | Reserva exclusiva | reservation |
| 3 | Preferências alimentares | dietary |
| 4 | Preferências de vinho | wine-pref |
| 5 | Pagamento antecipado | payment |
| 6 | Contagem regressiva | countdown |
| 7 | Dia da experiência | welcome |
| 8 | Degustação (3 cursos) | course-1, course-2, course-3 |
| 9 | Foto & encerramento | photo, finale |

#### Course-by-Course Experience

**Course 1 — Amuse-Bouche:**
- Course progress bar (1/3)
- Chef portrait with chef's hat icon
- "Amuse-Bouche" title with description
- Chef's story: "Inspiro-me na culinária molecular..."
- Sommelier pairing note: "Champagne Brut harmoniza com as notas cítricas"
- "Próximo Curso" CTA

**Course 2 — Prato Principal:**
- Wagyu A5 photo (FoodImg)
- "Wagyu A5 Miyazaki" with description
- Wine pairing: "Barolo DOCG 2018"
- Sommelier note with Wine icon
- Chef interage com a mesa

**Course 3 — Grand Finale:**
- Soufflé de Chocolate with Mousse photo
- Espumante pairing
- Chef's closing message

#### Key Screens

- **Home:** Exclusive card with Crown icon, "2 estrelas Michelin", 8 lugares, R$680/pessoa, "3 vagas" warning badge
- **Detail:** Chef Ricardo Oliveira profile, 7 expectations (degustação, harmonização, interação, menu assinado, fotos, certificado, 3h duração), scarcity badge
- **Reservation:** Date selection (some sold out), guest counter (1–4), price calculation
- **Dietary:** Restrictions (7 options), allergies (8 options), occasion (5 options) — "O chef personaliza para você"
- **Wine Preferences:** 4 types (Tinto/Branco/Espumante/Sem álcool), intensity (Leve/Médio/Encorpado), region (6 options)
- **Countdown:** 3-day countdown timer, chef message quote about Wagyu A5 sourcing
- **Welcome:** Champagne reception, dress code reminder, seat assignment
- **Photo:** Photo session with chef, signed menu souvenir
- **Finale:** Digital participation certificate, experience rating, trophy badge

#### Unique Functional Anchors
- **Multi-Step Reservation:** Date → Guests → Dietary → Wine → Payment
- **Course-by-Course Progression:** 3 guided courses with sommelier notes
- **Chef's Personal Messages:** Narrative quotes building anticipation
- **Digital Certificate:** Post-experience trophy credential

---

### 11.9 Casual Dining — Cantina Noowe

**File:** `CasualDiningDemo.tsx` — **776 lines** — **15 screens** — **9 journey steps**

#### Journey Steps

| Step | Label | Screens |
|------|-------|---------|
| 1 | Descobrir restaurante | home, restaurant |
| 2 | Walk-in ou reserva | entry-choice |
| 3 | Lista de espera inteligente | waitlist, waitlist-bar |
| 4 | Modo família | family-mode, family-activities |
| 5 | Cardápio interativo | menu, item-detail |
| 6 | Comanda por pessoa | comanda |
| 7 | Dividir conta | split, split-by-item |
| 8 | Gorjeta & pagamento | tip, payment-success |
| 9 | Avaliação & fidelidade | review |

#### People System (4 guests)

| ID | Name | Color | Role |
|----|------|-------|------|
| p1 | Você | bg-primary | User |
| p2 | Maria | bg-pink-500 | Guest |
| p3 | João | bg-blue-500 | Guest |
| p4 | Sofia | bg-purple-500 | Kid |

#### Menu Data (10 items)

| Name | Price | Category | Prep | Allergens | Special |
|------|-------|----------|------|-----------|---------|
| Lasanha Bolonhesa | R$52 | Massas | 25 min | glúten, lactose | Popular |
| Pizza Pepperoni | R$58 | Pizzas | 18 min | glúten, lactose | Popular |
| Risoto de Camarão | R$72 | Especiais | 30 min | crustáceos, lactose | — |
| Filé à Parmegiana | R$65 | Carnes | 22 min | glúten, lactose | Popular |
| Salada Caesar | R$38 | Saladas | 8 min | glúten, lactose | Vegetarian |
| Tiramisù | R$28 | Sobremesas | 5 min | glúten, lactose, ovos | — |
| Mini Pizza Margherita | R$25 | Kids | 12 min | glúten, lactose | Kids |
| Nuggets com Batata | R$22 | Kids | 15 min | glúten | Kids |
| Macarrão com Queijo | R$20 | Kids | 10 min | glúten, lactose | Kids |
| Bruschetta | R$26 | Entradas | 8 min | glúten | Vegetarian |

#### Smart Waitlist System

- **Entry Choice:** 3 options: Walk-in Inteligente (with benefits: pedir drinks, notificação, ver cardápio), Reserva Antecipada (time slots), Já estou na mesa (QR)
- **Waitlist:** Animated position counter (spinning border), stats (people, table, status), "Enquanto espera" actions (pedir drinks, ver cardápio), Family Mode toggle
- **Waitlist Bar:** Order drinks/appetizers during wait — goes to comanda (Caipirinha R$22, Cerveja R$18, Suco R$12, Pão de Alho R$16)

#### Family Mode System

- **Activation:** Toggle on waitlist screen
- **Features (5):** Kids Menu em destaque, Cadeirão reservado, Kit de atividades, Pratos kids primeiro, Alerta de alérgenos
- **Kid Registration:** Name, age, allergies for each child
- **Activities (4):** Colorir na Mesa, Quiz da Pizza, Caça ao Tesouro, Chef Mirim (make own pizza)
- **Menu Impact:** Kids items float to top when family mode is active

#### Per-Person Comanda

Orders grouped by person with colored avatars:
- Você: Lasanha R$52
- Maria: Pizza R$58
- Sofia: Mini Pizza R$25 (kids badge)
- João: Filé R$65

#### Multi-Category Rating

3 separate star ratings: Comida, Serviço, Ambiente. Tag chips for feedback. Trophy for completing.

#### Unique Functional Anchors
- **Smart Waitlist:** Order drinks/food while waiting
- **Family Mode:** Kids menu priority, activities, allergen alerts
- **Per-Person Ordering:** Items tagged to specific guests
- **3-Category Rating:** Food + Service + Ambiance

---

### 11.10 Pub & Bar — Noowe Tap House

**File:** `PubBarDemo.tsx` — **800 lines** — **15 screens** — **9 journey steps**

#### Journey Steps

| Step | Label | Screens |
|------|-------|---------|
| 1 | Descoberta | discovery, venue |
| 2 | Chegada & Check-in | check-in, tab-opened |
| 3 | Convidar amigos | invite-friends |
| 4 | Cardápio & Pedido | menu, drink-detail, order-status |
| 5 | Chamar garçom | call-waiter |
| 6 | Rodada do grupo | round-builder, round-sent |
| 7 | Conta ao vivo | tab-live |
| 8 | Dividir & Pagar | split, payment |
| 9 | Pós-experiência | post |

#### Drinks Data (10 items)

| Name | Price | HH Price | Cat | ABV | IBU | Style |
|------|-------|----------|-----|-----|-----|-------|
| IPA Artesanal | R$28 | R$19 | Chopp | 6.5% | 55 | American IPA |
| Pilsen Premium | R$22 | R$15 | Chopp | 4.8% | 18 | German Pilsner |
| Stout de Chocolate | R$30 | R$21 | Chopp | 5.5% | 35 | Chocolate Stout |
| Wheat Beer | R$25 | R$17 | Chopp | 5.0% | 12 | Hefeweizen |
| Gin Tônica Artesanal | R$38 | R$26 | Drinks | 12% | — | — |
| Aperol Spritz | R$35 | R$24 | Drinks | 8% | — | — |
| Moscow Mule | R$36 | R$25 | Drinks | 10% | — | — |
| Porção de Batata | R$32 | R$32 | Petiscos | — | — | — |
| Nachos Supreme | R$38 | R$38 | Petiscos | — | — | — |
| Tábua de Frios | R$65 | R$65 | Petiscos | — | — | — |

#### Friends System (4 people)

| Name | Initial | Color | Status |
|------|---------|-------|--------|
| Você | V | bg-primary | Host |
| Lucas | L | bg-blue-500 | Joined |
| Ana | A | bg-pink-500 | Joined |
| Pedro | P | bg-green-500 | Pending |

#### Tab System

- **Pre-authorization:** Card linked on check-in (•••• 4242 Visa)
- **Cover credit:** R$25 converted to consumption credit
- **Spending limit:** Configurable with −/+ stepper, alerts at 80%
- **Tab tracking:** `TabItem[]` with drinkId, who ordered, timestamp
- **Running total:** Sum of all tab items with HH pricing applied
- **HH savings:** Shows total saved via Happy Hour

#### Happy Hour System

- Timer: `hhMinutes` state (starts at 92 min)
- Progress bar: visual countdown
- Dual pricing on menu: strikethrough original + warning-colored HH price
- Savings tracking: accumulated across all orders

#### Round Builder

- Each friend selects their own drink
- Friend chips with avatar + drink assignment
- "Enviar Rodada" sends all drinks at once to bar
- Success: "Rodada enviada! · X drinks ao barman"

#### Call Waiter (Pub-specific)

4 motives with description:
1. Dúvida sobre o cardápio
2. Preciso de copos/guardanapos
3. Pedido especial
4. Problema na mesa

#### Tab Live (Real-time bill)

- Per-person breakdown: who ordered what and when
- Running totals per person
- Cover credit applied
- HH savings shown
- "Fechar Tab" CTA

#### Unique Functional Anchors
- **Digital Tab:** Pre-authorized card, cover credit, spending limit
- **Happy Hour Engine:** Timer-based dual pricing with savings tracker
- **Round Builder:** Group drink ordering — each person picks their own
- **Friend Tab Sharing:** Invite via link, track per-person consumption
- **Drink Detail Cards:** ABV, IBU, style, harmonization suggestions

---

### 11.11 Club & Balada — NOOWE Club

**File:** `ClubDemo.tsx` — **801 lines** — **18 screens** — **9 journey steps**

#### Journey Steps

| Step | Label | Screens |
|------|-------|---------|
| 1 | Descoberta | discovery, event-detail, lineup |
| 2 | Decisão / Ingresso | tickets, digital-ticket, promoter-list |
| 3 | Chegada & Check-in | virtual-queue, check-in |
| 4 | Cardápio & Pedido | floor-menu, order-pickup |
| 5 | Camarote VIP | vip-table, vip-map |
| 6 | Bottle Service | bottle-service |
| 7 | Conta & Consumação | min-spend |
| 8 | Dividir & Pagar | split, payment |
| 9 | Pós-experiência | post, rate |

#### Ticket System (3 tiers)

| Tier | Price | Original | Perks |
|------|-------|----------|-------|
| Pista | R$60 | R$80 | Entrada após 23:30, R$60 vira crédito consumação |
| VIP | R$120 | R$150 | Entrada prioritária, área exclusiva, 1 drink cortesia |
| Open Bar | R$200 | R$250 | Entrada prioritária, open bar completo, VIP inclusa |

Scarcity: "Lote 2 · Últimas unidades · Preço sobe em 2h"

#### Digital Ticket (Anti-Fraud QR)

- Animated QR code with pulsing border
- Ticket code: "NC-847"
- "Código muda a cada 30s — impossível clonar" (ShieldCheck icon)
- Entry credit conversion (Pista: R$60 becomes consumption credit)

#### Lineup

4 DJs with time slots, genre, bio, and headliner badge. Special guest with gradient card.

#### Promoter List & Birthday

- 2 promoter lists with benefits and spots remaining
- Birthday package: free entry + companion + champagne + table decoration
- Guest management: confirmed/pending/declined status tracking

#### VIP Camarote System (4 options)

| Name | People | Min. Spend | Deposit | Position |
|------|--------|-----------|---------|----------|
| Lounge | 6-8 | R$2,000 | R$800 | Lateral pista |
| Premium | 8-12 | R$3,000 | R$1,200 | Frente palco |
| Stage | 10-15 | R$5,000 | R$2,000 | Palco (sold out) |
| Sky Box | 15-20 | R$8,000 | R$3,000 | Terraço |

"Depósito vira crédito de consumação — você não perde"

#### Bottle Service (6 options)

| Name | Price | Description |
|------|-------|-------------|
| Absolut Vodka | R$350 | 750ml + 4 energéticos |
| Grey Goose | R$580 | 750ml Premium + tônica |
| Moët Chandon | R$650 | 750ml Brut Impérial |
| JW Black | R$480 | 750ml 12 anos |
| Balde Cerveja | R$120 | 6 long necks premium |
| Don Julio Reposado | R$520 | 750ml + limões |

#### Minimum Spend Tracker

- Circular progress: consumed (R$1,580) vs minimum (R$3,000) = 53%
- Color coding: <50% warning, 50-80% primary, >80% success
- "Faltam R$1,420" remaining display
- Breakdown: bottles + drinks + food ordered

#### Floor Menu (Quick Order from Dance Floor)

6 drinks: Gin Tônica (R$38), Vodka Red Bull (R$35), Cerveja (R$18), Água (R$8), Shot Tequila (R$25), Caipirinha (R$30)
Nearest bar indicator: "Bar Pista Central"
Entry credit shown inline

#### Post-Experience

- Night summary: total spent, drinks count, hours inside
- Uber integration CTA
- Points earned
- Multi-category rating: Música, Drinks, Ambiente, Atendimento, Segurança
- "Salvar nos favoritos" + share

#### Unique Functional Anchors
- **Ticket Tiers:** 3-tier with dynamic pricing and credit conversion
- **Anti-Fraud QR:** Animated code rotation every 30s
- **Promoter Lists:** VIP/Friends lists with benefits
- **Birthday Package:** Free entry + champagne + decoration
- **VIP Map:** Visual camarote position selection
- **Bottle Service:** Premium menu with mixers included
- **Minimum Spend Tracker:** Real-time consumption vs. required minimum
- **Floor Ordering:** Order from dance floor, pickup at nearest bar
- **Uber Integration:** Post-experience ride request

---

## 12. Visual Design System

### Color Tokens

All components use semantic tokens from `index.css`:
- `--primary`, `--primary-foreground` — Main brand color
- `--accent` — Secondary accent (used in gradients)
- `--muted`, `--muted-foreground` — Subdued backgrounds/text
- `--success` — Positive states (paid, ready, confirmed)
- `--warning` — Caution states (replenishing, pending, HH timer)
- `--destructive` — Error/delete states

### Typography Scale

| Usage | Class |
|-------|-------|
| Hero heading | `font-display text-2xl font-bold` |
| Section heading | `font-display text-xl font-bold` |
| Card title | `font-semibold text-sm` |
| Body text | `text-sm text-muted-foreground` |
| Small label | `text-xs text-muted-foreground` |
| Micro text | `text-[10px] text-muted-foreground` |
| Nano text | `text-[9px] text-muted-foreground` |
| Price display | `font-display font-bold text-sm` |
| Large price | `font-display text-2xl font-bold` |

### Animation Patterns

| Pattern | Class | Usage |
|---------|-------|-------|
| Pulse | `animate-pulse` | GuidedHint, loading states, geofence |
| Spin | `animate-spin` | Loader2 icons, queue counter |
| Bounce | `animate-bounce` | QR scan line |
| Ping | `animate-ping` | Scale weighing indicator |
| Glow Shadow | `shadow-glow` | Primary CTA buttons |
| Scale Press | `active:scale-[0.98]` | Payment CTAs |

### Card Patterns

| Type | Classes |
|------|---------|
| Standard | `bg-card rounded-2xl p-4 shadow-md border border-border` |
| Elevated | `bg-card rounded-2xl p-4 shadow-lg border border-border` |
| Accent | `bg-primary/5 rounded-2xl p-4 border border-primary/20` |
| Success | `bg-success/10 rounded-xl border border-success/20` |
| Warning | `bg-warning/10 rounded-xl border border-warning/20` |
| Gradient Header | `bg-gradient-to-br from-primary via-primary/90 to-accent` |

---

## 13. File Map & Architecture Diagram

### Complete File Map

```
src/components/demo/
├── DemoShared.tsx              182 lines  │ PhoneShell, BottomNav, GuidedHint, ItemIcon, SERVICE_TYPES
├── DemoPayment.tsx             310 lines  │ Shared payment panel (6 methods, tip, loyalty)
├── DemoPaymentSuccess.tsx      150 lines  │ Success confirmation (icon, summary, actions)
├── DemoOrderStatus.tsx         399 lines  │ Order tracking (11 service-type presets)
├── DemoSplitBill.tsx           229 lines  │ Split bill (4 modes, person cards)
├── DemoI18n.tsx               ~6500 lines │ Translation engine (PT/EN/ES)
├── FoodImages.tsx              193 lines  │ 100+ Unsplash URLs + FoodImg component
└── experiences/
    ├── FineDiningDemo.tsx      1205 lines │ 18 screens, AI harmonization, split bill
    ├── QuickServiceDemo.tsx     621 lines │ 9 screens, skip-the-line, combos
    ├── FastCasualDemo.tsx       618 lines │ 12 screens, 4-step bowl builder
    ├── CafeBakeryDemo.tsx       573 lines │ 9 screens, work mode, refil system
    ├── BuffetDemo.tsx           407 lines │ 10 screens, smart scale, live stations
    ├── DriveThruDemo.tsx        405 lines │ 11 screens, GPS geofencing
    ├── FoodTruckDemo.tsx        447 lines │ 12 screens, live map, virtual queue
    ├── ChefsTableDemo.tsx       506 lines │ 13 screens, course-by-course
    ├── CasualDiningDemo.tsx     776 lines │ 15 screens, family mode, smart waitlist
    ├── PubBarDemo.tsx           800 lines │ 15 screens, tab system, round builder
    └── ClubDemo.tsx             801 lines │ 18 screens, tickets, VIP, bottle service

src/contexts/
└── DemoContext.tsx              456 lines │ Simulation engine, mock data, auto-progression
```

### Total Codebase Metrics

| Metric | Value |
|--------|-------|
| Total experience code | ~6,359 lines |
| Shared components | ~1,463 lines |
| Context/engine | 456 lines |
| i18n translations | ~6,500 lines |
| Food image system | 193 lines |
| **Grand total (demo system)** | **~14,971 lines** |
| Unique screens | 148+ |
| Interactive actions | 500+ |
| Mock data entities | 80+ |

---

*Document Version: 5.0 — Deep Audit Edition*
*Generated: 2026-03-17*
*Methodology: Line-by-line source code audit of every component, screen, action, state variable, and data entity in the demo client system.*
