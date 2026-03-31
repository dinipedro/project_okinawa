# Auditoria Bidirecional Completa — Client ↔ Backend ↔ Restaurant

> **Data:** 2026-03-29
> **Método:** Trace de dados real — leitura de código fonte de cada tela, serviço e gateway
> **Escopo:** 40 fluxos bidirecionais (18 Client→Restaurant + 22 Restaurant→Client)

---

## RESUMO EXECUTIVO

| Categoria | Real-Time (WebSocket) | Polling Only | Broken/Missing | Total |
|-----------|:--------------------:|:------------:|:--------------:|:-----:|
| **Client → Restaurant** | 7 | 7 | 4 | 18 |
| **Restaurant → Client** | 5 | 7 | 5 | 17* |
| **TOTAL** | **12** | **14** | **9** | **35** |

*Alguns fluxos se sobrepõem entre as direções.

---

## FLUXOS REAL-TIME (12) ✅

Estes fluxos funcionam via WebSocket — dados chegam em tempo real:

| # | Fluxo | Direção | Gateway | Evento |
|---|-------|---------|---------|--------|
| 1 | Client cria pedido → KDS recebe | C→R | EventsGateway | `order:new` |
| 2 | Client adiciona itens → KDS atualiza | C→R | EventsGateway | `order:updated` |
| 3 | Client cancela pedido → KDS remove | C→R | EventsGateway | `order:cancelled` |
| 4 | Chef aceita pedido → Client vê "preparando" | R→C | EventsGateway | `order:update` |
| 5 | Chef marca pronto → Client vê "pronto" | R→C | EventsGateway | `order:update` |
| 6 | Garçom marca entregue → Client vê "entregue" | R→C | EventsGateway | `order:update` |
| 7 | Client entra na fila de espera → Maitre vê | C→R | WaitlistGateway | `waitlist:update` |
| 8 | Staff chama próximo fila → Client notificado | R→C | WaitlistGateway | `waitlist:called` |
| 9 | Client chama garçom → Staff recebe call | C→R | CallsGateway | `call:new` |
| 10 | Client entra na fila do clube → Staff vê | C→R | QueueGateway | `queueUpdate` |
| 11 | Staff admite do clube → Client notificado | R→C | QueueGateway | `queueUpdate` |
| 12 | Client compra ticket clube → Door vê | C→R | QueueGateway | via queue |

---

## FLUXOS POLLING (14) ⚠️

Dados chegam mas com delay (30-60s polling ou refresh manual):

| # | Fluxo | Direção | Problema |
|---|-------|---------|----------|
| 1 | Client cria reserva → Restaurant vê | C→R | Backend NÃO emite WebSocket ao criar reserva |
| 2 | Client cancela reserva → Restaurant vê | C→R | Backend NÃO emite WebSocket |
| 3 | Client paga pedido → Financial atualiza | C→R | Backend NÃO emite evento de pagamento |
| 4 | Client paga split → Financial atualiza | C→R | Backend NÃO emite evento |
| 5 | Client escaneia QR → Mesa fica ocupada | C→R | Backend NÃO emite evento de sessão |
| 6 | Client dá gorjeta → Tips atualiza | C→R | Backend NÃO emite evento |
| 7 | Client usa pontos loyalty → Balance atualiza | C→R | Backend NÃO emite evento |
| 8 | Staff confirma reserva → Client vê | R→C | Backend NÃO emite WebSocket |
| 9 | Staff senta guest → Client vê | R→C | Backend NÃO emite WebSocket |
| 10 | Staff cancela reserva → Client vê | R→C | Backend NÃO emite WebSocket |
| 11 | Staff marca item 86 → Client menu atualiza | R→C | Backend NÃO emite WebSocket |
| 12 | Staff atualiza preço menu → Client vê | R→C | Backend NÃO emite WebSocket |
| 13 | Staff add/remove item menu → Client vê | R→C | Backend NÃO emite WebSocket |
| 14 | Client escreve review → Restaurant vê | C→R | Backend EMITE mas restaurant NÃO escuta |

---

## FLUXOS BROKEN/MISSING (9) ❌

Dados NÃO chegam ao outro app ou funcionalidade não existe:

| # | Fluxo | Problema Raiz | Impacto |
|---|-------|--------------|---------|
| 1 | **Client paga tab bar** | Backend NÃO emite evento ao fechar tab | Barman não sabe que tab foi paga |
| 2 | **Client convida guests reserva** | Sem implementação de notificação para convidados | Convidados não recebem convite |
| 3 | **Staff reconhece call** → Client | Backend emite para staff, mas Client NÃO escuta /calls | Cliente não sabe que garçom viu o chamado |
| 4 | **Staff resolve call** → Client | Mesmo problema — cliente sem feedback | Cliente fica sem saber se foi atendido |
| 5 | **Staff atribui garçom à mesa** | Endpoint NÃO existe | Sem rastreio de garçom por mesa |
| 6 | **Staff processa reembolso** | Endpoint de refund NÃO existe | Sem fluxo de estorno |
| 7 | **Cook bumps item** via KDS Brain | Endpoint `bumpItem` existe no KDS Brain mas NÃO no orders module original | Confusão entre 2 sistemas |
| 8 | **Staff cria promoção** → Client vê | Sem WebSocket para novas promoções | Cliente precisa reabrir app |
| 9 | **Push notifications** | NENHUM fluxo envia push notification | Cliente precisa ter app aberto |

---

## ANÁLISE POR GATEWAY WEBSOCKET

