# KDS Brain — Plano de desenvolvimento para Claude Code

> **Objetivo:** Evoluir o KDS existente para um sistema autônomo de orquestração de cozinha com integração de delivery.
> **Regra de ouro:** Nunca reescrever o que funciona. Sempre estender, adicionar campos, criar novos módulos ao lado dos existentes.
> **Data:** Março 2026

---

## CONTEXTO DO PROJETO EXISTENTE

### Stack técnica (manter exatamente)

- **Backend:** NestJS + TypeScript + PostgreSQL + TypeORM + Redis
- **Mobile:** React Native (apps separados: `restaurant`, `client`)
- **Shared:** Pasta shared com services e hooks reutilizáveis
- **Real-time:** WebSocket via NestJS Gateway (namespace `/orders`)
- **Auth:** JWT + RBAC (roles: OWNER, MANAGER, CHEF, BARMAN, WAITER)
- **Data fetching (mobile):** TanStack Query (React Query)
- **Estado:** Hooks customizados com React Query + WebSocket listeners

### Estrutura de pastas existente (não alterar, apenas adicionar)

```
platform/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── orders/
│       │   │   ├── entities/
│       │   │   │   ├── order.entity.ts
│       │   │   │   ├── order-item.entity.ts
│       │   │   │   └── order-guest.entity.ts
│       │   │   ├── orders.service.ts
│       │   │   ├── orders.controller.ts
│       │   │   ├── orders.gateway.ts
│       │   │   ├── kds.service.ts
│       │   │   ├── order-additions.service.ts
│       │   │   ├── helpers/
│       │   │   │   ├── kds-formatter.helper.ts
│       │   │   │   └── order-calculator.helper.ts
│       │   │   └── dto/
│       │   └── ... (outros módulos)
│       └── common/
│           └── enums/
│               └── order-status.enum.ts
├── mobile/
│   ├── apps/
│   │   └── restaurant/
│   │       └── src/
│   │           ├── screens/
│   │           │   ├── kds/
│   │           │   │   └── KDSScreen.tsx
│   │           │   ├── barman-kds/
│   │           │   │   └── BarmanKDSScreen.tsx
│   │           │   └── cook/
│   │           │       └── CookStationScreen.tsx
│   │           └── navigation/
│   │               └── index.tsx
│   └── packages/
│       └── shared/
│           ├── services/
│           │   ├── api.ts
│           │   └── socket.ts
│           └── hooks/
│               └── useOrdersQuery.ts
```

### Entidades existentes (campos atuais — NÃO remover nenhum)

**Order entity** — campos que já existem:
```typescript
id: UUID (PK)
restaurant_id: UUID (FK → Restaurant)
user_id: UUID (FK → Profile)
table_id: UUID (FK → Table, nullable)
waiter_id: UUID (FK → Profile, nullable)
status: OrderStatus
order_type: OrderType // delivery, pickup, dine_in, tab, table_tab
party_size: number
subtotal: decimal
tax_amount: decimal
tip_amount: decimal
discount_amount: decimal
total_amount: decimal
special_instructions: text
estimated_ready_at: timestamp
actual_ready_at: timestamp
completed_at: timestamp
is_shared: boolean
metadata: JSONB
created_at: timestamp
updated_at: timestamp
```

**OrderItem entity** — campos que já existem:
```typescript
id: UUID (PK)
order_id: UUID (FK → Order)
menu_item_id: UUID (FK → MenuItem)
quantity: number
unit_price: decimal
total_price: decimal
status: OrderItemStatus // pending, preparing, ready, delivered, cancelled
customizations: JSONB // Array de {name, value, price_modifier}
special_instructions: text
ordered_by: UUID
prepared_by: UUID
prepared_at: timestamp
```

**OrderStatus enum** — valores existentes:
```typescript
PENDING, CONFIRMED, PREPARING, READY, COMPLETING, DELIVERING, COMPLETED, CANCELLED, OPEN_FOR_ADDITIONS
```

**OrderItemStatus enum** — valores existentes:
```typescript
pending, preparing, ready, delivered, cancelled
```

### Endpoints KDS existentes (manter funcionando)

```
GET  /orders/kds/kitchen   → roles: OWNER, MANAGER, CHEF
GET  /orders/kds/bar       → roles: OWNER, MANAGER, BARMAN
PATCH /orders/:id/status   → roles: OWNER, MANAGER, CHEF, BARMAN, WAITER
POST  /orders/:id/items    → roles: OWNER, MANAGER, WAITER
PATCH /orders/:id/open     → roles: OWNER, MANAGER, WAITER
```

### WebSocket existente

```typescript
// Namespace: /orders
// Rooms: restaurant:{restaurantId}, user:{userId}
// Eventos: order:created, order:updated
// Auth: JWT no handshake
```

### Padrão de API service no mobile (manter estilo)

```typescript
// shared/services/api.ts — padrão existente
class ApiService {
  static async getKitchenOrders(restaurantId: string): Promise<KdsOrder[]> { ... }
  static async getBarOrders(restaurantId: string): Promise<KdsOrder[]> { ... }
  static async updateOrderStatus(orderId: string, status: string): Promise<void> { ... }
}
```

### Padrão de hooks no mobile (manter estilo)

```typescript
// shared/hooks/useOrdersQuery.ts — usa TanStack Query
// Padrão: useQuery + invalidação via WebSocket
```

---

## REGRAS DE DESENVOLVIMENTO

### i18n — obrigatório em TODO código novo

**Backend:** Mensagens de erro e responses devem usar chaves i18n.

```typescript
// Padrão para mensagens no backend
// Criar: backend/src/common/i18n/kds.i18n.ts

export const KDS_MESSAGES = {
  ITEM_NOT_FOUND: 'kds.errors.item_not_found',
  STATION_NOT_FOUND: 'kds.errors.station_not_found',
  INVALID_STATUS_TRANSITION: 'kds.errors.invalid_status_transition',
  ITEM_UNAVAILABLE: 'kds.errors.item_unavailable',
  CAPACITY_EXCEEDED: 'kds.errors.capacity_exceeded',
  PLATFORM_SYNC_FAILED: 'kds.errors.platform_sync_failed',
} as const;
```

**Mobile:** Todas as strings visíveis ao usuário devem ser chaves i18n. Nenhuma string hardcoded em tela.

```typescript
// Criar arquivo de traduções para KDS
// shared/i18n/locales/pt-BR/kds.json
{
  "kds": {
    "screen_title": "Kitchen Display",
    "bar_title": "Bar Display",
    "station_title": "Estação: {{stationName}}",
    "chef_title": "Chef View",
    "countdown": {
      "remaining": "{{minutes}} min restantes",
      "late": "{{minutes}} min atrasado",
      "waiting_fire": "Começa em {{minutes}} min"
    },
    "convergence": {
      "progress": "{{ready}}/{{total}} prontos",
      "waiting_for": "Aguardando: {{stations}}"
    },
    "actions": {
      "swipe_ready": "Swipe → pronto",
      "swipe_undo": "← undo",
      "mark_86": "Marcar esgotado"
    },
    "status": {
      "pending": "Pendente",
      "preparing": "Preparando",
      "ready": "Pronto",
      "delivered": "Entregue",
      "cancelled": "Cancelado",
      "waiting_fire": "Aguardando"
    },
    "order_source": {
      "noowe": "NOOWE",
      "ifood": "iFood",
      "rappi": "Rappi",
      "ubereats": "Uber Eats"
    },
    "courses": {
      "appetizer": "Entrada",
      "main": "Principal",
      "dessert": "Sobremesa",
      "drink": "Bebida",
      "side": "Acompanhamento"
    },
    "chef_view": {
      "active_tables": "Mesas ativas",
      "delivery_queue": "Delivery na fila",
      "avg_time": "Tempo médio",
      "alerts": "Alertas",
      "station_load": "{{count}} ativos",
      "station_late": "{{count}} atrasados"
    },
    "empty_state": {
      "kitchen": "Nenhum pedido ativo",
      "bar": "Nenhum pedido",
      "station": "Nenhum ticket"
    },
    "delivery": {
      "rider_eta": "Rider chega em {{minutes}} min",
      "pickup": "Retirada"
    },
    "item_86": {
      "title": "Item esgotado",
      "confirm": "Confirmar indisponibilidade?",
      "success": "Item marcado como esgotado",
      "restored": "Item disponível novamente"
    },
    "alerts": {
      "new_order": "Novo pedido",
      "item_late": "Item atrasado",
      "rider_arriving": "Rider chegando",
      "capacity_warning": "Cozinha sobrecarregada"
    }
  }
}

// shared/i18n/locales/en/kds.json — mesma estrutura em inglês
// shared/i18n/locales/es/kds.json — mesma estrutura em espanhol
```

