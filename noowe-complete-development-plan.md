# NOOWE — Plano de desenvolvimento completo (documento único para Claude Code)

> **Escopo:** KDS Brain + Financial Brain + Features competitivas — TUDO em um documento.
> **Stack:** NestJS + TypeScript + PostgreSQL + TypeORM + Redis + React Native
> **Gateways:** Asaas (cartão + PIX) + Stripe Terminal (Tap to Pay NFC)
> **Fiscal:** Focus NFe (Fase 1) → SEFAZ direta (Fase 2 futura, adapter pattern)
> **Data:** Março 2026
> **Prazo total:** 24 semanas (6 fases)

---

## CONTEXTO DO PROJETO EXISTENTE

### Stack técnica (manter exatamente)
- **Backend:** NestJS + TypeScript + PostgreSQL + TypeORM + Redis
- **Mobile:** React Native (apps separados: `restaurant`, `client`)
- **Shared:** `mobile/packages/shared/` com services, hooks (TanStack Query), i18n
- **Real-time:** WebSocket via NestJS Gateway (namespace `/orders`)
- **Auth:** JWT + RBAC (roles: OWNER, MANAGER, CHEF, BARMAN, WAITER, CUSTOMER)

### Estrutura de pastas existente (NÃO alterar, apenas adicionar)

```
platform/
├── backend/src/
│   ├── modules/
│   │   ├── orders/
│   │   │   ├── entities/ (order.entity.ts, order-item.entity.ts, order-guest.entity.ts)
│   │   │   ├── orders.service.ts, orders.controller.ts, orders.gateway.ts
│   │   │   ├── kds.service.ts, order-additions.service.ts
│   │   │   ├── helpers/ (kds-formatter.helper.ts, order-calculator.helper.ts)
│   │   │   └── dto/
│   │   ├── payments/
│   │   │   ├── payments.service.ts (427 lines), payments.controller.ts
│   │   │   ├── payment-split.service.ts
│   │   │   └── entities/ (wallet, wallet-transaction, payment-method, payment-split)
│   │   ├── financial/
│   │   │   ├── financial-transaction.service.ts, financial-report.service.ts
│   │   │   ├── financial.controller.ts
│   │   │   └── entities/ (financial-transaction)
│   │   ├── tips/ (tips.service.ts, tip entity)
│   │   ├── tabs/ (tabs.service.ts, tab-payments.service.ts, entities: tab, tab-member, tab-item, tab-payment)
│   │   ├── receipts/ (receipts.service.ts, receipt entity)
│   │   ├── promotions/ (promotions.service.ts, promotion entity)
│   │   └── loyalty/ (loyalty.service.ts, stamp-card entity)
│   └── common/enums/order-status.enum.ts
├── mobile/
│   ├── apps/restaurant/src/
│   │   ├── screens/ (kds/KDSScreen.tsx, barman-kds/BarmanKDSScreen.tsx, cook/CookStationScreen.tsx)
│   │   └── navigation/index.tsx
│   └── packages/shared/
│       ├── services/ (api.ts, socket.ts)
│       ├── hooks/ (useOrdersQuery.ts)
│       └── utils/ (formatters.ts)
```

### Entidades existentes (campos atuais — NÃO remover nenhum)

**Order:** id(UUID), restaurant_id, user_id, table_id(nullable), waiter_id(nullable), status(OrderStatus), order_type(delivery/pickup/dine_in/tab/table_tab), party_size, subtotal, tax_amount, tip_amount, discount_amount, total_amount, special_instructions, estimated_ready_at, actual_ready_at, completed_at, is_shared, metadata(JSONB), created_at, updated_at

**OrderItem:** id(UUID), order_id, menu_item_id, quantity, unit_price, total_price, status(pending/preparing/ready/delivered/cancelled), customizations(JSONB), special_instructions, ordered_by, prepared_by, prepared_at

**OrderStatus enum:** PENDING, CONFIRMED, PREPARING, READY, COMPLETING, DELIVERING, COMPLETED, CANCELLED, OPEN_FOR_ADDITIONS

**Wallet:** balance, wallet_type(CLIENT/RESTAURANT/STAFF), max_balance, daily_limit, monthly_limit

**WalletTransaction:** transaction_type(RECHARGE/WITHDRAWAL/PAYMENT), amount, balance_before, balance_after, order_id, external_transaction_id

**PaymentMethod:** card_last_four, card_brand, card_exp_month(encrypted), card_exp_year(encrypted), pix_key(encrypted), external_payment_method_id

**FinancialTransaction:** type(SALE/TIP/REFUND/EXPENSE/ADJUSTMENT), category, amount, description, order_id, restaurant_id

### Endpoints existentes (DEVEM continuar funcionando)
```
GET  /orders/kds/kitchen   → OWNER, MANAGER, CHEF
GET  /orders/kds/bar       → OWNER, MANAGER, BARMAN
PATCH /orders/:id/status   → OWNER, MANAGER, CHEF, BARMAN, WAITER
POST /payments/process     → CUSTOMER, OWNER, MANAGER (10/min, idempotency)
GET  /payments/wallet      → Multi-role
POST /payments/wallet/recharge → CUSTOMER, OWNER, MANAGER
```