| Gateway | Namespace | Emite Eventos | Restaurant Escuta | Client Escuta | Status |
|---------|-----------|:------------:|:-----------------:|:-------------:|--------|
| **EventsGateway** | /events | order:new, order:update, review:created | ✅ KDS screens | ✅ OrderStatusScreen | **FUNCIONAL** |
| **OrdersGateway** | /orders | order:created, order:updated | ✅ KDS screens | ✅ OrderStatusScreen | **FUNCIONAL** |
| **WaitlistGateway** | /waitlist | waitlist:update, waitlist:called | ✅ MaitreWaitlist | ⚠️ TBD client | **PARCIAL** |
| **CallsGateway** | /calls | call:new, call:updated | ✅ CallsManagement | ❌ CallWaiterScreen | **STAFF ONLY** |
| **QueueGateway** | /queue | queueUpdate, statsUpdate | ✅ ClubQueueMgmt | ✅ ClubQueueScreen | **FUNCIONAL** |
| **TabsGateway** | /tabs | tab:item_added, tab:updated | ❌ NÃO ESCUTA | ✅ TabScreen (via hook) | **CLIENT ONLY** |
| **ReservationsGateway** | /reservations | — | ❌ NÃO EMITE | ❌ NÃO ESCUTA | **INATIVO** |
| **ApprovalsGateway** | /approvals | — | ⚠️ ApprovalsScreen | — | **STAFF ONLY** |

---

## GAPS CRÍTICOS POR MÓDULO BACKEND

### 1. reservations.service.ts — NÃO emite WebSocket
**Arquivo:** `backend/src/modules/reservations/reservations.service.ts`
**Problema:** Os métodos `create()`, `updateStatus()` escrevem no banco mas NUNCA chamam o ReservationsGateway.
**Impacto:** Nenhuma mudança de reserva é real-time entre os 2 apps.
**Fix necessário:** Adicionar `this.reservationsGateway.notifyReservationUpdate()` após cada operação.

### 2. payments.service.ts — NÃO emite WebSocket
**Arquivo:** `backend/src/modules/payments/payments.service.ts`
**Problema:** `processPayment()` escreve no banco mas NÃO emite evento.
**Impacto:** Restaurant não sabe quando pagamento é confirmado em real-time.
**Fix necessário:** Emitir evento `payment:completed` via EventsGateway.

### 3. tabs.service.ts — NÃO emite para restaurant
**Arquivo:** `backend/src/modules/tabs/tabs.service.ts`
**Problema:** TabsGateway existe mas apenas o CLIENT escuta. Restaurant BarmanStation não recebe eventos de tab.
**Fix necessário:** Emitir eventos de tab para room `restaurant:{id}`.

### 4. menu-items.service.ts — NÃO emite WebSocket
**Arquivo:** `backend/src/modules/menu-items/menu-items.service.ts`
**Problema:** CRUD de menu items NÃO emite eventos.
**Impacto:** Cliente vê cardápio desatualizado até refresh manual.
**Fix necessário:** Emitir `menu:item_updated`, `menu:item_unavailable` via EventsGateway.

### 5. calls.service.ts — Emite para staff mas NÃO para client
**Arquivo:** `backend/src/modules/calls/calls.service.ts`
**Problema:** `acknowledge()` e `resolve()` emitem para `restaurant:{id}:staff` mas NÃO para `user:{userId}`.
**Impacto:** Cliente chama garçom mas nunca sabe se foi atendido.
**Fix necessário:** Emitir evento para room `user:{call.customer_id}`.

### 6. Push notifications — NÃO implementadas em nenhum fluxo
**Problema:** O backend tem NotificationsModule e FCM setup, mas NENHUM service chama push notification.
**Impacto:** Cliente precisa ter app aberto para ver qualquer atualização.
**Fix necessário:** Chamar `notificationsService.sendPush()` em: order ready, reservation confirmed, payment received, call acknowledged.

---

## PLANO DE AÇÃO PRIORIZADO

### 🔴 CRÍTICO (funcionalidade core quebrada)

| # | Ação | Arquivo | Esforço |
|---|------|---------|---------|
| 1 | Emitir WebSocket em `reservations.service.ts` (create, updateStatus) | reservations.service.ts | 2h |
| 2 | Emitir WebSocket em `payments.service.ts` (processPayment) | payments.service.ts | 1h |
| 3 | Emitir eventos de tab para restaurant room | tabs.service.ts + BarmanStation | 2h |
| 4 | Adicionar listener /calls no CallWaiterScreen (client) | CallWaiterScreen.tsx | 1h |
| 5 | Criar endpoint de refund | payments module | 3h |

### 🟠 ALTO (UX significativamente degradada)

| # | Ação | Arquivo | Esforço |
|---|------|---------|---------|
| 6 | Emitir WebSocket em menu-items.service.ts (CRUD + 86) | menu-items.service.ts | 2h |
| 7 | Push notification: order ready | orders.service.ts + notifications | 2h |
| 8 | Push notification: reservation confirmed | reservations.service.ts | 1h |
| 9 | Push notification: payment received | payments.service.ts | 1h |
| 10 | Push notification: call acknowledged | calls.service.ts | 1h |

### 🟡 MÉDIO (melhorias)

| # | Ação | Arquivo | Esforço |
|---|------|---------|---------|
| 11 | Listener table:status_changed no client | Client screens | 1h |
| 12 | Listener review:created no restaurant | RestaurantReviewsScreen | 1h |
| 13 | Listener waitlist events no client | WaitlistScreen/VirtualQueueScreen | 2h |
| 14 | Endpoint waiter assignment por mesa | tables.service.ts | 2h |

### Totais

| Prioridade | Itens | Horas |
|-----------|:-----:|:-----:|
| 🔴 Crítico | 5 | ~9h |
| 🟠 Alto | 5 | ~7h |
| 🟡 Médio | 4 | ~6h |
| **TOTAL** | **14** | **~22h** |
