# Service Types: Entertainment (Pub & Bar, Club & Balada)

## Visão Geral

Este documento especifica os dois tipos de serviço voltados ao segmento de entretenimento noturno.

| Código | Nome | Descrição |
|--------|------|-----------|
| `pub_bar` | Pub & Bar | Estabelecimento focado em bebidas com ambiente social |
| `club` | Club & Balada | Entretenimento noturno com música, dança e experiência social |

---

## 1. Pub & Bar 🍺

### 1.1 Características Operacionais

| Parâmetro | Valor |
|-----------|-------|
| Público-Alvo | Amigos, happy hour, encontros |
| Ticket Médio | R$ 80-200 por pessoa |
| Permanência | 2-5 horas |
| Rotatividade | 1-2 giros/noite |
| Pico | 18h-01h |

### 1.2 Features Ativas

| Feature | Código | Descrição |
|---------|--------|-----------|
| Tab Digital | `digital_tab` | Comanda 100% digital |
| Tab Compartilhado | `group_tab` | Múltiplos usuários em uma comanda |
| Rastreamento Individual | `individual_tracking` | Registra quem pediu cada item |
| Convite por Link | `tab_invite` | Convidar pessoas para o tab |
| Happy Hour Automático | `auto_happy_hour` | Preços ajustam automaticamente |
| Pedir Rodada | `repeat_round` | Repetir última rodada |
| Chamar Garçom | `call_waiter` | Notificação para garçom |
| Split por Consumo | `split_by_consumption` | Dividir pelo que cada um pediu |
| Pré-autorização | `card_preauth` | Hold no cartão ao abrir tab |
| Crédito de Entrada | `cover_credit` | Entrada convertida em consumação |

### 1.3 Arquitetura Backend

#### Entidades
- `Tab` - Comanda digital (individual ou grupo)
- `TabMember` - Membros do tab compartilhado
- `TabItem` - Itens pedidos (reutiliza OrderItemStatus)
- `TabPayment` - Pagamentos individuais
- `HappyHourSchedule` - Configuração de promoções
- `WaiterCall` - Chamadas de garçom

#### Endpoints Principais
```
POST   /api/v1/tabs                    # Criar tab
GET    /api/v1/tabs/:id                # Detalhes
POST   /api/v1/tabs/:id/join           # Entrar em tab
POST   /api/v1/tabs/:id/items          # Adicionar item
POST   /api/v1/tabs/:id/repeat-round   # Repetir rodada
GET    /api/v1/tabs/:id/split-options  # Opções de divisão
POST   /api/v1/tabs/:id/payments       # Processar pagamento
POST   /api/v1/waiter-calls            # Chamar garçom
GET    /api/v1/happy-hour/active       # Promoções ativas
```

### 1.4 Regras de Negócio

| Código | Regra |
|--------|-------|
| PB-001 | Tab só pode ser aberto se não houver Tab pendente |
| PB-002 | Crédito de entrada só aplica se pago via app |
| PB-003 | Crédito não é reembolsável |
| PB-004 | Happy hour aplica-se apenas a itens do horário |
| PB-005 | Host pode remover membro a qualquer momento |
| PB-006 | Membro removido deve pagar consumo primeiro |

---

## 2. Club & Balada 🎵

### 2.1 Características Operacionais

| Parâmetro | Valor |
|-----------|-------|
| Público-Alvo | Jovens adultos, celebrações |
| Ticket Médio Pista | R$ 150-500 |
| Ticket Médio Camarote | R$ 300-1000+ |
| Permanência | 4-7 horas |
| Pico | 00h-04h |

### 2.2 Features Ativas

| Feature | Código | Descrição |
|---------|--------|-----------|
| Entrada Antecipada | `advance_entry` | Comprar ingresso com desconto |
| Tipos de Entrada | `entry_variations` | Pista, VIP, Open Bar |
| Lista de Convidados | `guest_list` | Entrar na lista pelo app |
| Aniversariante | `birthday_entry` | Entrada gratuita |
| Lineup | `lineup` | Ver atrações da noite |
| Reserva de Camarote | `table_reservation` | Reservar mesa VIP |
| Mapa de Mesas | `table_map` | Visualizar localização |
| Convite para Camarote | `table_invite` | Host convida amigos |
| Tracker de Mínimo | `minimum_spend_tracker` | Barra de progresso |
| Bottle Service | `bottle_service` | Cardápio de garrafas |
| Fila Virtual | `virtual_queue` | Entrar na fila pelo app |
| Lotação em Tempo Real | `occupancy_display` | Ver nível de lotação |
| Check-in/out | `check_in_out` | Controle de capacidade |