### WebSocket existente
Namespace `/orders`, rooms: `restaurant:{id}`, `user:{id}`. Eventos: `order:created`, `order:updated`. Auth: JWT no handshake.

---

## REGRAS GLOBAIS (aplicar em TODA linha de código novo)

### i18n — obrigatório
**Backend:** Mensagens de erro usam chaves i18n.
**Mobile:** Zero strings hardcoded. Usar hook de i18n do projeto. Traduções em pt-BR, en, es.

Criar arquivos de tradução:
- `shared/i18n/locales/pt-BR/kds.json` — chaves para KDS, countdown, convergência, status
- `shared/i18n/locales/pt-BR/financial.json` — chaves para pagamentos, caixa, fiscal, forecast
- `shared/i18n/locales/pt-BR/menu.json` — chaves para cardápio digital, alérgenos, categorias
- Mesma estrutura para `/en/` e `/es/`

### Migrations
- Reversíveis (up + down). Naming: `{timestamp}-phase-{N}-{descricao}.ts`
- Nunca alterar migrations anteriores

### Testes
- Todo service novo tem testes unitários
- Adapters com mocks das APIs externas
- Testar transições de status válidas e inválidas

### Retrocompatibilidade
- Endpoints existentes DEVEM continuar funcionando
- Novos endpoints em rotas novas
- Fallback para dados legados (campos nullable com lógica de fallback)

---

## FASE 1 — FUNDAÇÃO (semanas 1-4)

**Objetivo:** KDS funcional com estações configuráveis + pagamento real (Asaas + Tap to Pay) + controle de caixa. Ao final, o restaurante pode operar.

---

### Task 1.1 — Entidade CookStation

**Criar:** `backend/src/modules/kds-brain/entities/cook-station.entity.ts`