**Uso nos componentes (padrão):**

```typescript
// Em todo componente React Native, usar o hook de i18n do projeto
// Nunca: <Text>Nenhum pedido</Text>
// Sempre: <Text>{t('kds.empty_state.kitchen')}</Text>
```

### Migrações de banco

- Cada sprint gera seus arquivos de migration do TypeORM
- Migrations devem ser reversíveis (up + down)
- Nomear: `{timestamp}-kds-brain-sprint-{N}-{descricao}.ts`
- Nunca alterar migrations anteriores

### Testes

- Todo service novo do Brain deve ter testes unitários
- Os adapters de plataforma devem ter testes com mocks das APIs externas
- Testar as transições de status válidas e inválidas

### Retrocompatibilidade

- Os endpoints `/orders/kds/kitchen` e `/orders/kds/bar` existentes DEVEM continuar funcionando
- Novos endpoints do Brain ficam em rotas novas `/kds/brain/*`
- As 3 telas existentes (KDSScreen, BarmanKDSScreen, CookStationScreen) recebem evolução incremental, não rewrite

---

## SPRINT 1 — FUNDAÇÃO E CONFIGURAÇÃO (semanas 1-3)

### Objetivo
Substituir tudo que é hardcoded por configuração, adicionar campos essenciais, e implementar as interações básicas (countdown, swipe, undo, 86). Ao final deste sprint, o KDS existente já funciona melhor sem quebrar nada.

---

### Task 1.1 — Entidade CookStation + Migration

**Criar:** `backend/src/modules/kds-brain/entities/cook-station.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('cook_stations')
export class CookStation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurant_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // "Grelhados", "Frios", "Massas", "Bar Drinks", "Bar Cervejas"

  @Column({ type: 'varchar', length: 20 })
  type: 'kitchen' | 'bar';

  @Column({ type: 'varchar', length: 10, nullable: true })
  emoji: string;

  @Column({ type: 'int', default: 15 })
  late_threshold_minutes: number;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**Criar migration:** Gerar via TypeORM CLI e verificar que inclui:
```sql
CREATE TABLE cook_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('kitchen', 'bar')),
  emoji VARCHAR(10),
  late_threshold_minutes INT DEFAULT 15,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_cook_stations_restaurant ON cook_stations(restaurant_id);
```

**Criar:** `backend/src/modules/kds-brain/dto/cook-station.dto.ts`

```typescript
export class CreateCookStationDto {
  name: string;        // @IsString() @Length(1, 100)
  type: 'kitchen' | 'bar'; // @IsIn(['kitchen', 'bar'])
  emoji?: string;      // @IsOptional() @IsString()
  late_threshold_minutes?: number; // @IsOptional() @IsInt() @Min(1) @Max(120)
  display_order?: number; // @IsOptional() @IsInt()
}

export class UpdateCookStationDto extends PartialType(CreateCookStationDto) {}
```

**Criar:** `backend/src/modules/kds-brain/cook-station.service.ts`
- CRUD completo para CookStation
- `findByRestaurant(restaurantId)` — retorna estações ativas ordenadas por `display_order`
- Validar que o restaurante existe antes de criar

**Criar:** `backend/src/modules/kds-brain/cook-station.controller.ts`

| Método | Rota | Roles | Body/Query |
|--------|------|-------|------------|
| `POST` | `/kds/brain/stations` | OWNER, MANAGER | CreateCookStationDto + restaurant_id |
| `GET` | `/kds/brain/stations?restaurant_id=X` | OWNER, MANAGER, CHEF, BARMAN | - |
| `PATCH` | `/kds/brain/stations/:id` | OWNER, MANAGER | UpdateCookStationDto |
| `DELETE` | `/kds/brain/stations/:id` | OWNER, MANAGER | - (soft delete: is_active=false) |

**Critério de aceite:**
- [ ] CRUD de estações funciona via API
- [ ] Cada restaurante pode ter N estações com nomes, emojis e thresholds diferentes
- [ ] i18n: mensagens de erro usam chaves

---

### Task 1.2 — Novos campos no MenuItem

**Alterar:** `backend/src/modules/menu/entities/menu-item.entity.ts`

Adicionar campos (NÃO remover nenhum existente):

```typescript
@Column({ type: 'uuid', nullable: true })
station_id: string; // FK → CookStation

@Column({ type: 'int', default: 10 })
estimated_prep_minutes: number;

@Column({ type: 'varchar', length: 20, default: 'main' })
course: string; // 'appetizer' | 'main' | 'dessert' | 'drink' | 'side'

@Column({ type: 'boolean', default: true })
is_available: boolean; // Para feature 86/esgotado

@ManyToOne(() => CookStation, { nullable: true })
@JoinColumn({ name: 'station_id' })
station: CookStation;
```

**Criar migration:**
```sql
ALTER TABLE menu_items ADD COLUMN station_id UUID REFERENCES cook_stations(id) ON DELETE SET NULL;
ALTER TABLE menu_items ADD COLUMN estimated_prep_minutes INT DEFAULT 10;
ALTER TABLE menu_items ADD COLUMN course VARCHAR(20) DEFAULT 'main';
ALTER TABLE menu_items ADD COLUMN is_available BOOLEAN DEFAULT true;