### 2.3 Arquitetura Backend

#### Entidades
- `ClubEntry` - Ingressos/tickets
- `GuestListEntry` - Lista de convidados
- `VipTableReservation` - Reservas de camarote
- `VipTableGuest` - Convidados do camarote
- `VipTableTab` - Tab de consumo do camarote
- `VipTableTabItem` - Itens do tab
- `QueueEntry` - Fila virtual
- `Lineup` - Eventos/atrações
- `LineupSlot` - Slots individuais
- `ClubCheckInOut` - Controle de entrada/saída

#### Endpoints Principais
```
# Entries
POST   /api/v1/club-entries              # Comprar entrada
POST   /api/v1/club-entries/validate     # Validar na porta
POST   /api/v1/club-entries/check-in     # Check-in

# Guest List
POST   /api/v1/guest-list                # Entrar na lista
GET    /api/v1/guest-list/my             # Minhas listas

# VIP Tables
POST   /api/v1/table-reservations        # Criar reserva
POST   /api/v1/table-reservations/:id/guests  # Convidar
POST   /api/v1/table-reservation-invites/:token/accept

# VIP Tabs
POST   /api/v1/table-tabs/:id/items      # Adicionar item
GET    /api/v1/table-tabs/:id/summary    # Resumo com tracker

# Queue
POST   /api/v1/queue                     # Entrar na fila
GET    /api/v1/queue/my                  # Minha posição
POST   /api/v1/queue/:id/call            # Chamar (staff)

# Lineup
GET    /api/v1/lineup/restaurant/:id/date/:date

# Occupancy
GET    /api/v1/occupancy/restaurant/:id/level
```

### 2.4 Minimum Spend Tracker

O tracker de consumação mínima exibe em tempo real:

```
CONSUMAÇÃO MÍNIMA: R$ 3.000

Consumido:    R$ 1.580
Créditos:    -R$ 600 (depósito)
             -R$ 240 (entradas)
─────────────────────────────
Pago:         R$ 740

[████████░░░░░░░░░░░░] 53%

Faltam: R$ 1.420 para atingir o mínimo
```

### 2.5 Regras de Negócio

| Código | Regra |
|--------|-------|
| CL-001 | Entrada só pode ser usada uma vez |
| CL-002 | Entrada expira às 06:00 do dia seguinte |
| CL-003 | Lista fecha no horário definido |
| CL-004 | Depósito cobrado no momento da reserva |
| CL-005 | Cancelamento após deadline = perda do depósito |
| CL-006 | Consumação mínima obrigatória |
| CL-007 | Crédito de entrada só vale se entrada usada |
| CL-008 | Fila tem tolerância de 5 minutos |
| CL-009 | Convidado de camarote tem entrada inclusa |
| CL-010 | Host responsável pelo mínimo se grupo não pagar |

---

## 3. WebSocket Rooms

### Pub & Bar
- `tab:{tabId}` - Atualizações do tab em tempo real

### Club
- `queue:{restaurantId}` - Atualizações da fila
- `queue:{restaurantId}:user:{userId}` - Posição individual

---

## 4. Integração com Sistema Existente

### Reutilização de Padrões
- `TabItem` reutiliza `OrderItemStatus` do módulo Orders
- `TabPayment` reutiliza `PaymentSplitStatus` do módulo Payments
- `VipTableGuest` segue padrão de `ReservationGuest`
- `WaiterCall` é compartilhado entre tipos de serviço

### Configuração por Restaurante
Todas as features são configuráveis via `RestaurantServiceConfig`:
- Cover charge (valor, crédito, schedules)
- Tab (pré-autorização, limites, auto-close)
- Happy Hour (schedules, descontos)
- VIP Tables (tipos, depósito, consumação mínima)
- Queue (níveis de prioridade, capacidade)