```typescript
@Entity('cook_stations')
export class CookStation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) restaurant_id: string;
  @Column({ type: 'varchar', length: 100 }) name: string;
  @Column({ type: 'varchar', length: 20 }) type: 'kitchen' | 'bar';
  @Column({ type: 'varchar', length: 10, nullable: true }) emoji: string;
  @Column({ type: 'int', default: 15 }) late_threshold_minutes: number;
  @Column({ type: 'int', default: 0 }) display_order: number;
  @Column({ type: 'boolean', default: true }) is_active: boolean;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

**Migration:**
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

**CRUD controller + service + DTOs.**

**Endpoints:**
| Método | Rota | Roles |
|--------|------|-------|
| POST | `/kds/brain/stations` | OWNER, MANAGER |
| GET | `/kds/brain/stations?restaurant_id=X` | OWNER, MANAGER, CHEF, BARMAN |
| PATCH | `/kds/brain/stations/:id` | OWNER, MANAGER |
| DELETE | `/kds/brain/stations/:id` | OWNER, MANAGER |

---

### Task 1.2 — Novos campos MenuItem, Order, OrderItem

**Alterar MenuItem (migration):**
```sql
ALTER TABLE menu_items ADD COLUMN station_id UUID REFERENCES cook_stations(id) ON DELETE SET NULL;
ALTER TABLE menu_items ADD COLUMN estimated_prep_minutes INT DEFAULT 10;
ALTER TABLE menu_items ADD COLUMN course VARCHAR(20) DEFAULT 'main';
ALTER TABLE menu_items ADD COLUMN is_available BOOLEAN DEFAULT true;
ALTER TABLE menu_items ADD COLUMN photo_url TEXT;
ALTER TABLE menu_items ADD COLUMN allergens JSONB DEFAULT '[]';
ALTER TABLE menu_items ADD COLUMN ncm VARCHAR(8) DEFAULT '00000000';
ALTER TABLE menu_items ADD COLUMN cfop VARCHAR(4) DEFAULT '5102';
ALTER TABLE menu_items ADD COLUMN is_vegetarian BOOLEAN DEFAULT false;
ALTER TABLE menu_items ADD COLUMN is_vegan BOOLEAN DEFAULT false;
CREATE INDEX idx_menu_items_station ON menu_items(station_id);
```

**Alterar Order (migration):**
```sql
ALTER TABLE orders ADD COLUMN source VARCHAR(20) DEFAULT 'noowe';
ALTER TABLE orders ADD COLUMN source_order_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN delivery_rider_eta TIMESTAMP;
CREATE INDEX idx_orders_source ON orders(source);
```

**Alterar OrderItem (migration):**
```sql
ALTER TABLE order_items ADD COLUMN station_id UUID REFERENCES cook_stations(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD COLUMN fire_at TIMESTAMP;
ALTER TABLE order_items ADD COLUMN expected_ready_at TIMESTAMP;
ALTER TABLE order_items ADD COLUMN course VARCHAR(20);
CREATE INDEX idx_order_items_station_status ON order_items(station_id, status);
CREATE INDEX idx_order_items_fire_at ON order_items(fire_at);
```

**Ajustar `orders.service.ts`:** Na criação de pedido, copiar `station_id` e `course` do MenuItem para o OrderItem.

---

### Task 1.3 — Módulo kds-brain (estrutura + roteamento + prioridade)

**Criar estrutura:**
```
backend/src/modules/kds-brain/
├── kds-brain.module.ts
├── entities/cook-station.entity.ts
├── services/
│   ├── brain-router.service.ts      // Roteia items para estações por station_id
│   ├── brain-priority.service.ts    // Prioridade relativa ao prep time
│   └── item-availability.service.ts // 86/esgotado
├── controllers/
│   ├── cook-station.controller.ts
│   └── kds-brain.controller.ts
└── dto/
```

**BrainRouterService:** Busca OrderItems por `station_id`. Fallback: se `station_id` null, usa lógica legada de categorias do `kds.service.ts`.

**BrainPriorityService:**
- `ratio = tempo_decorrido_desde_fire / estimated_prep_minutes`
- ratio < 0.5 → queued | 0.5-0.9 → normal | 0.9-1.2 → high | > 1.2 → urgent
- Countdown: `remaining = expected_ready_at - now` (positivo=restante, negativo=atraso)

**Endpoints KDS Brain:**
| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| GET | `/kds/brain/stations/:stationId/queue` | OWNER,MANAGER,CHEF,BARMAN | Fila da estação |
| PATCH | `/kds/brain/items/:itemId/bump` | OWNER,MANAGER,CHEF,BARMAN | Swipe right: avança status |
| PATCH | `/kds/brain/items/:itemId/undo` | OWNER,MANAGER,CHEF,BARMAN | Swipe left: volta status |
| PATCH | `/kds/brain/menu-items/:id/toggle-available` | OWNER,MANAGER,CHEF,BARMAN | 86/esgotado |

Bump emite `order:updated` via WebSocket. Toggle 86 emite `menu:item_unavailable`.

---

### Task 1.4 — Swipe, countdown e alertas sonoros (mobile)

**Alterar** KDSScreen, BarmanKDSScreen, CookStationScreen:
- Swipe right (>100px) → `ApiService.bumpItem(itemId)` + haptic
- Swipe left (>100px) → `ApiService.undoItem(itemId)` + haptic
- Countdown: `remaining > 0 ? t('kds.countdown.remaining', {minutes}) : t('kds.countdown.late', {minutes: Math.abs(remaining)})`
- Cor: remaining > 3 → verde | 1-3 → amarelo | ≤ 0 → vermelho
- Sons: `new_order.mp3` no `item:fired`, `item_late.mp3` quando countdown ≤ 0
- Manter botões tap como fallback

**CookStationScreen:** Substituir tabs hardcoded por tabs dinâmicas carregadas de `ApiService.getStations(restaurantId)`.

**Criar** `restaurant/src/screens/kds-settings/StationSettingsScreen.tsx` — CRUD de estações.

---

### Task 1.5 — Payment gateway (Asaas + Stripe Tap to Pay)

**Criar:**
```
backend/src/modules/payment-gateway/
├── payment-gateway.module.ts
├── interfaces/gateway-adapter.interface.ts
├── services/gateway-router.service.ts
├── adapters/
│   ├── asaas/asaas.adapter.ts          // Cartão + PIX
│   ├── stripe-terminal/stripe-terminal.adapter.ts  // Tap to Pay
│   └── wallet/wallet.adapter.ts        // Wrapper do existente
├── controllers/
│   ├── gateway.controller.ts
│   └── webhook.controller.ts
├── entities/
│   ├── gateway-transaction.entity.ts
│   └── gateway-config.entity.ts
└── dto/
```

**GatewayAdapter interface:**
```typescript
interface GatewayAdapter {
  readonly provider: 'asaas' | 'stripe_terminal' | 'wallet' | 'cash';
  processPayment(params: ProcessPaymentParams): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount?: number): Promise<RefundResult>;
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
}
```

**Asaas adapter:** API v3, REST. Cartão (tokenização via Asaas.js), PIX (retorna QR base64 + copia-e-cola). Webhooks: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_REFUNDED. Auth: header `access_token`. Consultar https://docs.asaas.com antes de implementar.

**Stripe Terminal adapter:** Tap to Pay NFC. Backend cria ConnectionToken e PaymentIntent. Mobile usa `@stripe/stripe-terminal-react-native` para discover reader (tapToPay), connect, collect, confirm. Consultar https://docs.stripe.com/terminal antes de implementar.

**Migration:**
```sql
CREATE TABLE gateway_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  provider VARCHAR(20) NOT NULL,
  credentials JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  settings JSONB,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(restaurant_id, provider)
);
CREATE TABLE gateway_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id),
  provider VARCHAR(20) NOT NULL,
  external_id VARCHAR(255),
  payment_method VARCHAR(20) NOT NULL,
  amount_cents INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL,
  correlation_id VARCHAR(255),
  metadata JSONB,
  error_code VARCHAR(50),
  error_message TEXT,
  refunded_amount_cents INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_gateway_tx_order ON gateway_transactions(order_id);