CREATE INDEX idx_menu_items_station ON menu_items(station_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
```

**Alterar:** DTOs existentes do MenuItem para incluir os novos campos como opcionais em update/create.

**Critério de aceite:**
- [ ] MenuItem aceita `station_id`, `estimated_prep_minutes`, `course`, `is_available` no create/update
- [ ] Valores default são aplicados para itens que não configuraram os novos campos
- [ ] Nenhum endpoint existente do menu quebra

---

### Task 1.3 — Novos campos no Order e OrderItem

**Alterar:** `backend/src/modules/orders/entities/order.entity.ts`

Adicionar:
```typescript
@Column({ type: 'varchar', length: 20, default: 'noowe' })
source: string; // 'noowe' | 'ifood' | 'rappi' | 'ubereats'

@Column({ type: 'varchar', length: 255, nullable: true })
source_order_id: string; // ID na plataforma externa

@Column({ type: 'timestamp', nullable: true })
delivery_rider_eta: Date; // ETA do rider (para delivery)
```

**Alterar:** `backend/src/modules/orders/entities/order-item.entity.ts`

Adicionar:
```typescript
@Column({ type: 'uuid', nullable: true })
station_id: string; // Estação para qual foi roteado (calculado pelo Brain)

@Column({ type: 'timestamp', nullable: true })
fire_at: Date; // Quando o item foi/será disparado para a estação

@Column({ type: 'timestamp', nullable: true })
expected_ready_at: Date; // Previsão calculada pelo Brain

@Column({ type: 'varchar', length: 20, nullable: true })
course: string; // Copiado do MenuItem no momento do pedido
```

**Criar migration:**
```sql
ALTER TABLE orders ADD COLUMN source VARCHAR(20) DEFAULT 'noowe';
ALTER TABLE orders ADD COLUMN source_order_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN delivery_rider_eta TIMESTAMP;

ALTER TABLE order_items ADD COLUMN station_id UUID REFERENCES cook_stations(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD COLUMN fire_at TIMESTAMP;
ALTER TABLE order_items ADD COLUMN expected_ready_at TIMESTAMP;
ALTER TABLE order_items ADD COLUMN course VARCHAR(20);

CREATE INDEX idx_orders_source ON orders(source);
CREATE INDEX idx_order_items_station_status ON order_items(station_id, status);
CREATE INDEX idx_order_items_fire_at ON order_items(fire_at);
```

**Ajustar:** `orders.service.ts` — no método de criação de pedido, copiar `station_id` e `course` do MenuItem para o OrderItem no momento da criação. Se `station_id` do MenuItem for null, usar lógica legada (categorias).

**Critério de aceite:**
- [ ] Pedidos criados pelo app NOOWE continuam funcionando (source='noowe', campos novos nullable)
- [ ] Na criação do pedido, `station_id` e `course` são copiados do MenuItem para o OrderItem
- [ ] Nenhum endpoint existente quebra

---

### Task 1.4 — Módulo KDS Brain (estrutura base)

**Criar a seguinte estrutura:**

```
backend/src/modules/kds-brain/
├── kds-brain.module.ts
├── entities/
│   └── cook-station.entity.ts          (criado na Task 1.1)
├── services/
│   ├── brain-router.service.ts         (Task 1.4)
│   ├── brain-priority.service.ts       (Task 1.5)
│   ├── brain-countdown.service.ts      (Task 1.5)
│   └── item-availability.service.ts    (Task 1.6)
├── controllers/
│   ├── cook-station.controller.ts      (criado na Task 1.1)
│   └── kds-brain.controller.ts         (Task 1.4)
├── dto/
│   ├── cook-station.dto.ts             (criado na Task 1.1)
│   ├── station-queue.dto.ts            (Task 1.4)
│   └── bump-item.dto.ts               (Task 1.4)
└── i18n/
    └── kds-brain.i18n.ts               (chaves de mensagens)
```

**Criar:** `kds-brain.module.ts`
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([CookStation, Order, OrderItem, MenuItem])],
  controllers: [CookStationController, KdsBrainController],
  providers: [
    CookStationService,
    BrainRouterService,
    BrainPriorityService,
    BrainCountdownService,
    ItemAvailabilityService,
  ],
  exports: [BrainRouterService, BrainPriorityService],
})
export class KdsBrainModule {}
```

**Criar:** `services/brain-router.service.ts`

Este service substitui a filtragem por keywords. Ele roteia itens para estações baseado em `station_id` do MenuItem.

```typescript
@Injectable()
export class BrainRouterService {
  /**
   * Retorna os pedidos roteados para uma estação específica.
   * Substitui a lógica de keywords hardcoded do kds.service.ts.
   * 
   * Lógica:
   * 1. Busca OrderItems onde station_id == stationId
   * 2. Agrupa por Order (order_id)
   * 3. Filtra por status se fornecido
   * 4. Para cada item, calcula countdown e prioridade
   * 5. Ordena por prioridade (urgent > high > normal > queued)
   * 
   * FALLBACK: Se OrderItem.station_id é null (item antigo, antes da migração),
   * usar a lógica legada de categorias do kds.service.ts existente.
   */
  async getStationQueue(params: {
    station_id: string;
    restaurant_id: string;
    status?: string;
  }): Promise<StationQueueItem[]> { }

  /**
   * Quando um pedido é criado, roteia cada item para a estação correta.
   * Chamado no hook afterInsert ou no orders.service.ts.
   */
  async routeOrderItems(order: Order): Promise<void> { }
}
```

**Criar:** `controllers/kds-brain.controller.ts`

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/kds/brain/stations/:stationId/queue` | OWNER, MANAGER, CHEF, BARMAN | Fila de itens da estação |
| `PATCH` | `/kds/brain/items/:itemId/bump` | OWNER, MANAGER, CHEF, BARMAN | Avança status (swipe right) |
| `PATCH` | `/kds/brain/items/:itemId/undo` | OWNER, MANAGER, CHEF, BARMAN | Volta status (swipe left) |

**Criar:** `dto/station-queue.dto.ts`

```typescript
// Response DTO para a fila de uma estação
export class StationQueueItemDto {
  order_id: string;
  order_item_id: string;
  order_number: string;     // #<8 chars>
  table_number: string;     // ou 'N/A'
  source: string;           // 'noowe' | 'ifood' | 'rappi' | 'ubereats'
  order_type: string;       // 'dine_in' | 'delivery' | 'pickup'
  course: string;           // 'appetizer' | 'main' | 'dessert' | 'drink'
  
  // Item
  item_name: string;
  quantity: number;
  special_instructions: string | null;
  customizations: any[];
  status: string;           // pending | preparing | ready
  
  // Timing (calculado pelo Brain)
  countdown_minutes: number;  // Positivo = tempo restante. Negativo = atrasado.
  priority: 'queued' | 'normal' | 'high' | 'urgent';
  is_late: boolean;
  
  // Fire control
  is_fired: boolean;          // true = pode preparar. false = aguardando fire.
  fire_at: string | null;     // ISO timestamp
  expected_ready_at: string | null;
  
  // Contexto
  waiter_name: string | null;
  delivery_rider_eta: string | null; // ISO timestamp
  
  created_at: string;
}
```

**Critério de aceite:**
- [ ] `GET /kds/brain/stations/:stationId/queue` retorna itens roteados para a estação
- [ ] Items sem `station_id` (legado) usam fallback de categorias
- [ ] `PATCH /kds/brain/items/:itemId/bump` avança status: pending→preparing→ready
- [ ] `PATCH /kds/brain/items/:itemId/undo` volta status: ready→preparing→pending
- [ ] Bump e undo emitem eventos WebSocket `order:updated`
- [ ] Todas as responses usam DTOs com i18n

---

### Task 1.5 — Prioridade contextual + Countdown

**Criar:** `services/brain-priority.service.ts`

```typescript
@Injectable()
export class BrainPriorityService {
  /**
   * Calcula prioridade baseada no tempo de preparo ESPERADO, não em threshold fixo.
   * 
   * Fórmula:
   * ratio = tempo_decorrido_desde_fire / estimated_prep_minutes
   * 
   * Se item não tem fire_at (legado), usa created_at do OrderItem.
   * Se item não tem estimated_prep_minutes, usa default da estação (late_threshold_minutes).
   * 
   * Mapeamento:
   * - ratio < 0.5  → 'queued'   (item recém-disparado, tudo normal)
   * - ratio 0.5-0.9 → 'normal'  (em andamento, no prazo)
   * - ratio 0.9-1.2 → 'high'    (chegando no limite)
   * - ratio > 1.2   → 'urgent'  (atrasado)
   * 
   * Boost para delivery:
   * Se order.source != 'noowe' e rider ETA está próximo, aplicar boost de urgência.
   */
  calculatePriority(item: OrderItemWithRelations): Priority { }

  /**
   * Calcula countdown em minutos.
   * 
   * Retorno:
   * - Positivo = minutos restantes até expected_ready_at
   * - Zero = no limite
   * - Negativo = minutos de atraso
   * 
   * Se expected_ready_at é null (legado), calcular com:
   * expected_ready_at = fire_at + estimated_prep_minutes
   * Se fire_at também é null, usar created_at + estimated_prep_minutes
   */
  calculateCountdown(item: OrderItemWithRelations): number { }
}
```

**Alterar:** `helpers/kds-formatter.helper.ts` — adicionar campos `countdown_minutes`, `priority`, `is_late` na formatação. Manter formatação antiga funcional para endpoints legados.

**Critério de aceite:**
- [ ] Prioridade é calculada relativamente ao prep time do prato
- [ ] Filé mignon (12min) com 8min decorridos = normal. Salada (5min) com 8min decorridos = urgent.
- [ ] Countdown retorna minutos restantes (positivo) ou atraso (negativo)
- [ ] Items legados (sem fire_at/expected_ready_at) usam fallback com created_at

---

### Task 1.6 — Item 86 (esgotado)

**Criar:** `services/item-availability.service.ts`

```typescript
@Injectable()
export class ItemAvailabilityService {
  /**
   * Marca um MenuItem como esgotado (is_available = false).
   * 
   * Efeitos:
   * 1. Atualiza MenuItem.is_available = false
   * 2. Emite evento WebSocket 'menu:item_unavailable' para restaurant room
   * 3. (Sprint 3) Notifica plataformas de delivery via adapter
   * 
   * O endpoint de criação de pedido deve verificar is_available antes de aceitar.
   */
  async markUnavailable(menuItemId: string, restaurantId: string): Promise<void> { }

  /**
   * Restaura disponibilidade (is_available = true).
   */
  async markAvailable(menuItemId: string, restaurantId: string): Promise<void> { }
}
```

**Adicionar endpoint no controller:**

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `PATCH` | `/kds/brain/menu-items/:id/toggle-available` | OWNER, MANAGER, CHEF, BARMAN | Toggle 86 |

**Alterar:** `orders.service.ts` — no fluxo de criação de pedido, verificar `is_available` de cada MenuItem. Se algum item está esgotado, rejeitar com erro i18n `kds.errors.item_unavailable`.

**Alterar:** `orders.gateway.ts` — adicionar evento:
```typescript
// Novo evento
'menu:item_unavailable' → { menu_item_id, restaurant_id, is_available }
```

**Critério de aceite:**
- [ ] Chef/Barman pode marcar item como esgotado via KDS
- [ ] Tentativa de pedir item esgotado retorna erro com i18n
- [ ] WebSocket notifica todos os devices conectados do restaurante
- [ ] Toggle restaura disponibilidade

---

### Task 1.7 — Swipe gestures + alertas sonoros (mobile)

**Alterar:** Todas as 3 telas KDS existentes.

**Swipe gesture — implementar em cada card de pedido/item:**

```typescript
// Usar react-native-gesture-handler (Swipeable) ou PanResponder
// Padrão de interação:
// - Swipe right (>100px) → chamar ApiService.bumpItem(itemId)
// - Swipe left (>100px) → chamar ApiService.undoItem(itemId)
// - Manter botões como fallback (tap ainda funciona)

// Visual do swipe:
// - Swipe right: fundo verde aparece, ícone ✓
// - Swipe left: fundo amarelo aparece, ícone ↩
// - Threshold visual: 40% da largura do card
// - Haptic feedback no threshold
```

**Countdown no display — substituir timer:**

```typescript
// ANTES (timer crescente):
// const elapsed = differenceInMinutes(now, item.created_at);
// <Text>{elapsed} min</Text>

// DEPOIS (countdown decrescente):
// const remaining = item.countdown_minutes; // Vem da API
// <Text>
//   {remaining > 0 
//     ? t('kds.countdown.remaining', { minutes: remaining })
//     : t('kds.countdown.late', { minutes: Math.abs(remaining) })
//   }
// </Text>
// Cor: remaining > 3 → verde | remaining 1-3 → amarelo | remaining <= 0 → vermelho
```

**Alertas sonoros:**

```typescript
// Usar expo-av ou react-native-sound
// Sons distintos (arquivos .mp3 curtos):
// - new_order.mp3: "ding" suave — quando novo item chega na estação
// - item_late.mp3: tom urgente — quando countdown chega a zero
// - rider_arriving.mp3: notificação — quando rider está a 5min (Sprint 3)

// Tocar som baseado no evento WebSocket:
// 'item:fired' → new_order.mp3
// Countdown atinge 0 → item_late.mp3

// Configuração: permitir mute por estação
```

**Criar:** Novos métodos no `ApiService`:

```typescript
// shared/services/api.ts — adicionar:
static async getStationQueue(stationId: string): Promise<StationQueueItem[]> { }
static async bumpItem(itemId: string): Promise<void> { } // POST /kds/brain/items/:id/bump
static async undoItem(itemId: string): Promise<void> { } // POST /kds/brain/items/:id/undo
static async toggleItemAvailability(menuItemId: string): Promise<void> { }
static async getStations(restaurantId: string): Promise<CookStation[]> { }
```

**Critério de aceite:**
- [ ] Swipe right em card de item avança status com haptic feedback
- [ ] Swipe left volta status
- [ ] Countdown mostra tempo restante (positivo) ou atraso (negativo)
- [ ] Card muda de cor quando countdown ≤ 0
- [ ] Som toca quando item chega e quando atrasa
- [ ] Todas as strings usam i18n
- [ ] Botões tap continuam funcionando como fallback

---

### Task 1.8 — Tela de configuração de estações (mobile)

**Criar:** `restaurant/src/screens/kds-settings/StationSettingsScreen.tsx`

Tela para OWNER/MANAGER configurar estações do restaurante:

```
┌──────────────────────────────────────┐
│  Estações da cozinha          [+ Nova]│
├──────────────────────────────────────┤
│                                      │
│  🔥 Grelhados                        │
│  Tipo: Cozinha │ Alerta: 15 min     │
│  [Editar] [Desativar]               │
│                                      │
│  ❄️ Frios                            │
│  Tipo: Cozinha │ Alerta: 10 min     │
│  [Editar] [Desativar]               │
│                                      │
│  🍝 Massas                           │
│  Tipo: Cozinha │ Alerta: 20 min     │
│  [Editar] [Desativar]               │
│                                      │
│  🍹 Bar                              │
│  Tipo: Bar │ Alerta: 8 min          │
│  [Editar] [Desativar]               │
│                                      │
└──────────────────────────────────────┘
```

- Form para criar/editar estação: nome, emoji (picker), tipo (kitchen/bar), late_threshold_minutes (slider)
- Drag to reorder (muda display_order)
- Soft delete (desativar)
- Registrar rota no navigation/index.tsx (drawer ou settings)

**Critério de aceite:**
- [ ] OWNER pode criar, editar, reordenar e desativar estações
- [ ] Mudanças refletem imediatamente nas telas KDS
- [ ] i18n completo
- [ ] Segue design system existente do app

---

### Task 1.9 — Evolução da CookStationScreen (estações dinâmicas)

**Alterar:** `restaurant/src/screens/cook/CookStationScreen.tsx`

Substituir tabs hardcoded ("Grelhados", "Frios", "Massas") por tabs dinâmicas carregadas das estações configuradas.

```typescript
// ANTES (hardcoded):
const STATIONS = [
  { name: 'Grelhados', emoji: '🔥', keywords: ['Filé', 'Salmão', ...] },
  { name: 'Frios', emoji: '❄️', keywords: ['Tartare', 'Ceviche', ...] },
  { name: 'Massas', emoji: '🍝', keywords: ['Risoto', 'Ravioli', ...] },
];

// DEPOIS (dinâmico):
const { data: stations } = useQuery(['cook-stations', restaurantId], () =>
  ApiService.getStations(restaurantId)
);
// Tabs renderizadas a partir de stations.filter(s => s.type === 'kitchen')
// Cada tab carrega: ApiService.getStationQueue(station.id)
```

**Alterar:** `KDSScreen.tsx` e `BarmanKDSScreen.tsx` — usar o novo endpoint `/kds/brain/stations/:stationId/queue` quando disponível, com fallback para endpoints legados se station_id não está configurado.

**Critério de aceite:**
- [ ] CookStationScreen mostra tabs dinâmicas do banco
- [ ] Restaurante sem estações configuradas vê fallback com comportamento antigo
- [ ] Adicionar nova estação na settings reflete imediatamente na CookStationScreen
- [ ] KDSScreen e BarmanKDSScreen funcionam com novo endpoint E com fallback legado

---

### Entregáveis do Sprint 1

Ao final deste sprint:

1. **Backend:**
   - Módulo `kds-brain` com CookStation CRUD
   - Novos campos em MenuItem, Order, OrderItem (com migrations reversíveis)
   - BrainRouterService substituindo keywords por station_id
   - BrainPriorityService com prioridade contextual
   - ItemAvailabilityService (86)
   - Endpoint bump/undo para swipe
   - Fallback para dados legados em todos os services
   - Eventos WebSocket novos (item:bumped, item:undone, menu:item_unavailable)

2. **Mobile:**
   - Swipe gestures nas 3 telas KDS
   - Countdown substituindo timer
   - Alertas sonoros (novo pedido, item atrasado)
   - Tela de configuração de estações
   - CookStationScreen com tabs dinâmicas
   - i18n em pt-BR, en, es para todas as novas strings

3. **Dados:**
   - 4 migrations (cook_stations, menu_items alterações, orders alterações, order_items alterações)

4. **Testes:**
   - BrainPriorityService: testes de cálculo de prioridade e countdown
   - BrainRouterService: testes de roteamento + fallback
   - ItemAvailabilityService: testes de toggle + rejeição de pedido

---

## SPRINT 2 — BRAIN ENGINE: AUTO-FIRE E CONVERGÊNCIA (semanas 4-7)

### Objetivo
Implementar a inteligência central: auto-fire por course (a cozinha recebe itens no momento certo), auto-sync entre estações (pratos de uma mesa ficam prontos juntos), e a visão consolidada do chef.

---

### Task 2.1 — Entidade FireSchedule + tabela

**Criar:** `backend/src/modules/kds-brain/entities/fire-schedule.entity.ts`

```typescript
@Entity('fire_schedules')
export class FireSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'uuid' })
  order_item_id: string;

  @Column({ type: 'uuid' })
  station_id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  course: string;

  @Column({ type: 'timestamp' })
  fire_at: Date;

  @Column({ type: 'timestamp' })
  expected_ready_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_ready_at: Date;

  @Column({ type: 'boolean', default: false })
  fired: boolean;

  @Column({ type: 'varchar', length: 20, default: 'auto' })
  fire_mode: string; // 'auto' | 'manual' | 'immediate'

  @CreateDateColumn()
  created_at: Date;
}
```

**Migration:**
```sql
CREATE TABLE fire_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES cook_stations(id),
  course VARCHAR(20),
  fire_at TIMESTAMP NOT NULL,
  expected_ready_at TIMESTAMP NOT NULL,
  actual_ready_at TIMESTAMP,
  fired BOOLEAN DEFAULT false,
  fire_mode VARCHAR(20) DEFAULT 'auto',
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_fire_schedules_pending ON fire_schedules(fire_at) WHERE NOT fired;
CREATE INDEX idx_fire_schedules_order ON fire_schedules(order_id);
CREATE INDEX idx_fire_schedules_station ON fire_schedules(station_id, fired);
```

---

### Task 2.2 — AutoFireService

**Criar:** `backend/src/modules/kds-brain/services/auto-fire.service.ts`

```typescript
@Injectable()
export class AutoFireService {
  /**
   * Chamado quando um pedido é criado ou confirmado.
   * Calcula o schedule de fire para cada item.
   * 
   * DINE-IN (course sequencing):
   * 1. Agrupa items por course (appetizer, main, dessert, drink)
   * 2. Course 1 (appetizer/drink): fire imediato
   * 3. Demais courses: fire_mode='auto', fire_at será calculado
   *    quando o course anterior for marcado como ready
   * 4. Dentro de um course: o item mais longo define o critical path
   *    Items mais rápidos recebem delay = (max_prep - own_prep)
   *    para que todos fiquem prontos no mesmo instante
   * 
   * DELIVERY/PICKUP:
   * 1. Se delivery_rider_eta existe, calcular backward:
   *    fire_at = rider_eta - estimated_prep_minutes - BUFFER_MINUTES(3)
   * 2. Se não tem rider_eta, fire imediato para todos os items
   * 
   * CONFIGURAÇÃO POR RESTAURANTE:
   * - course_gap_mode: 'on_ready' (default) | 'timed' (intervalo fixo em minutos)
   * - Se 'timed': fire course N+1 = fire course N + course_gap_minutes
   */
  async createFireSchedule(order: Order): Promise<FireSchedule[]> { }

