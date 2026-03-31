# Gap Analysis — Plano Completo vs Implementado

> Gerado em 2026-03-29 | Baseado na auditoria do `noowe-complete-development-plan.md`

---

## Scorecard Geral

| Fase | Tasks | Implementado | Parcial | Faltando | % |
|------|:-----:|:------------:|:-------:|:--------:|---|
| 1 — Fundação | 6 | 6 | 0 | 0 | **100%** |
| 2 — Inteligência | 5 | 4 | 1 | 0 | **90%** |
| 3 — Integração | 4 | 3 | 1 | 0 | **88%** |
| 4 — Analytics | 6 | 5 | 1 | 0 | **92%** |
| 5 — Table Stakes | 4 | 0 | 2 | 2 | **25%** |
| 6 — Diferenciação | 3 | 0 | 2 | 1 | **17%** |
| **TOTAL** | **28** | **18** | **7** | **3** | **75%** |

---

## Itens 100% Implementados (18/28)

| # | Task | Fase |
|---|------|------|
| 1.1 | CookStation entity + CRUD | 1 |
| 1.2 | MenuItem novos campos (station, prep, course, ncm, cfop) | 1 |
| 1.3 | KDS Brain module (router, priority, 86) | 1 |
| 1.4 | Swipe + countdown + dynamic stations mobile | 1 |
| 1.5 | Payment Gateway (Asaas + Stripe Terminal) | 1 |
| 1.6 | Cash Register (open/close/movements) | 1 |
| 2.1 | FireSchedule + AutoFireService | 2 |
| 2.2 | AutoSyncService (convergência) | 2 |
| 2.3 | ChefViewScreen | 2 |
| 2.4 | COGS + Cost Control (ingredients, recipes, margins) | 2 |
| 3.1 | Delivery integrations (iFood/Rappi/UberEats) | 3 |
| 3.2 | Fiscal NFC-e (Focus NFe + SEFAZ placeholder) | 3 |
| 3.3 | Reconciliação delivery | 3 |
| 4.1 | KDS Analytics (PrepAnalytics) | 4 |
| 4.2 | Self-learning (sugestões de prep time) | 4 |
| 4.3 | Cash flow forecast | 4 |
| 4.4 | Dashboard financeiro evoluído | 4 |
| 4.6 | Export contábil + Contas a pagar (Bills) | 4 |

---

## Gap Detalhado — 10 Itens Pendentes

### PARCIAIS (7 itens — precisam de complemento)

#### GAP-1: Items "aguardando fire" display (Task 2.5)
- **Status:** ⚠️ Parcial
- **Implementado:** Lógica de `is_fired` no CookStationScreen, cards diferenciados
- **Faltando:** Animação de transição quando `item:fired` é recebido via WebSocket
- **Esforço:** 2h (Mobile)

#### GAP-2: Event listeners KDS ↔ Financial (Task 3.4)
- **Status:** ⚠️ Parcial
- **Implementado:** Chamadas diretas entre services
- **Faltando:** Instalar `@nestjs/event-emitter`, criar listeners `@OnEvent('order.payment.confirmed')`, `@OnEvent('order.item.ready')`, `@OnEvent('menu.item.unavailable')` para desacoplar KDS e Financial
- **Esforço:** 4h (Backend)

#### GAP-3: Tip automation (Task 4.5)
- **Status:** ⚠️ Parcial
- **Implementado:** TipsService com distribuição manual, TipsDistributionScreen
- **Faltando:** Campo `tip_distribution_mode` no restaurante config, cron job no fechamento de caixa para auto-distribuição, distribuição para wallet dos staff
- **Esforço:** 4h (Backend + Mobile)

#### GAP-4: Table map visual (Task 5.2)
- **Status:** ⚠️ Parcial
- **Implementado:** Table entity com position_x, position_y; FloorPlanScreen existe
- **Faltando:** Campos `shape`, `width`, `height`, `section` na entity; Editor drag-and-drop; Visualização de seções
- **Esforço:** 8h (Backend migration + Mobile screen)

#### GAP-5: Offline mode (Task 5.3)
- **Status:** ⚠️ Parcial
- **Implementado:** `offline-storage.ts` com sync queue e cache
- **Faltando:** NFC-e em contingência offline; Processamento de venda dinheiro offline; Banner "Modo offline" nas telas de operação
- **Esforço:** 8h (Mobile + Backend)

#### GAP-6: Reservations online (Task 6.1)
- **Status:** ⚠️ Parcial
- **Implementado:** Reservations module completo com entity, service, controller, WebSocket gateway
- **Faltando:** Google Reserve adapter; Cron de reminder (2h antes); No-show tracking; Email/push de confirmação automática
- **Esforço:** 6h (Backend + Mobile)

#### GAP-7: Loyalty cashback + pontos (Task 6.3)
- **Status:** ⚠️ Parcial
- **Implementado:** Loyalty module com stamp cards; LoyaltyProgram entity com points
- **Faltando:** Cashback automático (X% → wallet); Pontos por valor gasto (R$1 = 1 ponto); Resgate no fluxo de pagamento; Config por restaurante
- **Esforço:** 6h (Backend + Mobile)