CREATE INDEX idx_gateway_tx_idempotency ON gateway_transactions(idempotency_key);
```

**Endpoints:**
| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| POST | `/payment-gateway/process` | CUSTOMER,OWNER,MANAGER,WAITER | Processar pagamento |
| POST | `/payment-gateway/connection-token` | OWNER,MANAGER,WAITER | Token Stripe Terminal |
| POST | `/payment-gateway/tap-to-pay/intent` | OWNER,MANAGER,WAITER | Criar PaymentIntent |
| GET | `/payment-gateway/pix/:orderId/qrcode` | CUSTOMER | QR Code PIX |
| POST | `/payment-gateway/refund/:txId` | OWNER,MANAGER | Estorno |
| POST | `/payment-gateway/webhooks/asaas` | Public (validate sig) | Webhook Asaas |
| POST | `/payment-gateway/webhooks/stripe` | Public (validate sig) | Webhook Stripe |

**Alterar `payments.service.ts`:** Rotear para adapter correto baseado em payment_method.

**Mobile:** Criar `TapToPayScreen.tsx` com animação NFC, "Aproxime o cartão", resultado.

---

### Task 1.6 — Controle de caixa

**Criar:** `backend/src/modules/cash-register/`

**Entidades:**
```typescript
@Entity('cash_register_sessions')
// id, restaurant_id, opened_by, closed_by, opening_balance, expected_balance,
// actual_balance, difference, status('open'|'closed'), opened_at, closed_at, closing_notes

@Entity('cash_register_movements')
// id, session_id, type('sale_cash'|'sale_card'|'sale_pix'|'sale_tap'|'sale_wallet'|
// 'tip'|'sangria'|'reforco'|'refund'|'expense'), amount, is_cash(boolean),
// order_id, created_by, description, created_at
```

**Lógica:** Apenas 1 sessão aberta por restaurante. Cada pagamento cria CashRegisterMovement automaticamente. Sangria/reforço manual. Fechamento calcula `expected = opening + SUM(movements WHERE is_cash)`.

**Endpoints:**
| Método | Rota | Roles |
|--------|------|-------|
| POST | `/cash-register/open` | OWNER, MANAGER |
| GET | `/cash-register/current` | OWNER, MANAGER, WAITER |
| POST | `/cash-register/movement` | OWNER, MANAGER |
| POST | `/cash-register/close` | OWNER, MANAGER |
| GET | `/cash-register/sessions/:id/report` | OWNER, MANAGER |

---

### Critérios de aceite Fase 1:
- [ ] Estações configuráveis por restaurante (CRUD)
- [ ] KDS com countdown decrescente, swipe gestures, alertas sonoros
- [ ] CookStationScreen com tabs dinâmicas do banco
- [ ] Item 86 com propagação WebSocket
- [ ] Pagamento cartão (Asaas sandbox) funcional
- [ ] PIX com QR Code (Asaas sandbox) funcional
- [ ] Tap to Pay (Stripe Terminal) funcional no celular do garçom
- [ ] Wallet e cash retrocompatíveis
- [ ] Controle de caixa abertura/fechamento com diferença
- [ ] i18n em todas as telas novas

---

## FASE 2 — INTELIGÊNCIA (semanas 5-8)

**Objetivo:** Cozinha orquestrada (auto-fire, convergência). Owner vê custo e margem real.

---

### Task 2.1 — FireSchedule + AutoFireService

**Criar entidade:**
```typescript
@Entity('fire_schedules')
// id, order_id, order_item_id, station_id, course, fire_at(timestamp),
// expected_ready_at(timestamp), actual_ready_at, fired(boolean), fire_mode('auto'|'manual'|'immediate'),
// created_at
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
```

**AutoFireService:**
- `createFireSchedule(order)`: Agrupa items por course. Course 1 = fire imediato. Demais = fire_mode='auto', ativado quando course anterior fica ready. Dentro de um course, item mais lento define critical path; items rápidos recebem delay.
- Para delivery: backward scheduling a partir do `delivery_rider_eta`.
- `@Cron('*/30 * * * * *') processFireQueue()`: Busca `fire_at <= now AND fired=false`, marca fired=true, atualiza OrderItem.fire_at, emite `item:fired` via WebSocket.
- `fireNextCourse(orderId, completedCourse)`: Chamado quando convergence:complete do course anterior.

---

### Task 2.2 — AutoSyncService (convergência)

**AutoSyncService:**
- `getConvergenceState(orderId, course)`: Retorna `{ stations: [{name, emoji, status}], ready_count, total_count, is_complete }`.
- `checkConvergence(orderItemId)`: Quando item é bumped para ready, verifica se todos os items do mesmo course/order estão ready. Se sim, emite `convergence:complete` → dispara `fireNextCourse`.

**WebSocket:** `convergence:updated` → emitido para `restaurant:{id}` sempre que item muda status.

**Endpoint:** `GET /kds/brain/orders/:orderId/convergence?course=main`

---

### Task 2.3 — ChefViewScreen

**Criar:** `restaurant/src/screens/chef-view/ChefViewScreen.tsx`

Visão panorâmica: cards por estação (ativos, atrasados, tempo médio), métricas globais (mesas ativas, delivery na fila), alertas (items atrasados, riders chegando). Tap em estação → navega para fila.

**Endpoint:** `GET /kds/brain/chef/overview?restaurant_id=X`

---

### Task 2.4 — COGS e margem por prato

**Criar:** `backend/src/modules/cost-control/`

**Entidades:**
```typescript
@Entity('ingredients')
// id, restaurant_id, name, unit('kg'|'l'|'un'|'g'|'ml'), category, is_active