  /**
   * Chamado quando um course é marcado como ready.
   * Dispara o próximo course.
   */
  async fireNextCourse(orderId: string, completedCourse: string): Promise<void> { }

  /**
   * Job periódico (cron a cada 30 segundos).
   * Busca FireSchedules onde fire_at <= now AND fired = false.
   * Para cada um:
   * 1. Marca fired = true
   * 2. Atualiza OrderItem.fire_at = now
   * 3. Emite WebSocket 'item:fired' para a estação
   * 4. Toca som de novo pedido na estação
   */
  @Cron('*/30 * * * * *')
  async processFireQueue(): Promise<void> { }
}
```

**Registrar:** O cron job no módulo NestJS com `@nestjs/schedule`.

**Alterar:** `orders.service.ts` — após criar um pedido com status CONFIRMED, chamar `autoFireService.createFireSchedule(order)`.

**Critério de aceite:**
- [ ] Pedido dine-in: itens de entrada são fired imediatamente, principal fica aguardando
- [ ] Quando entrada é marcada ready, principal é automaticamente fired
- [ ] Dentro de um course, itens rápidos recebem delay para convergir com o mais lento
- [ ] Pedido delivery: fire é calculado backward a partir do ETA do rider
- [ ] Cron processa fires pendentes a cada 30s
- [ ] WebSocket 'item:fired' é emitido quando item é disparado

---

### Task 2.3 — AutoSyncService (convergência entre estações)

**Criar:** `backend/src/modules/kds-brain/services/auto-sync.service.ts`

```typescript
@Injectable()
export class AutoSyncService {
  /**
   * Retorna o estado de convergência de um pedido/course.
   * Usado para exibir a barra de progresso no KDS.
   * 
   * Retorna:
   * {
   *   order_id: string,
   *   course: string,
   *   table_number: string,
   *   stations: [
   *     { station_id, station_name, station_emoji, status: 'waiting'|'preparing'|'ready' },
   *     ...
   *   ],
   *   ready_count: number,
   *   total_count: number,
   *   is_complete: boolean  // true quando todos os stations estão ready
   * }
   */
  async getConvergenceState(orderId: string, course: string): Promise<ConvergenceState> { }

