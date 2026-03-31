# KDS (Kitchen Display System) — Documentação Técnica

> Documento gerado em 2026-03-29 | Plataforma NOOWE
> Cobre: arquitetura backend, telas mobile, fluxo de dados em tempo real e funcionalidades.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura Backend](#2-arquitetura-backend)
3. [Telas do App Restaurant](#3-telas-do-app-restaurant)
4. [Fluxo de Dados em Tempo Real](#4-fluxo-de-dados-em-tempo-real)
5. [Funcionalidades Implementadas](#5-funcionalidades-implementadas)
6. [Referência de Arquivos](#6-referência-de-arquivos)

---

## 1. Visão Geral

O KDS é o sistema de exibição de pedidos para a cozinha e bar dos restaurantes. Ele permite que chefs, cozinheiros e barmen visualizem pedidos em tempo real, atualizem status de preparação e acompanhem tempos.

### Componentes

```
┌─────────────┐     WebSocket      ┌──────────────┐     REST API    ┌────────────┐
│  Client App │ ───────────────→   │   Backend    │  ←───────────── │ Restaurant │
│  (Pedidos)  │    order:created   │   NestJS     │   GET /kds/*    │    App     │
└─────────────┘                    │              │   PATCH status  │  (3 telas) │
                                   │  PostgreSQL  │                 │            │
                                   │  Redis/WS    │ ──────────────→ │  KDS       │
                                   └──────────────┘  order:updated  │  BarmanKDS │
                                                                    │  CookStn   │
                                                                    └────────────┘
```

### 3 Telas KDS

| Tela | Público | Propósito |
|------|---------|-----------|
| **KDSScreen** | Chef / Cozinheiro geral | Todos os pedidos da cozinha (exclui bebidas) |
| **BarmanKDSScreen** | Barman | Apenas pedidos de bebidas (drinks, cerveja, vinho, cocktails) |
| **CookStationScreen** | Cozinheiro de estação | Pedidos filtrados por estação (grelhados, frios, massas) |

---

## 2. Arquitetura Backend

### 2.1 Entidades

#### Order Entity
**Arquivo:** `platform/backend/src/modules/orders/entities/order.entity.ts`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `restaurant_id` | UUID | FK → Restaurant |
| `user_id` | UUID | FK → Profile (cliente) |
| `table_id` | UUID | FK → Table (nullable) |
| `waiter_id` | UUID | FK → Profile (garçom, nullable) |
| `status` | OrderStatus | Estado atual do pedido |
| `order_type` | OrderType | delivery, pickup, dine_in, tab, table_tab |
| `party_size` | number | Tamanho do grupo (default: 1) |
| `subtotal` | decimal | Subtotal dos itens |
| `tax_amount` | decimal | Impostos |
| `tip_amount` | decimal | Gorjeta |
| `discount_amount` | decimal | Desconto aplicado |
| `total_amount` | decimal | Total final |
| `special_instructions` | text | Instruções especiais do pedido |
| `estimated_ready_at` | timestamp | Previsão de entrega |
| `actual_ready_at` | timestamp | Quando ficou pronto (preenchido automaticamente) |
| `completed_at` | timestamp | Quando foi concluído |
| `is_shared` | boolean | Se é pedido compartilhado |
| `metadata` | JSONB | Dados flexíveis |

**Índices:** restaurant_id, user_id, status, created_at (otimizados para consultas KDS)

#### OrderItem Entity
**Arquivo:** `platform/backend/src/modules/orders/entities/order-item.entity.ts`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `order_id` | UUID | FK → Order |
| `menu_item_id` | UUID | FK → MenuItem |
| `quantity` | number | Quantidade |
| `unit_price` | decimal | Preço unitário |
| `total_price` | decimal | Preço total (qty × unit) |
| `status` | OrderItemStatus | pending, preparing, ready, delivered, cancelled |
| `customizations` | JSONB | Array de {name, value, price_modifier} |
| `special_instructions` | text | Instruções do item específico |
| `ordered_by` | UUID | Quem do grupo pediu (para pedidos compartilhados) |
| `prepared_by` | UUID | Quem preparou |
| `prepared_at` | timestamp | Quando foi preparado |

### 2.2 Enums de Status

#### OrderStatus — Fluxo de Estados

```
PENDING ──→ CONFIRMED ──→ PREPARING ──→ READY ──→ COMPLETING ──→ COMPLETED
                                          │           │
                                          │           └──→ DELIVERING (delivery)
                                          │
                                    OPEN_FOR_ADDITIONS (comanda aberta)
                                          │
    ← ← ← ← CANCELLED (qualquer momento) ← ← ← ← ←
```

| Status | Descrição | Quem altera |
|--------|-----------|-------------|
| `PENDING` | Pedido criado, aguardando confirmação | Sistema |
| `CONFIRMED` | Confirmado pelo restaurante | Garçom/Manager |
| `PREPARING` | Em preparação na cozinha/bar | Chef/Barman (via KDS) |
| `READY` | Pronto para servir/retirar | Chef/Barman (via KDS) |
| `COMPLETING` | Em processo de finalização | Garçom |
| `DELIVERING` | Saiu para entrega | Sistema |
| `COMPLETED` | Entregue ao cliente | Garçom/Sistema |
| `CANCELLED` | Cancelado | Qualquer momento |
| `OPEN_FOR_ADDITIONS` | Comanda aberta — aceita novos itens | Garçom |

#### OrderItemStatus — Status por Item

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando preparação |
| `preparing` | Em preparação |
| `ready` | Pronto |
| `delivered` | Entregue ao cliente |
| `cancelled` | Cancelado |

### 2.3 KDS Service

**Arquivo:** `platform/backend/src/modules/orders/kds.service.ts`

```typescript
// Busca pedidos para o KDS, filtrados por tipo de estação
async getKdsOrders(params: {
  type?: 'kitchen' | 'bar';
  status?: string;
  restaurant_id?: string;
}): Promise<KdsOrder[]>
```

**Lógica de Roteamento por Estação:**

| Tipo | Categorias incluídas | Categorias excluídas |
|------|---------------------|---------------------|
| `kitchen` | Todas exceto bar | drinks, beverages, cocktails, beer, wine |
| `bar` | Apenas bar | Tudo que não é bebida |

**Interface de Saída (KdsOrder):**

```typescript
interface KdsOrder {
  id: string;
  order_number: string;        // #<8-primeiros-chars-do-id>
  table_number: string;        // ou 'N/A' para não-dine-in
  items: KdsOrderItem[];
  status: string;
  created_at: Date;
  priority: 'normal' | 'high' | 'urgent';
  waiter_name: string;
}

interface KdsOrderItem {
  id: string;
  name: string;
  quantity: number;
  instructions: string | null;
  modifiers: Record<string, any> | null;
}
```

**Sistema de Prioridade:**

| Prioridade | Tempo desde criação | Cor visual |
|-----------|-------------------|-----------|
| `normal` | 0–15 minutos | Verde/neutro |
| `high` | 15–30 minutos | Amarelo/warning |
| `urgent` | 30+ minutos | Vermelho/error |

### 2.4 Endpoints REST

**Arquivo:** `platform/backend/src/modules/orders/orders.controller.ts`

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/orders/kds/kitchen` | OWNER, MANAGER, CHEF | Pedidos da cozinha (exclui bebidas) |
| `GET` | `/orders/kds/bar` | OWNER, MANAGER, BARMAN | Pedidos do bar (apenas bebidas) |
| `PATCH` | `/orders/:id/status` | OWNER, MANAGER, CHEF, BARMAN, WAITER | Atualizar status do pedido |
| `POST` | `/orders/:id/items` | OWNER, MANAGER, WAITER | Adicionar itens (comanda aberta) |
| `PATCH` | `/orders/:id/open` | OWNER, MANAGER, WAITER | Abrir comanda para adições |

**Query Parameters (KDS):**

```typescript
@Query() type?: 'kitchen' | 'bar';
@Query() status?: 'pending' | 'preparing' | 'ready';
@Query() restaurant_id?: string;
```

### 2.5 WebSocket Gateway

**Arquivo:** `platform/backend/src/modules/orders/orders.gateway.ts`

| Namespace | Eventos | Descrição |
|-----------|---------|-----------|
| `/orders` | `order:created` | Novo pedido criado — enviado para sala do restaurante |
| `/orders` | `order:updated` | Status alterado — enviado para restaurante + cliente |

**Rooms:**
- `restaurant:{restaurantId}` — todos os staff conectados do restaurante
- `user:{userId}` — cliente específico (para notificar status do seu pedido)

**Autenticação:** JWT no handshake da conexão WebSocket.

---

## 3. Telas do App Restaurant

### 3.1 KDSScreen — Cozinha Geral

**Arquivo:** `platform/mobile/apps/restaurant/src/screens/kds/KDSScreen.tsx`

**Público:** Chef, cozinheiro principal

**Layout:**
```
┌──────────────────────────────────────┐
│  Kitchen Display System              │
│  [All] [Pending] [Preparing]         │  ← Filtros por status
├──────────────────────────────────────┤
│ ┌────────────┐  ┌────────────┐      │
│ │ #a1b2c3d4  │  │ #e5f6g7h8  │      │  ← Grid 2 colunas
│ │ Mesa: 5    │  │ Mesa: 12   │      │
│ │ ⏱ 8 min   │  │ ⏱ 23 min   │      │  ← Timer (vermelho se > 20min)
│ │            │  │ 🔴 URGENT  │      │
│ │ 2x Filé   │  │ 1x Risoto  │      │
│ │ 1x Salada  │  │ ⚠ Sem sal  │      │  ← Instruções especiais
│ │            │  │            │      │
│ │ [Start ▶]  │  │ [Ready ✓]  │      │  ← Botões de ação
│ └────────────┘  └────────────┘      │
└──────────────────────────────────────┘
```

**Funcionalidades:**
- Grid de 2 colunas com cards de pedidos
- Filtro por status: All / Pending / Preparing
- Timer de tempo decorrido (vermelho após 20 min)
- Borda vermelha no card se pedido urgente (> 20 min)
- Ícone de tipo de pedido (delivery/pickup/dine-in)
- Instruções especiais com ícone ⚠️
- **Ação "Start Preparing":** Status confirmed → preparing
- **Ação "Ready!":** Status preparing → ready
- **Real-time:** WebSocket `order:new` e `order:updated`
- Empty state: ícone de chapéu de chef + "No active orders"

**Cores de Status:**
| Status | Cor |
|--------|-----|
| pending | warning (amarelo) |
| confirmed | info (azul) |
| preparing | secondary (roxo) |
| ready | success (verde) |
| cancelled | error (vermelho) |

### 3.2 BarmanKDSScreen — Bar

**Arquivo:** `platform/mobile/apps/restaurant/src/screens/barman-kds/BarmanKDSScreen.tsx`

**Público:** Barman

**Layout:**
```
┌──────────────────────────────────────┐
│  Bar Display System                  │
├──────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │ ⏱ 3  │  │ 🧪 5 │  │ ✓ 2  │      │  ← Stats cards
│  │Pend. │  │Prep. │  │Ready │      │
│  └──────┘  └──────┘  └──────┘      │
├──────────────────────────────────────┤
│  [All] [⏱ Pending] [🧪 Prep] [✓]    │  ← Filtros SegmentedButtons
├──────────────────────────────────────┤
│ ┌────────────────────────────────┐   │
│ │ #a1b2 | Mesa 7  ⏱ 5min 🟢    │   │  ← Header + timer + prioridade
│ │ 👤 João (garçom)              │   │  ← Nome do garçom
│ │                                │   │
│ │ 2x Caipirinha                  │   │
│ │   [Limão] [Cachaça Especial]   │   │  ← Modificadores como chips
│ │   ⚠ Pouco gelo                │   │  ← Instrução especial
│ │                                │   │
│ │ 1x Cerveja Artesanal          │   │
│ │   [IPA] [Copo 500ml]          │   │
│ │                                │   │
│ │ [▶ Iniciar Preparo]           │   │  ← Botão de ação
│ └────────────────────────────────┘   │
└──────────────────────────────────────┘
```

**Funcionalidades:**
- Stats cards no topo: contagem por status (pending/preparing/ready)
- Filtros: All, Pending (⏱), Preparing (🧪), Ready (✓)
- Timer com chip colorido por prioridade (urgent=vermelho, high=amarelo, normal=verde)
- Badge "URGENT" se prioridade urgente
- Nome do garçom responsável
- **Items com modificadores** exibidos como chips coloridos
- **Instruções especiais** em fundo warning com texto itálico
- **Cancelar item individual:** Botão ❌ (apenas se order está preparing)
  - Chama `ApiService.cancelBarItem(orderId, itemId, reason)`
- **Ação "Iniciar Preparo":** pending → preparing (ícone play, cor info)
- **Ação "Concluído":** preparing → ready (ícone check, cor success)
- **Pedido Ready:** Card com fundo verde claro, sem botão de ação
- **Auto-refresh:** Atualiza a cada 30 segundos
- **Pull-to-refresh:** RefreshControl
- Empty state: 🍹 cocktail + "Nenhum Pedido"

### 3.3 CookStationScreen — Estações da Cozinha

**Arquivo:** `platform/mobile/apps/restaurant/src/screens/cook/CookStationScreen.tsx`

**Público:** Cozinheiro de estação específica

**Estações Configuradas:**

| Estação | Emoji | Keywords de Filtro |
|---------|-------|--------------------|
| **Grelhados** | 🔥 | Filé, Salmão, Polvo, Picanha, Costela |
| **Frios** | ❄️ | Tartare, Ceviche, Burrata, Carpaccio, Salada |
| **Massas** | 🍝 | Risoto, Ravioli, Fettuccine, Penne, Gnocchi |

**Layout:**
```
┌──────────────────────────────────────┐
│  Cook Station                        │
├──────────────────────────────────────┤
│  [🔥 Grelhados (5)] [❄️ Frios (2)] [🍝 Massas (3)]  │  ← Tabs de estação
├──────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │ ⏱ 3  │  │ 🔥 2 │  │ ✓ 1  │      │  ← Stats por estação
│  │Pend. │  │Prep. │  │Ready │      │
│  └──────┘  └──────┘  └──────┘      │
├──────────────────────────────────────┤
│ ┌────────────────────────────────┐   │
│ │ 🔴 LATE                       │   │  ← Alerta se > 15min
│ │ Mesa 3          ⏱ 18min       │   │  ← Mesa grande + timer vermelho
│ │ [PREPARING]                    │   │
│ │                                │   │
│ │ ┌────┐                        │   │
│ │ │ 2x │ Filé Mignon            │   │  ← Badge de quantidade 48x48
│ │ └────┘ ⚠ Ao ponto             │   │
│ │                                │   │
│ │ ┌────┐                        │   │
│ │ │ 1x │ Picanha                │   │
│ │ └────┘                        │   │
│ │                                │   │
│ │ [████████ PRONTO! ████████]   │   │  ← Botão grande 56pt
│ └────────────────────────────────┘   │
└──────────────────────────────────────┘
```

**Funcionalidades:**
- **Tabs de estação** com contagem de pedidos: emoji + nome + "(N)"
- Tab ativa com cor primária, inativas com cor terciária
- **Stats por estação** selecionada (pending/preparing/ready)
- **Filtragem por keywords:** Mostra apenas itens cujo nome contém keyword da estação
- **Alerta LATE:** 🔴 badge em vermelho se pedido > 15 minutos
- **Timer vermelho** quando acima do threshold
- **Badge de quantidade** (48x48px): "2x" em box destacado
- **Ordenação:** Ready → Preparing → Confirmed/Pending (ready primeiro). Dentro do mesmo status: mais antigo primeiro (FIFO)
- **Layout responsivo:** 2 colunas em tablet (≥ 768px), 1 coluna em phone
- **Ação "Começar a Preparar":** confirmed → preparing (fundo warning)
- **Ação "Pronto!":** preparing → ready (fundo success)
- Botões grandes: full-width, 56pt altura, uppercase, bold
- **Real-time:** WebSocket `order:new`, `order:updated`
- **Pull-to-refresh**
- **Constante:** `KITCHEN_LATE_MINUTES = 15`
- Empty state: 👨‍🍳 + "Nenhum Ticket" + mensagem contextual

---

## 4. Fluxo de Dados em Tempo Real

### 4.1 Criação de Pedido

```
1. Cliente (App Client) cria pedido
   ↓
2. POST /orders → Backend cria Order + OrderItems (transação)
   ↓
3. EventsGateway.notifyOrderCreated(order)
   ↓
4. WebSocket emite "order:created" → sala "restaurant:{id}"
   ↓
5. KDS screens recebem evento → adicionam pedido na lista
```

### 4.2 Atualização de Status

```
1. Chef/Barman pressiona botão no KDS
   ↓
2. PATCH /orders/:id/status { status: 'preparing' }
   ↓
3. Backend atualiza Order.status
   │  → Se READY: preenche actual_ready_at
   │  → Se COMPLETED: preenche completed_at + loyalty points
   ↓
4. OrdersGateway.notifyOrderUpdated(order)
   ↓
5. WebSocket emite "order:updated" para:
   │  → "restaurant:{id}" (outros staff)
   │  → "user:{userId}" (cliente recebe notificação)
   ↓
6. Todas as telas KDS conectadas atualizam o pedido
```

### 4.3 Comanda Aberta

```
1. Garçom abre comanda: PATCH /orders/:id/open
   ↓
2. Status → OPEN_FOR_ADDITIONS
   ↓
3. Garçom adiciona itens: POST /orders/:id/items
   ↓
4. Backend adiciona OrderItems + recalcula totais (transação)
   ↓
5. KDS atualiza com novos itens
```

---

## 5. Funcionalidades Implementadas

### 5.1 Funcionalidades Core

| Feature | Status | Detalhes |
|---------|--------|---------|
| Exibição de pedidos em tempo real | ✅ | WebSocket + REST fallback |
| Filtro por status (pending/preparing/ready) | ✅ | Nas 3 telas |
| Roteamento cozinha vs bar | ✅ | Backend filtra por categorias |
| Estações de cozinha (grelhados/frios/massas) | ✅ | Filtro por keywords no frontend |
| Timer de tempo decorrido | ✅ | Atualizado em tempo real |
| Sistema de prioridade (normal/high/urgent) | ✅ | Backend calcula, frontend exibe |
| Alerta de pedido atrasado | ✅ | > 15min (CookStation), > 20min (KDS geral) |
| Atualização de status via botão | ✅ | confirmed → preparing → ready |
| Instruções especiais destacadas | ✅ | Ícone ⚠️ + fundo warning |
| Modificadores/customizações | ✅ | Chips coloridos no BarmanKDS |
| Cancelamento de item individual | ✅ | Apenas no BarmanKDS durante preparing |
| Comanda aberta (adicionar itens) | ✅ | OPEN_FOR_ADDITIONS status |
| Pull-to-refresh | ✅ | Nas 3 telas |
| Auto-refresh periódico | ✅ | 30s no BarmanKDS |
| Layout responsivo (tablet/phone) | ✅ | CookStation: 2 cols tablet, 1 col phone |
| Empty state | ✅ | Ícone + mensagem contextual por tela |
| Controle de acesso (RBAC) | ✅ | OWNER/MANAGER/CHEF/BARMAN por endpoint |
| Data minimization (LGPD) | ✅ | Dados de delivery excluídos no KDS |
| Graceful shutdown (WebSocket) | ✅ | beforeApplicationShutdown() no gateway |

### 5.2 Segurança

| Feature | Status |
|---------|--------|
| JWT auth no WebSocket handshake | ✅ |
| RBAC por endpoint (roles: CHEF, BARMAN, etc.) | ✅ |
| Serialização LGPD (exclui dados desnecessários) | ✅ |
| Transações atômicas (criação de pedido + itens) | ✅ |
| Circuit breaker no gateway shutdown | ✅ |

---

## 6. Referência de Arquivos

### Backend

| Arquivo | Descrição |
|---------|-----------|
| `backend/src/modules/orders/entities/order.entity.ts` | Entidade Order |
| `backend/src/modules/orders/entities/order-item.entity.ts` | Entidade OrderItem |
| `backend/src/modules/orders/entities/order-guest.entity.ts` | Entidade OrderGuest (pedidos compartilhados) |
| `backend/src/modules/orders/orders.service.ts` | Lógica de negócio de pedidos |
| `backend/src/modules/orders/orders.controller.ts` | Endpoints REST (inclui /kds/*) |
| `backend/src/modules/orders/orders.gateway.ts` | WebSocket namespace /orders |
| `backend/src/modules/orders/kds.service.ts` | Serviço KDS (filtro cozinha/bar) |
| `backend/src/modules/orders/order-additions.service.ts` | Comanda aberta |
| `backend/src/modules/orders/helpers/kds-formatter.helper.ts` | Formatação de pedidos para KDS |
| `backend/src/modules/orders/helpers/order-calculator.helper.ts` | Cálculo de prioridade |
| `backend/src/modules/orders/dto/` | DTOs de validação |
| `backend/src/common/enums/order-status.enum.ts` | Enum OrderStatus |

### Mobile Restaurant App

| Arquivo | Descrição |
|---------|-----------|
| `restaurant/src/screens/kds/KDSScreen.tsx` | Tela KDS geral (cozinha) |
| `restaurant/src/screens/barman-kds/BarmanKDSScreen.tsx` | Tela KDS do bar |
| `restaurant/src/screens/cook/CookStationScreen.tsx` | Tela de estação específica |
| `restaurant/src/navigation/index.tsx` | Registro das rotas KDS no drawer |

### Mobile Shared

| Arquivo | Descrição |
|---------|-----------|
| `shared/services/api.ts` | ApiService.getKitchenOrders(), getBarOrders(), updateOrderStatus() |
| `shared/services/socket.ts` | Conexão WebSocket |
| `shared/hooks/useOrdersQuery.ts` | Hook TanStack Query para pedidos |