@Entity('ingredient_prices')
// id, ingredient_id, price_per_unit(DECIMAL 10,4), supplier, effective_date

@Entity('recipes')
// id, menu_item_id(FK MenuItem 1:1), restaurant_id, calculated_cost, calculated_margin_pct, last_calculated_at

@Entity('recipe_ingredients')
// id, recipe_id, ingredient_id, quantity(DECIMAL 10,4)
```

**COGSService:** Quando OrderItem é pago, busca Recipe → calcula custo × quantidade → registra FinancialTransaction tipo 'COGS'. Se Recipe não existe, registra com custo 0 + alerta 'no_recipe'.

**MarginTrackerService:** Endpoints para dashboard: margens por item, alertas margem < 25%, food cost % do período.

**Mobile:** RecipeScreen (ficha técnica), MarginDashboardScreen.

---

### Task 2.5 — Items "aguardando fire" no display

**Mobile (todas as telas KDS):** Items com `fired=false` aparecem como cards tracejados, opacidade 0.6, "Começa em X min", swipe desabilitado. Quando `item:fired` via WebSocket, transiciona para card ativo com animação.

---

### Critérios de aceite Fase 2:
- [ ] Auto-fire por course funciona (entrada fired imediato, principal aguarda)
- [ ] Convergência entre estações com barra de progresso
- [ ] Chef vê panorama em uma tela
- [ ] Ficha técnica cadastrável por prato
- [ ] COGS registrado automaticamente a cada venda
- [ ] Margem por prato visível no dashboard
- [ ] Items aguardando fire aparecem tracejados no KDS

---

## FASE 3 — INTEGRAÇÃO (semanas 9-12)

**Objetivo:** Delivery entra no KDS. NFC-e automática. Reconciliação de comissões.

---

### Task 3.1 — Integração delivery (iFood/Rappi/UberEats)

**Criar:** `backend/src/modules/integrations/`

```
integrations/
├── integrations.module.ts
├── interfaces/platform-adapter.interface.ts
├── services/ (order-normalizer, status-sync, capacity-manager)
├── controllers/ (webhook.controller.ts)
├── platforms/ (ifood/, rappi/, ubereats/ — cada um com adapter, auth, types)
├── entities/ (platform-connection, external-menu-mapping)
└── dto/ (normalized-order)
```

**PlatformAdapter interface:** validateWebhook, normalizeOrder, confirmOrder, rejectOrder, syncStatus, setPreparationTime.

**Entidades:**
```sql
CREATE TABLE platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  platform VARCHAR(20) NOT NULL,
  credentials JSONB NOT NULL,
  webhook_secret VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  auto_accept BOOLEAN DEFAULT true,
  max_concurrent_orders INT DEFAULT 30,
  last_sync_at TIMESTAMP,
  UNIQUE(restaurant_id, platform)
);
CREATE TABLE external_menu_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  platform VARCHAR(20) NOT NULL,
  external_item_id VARCHAR(255) NOT NULL,
  external_item_name VARCHAR(255),
  internal_menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(restaurant_id, platform, external_item_id)
);
```

**Webhook controller:** `POST /integrations/webhooks/:platform/orders` — valida, normaliza, verifica capacidade, cria Order, Brain processa, confirma na plataforma.

**StatusSyncService:** Escuta `order.status.changed`, se source != 'noowe', chama adapter.syncStatus.

**Mobile:** Badge de origem ("iFood", "Rappi"), ETA rider, tela config integrações + mapeamento menu.

---

### Task 3.2 — Módulo fiscal (NFC-e via Focus NFe)

**Criar:** `backend/src/modules/fiscal/`

```
fiscal/
├── fiscal.module.ts
├── interfaces/fiscal-adapter.interface.ts
├── adapters/
│   ├── focus-nfe/focus-nfe.adapter.ts       // FASE 1: API intermediária
│   └── sefaz-direct/sefaz-direct.adapter.ts // FASE 2: placeholder NotImplementedException
├── entities/ (fiscal-document, fiscal-config)
├── services/ (fiscal-emission, fiscal-onboarding)
├── controllers/ (fiscal.controller.ts, fiscal-webhook.controller.ts)
└── dto/
```

**FiscalAdapter interface:** emitNfce, cancelNfce, consultNfce, invalidateRange.

**Focus NFe adapter:**
- Emissão: `POST /v2/nfce?ref={ref}` com dados em JSON. Focus monta XML, assina, transmite à SEFAZ.
- Certificado A1 do restaurante enviado UMA VEZ para Focus NFe via upload endpoint. NOOWE NÃO armazena certificado na Fase 1.
- Webhooks: NFC-e autorizada, cancelada, erro.
- Auth: `Authorization: Token token={api_token}`. Consultar https://focusnfe.com.br/doc/.

**Entidades:**
```sql
CREATE TABLE fiscal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL, order_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL, status VARCHAR(20) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  access_key VARCHAR(44), number INT, series INT,
  xml TEXT, qr_code_url TEXT, danfe_url TEXT, protocol TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  items_snapshot JSONB, external_ref VARCHAR(255), error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE fiscal_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL UNIQUE,
  cnpj VARCHAR(14) NOT NULL, ie VARCHAR(15),
  razao_social VARCHAR(200) NOT NULL, nome_fantasia VARCHAR(200),
  state_code VARCHAR(2) NOT NULL, endereco JSONB NOT NULL,
  regime_tributario VARCHAR(30) NOT NULL,
  tax_defaults JSONB NOT NULL,
  csc_id VARCHAR(10), csc_token VARCHAR(255),
  current_series INT DEFAULT 1, next_number INT DEFAULT 1,
  fiscal_provider VARCHAR(20) DEFAULT 'focus_nfe',
  focus_nfe_token VARCHAR(255),
  certificate_uploaded BOOLEAN DEFAULT false,
  auto_emit BOOLEAN DEFAULT true, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);
