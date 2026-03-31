# Validação Funcional Completa — Plataforma NOOWE

> **Data:** 2026-03-29
> **Escopo:** 8 tipos de usuário × 11 tipos de estabelecimento × todos os fluxos
> **Método:** Leitura de código real, trace de dados ponta-a-ponta
> **Status:** DOCUMENTAÇÃO APENAS — sem correções aplicadas

---

## SCORE GERAL POR TIPO DE ESTABELECIMENTO

| Tipo | Score | Gaps Críticos |
|------|:-----:|---------------|
| Pub & Bar | **85%** | Cover charge collection, invite QR, tab balance alerts |
| Casual Dining | **80%** | Walk-in vs reservation differentiation |
| Fine Dining | **75%** | Waiter auto-assign, deep link QR |
| Club/Balada | **75%** | Area segregation, min spend enforcement, lineup data |
| Quick Service | **60%** | Pickup code, counter confirmation |
| Drive-Thru | **60%** | Geolocation priority, lane tracking |
| Chef's Table | **55%** | Prepay enforcement, chef approval, capacity |
| Fast Casual | **50%** | Customization UI, counter/table choice |
| Buffet | **50%** | Weight-based pricing, digital tab |
| Café/Bakery | **45%** | Stamp reward redemption, auto-stamp |
| Food Truck | **45%** | Dynamic location, geo queue |
| **MÉDIA** | **62%** | — |

---

## SCORE POR TIPO DE USUÁRIO

| Usuário | Score | Gaps Críticos |
|---------|:-----:|---------------|
| Consumidor | **70%** | RestaurantScreen não adapta CTAs por serviceType, geolocation hardcoded, wallet UI incompleta |
| Dono/Owner | **80%** | Dashboard completo, config OK, staff roles sem UI filtering |
| Gerente | **75%** | Approvals OK, daily reports OK |
| Hostess/Maitre | **70%** | Reservas OK, fila OK, check-in parcial, no push to client |
| Garçom | **65%** | Mesas atribuídas sem filtro, no push on new order |
| Chef | **80%** | KDS real-time OK, bump OK, auto-fire OK |
| Caixa | **50%** | Cash payment sem confirmation flow, financial dashboard OK |
| Barman | **85%** | KDS bar OK, tabs OK, recipes OK |
| **MÉDIA** | **72%** | — |

---

## CASCATAS INTERROMPIDAS (Ação no App A que NÃO reflete no App B)

| # | Ação | Quem faz | Onde deveria refletir | O que falta |
|---|------|----------|----------------------|-------------|
| 1 | PIX/Cartão payment | Client | Restaurant FinancialScreen | Gateway adapters são LOG PLACEHOLDERS — pagamento nunca processado de verdade |
| 2 | Cash payment pending | Client | Restaurant OrderScreen | Sem UI de confirmação manual no restaurant app |
| 3 | Payment confirmed | Client | Restaurant TableListScreen | Table NÃO muda para AVAILABLE após pagamento |
| 4 | Payment confirmed | Client | Waitlist | Próximo da fila NÃO é chamado automaticamente |
| 5 | Order completed | Backend | Client NotificationsScreen | Push "Como foi?" NÃO enviado (sem scheduler) |
| 6 | Reservation confirmed | Restaurant | Client ReservationDetailScreen | Push para cliente é PLACEHOLDER TODO |
| 7 | Order ready | KDS/Chef | Client OrderStatusScreen | Push é PLACEHOLDER TODO (WebSocket funciona) |
| 8 | ServiceType features | Backend Registry | Client RestaurantScreen | RestaurantScreen NÃO usa useServiceTypeFeatures() |
| 9 | Staff role | Backend UserRole | Restaurant Navigation | Drawer NÃO filtra telas por role |

---

## FUNCIONALIDADES QUE DEVERIAM ESTAR DESABILITADAS MAS NÃO ESTÃO

| Tipo de Restaurante | Feature | Deveria estar OFF | Status |
|---------------------|---------|:-----------------:|--------|
| Quick Service | "Fazer Reserva" button | OFF | ❌ Visível |
| Quick Service | "QR Mesa" | OFF | ❌ Visível |
| Drive-Thru | "Mesa" button | OFF | ❌ Visível |
| Drive-Thru | "Fila de espera" | OFF | ❌ Visível |
| Buffet | "Pedir por item" | OFF | ❌ Visível |
| Food Truck | "Reserva" | OFF | ❌ Visível |
| Club | "Pedir Comida" (sem tab) | OFF | ❌ Visível |