  /**
   * Chamado quando um item é bumped para 'ready'.
   * Verifica se todos os items do mesmo course/order estão ready.
   * Se sim, emite evento 'convergence:complete' → pode triggerar próximo course.
   */
  async checkConvergence(orderItemId: string): Promise<void> { }
}
```

**Endpoint novo:**

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/kds/brain/orders/:orderId/convergence?course=main` | OWNER, MANAGER, CHEF, BARMAN | Estado de convergência |

**Alterar:** response do `StationQueueItemDto` para incluir campo `convergence`:

```typescript
// Adicionar ao StationQueueItemDto:
convergence?: {
  stations: Array<{
    station_name: string;
    station_emoji: string;
    status: 'waiting' | 'preparing' | 'ready';
  }>;
  ready_count: number;
  total_count: number;
};
```

**WebSocket — novo evento:**
```typescript
'convergence:updated' → { order_id, course, ready_count, total_count, stations }
// Emitido para room restaurant:{restaurantId} sempre que um item muda de status
```

**Critério de aceite:**
- [ ] Cada estação vê o progresso das outras para o mesmo pedido/course
- [ ] Quando último item do course fica ready, 'convergence:complete' é emitido
- [ ] convergence:complete do course N dispara auto-fire do course N+1
- [ ] WebSocket atualiza convergence em tempo real em todas as telas