```

**FiscalEmissionService:** Chamado quando pagamento é confirmado (se auto_emit=true). Monta EmitNfceParams, chama adapter, salva FiscalDocument, incrementa next_number.

**Mapeamento pagamento → código fiscal:** cash='01', credit_card='03', debit_card='04', pix='17', wallet='05'.

**Mobile:** FiscalSetupScreen (onboarding), QR Code fiscal no DigitalReceiptScreen.

---

### Task 3.3 — Reconciliação de delivery

**Criar:** `backend/src/modules/reconciliation/`

**Entidade:**
```sql
CREATE TABLE delivery_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL, platform VARCHAR(20) NOT NULL,
  settlement_date DATE, gross_amount DECIMAL(10,2),
  commission_amount DECIMAL(10,2), expected_net DECIMAL(10,2),
  actual_received DECIMAL(10,2), difference DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending', order_count INT,
  created_at TIMESTAMP DEFAULT now()
);
```

Taxas configuráveis por plataforma. Na criação do pedido delivery: registra gross + comissão estimada. Quando repasse chega: concilia e alerta discrepâncias.

---

### Task 3.4 — Event listeners (sinergia KDS ↔ Financial)

```typescript
@OnEvent('order.payment.confirmed') → FinancialTransaction(SALE) + CashRegisterMovement + NFC-e + DeliverySettlement
@OnEvent('order.item.ready') → COGS registro
@OnEvent('menu.item.unavailable') → Propaga para plataformas delivery
```

---

### Critérios de aceite Fase 3:
- [ ] Pedido iFood/Rappi/UberEats aparece no KDS igual pedido do salão
- [ ] Status sincronizado de volta para plataformas
- [ ] NFC-e emitida automaticamente via Focus NFe (sandbox)
- [ ] QR Code fiscal no recibo digital
- [ ] Reconciliação de comissões delivery
- [ ] Adapter SEFAZ Direct existe como placeholder

---

## FASE 4 — ANALYTICS E AUTOMAÇÃO (semanas 13-16)

**Objetivo:** Dados, previsões, automação de gorjetas, export contábil.

---

### Task 4.1 — Analytics de cozinha

**Entidade:**
```sql
CREATE TABLE prep_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL, station_id UUID NOT NULL,
  menu_item_id UUID NOT NULL, order_item_id UUID NOT NULL,
  expected_prep_minutes INT, actual_prep_minutes INT,
  was_late BOOLEAN DEFAULT false,
  shift VARCHAR(20), source VARCHAR(20), day_of_week VARCHAR(10),
  recorded_at TIMESTAMP DEFAULT now()
);
```

**Coleta:** Quando OrderItem bumped para ready, calcula actual_prep = now - fire_at.

**Endpoints:** `/kds/brain/analytics/prep-times`, `/bottlenecks`, `/throughput`, `/platform-performance`.

---

### Task 4.2 — Self-learning

**SelfLearningService:** Job semanal. Para cada MenuItem com 20+ registros: calcula média real. Se diferença > 20% do estimated_prep_minutes: sugere ajuste (nunca aplica automaticamente). Owner aceita/rejeita.

---

### Task 4.3 — Cash flow forecast

**ForecastService:** Projeção 7/30/90 dias usando média ponderada vendas por dia_da_semana + contas a pagar agendadas + repasses delivery pendentes. Alertas quando saldo projetado < threshold.

**Endpoint:** `GET /financial-brain/forecast?restaurant_id=X&days=30`

---

### Task 4.4 — Dashboard financeiro inteligente (mobile)

Evoluir FinancialScreen: receita por canal (salão/iFood/Rappi), margem, food cost %, alertas, status caixa, link para forecast.

---

### Task 4.5 — Automação de gorjetas

Quando caixa é fechado: busca gorjetas PENDING do período, aplica regra de distribuição (auto_equal/auto_by_role/manual), distribui para wallets do staff.

---

### Task 4.6 — Export contábil + Contas a pagar

**Export:** CSV, OFX, PDF. Agendamento mensal por email.

**Contas a pagar:**
```sql
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL, description VARCHAR(200),
  supplier VARCHAR(200), category VARCHAR(50),
  amount DECIMAL(10,2), due_date DATE, paid_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  is_recurring BOOLEAN DEFAULT false, recurrence VARCHAR(20),
  created_at TIMESTAMP DEFAULT now()
);
```

Integra com forecast (contas agendadas entram na projeção).

---

### Critérios de aceite Fase 4:
- [ ] Analytics de cozinha com tempos reais
- [ ] Sugestões de ajuste de prep time
- [ ] Forecast 7/30/90 dias com alertas
- [ ] Gorjetas distribuídas automaticamente no fechamento
- [ ] Export contábil funcional
- [ ] Contas a pagar com integração no forecast

---

## FASE 5 — TABLE STAKES COMPETITIVOS (semanas 17-20)

**Objetivo:** Features que o mercado exige. Sem elas, o restaurante escolhe Anota AI por R$99/mês.

---

### Task 5.1 — Cardápio digital QR Code com autoatendimento

**Criar:** `backend/src/modules/digital-menu/`

Cardápio web acessível via QR Code na mesa. URL: `https://menu.noowe.com/{slug}?table={table_id}`. Cliente navega categorias, vê fotos/descrições/alérgenos, monta pedido, confirma. Pedido entra como Order dine_in normal → KDS Brain processa.