**Causa raiz:** `RestaurantScreen.tsx` renderiza botões hardcoded. O hook `useServiceTypeFeatures()` EXISTE mas NÃO é usado nessa tela.

---

## FUNCIONALIDADES QUE DEVERIAM EXISTIR MAS NÃO EXISTEM

| # | Feature | ServiceType | Severidade |
|---|---------|-------------|:----------:|
| 1 | Pickup code generation (#B247) | Quick Service, Drive-Thru | 🔴 |
| 2 | Weight-based pricing (balança) | Buffet | 🔴 |
| 3 | Dynamic location update | Food Truck | 🔴 |
| 4 | Pre-payment enforcement on reservation | Chef's Table | 🔴 |
| 5 | Counter confirmation UI (staff) | Quick Service | 🟠 |
| 6 | Cash payment manual confirmation | Todos | 🟠 |
| 7 | Table state machine (OCCUPIED→CLEANING→AVAILABLE) | Todos com mesa | 🟠 |
| 8 | Waitlist auto-advance after payment | Todos com fila | 🟠 |
| 9 | Scheduled notifications (review prompt, retention, reminders) | Todos | 🟠 |
| 10 | Stamp card auto-award on purchase | Café/Bakery | 🟡 |
| 11 | Stamp card reward redemption | Café/Bakery | 🟡 |
| 12 | Geolocation queue priority | Drive-Thru | 🟡 |
| 13 | Chef approval workflow | Chef's Table | 🟡 |
| 14 | Lineup artist data (backend entity) | Club | 🟡 |
| 15 | Menu item customization UI | Fast Casual | 🟡 |
| 16 | Cover charge collection workflow | Pub & Bar | 🟡 |
| 17 | Group tab invite QR generation | Pub & Bar | 🟢 |
| 18 | Club area segregation (pista/VIP/rooftop) | Club | 🟢 |
| 19 | Birthday special entry pricing | Club | 🟢 |

---

## NOTIFICAÇÕES — MATRIZ COMPLETA

| Evento | Consumidor | Hostess | Garçom | Chef | Caixa | Dono |
|--------|:----------:|:-------:|:------:|:----:|:-----:|:----:|
| Reserva criada | — | ✅ WS | — | — | — | ✅ WS |
| Reserva confirmada | ❌ TODO | ✅ WS | — | — | — | — |
| Reserva cancelada (cliente) | — | ✅ WS | — | — | — | ✅ WS |
| Reserva cancelada (restaurante) | ✅ WS | — | — | — | — | — |
| Reminder 24h/1h antes | ❌ MISSING | — | — | — | — | — |
| Check-in ("Cheguei") | — | ❌ MISSING | — | — | — | — |
| Mesa atribuída | ✅ WS | — | ❌ MISSING | — | — | — |
| Novo pedido | — | — | ✅ WS | ✅ WS | — | — |
| Pedido preparando | ✅ WS | — | — | — | — | — |
| Pedido pronto | ❌ TODO | — | ❌ TODO | — | — | — |
| Pedido entregue | ✅ WS | — | — | — | — | — |
| Chamou garçom | — | — | ✅ WS | — | — | — |
| Call acknowledged | ✅ WS | — | ✅ WS | — | — | — |
| Pediu conta | — | — | ❌ MISSING | — | ❌ MISSING | — |
| Pagamento confirmado | ✅ WS | — | — | — | ❌ TODO | ✅ WS |
| Cashback creditado | ✅ WS | — | — | — | — | — |
| Convite reserva | ❌ TODO | — | — | — | — | — |
| Vez na fila | ✅ WS | ✅ WS | — | — | — | — |
| Nova avaliação | — | — | — | — | — | ✅ WS |
| Item indisponível (86) | ✅ WS | — | — | — | — | ✅ WS |
| Gorjeta recebida | — | — | ✅ WS | — | — | ✅ WS |
| Pós-visita "Como foi?" | ❌ MISSING | — | — | — | — | — |
| No-show | — | ✅ CRON | — | — | — | ❌ MISSING |

**Legenda:** ✅ WS = WebSocket real-time | ✅ CRON = Cron job | ❌ TODO = Placeholder | ❌ MISSING = Não existe

---

## PAYMENT FLOW — STATUS POR MÉTODO

| Método | UI Client | Backend Processing | Gateway Real | Webhook | Cascade Completa |
|--------|:---------:|:-----------------:|:------------:|:-------:|:----------------:|
| **Wallet** | ✅ | ✅ Debit + Transaction | N/A | N/A | ✅ 100% |
| **PIX** | ✅ | ❌ LOG PLACEHOLDER | ❌ TODO | ❌ TODO | ❌ 5% |
| **Cartão** | ✅ Luhn+brand | ❌ LOG PLACEHOLDER | ❌ TODO | ❌ TODO | ❌ 5% |
| **Tap-to-Pay** | ✅ Screen | ⚠️ Intent creation | ❌ TODO | ❌ TODO | ❌ 20% |
| **Cash** | ✅ | ✅ Status=pending | N/A | N/A | ❌ 30% (no confirm) |
| **Split** | ✅ 3 modes | ✅ Full logic | Via base method | Via base | ✅ 95% |

---

## AÇÕES PRIORIZADAS

### 🔴 CRÍTICO (plataforma não funciona sem)

1. **Implementar gateway real Asaas** — PIX e cartão são LOG PLACEHOLDERS. Sem isso, restaurante não pode cobrar
2. **RestaurantScreen service-type gating** — Usar `useServiceTypeFeatures()` para mostrar/esconder botões por tipo
3. **Cash payment confirmation flow** — Staff precisa de botão para confirmar recebimento de dinheiro
4. **Table state machine pós-pagamento** — Mesa fica OCCUPIED para sempre após pagamento

### 🟠 ALTO (tipo de restaurante inteiro comprometido)

5. **Pickup code** para Quick Service / Drive-Thru — fluxo core do tipo
6. **Weight-based pricing** para Buffet — fluxo core do tipo
7. **Dynamic location** para Food Truck — funcionalidade principal
8. **Pre-payment enforcement** para Chef's Table — reserva sem pagamento não deveria ser permitida
9. **Navigation role filtering** — Chef vê telas do caixa, garçom vê telas do RH
10. **Scheduled notifications** — review prompts, reservation reminders, retention offers

### 🟡 MÉDIO (funcionalidade específica faltando)

11. **Stamp card automation** para Café — award + redemption
12. **Waitlist auto-advance** após pagamento/table freed
13. **Geolocation real no HomeScreen** (remover lat:0, lng:0 hardcoded)
14. **Profile avatar upload + dietary preferences**
15. **Wallet dedicated screen** com transaction history + add funds

### 🟢 BAIXO (polish)

16. Cover charge collection workflow (Pub)
17. Group tab invite QR (Pub)
18. Club area segregation
19. Menu item customization UI (Fast Casual)
20. Lineup artist backend entity (Club)

---

## RESUMO FINAL

| Dimensão | Score |
|----------|:-----:|
| Backend APIs + Controllers | **100%** |
| WebSocket Real-Time | **86%** |
| Client ↔ Restaurant E2E | **70%** |
| Service-Type Feature Gating | **0%** (hook existe, não é usado) |
| Payment Processing Real | **20%** (só wallet funciona de verdade) |
| Push Notifications | **0%** (todos são TODO placeholders) |
| Scheduled Jobs (crons) | **30%** (reservas reminder + no-show existem, resto não) |
| Post-Experience Automation | **10%** (loyalty fire-and-forget, sem review prompt) |
| **SCORE FUNCIONAL GERAL** | **52%** |

### Conclusão:

A plataforma tem **arquitetura excelente** (276 endpoints, 9 gateways, 158 telas) mas gaps funcionais significativos:

1. **Pagamentos reais** não processam (adapters são placeholders)
2. **Service-type gating** não é aplicado na UI (todos os restaurantes mostram os mesmos botões)
3. **Push notifications** são todos placeholders
4. **Pós-pagamento** não dispara nenhuma automação (table cleanup, queue advance, review prompt)
5. **Role-based navigation** não filtra telas por cargo

Estes 5 gaps representam ~80% da distância entre o estado atual (52%) e produção (100%).