### NÃO IMPLEMENTADOS (3 itens — precisam ser criados do zero)

#### GAP-8: Digital menu QR Code com autoatendimento (Task 5.1) 🔴
- **Status:** ❌ Não implementado
- **O que falta:**
  - Backend: Módulo `digital-menu` com `menu_qr_configs` entity
  - Endpoints públicos: `GET /menu/:slug`, `POST /menu/:slug/order`, `POST /menu/:slug/call-waiter`
  - Frontend web: Página de cardápio responsiva (React/Next.js ou similar)
  - Mobile restaurant: Tela para gerar QR Codes por mesa
  - Integração com KDS Brain (pedido via QR → Order normal → auto-fire)
- **Esforço:** 16h (Backend + Web frontend + Mobile)
- **Impacto:** ALTO — feature competitiva essencial

#### GAP-9: Purchase import + Stock (Task 5.4) 🔴
- **Status:** ❌ Não implementado
- **O que falta:**
  - Backend: Módulo `purchase-import` (parser XML NF-e, match com ingredients)
  - Backend: Módulo `stock` com `stock_items` entity
  - Baixa automática: Quando OrderItem pago → deduz ingredientes do Recipe
  - Alerta `stock:low` quando abaixo do mínimo
  - Mobile restaurant: Tela de estoque + import
- **Esforço:** 12h (Backend + Mobile)
- **Impacto:** ALTO — operação fundamental

#### GAP-10: Customer CRM (Task 6.2) 🔴
- **Status:** ❌ Não implementado
- **O que falta:**
  - Backend: Módulo `customer-crm` com `customer_profiles` entity
  - Segmentação automática: VIP, recurring, dormant, new
  - Push notification por segmento
  - Cupom de aniversário automático
  - Perfil visível ao garçom/hostess
  - Mobile restaurant: Tela de CRM + segmentos
- **Esforço:** 10h (Backend + Mobile)
- **Impacto:** MÉDIO — retenção e marketing

---

## Plano de Execução Estruturado

### Sprint GAP-1: "Quick Wins" (~14h)
**Objetivo:** Fechar os 4 gaps mais rápidos.

| # | Gap | Esforço | Responsável |
|---|-----|---------|-------------|
| 1 | GAP-1: Animação fire transition | 2h | Mobile |
| 2 | GAP-2: Event emitter integration | 4h | Backend |
| 3 | GAP-3: Tip auto-distribution | 4h | Backend + Mobile |
| 4 | GAP-4: Table shape/size fields | 4h | Backend migration |

### Sprint GAP-2: "Core Features" (~28h)
**Objetivo:** Implementar os 3 módulos faltantes.

| # | Gap | Esforço | Responsável |
|---|-----|---------|-------------|
| 5 | GAP-8: Digital menu QR Code | 16h | Backend + Web + Mobile |
| 6 | GAP-9: Stock + Purchase import | 12h | Backend + Mobile |

### Sprint GAP-3: "Customer & Polish" (~28h)
**Objetivo:** CRM, loyalty completo, reservas avançadas, offline.

| # | Gap | Esforço | Responsável |
|---|-----|---------|-------------|
| 7 | GAP-10: Customer CRM | 10h | Backend + Mobile |
| 8 | GAP-7: Loyalty cashback + pontos | 6h | Backend + Mobile |
| 9 | GAP-6: Reservations (Google Reserve + reminders) | 6h | Backend + Mobile |
| 10 | GAP-5: Offline mode (NFC-e contingência) | 6h | Mobile |

---

## Resumo

| Métrica | Valor |
|---------|-------|
| Tasks do plano | 28 |
| 100% implementadas | 18 (64%) |
| Parcialmente implementadas | 7 (25%) |
| Não implementadas | 3 (11%) |
| **Score geral** | **75%** |
| Horas para 100% | **~70h** |
| Sprints estimados | **3 sprints (1 semana cada)** |

### Priorização por impacto:

| Prioridade | Item | Impacto |
|------------|------|---------|
| 🔴 1 | Digital menu QR Code (GAP-8) | Feature competitiva — todos concorrentes têm |
| 🔴 2 | Stock + Purchase import (GAP-9) | Operação fundamental — controle de insumos |
| 🟠 3 | Customer CRM (GAP-10) | Retenção — segmentação + push + aniversário |
| 🟠 4 | Event emitter wiring (GAP-2) | Arquitetura — desacoplamento KDS ↔ Financial |
| 🟡 5 | Tip automation (GAP-3) | Operação — menos trabalho manual |
| 🟡 6 | Loyalty cashback (GAP-7) | Retenção — pontos + resgate |
| 🟡 7 | Reservations advanced (GAP-6) | Diferenciação — Google Reserve + reminders |
| 🟢 8 | Table visual editor (GAP-4) | UX — drag-and-drop mesas |
| 🟢 9 | Fire animation (GAP-1) | Polish — UX refinamento |
| 🟢 10 | Offline contingência (GAP-5) | Resiliência — NFC-e offline |