---

### Task 2.4 — ChefViewScreen (visão consolidada)

**Criar:** `restaurant/src/screens/chef-view/ChefViewScreen.tsx`

Nova tela exclusiva para CHEF/OWNER/MANAGER mostrando visão panorâmica da operação.

```
Dados exibidos:
- Cards de resumo por estação: nome, emoji, N ativos, N atrasados, tempo médio estimado
- Métricas globais: mesas ativas, delivery na fila, tempo médio atual
- Lista de alertas: items atrasados (com mesa/pedido), riders chegando
- Tap em estação → navega para CookStationScreen daquela estação
```

**Endpoint novo:**

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/kds/brain/chef/overview?restaurant_id=X` | OWNER, MANAGER, CHEF | Dados consolidados |

**Response:**
```typescript
interface ChefOverviewDto {
  stations: Array<{
    station_id: string;
    name: string;
    emoji: string;
    active_count: number;
    late_count: number;
    avg_remaining_minutes: number;
  }>;
  metrics: {
    active_tables: number;
    delivery_queue: number;
    avg_prep_minutes: number;
  };
  alerts: Array<{
    type: 'item_late' | 'rider_arriving' | 'capacity_warning';
    message: string; // i18n key com params
    order_id: string;
    station_name: string;
    minutes_late?: number;
    rider_eta_minutes?: number;
  }>;
}
```

**Registrar:** Adicionar ChefViewScreen na navigation do restaurant app, acessível pelo drawer.

**Critério de aceite:**
- [ ] Chef vê resumo de todas as estações em uma tela
- [ ] Alertas de items atrasados e riders chegando aparecem em tempo real
- [ ] Tap em estação navega para a fila daquela estação
- [ ] Dados atualizam via WebSocket (sem need de pull-to-refresh)
- [ ] i18n completo

---

### Task 2.5 — Items "aguardando fire" no display

**Alterar:** Telas KDS (todas).

Items que têm `FireSchedule` com `fired=false` devem aparecer no display da estação como cards especiais:

```typescript
// Visual do card "aguardando fire":
// - Borda tracejada (dashed border)
// - Opacidade 0.6
// - Texto: t('kds.countdown.waiting_fire', { minutes: X })
// - Não interativo (swipe desabilitado)
// - Ordenado DEPOIS dos items ativos
// - Quando fired=true (via WebSocket 'item:fired'), transiciona para card ativo com animação
```

**Critério de aceite:**
- [ ] Items aguardando fire aparecem como cards tracejados
- [ ] Countdown mostra "Começa em X min"
- [ ] Quando item é fired, card transiciona suavemente para ativo
- [ ] Swipe é desabilitado em cards aguardando

---

### Entregáveis do Sprint 2

1. **Backend:** AutoFireService com cron, AutoSyncService com convergência, ChefOverview endpoint, FireSchedule entity
2. **Mobile:** Barra de convergência nas telas KDS, ChefViewScreen, cards "aguardando fire"
3. **WebSocket:** Eventos item:fired, convergence:updated, convergence:complete
4. **Testes:** AutoFireService (dine-in sequencing, delivery backward calc), AutoSyncService (convergence check)

---

## SPRINT 3 — INTEGRAÇÃO DELIVERY: IFOOD, RAPPI, UBER EATS (semanas 8-11)

### Objetivo
Receber pedidos de plataformas externas, normalizar para o formato interno, processar pelo Brain, e sincronizar status de volta. O cozinheiro não sabe de onde veio o pedido — é apenas mais um card no KDS.

---

### Task 3.1 — Módulo de integrações (estrutura)

**Criar:**
```
backend/src/modules/integrations/
├── integrations.module.ts
├── interfaces/
│   └── platform-adapter.interface.ts      // Interface que todo adapter implementa
├── services/
│   ├── order-normalizer.service.ts        // Converte formato externo → interno
│   ├── status-sync.service.ts             // Devolve status para plataformas
│   └── capacity-manager.service.ts        // Auto-accept / reject baseado em carga
├── controllers/
│   └── webhook.controller.ts              // Recebe webhooks de todas as plataformas
├── entities/
│   ├── platform-connection.entity.ts      // Credenciais por restaurante/plataforma
│   └── external-menu-mapping.entity.ts    // Mapeamento item externo → interno
├── platforms/
│   ├── ifood/
│   │   ├── ifood.adapter.ts
│   │   ├── ifood.auth.service.ts
│   │   └── ifood.types.ts
│   ├── rappi/
│   │   ├── rappi.adapter.ts
│   │   ├── rappi.auth.service.ts
│   │   └── rappi.types.ts
│   └── ubereats/
│       ├── ubereats.adapter.ts
│       ├── ubereats.auth.service.ts
│       └── ubereats.types.ts
├── dto/
│   ├── normalized-order.dto.ts
│   ├── platform-connection.dto.ts
│   └── menu-mapping.dto.ts
└── i18n/
    └── integrations.i18n.ts
```

### Task 3.2 — PlatformAdapter interface

**Criar:** `interfaces/platform-adapter.interface.ts`

```typescript
export interface PlatformAdapter {
  readonly platform: 'ifood' | 'rappi' | 'ubereats';

  // Autenticação
  validateWebhook(headers: Record<string, string>, body: any): boolean;
  refreshAuth(connection: PlatformConnection): Promise<PlatformConnection>;

  // Pedido
  normalizeOrder(rawOrder: any, mappings: ExternalMenuMapping[]): NormalizedOrder;
  confirmOrder(connection: PlatformConnection, externalOrderId: string): Promise<void>;
  rejectOrder(connection: PlatformConnection, externalOrderId: string, reason: string): Promise<void>;

  // Status sync
  syncStatus(connection: PlatformConnection, externalOrderId: string, status: PlatformOrderStatus): Promise<void>;

  // Tempo
  setPreparationTime(connection: PlatformConnection, externalOrderId: string, minutes: number): Promise<void>;

  // Menu
  syncMenu?(connection: PlatformConnection): Promise<ExternalMenuItem[]>;
}