**Entidade:**
```sql
CREATE TABLE menu_qr_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  slug VARCHAR(100) NOT NULL UNIQUE,
  self_order_enabled BOOLEAN DEFAULT true,
  self_pay_enabled BOOLEAN DEFAULT true,
  delivery_enabled BOOLEAN DEFAULT false,
  delivery_price_markup_pct DECIMAL(5,2),
  theme JSONB, operating_hours JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

**Endpoints públicos (rate limited):**
| Método | Rota | Auth |
|--------|------|------|
| GET | `/menu/:slug` | Public |
| POST | `/menu/:slug/order` | Public |
| POST | `/menu/:slug/call-waiter` | Public |

Diferencial: mesmo cardápio para mesa e delivery, preços diferentes configuráveis. Pedido via QR vai direto para KDS Brain.

**Mobile:** Tela para gerar/imprimir QR Codes por mesa.

---

### Task 5.2 — Gestão de mesas (mapa visual)

**Alterar entidade Table existente (migration):**
```sql
ALTER TABLE tables ADD COLUMN IF NOT EXISTS position_x INT DEFAULT 0;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS position_y INT DEFAULT 0;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS shape VARCHAR(20) DEFAULT 'square';
ALTER TABLE tables ADD COLUMN IF NOT EXISTS width INT DEFAULT 1;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS height INT DEFAULT 1;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS section VARCHAR(50);
ALTER TABLE tables ADD COLUMN IF NOT EXISTS assigned_waiter_id UUID;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS current_status VARCHAR(20) DEFAULT 'available';
ALTER TABLE tables ADD COLUMN IF NOT EXISTS occupied_since TIMESTAMP;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS current_order_id UUID;
```

**Mobile:** TableMapScreen (mapa visual, cores por status, tap para detalhes). TableLayoutEditorScreen (drag-and-drop para posicionar mesas, seções, formas). WebSocket atualiza status real-time.

---

### Task 5.3 — Modo offline (PDV + NFC-e contingência)

**Criar:** `shared/services/offline-queue.service.ts`

Fila offline com AsyncStorage/SQLite. Operações offline: venda dinheiro, movimento caixa, NFC-e contingência. Detecção via NetInfo. Banner "Modo offline". Ao reconectar: sync automático com idempotency. Pagamento cartão/PIX NÃO funciona offline.

---

### Task 5.4 — Import NF-e de compra + Estoque automático

**Criar:** `backend/src/modules/purchase-import/` e `backend/src/modules/stock/`

3 métodos de import: consulta SEFAZ (via Focus NFe MD-e), chave de acesso, upload XML. Parser extrai fornecedor, items, quantidades, preços. Match com Ingredient existente. Cria IngredientPrice. Alimenta estoque.

**Entidade estoque:**
```sql
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  restaurant_id UUID NOT NULL,
  current_quantity DECIMAL(10,4) DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  min_quantity DECIMAL(10,4),
  last_purchase_price DECIMAL(10,4),
  updated_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_stock_restaurant ON stock_items(restaurant_id);
