# NOOWE — Client Demo Documentation v4.0

> **Enterprise-Grade Technical Specification**
> Interactive Client Demo System (`/demo`)
> Last updated: 2026-03-17

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Shared Component Library](#3-shared-component-library)
4. [DemoContext — Simulation Engine](#4-democontext--simulation-engine)
5. [Internationalization (i18n)](#5-internationalization-i18n)
6. [Service Type Catalog (11 Experiences)](#6-service-type-catalog-11-experiences)
   - 6.1 [Fine Dining — Bistrô Noowe](#61-fine-dining--bistrô-noowe)
   - 6.2 [Quick Service — NOOWE Express](#62-quick-service--noowe-express)
   - 6.3 [Fast Casual — NOOWE Fresh](#63-fast-casual--noowe-fresh)
   - 6.4 [Café & Bakery — Café Noowe](#64-café--bakery--café-noowe)
   - 6.5 [Buffet — Sabores Noowe](#65-buffet--sabores-noowe)
   - 6.6 [Drive-Thru — NOOWE Drive](#66-drive-thru--noowe-drive)
   - 6.7 [Food Truck — Taco Noowe](#67-food-truck--taco-noowe)
   - 6.8 [Chef's Table — Mesa do Chef Noowe](#68-chefs-table--mesa-do-chef-noowe)
   - 6.9 [Casual Dining — Cantina Noowe](#69-casual-dining--cantina-noowe)
   - 6.10 [Pub & Bar — Noowe Tap House](#610-pub--bar--noowe-tap-house)
   - 6.11 [Club & Balada — NOOWE Club](#611-club--balada--noowe-club)
7. [Shared Payment System](#7-shared-payment-system)
8. [Order Status Tracking System](#8-order-status-tracking-system)
9. [Split Bill System](#9-split-bill-system)
10. [Food Image System](#10-food-image-system)
11. [Visual Design System](#11-visual-design-system)
12. [File Map & Architecture Diagram](#12-file-map--architecture-diagram)

---

## 1. Executive Summary

The NOOWE Client Demo (`/demo`) is a high-fidelity, fully interactive simulation of the NOOWE consumer mobile application. It demonstrates 11 distinct service-type experiences — from Fine Dining to Club & Balada — each with its own complete customer journey comprising 7–12 guided stages.

**Key Metrics:**
- **11** service-type experiences
- **118** unique screens across all experiences
- **60+** interactive user actions per experience
- **3** supported languages (PT / EN / ES)
- **100+** curated food photographs (Unsplash CDN)
- **6** shared reusable components (PhoneShell, BottomNav, GuidedHint, DemoPayment, DemoOrderStatus, DemoSplitBill, DemoPaymentSuccess)

**Purpose:** Enable stakeholders (investors, restaurant owners, sales teams) to experience the full depth of NOOWE's consumer platform without requiring a live backend or real data.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    /demo Route                              │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │ Service Type  │  │  PhoneShell   │  │  Journey Sidebar │ │
│  │   Selector    │→ │  (375×812)    │  │  (Guided Steps)  │ │
│  └──────────────┘  │  ┌──────────┐ │  │  ┌─────────────┐ │ │
│                    │  │Experience│ │  │  │ Step 1 ✓    │ │ │
│                    │  │Component │ │  │  │ Step 2 ●    │ │ │
│                    │  └──────────┘ │  │  │ Step 3 ○    │ │ │
│                    │  ┌──────────┐ │  │  │   ...       │ │ │
│                    │  │BottomNav │ │  │  └─────────────┘ │ │
│                    │  └──────────┘ │  └──────────────────┘ │
│                    └───────────────┘                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │               DemoContext (Simulation Engine)           ││
│  │  restaurant | menu | cart | orders | loyalty | tables   ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │               DemoI18n (Translation Engine)             ││
│  │  PT (default) | EN | ES | 6,483 lines | regex fallback ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Rendering Pipeline

1. User selects one of 11 service types from the selector grid
2. The corresponding `*Demo.tsx` component mounts inside `PhoneShell`
3. Internal state machine (`Screen` union type) manages navigation
4. `JOURNEY_STEPS` and `SCREEN_INFO` exported from each experience drive the sidebar
5. `DemoContext` provides shared data (restaurant, menu, cart, orders, loyalty)
6. `DemoI18n` provides real-time translation via `useDemoI18n()` hook

### Key Interfaces

```typescript
// Screen navigation — each experience defines its own union type
type Screen = 'home' | 'restaurant' | 'menu' | 'item' | ... ;

// Journey sidebar configuration
interface JourneyStep {
  step: number;       // 1-indexed stage number
  label: string;      // Display label (e.g. "Descobrir restaurante")
  screens: string[];  // Screens belonging to this stage
}

// Screen metadata for sidebar panel
interface ScreenInfo {
  title: string;      // Short screen title
  desc: string;       // Detailed description shown in sidebar
}
```

---

## 3. Shared Component Library

### 3.1 PhoneShell (`DemoShared.tsx`)

iPhone-style device frame (375×812px) with:
- **Status bar:** Time (9:41), Wi-Fi icon, battery indicator
- **Dynamic Island:** Centered black pill notch
- **Content area:** Scrollable with hidden scrollbar (calc height excludes status bar + nav)
- **Home indicator:** Bottom bar (32×1px rounded)

### 3.2 BottomNav (`DemoShared.tsx`)

5-tab bottom navigation bar:

| Tab | Icon | Label | Badge |
|-----|------|-------|-------|
| `explore` | Search | Explorar | — |
| `orders` | UtensilsCrossed | Pedidos | Cart count |
| `scan` | QrCode | QR Code | Elevated FAB style |
| `loyalty` | Gift | Fidelidade | — |
| `profile` | User | Perfil | Notification count |

The QR Code tab uses a **floating action button** pattern (elevated -mt-5, primary circle with glow shadow).

### 3.3 GuidedHint (`DemoShared.tsx`)

Contextual instruction banner with:
- `animate-pulse` CSS animation (configurable via `pulse` prop)
- Zap icon + primary color scheme
- Used at the top of key screens to guide the user through the journey

### 3.4 ItemIcon (`DemoShared.tsx`)

Icon wrapper component replacing emojis with Lucide icons:
- **49** category-to-icon mappings (including PT-BR categories)
- **6 size presets:** xs (28px) → hero (80px)
- Consistent `bg-primary/10` gradient containers
- Used across all 11 experiences for menu items, categories, and navigation

### 3.5 SERVICE_TYPES Configuration

Array of 11 `ServiceTypeDemo` objects:

| ID | Name | Restaurant | Gradient |
|----|------|------------|----------|
| `fine-dining` | Fine Dining | Bistrô Noowe | rose-900 → amber-900 |
| `quick-service` | Quick Service | NOOWE Express | yellow-500 → orange-500 |
| `fast-casual` | Fast Casual | NOOWE Fresh | green-500 → emerald-500 |
| `cafe-bakery` | Café & Padaria | Café Noowe | amber-700 → orange-800 |
| `buffet` | Buffet | Sabores Noowe | orange-500 → red-500 |
| `drive-thru` | Drive-Thru | NOOWE Drive | blue-500 → cyan-500 |
| `food-truck` | Food Truck | Taco Noowe | lime-500 → green-500 |
| `chefs-table` | Chef's Table | Mesa do Chef Noowe | zinc-800 → stone-700 |
| `casual-dining` | Casual Dining | Cantina Noowe | red-500 → orange-500 |
| `pub-bar` | Pub & Bar | Noowe Tap House | amber-600 → yellow-700 |
| `club` | Club & Balada | NOOWE Club | purple-600 → pink-600 |

---

## 4. DemoContext — Simulation Engine

**File:** `src/contexts/DemoContext.tsx` (456 lines)

The DemoContext is the central state management layer providing realistic mock data and auto-simulation for the "Bistrô Noowe" demo restaurant.

### 4.1 Data Models

```typescript
DemoMenuItem {
  id, name, description, price, category, image, prepTime, popular?, tags?
}

DemoOrder {
  id, tableNumber, items[], status, total, customerName, createdAt, updatedAt, isKitchen?, isBar?
}

DemoTable {
  id, number, seats, status, customerName?, occupiedSince?, orderTotal?
}

DemoReservation {
  id, customerName, partySize, time, status, phone, notes?
}

DemoNotification {
  id, type, message, timestamp, read
}

DemoAnalytics {
  todayRevenue, todayOrders, avgTicket, occupancyRate,
  topItems[], hourlyRevenue[], weeklyRevenue[],
  customerSatisfaction, returningCustomers
}
```

### 4.2 Client-Side Actions

| Action | Description |
|--------|-------------|
| `addToCart(item, qty, notes)` | Add menu item to cart with optional notes |
| `removeFromCart(itemId)` | Remove item from cart |
| `updateCartQuantity(itemId, qty)` | Change quantity of cart item |
| `clearCart()` | Empty the cart |
| `placeOrder()` | Convert cart to a DemoOrder |
| `cartTotal` | Computed total of all cart items |
| `clientActiveOrder` | Currently active order (if any) |
| `loyaltyPoints` | Current loyalty point balance |

### 4.3 Restaurant-Side Actions

| Action | Description |
|--------|-------------|
| `updateOrderStatus(orderId, status)` | Change order status (pending → confirmed → preparing → ready → delivered → paid) |
| `updateTableStatus(tableId, status)` | Change table status (available → occupied → reserved → billing) |
| `markNotificationRead(notificationId)` | Mark notification as read |
| `toggleSimulation()` | Start/stop auto-simulation of events |

### 4.4 Auto-Simulation Engine

When enabled, the simulation engine auto-generates realistic events on timed intervals:
- New orders appearing from simulated customers
- Order status progression through the pipeline
- Kitchen/bar ready notifications
- Table status transitions
- Revenue accumulation in analytics

---

## 5. Internationalization (i18n)

**File:** `src/components/demo/DemoI18n.tsx` (6,483 lines)

### 5.1 Supported Languages

| Code | Label | Coverage |
|------|-------|----------|
| `pt` | PT | 100% (default — source language) |
| `en` | EN | 100% (all keys translated) |
| `es` | ES | 100% (all keys translated) |

### 5.2 Architecture

- **Context-based:** `DemoI18nProvider` + `useDemoI18n()` hook
- **Translation sections:** `shared`, `client`, `restaurant`
- **Fallback system:** If a key is not found in the translation map, a regex-based replacement engine attempts to translate inline Portuguese strings to the target language
- **6,483 lines** of curated translations covering all demo screens

### 5.3 Usage Pattern

```tsx
const { translateText, t, lang, setLang } = useDemoI18n();

// Keyed translation
t('shared', 'backToDemo')  // → "Back to demo" (EN)

// Inline text translation (regex fallback)
translateText('Explorar')  // → "Explore" (EN)
```

---

## 6. Service Type Catalog (11 Experiences)

---

### 6.1 Fine Dining — Bistrô Noowe

**File:** `src/components/demo/experiences/FineDiningDemo.tsx` (1,205 lines)
**Restaurant:** Bistrô Noowe · Contemporânea · R$$$$ · 4.8★ (324)

#### Journey (11 Stages)

| # | Stage | Screens | Description |
|---|-------|---------|-------------|
| 1 | Descobrir restaurante | `home`, `restaurant` | Map-based discovery with proximity, category filters, ratings. Restaurant profile with features, photos, and quick-access buttons. |
| 2 | Escanear QR da mesa | `qr-scan` | Animated QR scanner with corner brackets, scanning line, auto-success after 2.5s. Identifies "Mesa 7" with seat count. |
| 3 | Explorar cardápio | `menu`, `item`, `ai-harmonization` | Digital menu with categories, allergen tags, prep time, AI harmonization engine. |
| 4 | Montar comanda | `comanda` | Cart review with quantity adjustment, people invitation (SMS/WhatsApp/link), service charge calculation. |
| 5 | Acompanhar pedido | `order-status` | Real-time tracking via DemoOrderStatus with per-item status and chef names. |
| 6 | Fechar conta & pagar | `fechar-conta`, `payment-success` | Advanced bill closing with 4 split modes, per-item assignment, shared items, tip selector. |
| 7 | Programa de fidelidade | `loyalty` | Multi-tier loyalty (Silver→Gold→Platinum→Black) with points, rewards, and history. |
| 8 | Reservar mesa | `reservations` | Date/time/guest selector, friend invitation, confirmation code, SMS share. |
| 9 | Fila virtual | `virtual-queue` | Real-time queue with position tracking, party size, area preference. |
| 10 | Chamar equipe | `call-waiter` | Discreet call: Garçom / Sommelier / Ajuda. Confirmation with ETA (~2 min). |
| 11 | Notificações | `notifications` | 6 notification types: reservation, invite, queue, loyalty, promo, order. Accept/reject actions. |

#### Screens Deep-Dive

**Home Screen:**
- Greeting with time-based message ("Boa noite")
- Search bar (placeholder)
- Category filter chips: Todos, Fine Dining, Casual, Bar, Café
- Featured restaurant card with hero image, rating, cuisine, price range
- Quick-action grid: Escanear, Reservar, Fila Virtual, Cardápio
- "Perto de você" list with 3 nearby restaurants
- Notification bell with badge (3)

**Restaurant Profile:**
- Full-width hero image with gradient overlay
- Back button, heart (favorite), share
- Restaurant name, description, rating, distance, price range
- Operating hours
- Feature tags (array from DemoContext)
- CTA grid: Ver Cardápio (primary) + Reservar Mesa (outlined)
- Secondary actions: Escanear QR, Fila Virtual, Chamar Garçom

**Menu Screen:**
- Category tabs (horizontal scrollable)
- Cart count badge on floating button
- Menu items with: image, name, description, price, popular badge, prep time
- Tap item → Item Detail
- AI Harmonization button (Brain icon + gradient CTA)

**AI Harmonization (Unique Feature):**
- 3-step flow: Preferences → Loading (2s animation) → Results
- **Preference selection:**
  - Beverage: Vinho Tinto, Vinho Branco, Espumante, Cerveja, Cocktail, Sem álcool
  - Dietary: Nenhuma, Vegetariano, Vegano, Sem glúten, Sem lactose
  - Occasion: Jantar casual, Encontro romântico, Negócios, Aniversário, Com amigos
- **Loading state:** Animated brain icon, "Analisando 430+ combinações..."
- **Results:** 4-course suggestion (Entrada, Principal, Vinho, Sobremesa) with 98% match badge, total price, "Adicionar Tudo à Comanda" CTA

**Fechar Conta (Bill Closing — Unique Feature):**
- **Gradient header** with total da mesa
- **People at the table:** Guest avatars with paid/unpaid status, invite button (SMS/WhatsApp/link share)
- **Pay mode:** Solo (pagar tudo) vs Split (dividir conta)
- **4 split modes:**
  1. **Meus Itens:** Auto-calculates based on who ordered what
  2. **Partes Iguais:** Equal division among unpaid guests
  3. **Por Item (Seletivo):** Checkboxes per item with "Dividir por todos" option per item
  4. **Valor Fixo:** Increment/decrement stepper (R$ ±10)
- **Shared items:** Items marked "÷ todos" are divided equally
- **Summary card:** Your part + shared items + tip + paid by others = you pay
- **Continue to Payment →** Routes to DemoPayment shared component

**Profile Screen:**
- User avatar, name, email, loyalty points
- Level badge (Gold) with progress bar to Platinum
- 8 menu items: Notificações (badge:3), Histórico, Minhas Reservas, Fidelidade, Pagamentos, Favoritos, Configurações, Ajuda
- Logout button (destructive)

**My Orders Screen:**
- Active order card with status badge (Preparando/Pronto/Em andamento), item count, total, "Acompanhar" link
- Order history list with restaurant, date, total, item count, star rating

**Loyalty Screen:**
- 4-tier system: Silver (0-499), Gold (500-1499), Platinum (1500-2999), Black (3000+)
- Current tier with progress bar and points needed for next tier
- Rewards catalog: redeemable items with point costs
- Points history: earned/redeemed transactions

**Reservations Screen:**
- Date selector: Hoje, Amanhã, Sáb 15, Dom 16
- Time slots: 18:00, 19:00, 19:30, 20:00, 21:00
- Guest count: 1-6 people selector
- Confirmation state: code, date, time, guests, share link, invite friends

---

### 6.2 Quick Service — NOOWE Express

**File:** `src/components/demo/experiences/QuickServiceDemo.tsx` (621 lines)
**Restaurant:** NOOWE Express · Fast Food Premium · R$ · 4.5★ (1.2k)

#### Journey (8 Stages)

| # | Stage | Screens |
|---|-------|---------|
| 1 | Descobrir restaurante | `home`, `restaurant` |
| 2 | Skip the Line & menu | `menu` |
| 3 | Personalizar item | `item` |
| 4 | Revisar carrinho | `cart` |
| 5 | Pagamento rápido | `payment` |
| 6 | Acompanhar preparo | `preparing` |
| 7 | Retirar pedido | `ready` |
| 8 | Avaliar & fidelidade | `rating` |

#### Anchor Features

- **Skip the Line:** Pre-order before arrival, skip the queue entirely
- **Combo System:** 3 pre-built combos with original price vs combo price (25-38% savings)
- **Item Customization:**
  - Extras: Bacon Crocante (R$6), Cheddar Extra (R$4), Ovo Frito (R$5), Jalapeño (R$3)
  - Removals: Cebola, Tomate, Alface, Molho, Picles
  - Quantity selector (±)
- **4-Stage Prep Tracking:** Recebido → Preparando → Conferência → Pronto (auto-progresses at 1s, 3s, 5.5s, 8s intervals)
- **Pickup Code:** 3-digit code + express counter number + time record
- **Rating System:** 5-star rating + tag-based feedback (Velocidade, Sabor, Atendimento, Limpeza, Embalagem)

#### Menu Data (13 items)

| Category | Items | Price Range |
|----------|-------|-------------|
| Burgers | Smash Classic, Duplo, Chicken Crispy, Veggie Smash | R$ 28-39 |
| Acompanhamentos | Batata Frita G, Onion Rings, Nuggets | R$ 16-22 |
| Bebidas | Milkshake Nutella, Milkshake Oreo, Refrigerante, Suco Natural | R$ 9-22 |
| Sobremesas | Sundae, Cookie Gigante | R$ 12-14 |

All items include: calorie count, prep time (1-6 min), description, food photo ID.

---

### 6.3 Fast Casual — NOOWE Fresh

**File:** `src/components/demo/experiences/FastCasualDemo.tsx` (618 lines)
**Restaurant:** NOOWE Fresh · Fast Casual · Bowls · Wraps · 4.7★

#### Journey (7 Stages)

| # | Stage | Screens |
|---|-------|---------|
| 1 | Descobrir restaurante | `home`, `restaurant` |
| 2 | Bowls salvos ou novo | `saved-bowls` |
| 3 | Montar prato (4 etapas) | `builder-base`, `builder-protein`, `builder-toppings`, `builder-sauce` |
| 4 | Resumo & alergias | `builder-summary`, `allergies` |
| 5 | Pagamento | `payment` |
| 6 | Preparo em tempo real | `prep-tracking` |
| 7 | Retirada & avaliação | `ready`, `rating` |

#### Anchor Feature: 4-Step Dish Builder

**Step 1 — Base (5 options):**

| Base | Calories | Carbs | Protein | Fiber | Photo |
|------|----------|-------|---------|-------|-------|
| Arroz Branco | 200 | 44g | 4g | 1g | rice |
| Arroz Integral | 180 | 38g | 5g | 4g | brown-rice |
| Quinoa | 160 | 27g | 8g | 5g | quinoa |
| Mix de Folhas | 30 | 5g | 2g | 3g | mixed-greens |
| Wrap Integral | 150 | 25g | 4g | 3g | wrap-bowl |

**Step 2 — Protein (5 options):**

| Protein | Calories | Protein | Price | Allergens |
|---------|----------|---------|-------|-----------|
| Frango Grelhado | 165 | 31g | R$ 12 | — |
| Carne Bovina | 250 | 26g | R$ 16 | — |
| Salmão Grelhado | 208 | 20g | R$ 20 | Peixe |
| Tofu Crocante | 144 | 17g | R$ 10 | Soja |
| Camarão Salteado | 99 | 24g | R$ 22 | Crustáceo |

**Step 3 — Toppings (9 options, some premium):**
- Free: Tomate Cereja, Milho Grelhado, Pepino, Cenoura, Beterraba
- Premium: Edamame (+R$4, soja), Abacate (+R$5), Ovo Cozido (+R$3, ovo), Queijo Feta (+R$5, lactose)

**Step 4 — Sauces (5 options, max 2):**
- Tahini Limão (gergelim), Caesar Light (lactose, ovo), Shoyu & Gengibre (soja), Mostarda & Mel (mostarda), Pesto de Manjericão (castanha, lactose)

#### Real-Time Nutritional Dashboard

Throughout the builder, a floating `CalBadge` displays:
- Running calorie count (kcal)
- Protein total (g)
- Running price (R$)

#### Allergen Detection System

After completing the builder, the `allergies` screen shows:
- Collected allergens from all selected ingredients
- Visual alert badges per allergen category
- Confirmation before proceeding to payment

#### 5-Stage Prep Tracking

Recebido → Base → Montagem → Qualidade → Pronto (unique to Fast Casual)

---

### 6.4 Café & Bakery — Café Noowe

**File:** `src/components/demo/experiences/CafeBakeryDemo.tsx` (573 lines)
**Restaurant:** Café Noowe · Café & Padaria · R$$ · 4.7★ (890)

#### Journey (6 Stages)

| # | Stage | Screens |
|---|-------|---------|
| 1 | Descobrir café | `home`, `restaurant` |
| 2 | Escanear QR da mesa | `qr-scan` |
| 3 | Modo trabalho | `work-mode` |
| 4 | Cardápio & personalização | `menu`, `customize` |
| 5 | Comanda & refil | `comanda` |
| 6 | Pagamento | `payment`, `payment-success` |

#### Anchor Features

**Work Mode Dashboard:**
- Wi-Fi password (copiável)
- Speed: 150 Mbps (real-time display)
- Noise level: Moderado (Volume2 icon)
- Power outlets: Available at your table
- Session timer: Auto-increments every 30s

**Discovery Filters (Unique to Café):**
- Wi-Fi Rápido, Tomadas, Silencioso, Pet Friendly, Ao Ar Livre

**Beverage Customization Engine:**
- **Milk options:** Integral, Desnatado, Aveia, Amêndoas, Coco
- **Sizes:** P (200ml, +R$0), M (350ml, +R$4), G (500ml, +R$8)
- **Flavors:** Baunilha, Caramelo, Avelã, Canela (+R$3)
- **Temperature:** Quente, Morno, Gelado
- **Extra shot:** +R$4

**Refill System:**
- Items marked with `refill: true` in menu data
- Refill price: R$ 5 (flat rate)
- Applies to: Café Filtrado, Chá Verde, Chá de Camomila
- `addRefill()` function creates a new cart entry with `isRefill: true`

#### Menu Data (14 items)

| Category | Items | Price Range |
|----------|-------|-------------|
| Cafés | Espresso, Cappuccino, Café Filtrado (refil), Latte, Cold Brew | R$ 8-18 |
| Chás | Chá Verde (refil), Camomila (refil), Matcha Latte | R$ 12-20 |
| Salgados | Croissant Misto, Pão de Queijo (6un), Sanduíche Caprese | R$ 12-22 |
| Doces | Torta de Maçã, Brownie, Cookie & Cream | R$ 12-16 |

**Stamp Card (Loyalty):** Every 10 coffees → 1 free. Shown in payment success screen.

---

### 6.5 Buffet — Sabores Noowe

**File:** `src/components/demo/experiences/BuffetDemo.tsx` (407 lines)
**Restaurant:** Sabores Noowe · Buffet por Peso · R$ 79,90/kg · 4.4★

#### Journey (7 Stages)

| # | Stage | Screens |
|---|-------|---------|
| 1 | Descobrir buffet | `home`, `restaurant` |
| 2 | Check-in digital | `checkin` |
| 3 | Estações ao vivo | `stations` |
| 4 | Balança inteligente | `scale`, `scale-history` |
| 5 | Pedir bebidas | `drinks` |
| 6 | Comanda em tempo real | `comanda` |
| 7 | Pagamento sem fila | `payment`, `payment-success` |

#### Anchor Features

**Digital Check-in:**
- QR scan links to comanda code (e.g. SN-012)
- NFC auto-detection at smart scale
- Mesa identification

**Live Stations (6 stations):**

| Station | Items | Status |
|---------|-------|--------|
| Grelhados | Fraldinha, Linguiça, Frango | Fresh ✓ |
| Massas | Espaguete, Penne, Lasanha | Fresh ✓ |
| Saladas | Folhas Mix, Tabule, Grega | Fresh ✓ |
| Acompanhamentos | Arroz, Feijão, Purê, Farofa | Replenishing ⟳ |
| Sobremesas | Pudim, Mousse, Frutas | Fresh ✓ |
| Sushi Bar | Salmão, Atum, Philadelphia | Fresh ✓ |

Real-time alerts: "Fraldinha acabou de sair da churrasqueira!" and "Arroz sendo reabastecido · 3 min"

**Smart Scale Simulation:**
- Animated weight increase (0g → ~485g over ~3.5 seconds)
- Price calculation: weight × R$ 79.90/kg
- **Multi-weigh system:** Each weigh is saved to `weighHistory[]`
- Weigh history screen shows all trips to the scale with individual weights and cumulative total

**Drink Menu (7 items):**
- Sucos, Refrigerantes, Água, Cervejas, Vinhos
- Drinks delivered to table (not self-service)
- Independent ordering from food weight

**Comanda Composition:**
- Food total (weight-based)
- Drinks total (item-based)
- Service charge (10%)
- Grand total

---

### 6.6 Drive-Thru — NOOWE Drive

**File:** `src/components/demo/experiences/DriveThruDemo.tsx` (405 lines)
**Restaurant:** NOOWE Drive · Drive-Thru Inteligente · GPS Ativo

#### Journey (7 Stages)

| # | Stage | Screens |
|---|-------|---------|
| 1 | Pedir no caminho | `home`, `restaurant` |
| 2 | Montar pedido | `menu`, `customize`, `cart` |
| 3 | Pagamento antecipado | `payment` |
| 4 | GPS rastreia você | `gps-tracking` |
| 5 | Geofencing (500m) | `geofence` |
| 6 | Pista designada | `lane-assign` |
| 7 | Retirada & avaliação | `pickup`, `done` |

#### Anchor Features

**GPS Tracking Simulation:**
- Distance starts at 5.2km, decrements by 0.3km every 350ms
- Animated radar visualization
- Status bars: speed, direction, traffic conditions
- Auto-triggers geofencing at 0.5km

**Geofencing System (500m trigger):**
- Automatic notification to kitchen: "Finalizar pedido agora"
- Visual animation: concentric circles expanding
- Auto-transitions to lane assignment after 3 seconds

**Lane Assignment:**
- GPS-determined optimal lane
- Visual lane map with arrow indicator
- Lane number + window number
- "Pedido pronto quando você chegar"

**How It Works (4-step onboarding):**
1. Peça (Smartphone icon)
2. Pague (CreditCard icon)
3. Dirija (Car icon)
4. Retire (Check icon)

**Performance Stats:**
- Average time at window: 1:48
- Orders today: 234
- Satisfaction: 98%

#### Menu Data (8 items)

| Category | Items |
|----------|-------|
| Combos (4) | Classic R$42, Chicken R$45, Double R$52, Kids R$32 |
| Individuais (1) | Wrap Grelhado R$28 |
| Sobremesas (1) | Sundae R$14 |
| Bebidas (2) | Café Latte R$12, Milkshake R$22 |

---

### 6.7 Food Truck — Taco Noowe

**File:** `src/components/demo/experiences/FoodTruckDemo.tsx` (447 lines)
**Restaurant:** Taco Noowe · Mexican Street Food Premium

#### Journey (7 Stages)

| # | Stage | Screens |
|---|-------|---------|
| 1 | Descobrir no mapa | `home`, `map` |
| 2 | Ver food truck | `truck-detail`, `schedule` |
| 3 | Fila virtual | `queue` |
| 4 | Montar pedido | `menu`, `item-detail`, `cart` |
| 5 | Pagamento | `payment` |
| 6 | Preparo ao vivo | `waiting` |
| 7 | Retirada & avaliação | `ready`, `rating` |

#### Anchor Features

**Real-Time Map:**
- GPS location display with colored markers for multiple trucks
- Distance indicators (350m, 1.2km, 2.5km)
- Live status (Aberto/Fechado)
- Menu preview from map

**Schedule System:**
- Weekly schedule showing locations by day
- Future stops: Pq. Ibirapuera (Qui), Vila Madalena (Sex), Pinheiros (Sáb)
- Hours per stop

**Virtual Queue:**
- Position starts at 5, auto-decrements every 3 seconds
- "Fique onde quiser e receba a notificação"
- Queue shows: position, party name, estimated wait

**Menu (9 items):**
- Tacos (3): al Pastor R$35, Carnitas R$38, Vegetariano R$30
- Burritos (1): Carne Asada R$38
- Quesadillas (1): Frango R$28
- Petiscos (1): Nachos Supreme R$32
- Sobremesas (1): Churros R$18
- Bebidas (2): Agua Fresca Hibisco R$12, Horchata R$12

---

### 6.8 Chef's Table — Mesa do Chef Noowe

**File:** `src/components/demo/experiences/ChefsTableDemo.tsx` (506 lines)
**Restaurant:** Mesa do Chef Noowe · Chef Ricardo Oliveira · 2 estrelas Michelin

#### Journey (9 Stages)

| # | Stage | Screens |
|---|-------|---------|
| 1 | Descobrir experiência | `home`, `detail` |
| 2 | Reserva exclusiva | `reservation` |
| 3 | Preferências alimentares | `dietary` |
| 4 | Preferências de vinho | `wine-pref` |
| 5 | Pagamento antecipado | `payment` |
| 6 | Contagem regressiva | `countdown` |
| 7 | Dia da experiência | `welcome` |
| 8 | Degustação (3 cursos) | `course-1`, `course-2`, `course-3` |
| 9 | Foto & encerramento | `photo`, `finale` |

#### Anchor Features

**Exclusivity Indicators:**
- Crown icon + "EXCLUSIVO" badge
- 8 seats only
- 3 vagas remaining (warning badge)
- R$ 680/pessoa
- 7 cursos de degustação · Harmonização completa · 3h

**Pre-Experience Flow:**
- **Reservation:** Date selector with available dates, guest count (1-8), scarcity badge
- **Dietary preferences:** Alergias, restrições alimentares (checkboxes)
- **Wine preferences:** Profile questionnaire for sommelier pairing
- **Full prepayment:** Required for confirmation
- **Countdown:** Days/hours until the experience with event details

**Course-by-Course Tasting (Unique Feature):**
- Progress bar: `Curso X de Y`
- Each course screen includes:
  - Course name and category (Amuse-Bouche / Principal / Sobremesa)
  - Chef's narrative and dish story
  - Sommelier wine pairing notes
  - High-fidelity food photography
  - "Next course" progression button

**3 Documented Courses:**
1. **Amuse-Bouche:** Opening with chef's story
2. **Prato Principal:** Wagyu A5 with sommelier harmonization
3. **Sobremesa:** Grand finale soufflé with espumante

**Post-Experience:**
- Photo with the chef
- Signed menu (digital artifact)
- Digital certificate of attendance
- Experience rating

---

### 6.9 Casual Dining — Cantina Noowe

**File:** `src/components/demo/experiences/CasualDiningDemo.tsx` (776 lines)
**Restaurant:** Cantina Noowe · Casual Dining · Italiano · 4.6★ (842)

#### Journey (9 Stages)

| # | Stage | Screens |
|---|-------|---------|
| 1 | Descobrir restaurante | `home`, `restaurant` |
| 2 | Walk-in ou reserva | `entry-choice` |
| 3 | Lista de espera inteligente | `waitlist`, `waitlist-bar` |
| 4 | Modo família | `family-mode`, `family-activities` |
| 5 | Cardápio interativo | `menu`, `item-detail` |
| 6 | Comanda por pessoa | `comanda` |
| 7 | Dividir conta | `split`, `split-by-item` |
| 8 | Gorjeta & pagamento | `tip`, `payment-success` |
| 9 | Avaliação & fidelidade | `review` |

#### Anchor Features

**Smart Waitlist:**
- Entry choice: Walk-in (fila inteligente) vs Reserva
- Queue position auto-decrements every 4 seconds
- **Order from the bar while waiting:** Drinks/snacks go to your future comanda
- Waitlist bar menu: Caipirinha R$22, Cerveja Artesanal R$18, Suco Natural R$12, Pão de Alho R$16

**Family Mode (Unique Feature):**
- Cardápio kids with child-appropriate items
- Cadeirão (high chair) availability
- Kids activity kit (coloring pages, puzzles)
- Priority service for kid items
- Family badges (e.g. "10 jantares em família!")

**Per-Person Ordering:**
- Orders organized by person (Você, Maria, João, Sofia)
- Each person linked with color-coded avatar
- Sofia flagged as `isKid: true`

**Restaurant Profile Badges:**
- Kids Friendly (Baby icon, green)
- Pet OK (Dog icon, primary)
- Garçom na mesa, Reserva opcional, Grupos 10+, Cadeirão, Wi-Fi, Estacionamento

**Menu Data (10 items):**

| Category | Items | Price | Allergens |
|----------|-------|-------|-----------|
| Massas | Lasanha Bolonhesa | R$ 52 | glúten, lactose |
| Pizzas | Pizza Pepperoni | R$ 58 | glúten, lactose |
| Especiais | Risoto de Camarão | R$ 72 | crustáceos, lactose |
| Carnes | Filé à Parmegiana | R$ 65 | glúten, lactose |
| Saladas | Salada Caesar | R$ 38 | glúten, lactose |
| Sobremesas | Tiramisù | R$ 28 | glúten, lactose, ovos |
| Kids | Mini Pizza, Nuggets, Mac & Cheese | R$ 20-25 | varies |
| Entradas | Bruschetta | R$ 26 | glúten |

**4-Mode Split Bill (via DemoSplitBill):**
- Meus Itens, Partes Iguais, Por Item, Valor Fixo

**Review System:**
- 3-category rating: Food, Service, Ambiance (independent 5-star)
- Tags: "Ótima massa", "Garçom atencioso", "Ambiente acolhedor"

---

### 6.10 Pub & Bar — Noowe Tap House

**File:** `src/components/demo/experiences/PubBarDemo.tsx` (800 lines)
**Restaurant:** Noowe Tap House · 20 torneiras artesanais · 4.7★ (1.2k)

#### Journey (9 Stages — 10-Stage Service Blueprint)

| # | Stage | Screens |
|---|-------|---------|
| 1 | Descoberta | `discovery`, `venue` |
| 2 | Chegada & Check-in | `check-in`, `tab-opened` |
| 3 | Convidar amigos | `invite-friends` |
| 4 | Cardápio & Pedido | `menu`, `drink-detail`, `order-status` |
| 5 | Chamar garçom | `call-waiter` |
| 6 | Rodada do grupo | `round-builder`, `round-sent` |
| 7 | Conta ao vivo | `tab-live` |
| 8 | Dividir & Pagar | `split`, `payment` |
| 9 | Pós-experiência | `post` |

#### Anchor Features

**Smart Discovery:**
- Friend presence indicators ("Lucas e Ana frequentam o Noowe Tap House")
- Happy Hour active badge with countdown timer (92 min)
- Real-time occupancy (60%)
- "Mais pedidos agora" trending drinks section

**Digital Tab System:**
- QR check-in at table opens tab automatically
- Card pre-authorization with configurable limit (R$ 300 default)
- Cover charge (R$ 25) converts to consumption credit
- Tab items tracked per person with timestamps

**Happy Hour Engine:**
- Dual pricing: regular price vs HH price (30% off on chopps, 26-30% off on drinks)
- Countdown timer (auto-decrements every minute)
- Visual progress bar showing time remaining
- Savings tracker ("Você economizou R$ X com Happy Hour!")

**Drink Catalog (10 items):**

| Category | Item | Regular | Happy Hour | ABV | IBU |
|----------|------|---------|------------|-----|-----|
| Chopp | IPA Artesanal | R$ 28 | R$ 19 | 6.5% | 55 |
| Chopp | Pilsen Premium | R$ 22 | R$ 15 | 4.8% | 18 |
| Chopp | Stout de Chocolate | R$ 30 | R$ 21 | 5.5% | 35 |
| Chopp | Wheat Beer | R$ 25 | R$ 17 | 5.0% | 12 |
| Drinks | Gin Tônica | R$ 38 | R$ 26 | 12.0% | — |
| Drinks | Aperol Spritz | R$ 35 | R$ 24 | 8.0% | — |
| Drinks | Moscow Mule | R$ 36 | R$ 25 | 10.0% | — |
| Petiscos | Porção de Batata | R$ 32 | R$ 32 | — | — |
| Petiscos | Nachos Supreme | R$ 38 | R$ 38 | — | — |
| Petiscos | Tábua de Frios | R$ 65 | R$ 65 | — | — |

**Drink Detail Card:**
- ABV (Alcohol by Volume), IBU (International Bitterness Units)
- Beer style (e.g. American IPA, German Pilsner)
- Tasting notes and food pairing suggestions
- "New" and "Trending" badges
- Food photo

**Friends & Group Tab:**
- 4 friends: Você (host), Lucas (joined), Ana (joined), Pedro (pending)
- Invite via link share
- Each friend's consumption tracked independently

**Round Builder (Unique Feature):**
- Select a round for the entire group
- Each person can choose their drink
- All drinks sent to the bar in one batch
- "Round sent!" confirmation with item list

**Live Tab:**
- Real-time itemized view: who ordered what, when, price
- Per-person subtotals
- Total with Happy Hour savings
- Tab limit indicator (e.g. R$ 193 / R$ 300)

**Call Waiter:**
- Waiter called with reason selection
- Reasons: "Mais uma rodada", "Conta", "Dúvida", "Outro"
- Confirmation with ETA

**Split Options:**
- By consumption (each pays what they ordered)
- Equal split
- Selective items

---

### 6.11 Club & Balada — NOOWE Club

**File:** `src/components/demo/experiences/ClubDemo.tsx` (801 lines)
**Restaurant:** NOOWE Club · Tech House Night · 4.8★

#### Journey (9 Stages — 10-Stage Service Blueprint)

| # | Stage | Screens |
|---|-------|---------|
| 1 | Descoberta | `discovery`, `event-detail`, `lineup` |
| 2 | Decisão / Ingresso | `tickets`, `digital-ticket`, `promoter-list` |
| 3 | Chegada & Check-in | `virtual-queue`, `check-in` |
| 4 | Cardápio & Pedido | `floor-menu`, `order-pickup` |
| 5 | Camarote VIP | `vip-table`, `vip-map` |
| 6 | Bottle Service | `bottle-service` |
| 7 | Conta & Consumação | `min-spend` |
| 8 | Dividir & Pagar | `split`, `payment` |
| 9 | Pós-experiência | `post`, `rate` |

#### Anchor Features

**Event Discovery:**
- Genre filters: Hoje, Este fds, Tech House, Funk, Sertanejo, Open Bar
- Friend presence indicators ("Pedro e Camila vão no NOOWE Club")
- Real-time occupancy (72%)
- Countdown to event (3h 42min)
- Lot pricing (Lote 2)

**Lineup System:**
- DJ schedule with time slots, genres, and bios
- Headliner badge + gradient card
- 4 DJs: DJ Marcos (Tech House), Special Guest (???), DJ Fernanda (Minimal), Sunset Closing (Deep House)

**Ticket System (3 tiers):**

| Tier | Price | Benefits |
|------|-------|----------|
| Pista | R$ 60 | Entrada + R$60 consumação |
| VIP | R$ 120 | Entrada + área VIP + R$120 consumação |
| Open Bar | R$ 200 | Tudo incluso até 3h |

**Digital Ticket (Anti-Fraud):**
- Animated QR code (anti-screenshot)
- Dynamic color shifts
- Event details embedded

**Promoter List / Birthday:**
- Lista do promoter request
- Birthday entry request with date, group size
- Approval workflow

**Virtual Queue:**
- Queue position starts at 12, auto-decrements every 3 seconds
- Expected wait time
- Push notification on entry

**Floor Menu (order from the dance floor):**
- 6 quick drinks: Gin Tônica R$38, Vodka Red Bull R$35, Cerveja R$18, Água R$8, Shot Tequila R$25, Caipirinha R$30
- Tap to order → pickup at designated bar counter

**VIP Table System:**

| Table | Location | Capacity | Min Spend | Status |
|-------|----------|----------|-----------|--------|
| Premium 01 | Pista Principal | 10 | R$ 3.000 | Available |
| VIP 02 | Mezanino | 8 | R$ 2.000 | Available |
| Lounge 03 | Área Externa | 6 | R$ 1.500 | Available |

**VIP Map:** Visual layout showing table positions, DJ booth, bars, dance floor

**Bottle Service (6 bottles):**

| Bottle | Price | Details |
|--------|-------|---------|
| Absolut Vodka | R$ 350 | 750ml + 4 energéticos |
| Grey Goose | R$ 580 | 750ml Premium + tônica |
| Moët Chandon | R$ 650 | 750ml Brut Impérial |
| Johnnie Walker Black | R$ 480 | 750ml 12 anos |
| Balde Cerveja (6) | R$ 120 | 6 long necks premium |
| Don Julio Reposado | R$ 520 | 750ml + limões |

**Minimum Spend Tracker (Unique Feature):**
- Progress bar: R$ 1,580 / R$ 3,000 (52.7%)
- Visual tracker with remaining amount needed
- Credits from entry ticket applied automatically
- Real-time updates as orders are placed

**Post-Experience:**
- Night summary: hours, drinks consumed, total spent
- Uber integration (request ride)
- Loyalty points earned
- Rate the night (DJ, Ambiente, Atendimento, Drinks)

---

## 7. Shared Payment System

**File:** `src/components/demo/DemoPayment.tsx` (310 lines)

### 7.1 Configuration Interface

```typescript
PaymentConfig {
  title?: string;           // Header title
  subtitle?: string;        // e.g. "Mesa 7 · Bistrô Noowe"
  total: string;            // e.g. "R$ 194.70"
  totalLabel?: string;      // e.g. "Você paga"
  items: PaymentLineItem[]; // Summary breakdown
  loyalty?: PaymentLoyalty;  // Points badge
  showTip?: boolean;        // Tip selector
  defaultTip?: number;      // Default % (10)
  tipBase?: number;         // Base for tip calculation
  fullMethodGrid?: boolean; // 6 methods or 2
  infoBanner?: {};          // Info strip below methods
  ctaLabel?: string;        // Button text
  onBack: () => void;
  onConfirm: () => void;
  estimatedTime?: string;
}
```

### 7.2 Payment Methods

**Full Grid (6 methods):**
| Method | Icon | ID |
|--------|------|----|
| PIX | QrCode | pix |
| Crédito | CreditCard | credit |
| Apple Pay | Smartphone | apple |
| Google Pay | Smartphone | google |
| TAP to Pay | Zap | tap |
| Carteira | Wallet | wallet |

**Simple Mode (2 methods):**
| Method | Detail | Icon |
|--------|--------|------|
| Cartão vinculado | •••• 4242 · Visa | CreditCard |
| PIX | Pagamento instantâneo | QrCode |

### 7.3 Tip System

When `showTip: true`:
- Percentage options: 0%, 5%, 10%, 15%, 20%
- Real-time calculation based on `tipBase`
- Selected percentage highlighted with primary color

### 7.4 Visual Design

- **Gradient header:** `from-primary via-primary/90 to-accent`
- **Total display:** Large font with label above
- **Method cards:** Grid layout with active ring indicator
- **CTA button:** Full-width gradient with shadow-glow

---

## 8. Order Status Tracking System

**File:** `src/components/demo/DemoOrderStatus.tsx` (399 lines)

### 8.1 Step Presets Per Service Type

| Service Type | Steps | Pipeline |
|-------------|-------|----------|
| Fine Dining | 4 | Recebido → Preparando → Pronto → Entregue |
| Quick Service | 4 | Recebido → Preparando → Conferência → Pronto |
| Fast Casual | 5 | Recebido → Base → Montagem → Qualidade → Pronto |
| Café & Bakery | 3 | Recebido → Preparando → Pronto |
| Buffet | 4 | Check-in → Pesando → Extras → Completo |
| Drive-Thru | 4 | Recebido → Preparando → Pronto → Janela |
| Food Truck | 3 | Recebido → Preparando → Pronto |
| Chef's Table | 4 | Recebido → Empratando → Sommelier → Servido |
| Casual Dining | 4 | Recebido → Preparando → Pronto → Entregue |
| Pub & Bar | 3 | Recebido → Preparando → Pronto |
| Club | 3 | Recebido → Preparando → Pronto |

### 8.2 Item Status States

| Status | Label | Badge Class | Dot Style |
|--------|-------|-------------|-----------|
| `ready` | Pronto | bg-success/10 text-success | border-success/30 |
| `preparing` | Preparando | bg-primary/10 text-primary | border-primary/30 |
| `queued` | Na fila | bg-muted text-muted-foreground | border-border |
| `pending` | Na fila | bg-muted text-muted-foreground | border-border |

### 8.3 Features

- Per-item tracking with individual status, ETA, and chef name
- Gradient header with order code, ETA range, progress bar
- Table info card with action button
- Help modal with 3 contextual options
- Optional pickup code display
- Optional action button (e.g. "Fechar Conta")

---

## 9. Split Bill System

**File:** `src/components/demo/DemoSplitBill.tsx` (229 lines)

### 9.1 Split Modes

| Mode | ID | Description | Icon |
|------|-----|-------------|------|
| Meus Itens | `individual` | Each pays what they ordered | User |
| Partes Iguais | `equal` | Equal division | Users |
| Por Item | `selective` | Choose specific items | Receipt |
| Valor Fixo | `fixed` | Define amount to pay | DollarSign |

### 9.2 Person Data

```typescript
SplitPerson {
  id: string;
  name: string;
  color: string;    // Tailwind bg class
  initial: string;  // Avatar letter
  amount?: number;
  paid?: boolean;
  items?: { name: string; price: number }[];
}
```

### 9.3 Visual Design

- Gradient header matching DemoPayment style
- Person avatars with color-coded rings
- Mode selector cards with icon + description
- Summary lines with optional success/warning highlighting
- "Your amount" prominent display
- CTA: "Continuar para Pagamento"

---

## 10. Food Image System

**File:** `src/components/demo/FoodImages.tsx` (193 lines)

### 10.1 Image Sources

All images sourced from **Unsplash CDN** at optimized dimensions (400×400px, `fit=crop`).

### 10.2 Category Coverage (100+ photos)

| Category | Count | Examples |
|----------|-------|---------|
| Burgers & Fast Food | 9 | burger, burger-double, chicken-burger, veggie-burger, fries, onion-rings, nuggets, combo, wrap |
| Milkshakes & Drinks | 7 | milkshake, milkshake-oreo, soda, juice, juice-green, water, sparkling-water |
| Desserts | 12 | sundae, cookie, brownie, cake, churros, tiramisu, apple-pie, souffle, pudding, mousse, fruit-bowl |
| Coffee & Tea | 8 | espresso, cappuccino, filter-coffee, latte, cold-brew, matcha, green-tea, chamomile |
| Bakery | 3 | croissant, pao-queijo, sandwich-caprese |
| Bowls & Healthy | 20 | rice, brown-rice, quinoa, mixed-greens, grilled-chicken, beef, salmon, tofu, shrimp, tomato, corn, cucumber, carrot, beet, edamame, avocado, egg, feta, tahini, pesto |
| Mexican | 6 | taco, burrito, quesadilla, nachos, horchata, hibiscus |
| Italian / Casual | 10 | lasagna, pizza, pizza-pepperoni, risotto, parmegiana, caesar-salad, bruschetta, mac-cheese, pasta |
| Buffet | 3+ | grilled-meat, salad-bar, sushi-platter |
| Beer & Cocktails | 10+ | ipa, pilsen, stout, wheat-beer, gin-tonic, aperol, moscow-mule, beer-bucket, vodka, cocktail |
| Spirits | 4 | champagne, whisky, tequila |

### 10.3 FoodImg Component

```tsx
<FoodImg
  id="burger"           // Photo key
  size="sm" | "md" | "lg" | "xl"
  alt="Smash Burger"
  className="..."
/>
```

Size presets: sm (32×32), md (48×48), lg (64×64), xl (96×96). All use `rounded-xl object-cover`.

---

## 11. Visual Design System

### 11.1 Design Tokens (Semantic)

All colors use HSL-based semantic tokens from `index.css`:

| Token | Usage |
|-------|-------|
| `--background` | Page and card backgrounds |
| `--foreground` | Primary text |
| `--primary` | CTAs, active states, highlights |
| `--primary-foreground` | Text on primary backgrounds |
| `--muted` | Inactive backgrounds, dividers |
| `--muted-foreground` | Secondary text, descriptions |
| `--accent` | Gold/premium highlights |
| `--success` | Confirmations, "ready" states |
| `--warning` | Queue alerts, HH timers |
| `--destructive` | Errors, logout, badge alerts |
| `--border` | Card borders, dividers |
| `--card` | Card surfaces |

### 11.2 Typography

- **Display:** `font-display` class for headings
- **Body:** System font stack
- Sizes: `text-[9px]` → `text-2xl`
- Weight: `font-medium`, `font-semibold`, `font-bold`

### 11.3 Animations

| Animation | Usage |
|-----------|-------|
| `animate-pulse` | GuidedHint, loading states |
| `animate-spin` | Loader2 icons during API simulation |
| `animate-bounce` | QR scanner line |
| `shadow-glow` | Primary CTA buttons |
| `transition-transform` | Hover effects on cards |
| `backdrop-blur` | Overlay elements, bottom nav |

### 11.4 Layout Patterns

- **Container:** `px-5 pb-4` standard padding
- **Cards:** `rounded-xl border border-border bg-card p-3/p-4`
- **Gradient headers:** `bg-gradient-to-br from-primary via-primary/90 to-accent`
- **Category chips:** `px-4 py-2 rounded-full text-xs font-medium`
- **FAB (QR scan):** Elevated circle with `-mt-5` offset + `shadow-glow`

---

## 12. File Map & Architecture Diagram

```
src/
├── contexts/
│   └── DemoContext.tsx              # Simulation engine (456 lines)
│
├── components/demo/
│   ├── DemoShared.tsx               # PhoneShell, BottomNav, GuidedHint, ItemIcon (184 lines)
│   ├── DemoI18n.tsx                 # i18n engine PT/EN/ES (6,483 lines)
│   ├── DemoOrderStatus.tsx          # Shared order tracking (399 lines)
│   ├── DemoPayment.tsx              # Shared payment screen (310 lines)
│   ├── DemoSplitBill.tsx            # Shared split bill screen (229 lines)
│   ├── DemoPaymentSuccess.tsx       # Shared success screen (150 lines)
│   ├── FoodImages.tsx               # Unsplash photo system (193 lines)
│   │
│   └── experiences/
│       ├── FineDiningDemo.tsx        # 1,205 lines · 18 screens · 11 journey stages
│       ├── QuickServiceDemo.tsx      #   621 lines ·  9 screens ·  8 journey stages
│       ├── FastCasualDemo.tsx        #   618 lines · 12 screens ·  7 journey stages
│       ├── CafeBakeryDemo.tsx        #   573 lines ·  9 screens ·  6 journey stages
│       ├── BuffetDemo.tsx            #   407 lines · 10 screens ·  7 journey stages
│       ├── DriveThruDemo.tsx         #   405 lines · 11 screens ·  7 journey stages
│       ├── FoodTruckDemo.tsx         #   447 lines · 12 screens ·  7 journey stages
│       ├── ChefsTableDemo.tsx        #   506 lines · 13 screens ·  9 journey stages
│       ├── CasualDiningDemo.tsx      #   776 lines · 15 screens ·  9 journey stages
│       ├── PubBarDemo.tsx            #   800 lines · 15 screens ·  9 journey stages
│       └── ClubDemo.tsx              #   801 lines · 18 screens ·  9 journey stages

TOTAL: ~13,375 lines of experience code
       ~7,949 lines of shared infrastructure
       ~21,324 lines total demo client system
```

### Cross-Experience Dependency Graph

```
FineDiningDemo ──┬── DemoContext (restaurant, menu, cart, orders, loyalty)
QuickServiceDemo ├── DemoShared (PhoneShell, GuidedHint, ItemIcon, BottomNav)
FastCasualDemo   ├── DemoOrderStatus (order tracking presets)
CafeBakeryDemo   ├── DemoPayment (payment methods, tip, loyalty)
BuffetDemo       ├── DemoPaymentSuccess (confirmation, rewards)
DriveThruDemo    ├── DemoSplitBill (split modes, person tracking)
FoodTruckDemo    ├── FoodImages (100+ Unsplash photos)
ChefsTableDemo   └── DemoI18n (PT/EN/ES translations)
CasualDiningDemo
PubBarDemo
ClubDemo
```

---

> **Document Classification:** Internal Technical Reference
> **Version:** 4.0
> **Maintained by:** NOOWE Engineering Team
> **Review Cycle:** Per sprint / major feature release