export interface NormalizedOrder {
  source: 'ifood' | 'rappi' | 'ubereats';
  source_order_id: string;
  restaurant_id: string;
  order_type: 'delivery' | 'pickup';
  delivery_rider_eta?: Date;
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: string;
  items: NormalizedOrderItem[];
  payment_method?: string;
  total_amount?: number;
  metadata?: Record<string, any>; // Dados extras da plataforma
}

export interface NormalizedOrderItem {
  external_item_id: string;
  internal_menu_item_id?: string; // Populado pelo normalizer via mappings
  source_item_name: string;
  quantity: number;
  unit_price: number;
  customizations: Array<{ name: string; value: string; price_modifier: number }>;
  special_instructions?: string;
  course?: string;
}
```

### Task 3.3 — Entidades de integração

**Criar:** `entities/platform-connection.entity.ts`

```typescript
@Entity('platform_connections')
export class PlatformConnection {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) restaurant_id: string;
  @Column({ type: 'varchar', length: 20 }) platform: string;
  @Column({ type: 'jsonb' }) credentials: Record<string, any>;
  // credentials contém: client_id, client_secret, merchant_id, access_token, refresh_token, etc.
  @Column({ type: 'varchar', length: 255, nullable: true }) webhook_secret: string;
  @Column({ type: 'boolean', default: true }) is_active: boolean;
  @Column({ type: 'boolean', default: true }) auto_accept: boolean;
  @Column({ type: 'int', default: 30 }) max_concurrent_orders: number;
  @Column({ type: 'int', default: 20 }) high_load_threshold: number;
  @Column({ type: 'timestamp', nullable: true }) last_sync_at: Date;
}
// UNIQUE(restaurant_id, platform)
```

**Criar:** `entities/external-menu-mapping.entity.ts`

```typescript
@Entity('external_menu_mappings')
export class ExternalMenuMapping {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) restaurant_id: string;
  @Column({ type: 'varchar', length: 20 }) platform: string;
  @Column({ type: 'varchar', length: 255 }) external_item_id: string;
  @Column({ type: 'varchar', length: 255 }) external_item_name: string;
  @Column({ type: 'uuid' }) internal_menu_item_id: string;
  @Column({ type: 'boolean', default: true }) is_active: boolean;
}
// UNIQUE(restaurant_id, platform, external_item_id)
```

### Task 3.4 — Adapters por plataforma

**iFood adapter:** `platforms/ifood/ifood.adapter.ts`
- Auth: OAuth2 client_credentials → `https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token`
- Webhooks: validar header `x-ifood-signature` com HMAC
- Normalizar: mapear campos do pedido iFood (items, customer, delivery info)
- Status sync: PATCH `/order/v1.0/orders/{id}/confirm`, `/order/v1.0/orders/{id}/startPreparation`, `/order/v1.0/orders/{id}/readyToPickup`, `/order/v1.0/orders/{id}/dispatch`

**Rappi adapter:** `platforms/rappi/rappi.adapter.ts`
- Auth: API key ou OAuth2 conforme documentação Rappi Partners
- Webhooks: validar signature header
- Normalizar: mapear campos do pedido Rappi
- Status sync: endpoints da API Rappi para atualizar status

**Uber Eats adapter:** `platforms/ubereats/ubereats.adapter.ts`
- Auth: OAuth2 → `https://login.uber.com/oauth/v2/token`
- Webhooks: validar signature
- Normalizar: mapear campos do Uber Eats order
- Status sync: PATCH status via Uber Eats API

**NOTA IMPORTANTE PARA IMPLEMENTAÇÃO:**
As APIs dessas plataformas mudam com frequência. Antes de implementar cada adapter:
1. Consultar documentação oficial mais recente
2. Criar tipos (`.types.ts`) baseados na doc real
3. Implementar adapter com tratamento robusto de erros
4. Logging detalhado de cada chamada para debug

### Task 3.5 — Webhook controller + Order normalizer

**Criar:** `controllers/webhook.controller.ts`

```typescript
@Controller('integrations/webhooks')
export class WebhookController {
  // POST /integrations/webhooks/:platform/orders
  // Fluxo:
  // 1. Identificar adapter pela rota
  // 2. Validar webhook (signature)
  // 3. Buscar PlatformConnection do restaurante
  // 4. Buscar mappings de menu
  // 5. Normalizar pedido
  // 6. Verificar capacidade (CapacityManager)
  // 7. Se aceito: criar Order no sistema → Brain processa (auto-route, auto-fire)
  // 8. Confirmar na plataforma + informar ETA
  // 9. Se rejeitado (capacidade): rejeitar na plataforma com motivo

  // POST /integrations/webhooks/:platform/status
  // Recebe atualizações de status (rider ETA, cancelamentos, etc.)
}
```

### Task 3.6 — StatusSyncService

**Criar:** `services/status-sync.service.ts`

```typescript
@Injectable()
export class StatusSyncService {
  // Escuta evento 'order.status.changed' (EventEmitter ou decorator)
  // Se order.source != 'noowe':
  //   1. Buscar adapter da plataforma
  //   2. Mapear status interno → status da plataforma
  //   3. Chamar adapter.syncStatus()
  //   4. Logar resultado
  //   5. Se falhar, retry com backoff (3 tentativas)
}
```

### Task 3.7 — CapacityManagerService

**Criar:** `services/capacity-manager.service.ts`

```typescript
@Injectable()
export class CapacityManagerService {
  /**
   * Avalia se o restaurante pode aceitar mais um pedido delivery.
   * 
   * Retorna:
   * - accept: tudo normal
   * - accept_with_delay: aceita mas informa tempo extra
   * - reject: cozinha lotada, rejeita na plataforma
   * 
   * Critérios:
   * - Conta pedidos ativos (status CONFIRMED, PREPARING)
   * - Compara com max_concurrent_orders da PlatformConnection
   * - Se acima de high_load_threshold: aceita com delay
   * - Se acima de max_concurrent_orders: rejeita
   */
  async evaluateCapacity(restaurantId: string): Promise<CapacityResult> { }
}
```

### Task 3.8 — Badge de origem + ETA rider no mobile

**Alterar:** Todas as telas KDS.

- Adicionar badge discreto com ícone/nome da plataforma de origem
- Para pedidos delivery: mostrar "Rider chega em X min" atualizado via WebSocket
- Usar i18n: `t('kds.order_source.ifood')`, `t('kds.delivery.rider_eta', { minutes })`

### Task 3.9 — Tela de configuração de integrações (mobile)

**Criar:** `restaurant/src/screens/integrations/IntegrationSettingsScreen.tsx`

- Lista plataformas: iFood, Rappi, Uber Eats
- Status: Conectado / Desconectado
- Formulário para credenciais (merchant_id, client_id, etc.)
- Toggle auto-accept
- Slider para max_concurrent_orders e high_load_threshold
- Tela de mapeamento de menu: lista itens externos → select MenuItem interno

### Task 3.10 — Propagação de item 86 para plataformas

**Alterar:** `ItemAvailabilityService` (criado no Sprint 1).

Quando item é marcado esgotado:
1. Atualizar MenuItem.is_available = false (já existe)
2. Para cada PlatformConnection ativa do restaurante:
   - Buscar ExternalMenuMapping do item
   - Chamar adapter para pausar/desativar item na plataforma
3. Quando restaurado: reativar nas plataformas

---

### Entregáveis do Sprint 3

1. **Backend:** Módulo integrations completo, 3 adapters (iFood/Rappi/UberEats), webhook controller, status sync, capacity manager
2. **Mobile:** Badge de origem, ETA rider, tela de configuração de integrações, mapeamento de menu
3. **Dados:** Migrations para platform_connections, external_menu_mappings
4. **Testes:** Cada adapter com mock de API, normalizer, capacity manager