```

**Baixa automática:** Quando OrderItem pago → deduz ingredientes da Recipe do estoque. Se abaixo do mínimo → alerta `stock:low`.

---

### Critérios de aceite Fase 5:
- [ ] Cardápio QR Code funcional com autoatendimento
- [ ] Mapa visual de mesas com status real-time
- [ ] Editor layout drag-and-drop
- [ ] Modo offline para vendas em dinheiro
- [ ] NFC-e contingência offline
- [ ] Import NF-e de compra (3 métodos)
- [ ] Estoque com baixa automática e alertas

---

## FASE 6 — DIFERENCIAÇÃO (semanas 21-24)

**Objetivo:** Features que criam retenção e completam a experiência. CRM, reservas, fidelidade.

---

### Task 6.1 — Reservas online com Google Reserve

**Criar:** `backend/src/modules/reservations/`

**Entidade:**
```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL, user_id UUID,
  table_id UUID, date DATE NOT NULL, time TIME NOT NULL,
  party_size INT NOT NULL, status VARCHAR(20) DEFAULT 'confirmed',
  customer_name VARCHAR(200), customer_phone VARCHAR(20), customer_email VARCHAR(200),
  special_requests TEXT,
  source VARCHAR(20) DEFAULT 'app',
  confirmed_at TIMESTAMP, cancelled_at TIMESTAMP, reminder_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_reservations_restaurant_date ON reservations(restaurant_id, date);
```

Confirmação automática email/push. Lembrete 2h antes (cron job). No-show tracking. Integração mapa de mesas (mesa reservada = roxo). Adapter para Google Reserve (placeholder ou funcional).

---

### Task 6.2 — CRM do cliente

**Criar:** `backend/src/modules/customer-crm/`

**Entidade (enriquece Profile existente):**
```sql
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  restaurant_id UUID NOT NULL,
  total_visits INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  avg_ticket DECIMAL(10,2) DEFAULT 0,
  last_visit_at TIMESTAMP,
  favorite_items JSONB DEFAULT '[]',
  dietary_preferences JSONB DEFAULT '[]',
  segment VARCHAR(20) DEFAULT 'new',
  birthday DATE,
  UNIQUE(user_id, restaurant_id)
);
```

Segmentação automática: VIP (5+ visitas ou ticket > R$200), recurring (2-4/mês), dormant (30+ dias sem visita), new. Push notification por segmento. Cupom aniversário automático. Perfil visível quando cliente faz reserva/check-in.

---

### Task 6.3 — Fidelidade (cashback + pontos)

Evolução do stamp-card existente: cashback automático (X% do valor → crédito wallet), pontos por valor gasto (R$1 = 1 ponto), resgate no pagamento. Configurável por restaurante.

---

### Critérios de aceite Fase 6:
- [ ] Reservas online com confirmação automática
- [ ] Mesa reservada visível no mapa
- [ ] CRM com segmentação automática
- [ ] Push notifications por segmento
- [ ] Cashback e pontos funcionais
- [ ] Perfil do cliente visível ao garçom/hostess

---

## CHECKLIST FINAL

### Retrocompatibilidade
- [ ] Endpoints legados funcionam
- [ ] Restaurante sem config nova vê comportamento antigo
- [ ] App cliente não quebra

### i18n
- [ ] Zero strings hardcoded (pt-BR, en, es)

### Performance
- [ ] Endpoints < 200ms, WebSocket < 500ms, QR menu < 2s no 4G

### Segurança
- [ ] RBAC todos endpoints, webhooks validam signature
- [ ] Dados sensíveis criptografados, LGPD respeitada

### Experiência
- [ ] Cozinheiro: só faz swipe
- [ ] Garçom: celular = maquininha
- [ ] Owner: margem + forecast + gargalos numa tela
- [ ] Cliente: escaneia QR, pede, paga no celular
- [ ] Ninguém precisa de manual — interface guia

---

## RESUMO

| Fase | Semanas | Foco | Tasks |
|------|---------|------|-------|
| 1 | 1-4 | Fundação (KDS + Gateway + Caixa) | 6 |
| 2 | 5-8 | Inteligência (Auto-fire + COGS) | 5 |
| 3 | 9-12 | Integração (Delivery + NFC-e + Reconciliação) | 4 |
| 4 | 13-16 | Analytics (Forecast + Self-learning) | 6 |
| 5 | 17-20 | Table Stakes (QR Menu + Mesas + Offline + Estoque) | 4 |
| 6 | 21-24 | Diferenciação (Reservas + CRM + Fidelidade) | 3 |
| **Total** | **24 semanas** | **12 módulos novos** | **28 macro-tasks** |