---

## SPRINT 4 — ANALYTICS, SELF-LEARNING E POLISH (semanas 12-14)

### Objetivo
Coletar métricas de performance, construir dashboard para o chef/owner, e implementar auto-ajuste de tempos de preparo baseado em dados reais.

---

### Task 4.1 — Entidade PrepAnalytics + coleta automática

**Criar:** `backend/src/modules/kds-brain/entities/prep-analytics.entity.ts`

```typescript
@Entity('prep_analytics')
export class PrepAnalytics {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) restaurant_id: string;
  @Column({ type: 'uuid' }) station_id: string;
  @Column({ type: 'uuid' }) menu_item_id: string;
  @Column({ type: 'uuid' }) order_item_id: string;
  @Column({ type: 'int' }) expected_prep_minutes: number;
  @Column({ type: 'int', nullable: true }) actual_prep_minutes: number;
  @Column({ type: 'boolean', default: false }) was_late: boolean;
  @Column({ type: 'varchar', length: 20, nullable: true }) shift: string; // 'lunch'|'dinner'|'late_night'
  @Column({ type: 'varchar', length: 20, nullable: true }) source: string; // 'noowe'|'ifood'|...
  @Column({ type: 'varchar', length: 20, nullable: true }) day_of_week: string;
  @CreateDateColumn() recorded_at: Date;
}
```

**Coleta:** Quando OrderItem é bumped para 'ready':
- `actual_prep_minutes = differenceInMinutes(now, fire_at || created_at)`
- `was_late = actual_prep_minutes > expected_prep_minutes`
- `shift = calculateShift(now)` (lunch: 11-15h, dinner: 18-23h, etc.)
- Inserir registro em prep_analytics

### Task 4.2 — AnalyticsService

**Criar:** `backend/src/modules/kds-brain/services/analytics.service.ts`

Endpoints:

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/kds/brain/analytics/prep-times?restaurant_id=X&period=7d` | Tempo médio por prato e estação |
| `GET` | `/kds/brain/analytics/bottlenecks?restaurant_id=X&period=7d` | Estações com mais atrasos |
| `GET` | `/kds/brain/analytics/throughput?restaurant_id=X&period=7d` | Pedidos/hora por turno |
| `GET` | `/kds/brain/analytics/platform-performance?restaurant_id=X&period=30d` | Performance por plataforma |

Response de prep-times exemplo:
```typescript
{
  items: [
    { menu_item_name: "Filé Mignon", station_name: "Grelhados",
      avg_actual_minutes: 13.5, avg_expected_minutes: 12,
      total_prepared: 145, late_percentage: 18.5 },
    ...
  ],
  stations: [
    { station_name: "Grelhados", avg_actual_minutes: 14.2, total_prepared: 340, late_percentage: 22 },
    ...
  ]
}
```

### Task 4.3 — Self-learning (auto-ajuste de prep times)

**Criar:** `backend/src/modules/kds-brain/services/self-learning.service.ts`

```typescript
@Injectable()
export class SelfLearningService {
  /**
   * Job semanal (ou sob demanda).
   * Para cada MenuItem com >= 20 registros em prep_analytics:
   * 1. Calcular média real de prep time (últimos 30 dias)
   * 2. Se diferença > 20% do estimated_prep_minutes atual:
   *    - Sugerir ajuste (não aplica automaticamente)
   *    - Criar registro em 'prep_time_suggestions'
   * 3. Chef/Owner pode aceitar ou rejeitar a sugestão
   * 
   * NUNCA altera automaticamente — sempre sugere.
   * O owner aceita via endpoint ou via tela de settings.
   */
  async generateSuggestions(restaurantId: string): Promise<PrepTimeSuggestion[]> { }
}
```

### Task 4.4 — Dashboard analytics (mobile)

**Criar:** `restaurant/src/screens/analytics/KdsAnalyticsScreen.tsx`

- Gráfico de barras: tempo médio por estação
- Gráfico de linha: throughput por hora do dia
- Cards: % de atrasos, tempo médio total, estação mais lenta
- Sugestões de ajuste de prep time (aceitar/rejeitar)
- Filtros: período (7d, 30d, 90d), turno (almoço, jantar)

### Task 4.5 — Configuração de restaurant (novos campos)

**Alterar ou criar:** Settings do restaurante para KDS Brain.

Campos configuráveis (armazenar em metadata JSONB do Restaurant ou nova tabela):

```typescript
interface KdsBrainConfig {
  course_gap_mode: 'on_ready' | 'timed'; // default: 'on_ready'
  course_gap_minutes: number;             // default: 0 (se mode='timed')
  delivery_buffer_minutes: number;        // default: 3
  auto_accept_delivery: boolean;          // default: true
  max_concurrent_orders: number;          // default: 30
  high_load_threshold: number;            // default: 20
  sound_enabled: boolean;                 // default: true
  sound_volume: number;                   // default: 0.8
}
```

### Task 4.6 — Polish e refinamento

- [ ] Animações de transição nos cards (fire → ativo, ativo → ready)
- [ ] Haptic feedback no swipe threshold
- [ ] Pull-to-refresh em todas as telas (já existe, verificar que funciona com novos endpoints)
- [ ] Auto-refresh via WebSocket (reduzir polling de 30s para WebSocket-only onde possível)
- [ ] Empty states atualizados com i18n
- [ ] Tratamento de erros de rede com retry automático
- [ ] Skeleton loading states
- [ ] Acessibilidade: labels para screen readers, cores com contraste suficiente

---

### Entregáveis do Sprint 4

1. **Backend:** PrepAnalytics entity + coleta, AnalyticsService com 4 endpoints, SelfLearningService com sugestões
2. **Mobile:** Dashboard analytics, sugestões de ajuste, tela de config do Brain, polish visual
3. **Testes:** Analytics aggregation, self-learning suggestions
4. **i18n:** Revisão completa pt-BR/en/es em todas as telas novas

---

## CHECKLIST FINAL DE VALIDAÇÃO

Antes de considerar o KDS Brain completo, validar:

### Retrocompatibilidade
- [ ] Endpoints legados (`/orders/kds/kitchen`, `/orders/kds/bar`) continuam respondendo
- [ ] Restaurante sem estações configuradas vê comportamento antigo
- [ ] Pedidos sem `station_id` usam fallback de categorias
- [ ] Pedidos sem `fire_at` usam `created_at` como base

### i18n
- [ ] Zero strings hardcoded em telas novas
- [ ] Arquivos de tradução completos em pt-BR, en, es
- [ ] Mensagens de erro do backend usam chaves i18n

### Performance
- [ ] Endpoint de station queue responde em < 200ms
- [ ] WebSocket events chegam em < 500ms
- [ ] Cron de fire processing executa em < 2s
- [ ] Analytics queries com índices apropriados

### Segurança
- [ ] Todos os endpoints novos têm RBAC
- [ ] Webhooks validam signature/HMAC
- [ ] Credenciais de plataformas encriptadas em repouso
- [ ] Dados de delivery (endereço, telefone) excluídos do KDS (LGPD)

### Experiência
- [ ] Cozinheiro faz apenas swipe (nenhuma decisão de prioridade, sequência ou timing)
- [ ] Countdown mostra tempo restante, não decorrido
- [ ] Pratos de uma mesa ficam prontos juntos
- [ ] Pedido iFood/Rappi/UberEats aparece igual a pedido interno
- [ ] Item esgotado propaga para todas as plataformas em < 5s
