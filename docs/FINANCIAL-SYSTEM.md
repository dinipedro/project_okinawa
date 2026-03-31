# Sistema Financeiro — Documentação Técnica

> Documento gerado em 2026-03-29 | Plataforma NOOWE
> Cobre: pagamentos, wallet, split, tabs, gorjetas, relatórios financeiros, recibos, promoções e fidelidade.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Pagamentos & Wallet](#2-pagamentos--wallet)
3. [Split Payment (Divisão de Conta)](#3-split-payment)
4. [Tabs — Comanda de Bar/Pub](#4-tabs--comanda-de-barpub)
5. [Gorjetas (Tips)](#5-gorjetas)
6. [Relatórios Financeiros](#6-relatórios-financeiros)
7. [Recibos Digitais](#7-recibos-digitais)
8. [Promoções & Fidelidade](#8-promoções--fidelidade)
9. [Telas Mobile](#9-telas-mobile)
10. [Segurança & Compliance](#10-segurança--compliance)
11. [Referência de Arquivos](#11-referência-de-arquivos)

---

## 1. Visão Geral

O sistema financeiro da NOOWE cobre todo o ciclo de vida monetário de um restaurante:

```
CLIENTE                          RESTAURANTE                      GESTÃO
┌──────────┐                     ┌──────────┐                    ┌──────────┐
│ Wallet   │──→ Pagamento ──→    │ Receita  │──→ Transação ──→  │Relatório │
│ Cartão   │    do Pedido        │ Registrada│   Financeira      │ P&L      │
│ PIX      │                     │          │                    │ Cash Flow│
│ Dinheiro │                     │ Gorjeta  │──→ Distribuição ──→│ Export   │
└──────────┘                     └──────────┘                    └──────────┘
     │                                │
     ├── Split Payment               ├── Tab (Comanda Bar)
     ├── Recibo Digital              └── Promoção/Fidelidade
     └── Wallet Recharge/Withdraw
```

### Métodos de Pagamento Suportados

| Método | Enum | Status |
|--------|------|--------|
| Cartão de Crédito | `CREDIT_CARD` | Integração gateway pendente (Stripe) |
| Cartão de Débito | `DEBIT_CARD` | Integração gateway pendente |
| PIX | `PIX` | Integração gateway pendente |
| Wallet (Carteira Digital) | `WALLET` | Totalmente funcional |
| Dinheiro | `CASH` | Funcional (confirmação manual) |

---

## 2. Pagamentos & Wallet

### 2.1 Entidades

#### Wallet (Carteira Digital)
**Arquivo:** `backend/src/modules/payments/entities/wallet.entity.ts`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `balance` | DECIMAL(10,2) | Saldo atual |
| `wallet_type` | CLIENT / RESTAURANT / STAFF | Tipo da carteira |
| `max_balance` | DECIMAL(10,2) | Limite máximo (default: R$ 5.000) |
| `daily_limit` | DECIMAL(10,2) | Limite diário (default: R$ 3.000) |
| `monthly_limit` | DECIMAL(10,2) | Limite mensal (default: R$ 15.000) |

**Constraint:** Cada wallet pertence a UM usuário OU UM restaurante (XOR, nunca ambos).

#### WalletTransaction (Histórico de Transações)
**Arquivo:** `backend/src/modules/payments/entities/wallet-transaction.entity.ts`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `transaction_type` | RECHARGE / WITHDRAWAL / PAYMENT | Tipo |
| `amount` | DECIMAL(10,2) | Valor |
| `balance_before` | DECIMAL(10,2) | Saldo antes |
| `balance_after` | DECIMAL(10,2) | Saldo depois |
| `order_id` | UUID | Pedido associado (se pagamento) |
| `external_transaction_id` | VARCHAR | ID do gateway externo |

#### PaymentMethod (Métodos Salvos)
**Arquivo:** `backend/src/modules/payments/entities/payment-method.entity.ts`

| Campo | Tipo | Segurança |
|-------|------|-----------|
| `card_last_four` | VARCHAR | Visível (últimos 4) |
| `card_brand` | VARCHAR | Visa, Mastercard, etc. |
| `card_exp_month` | VARCHAR | **Criptografado AES-256-GCM** |
| `card_exp_year` | VARCHAR | **Criptografado AES-256-GCM** |
| `pix_key` | VARCHAR | **Criptografado AES-256-GCM** |
| `external_payment_method_id` | VARCHAR | Token do gateway (Stripe PM) |

### 2.2 Validação de Limites (LGPD)

Antes de CADA transação (recarga, saque, pagamento), o sistema valida:

| Limite | Default | Verificação |
|--------|---------|-------------|
| **Saldo máximo** | R$ 5.000 | `balance + recharge ≤ max_balance` |
| **Limite diário** | R$ 3.000 | Soma das transações desde 00:00 hoje |
| **Limite mensal** | R$ 15.000 | Soma das transações desde dia 1 do mês |

### 2.3 Processamento de Pagamento

**Endpoint:** `POST /payments/process`
**Rate Limit:** 10 req/min
**Idempotência:** Header `X-Idempotency-Key` obrigatório

**Fluxo por método:**

| Método | Ação no Backend | Status retornado |
|--------|----------------|------------------|
| `wallet` | Deduz do saldo, cria WalletTransaction | `completed` |
| `credit_card` / `debit_card` | Log para integração gateway | `completed` |
| `pix` | Log para integração gateway | `completed` |
| `cash` | Aguarda confirmação presencial | `pending` |

**Validações:**
- Pedido deve pertencer ao usuário
- Valor deve coincidir com o total do pedido (comparação com 2 decimais)
- Correlation ID único para rastreamento

### 2.4 Endpoints de Pagamento

| Método | Rota | Acesso | Rate Limit |
|--------|------|--------|-----------|
| `POST` | `/payments/process` | CUSTOMER, OWNER, MANAGER | 10/min |
| `GET` | `/payments/wallet` | Multi-role | 30/min |
| `POST` | `/payments/wallet/recharge` | CUSTOMER, OWNER, MANAGER | 5/min |
| `POST` | `/payments/wallet/withdraw` | OWNER, MANAGER | 5/min |
| `GET` | `/payments/transactions` | Multi-role | 30/min |
| `GET` | `/payments/payment-methods` | CUSTOMER, OWNER, MANAGER | 30/min |
| `POST` | `/payments/payment-methods` | CUSTOMER, OWNER, MANAGER | 30/min |
| `PATCH` | `/payments/methods/:id` | CUSTOMER, OWNER, MANAGER | 30/min |
| `DELETE` | `/payments/payment-methods/:id` | CUSTOMER, OWNER, MANAGER | 30/min |

---

## 3. Split Payment (Divisão de Conta)

### 3.1 Modos de Divisão

| Modo | Descrição | Cálculo |
|------|-----------|---------|
| **INDIVIDUAL** | Cada convidado paga seus itens | Agrupa itens por `ordered_by_user_id` |
| **SPLIT_EQUAL** | Divide total igualmente | `total / (guests + 1)` |
| **SPLIT_SELECTIVE** | Seleciona itens específicos | Soma apenas itens selecionados |

### 3.2 Cálculo do Split

```
Para cada participante:
  amount_due = subtotal dos itens
  service_charge = amount_due × 10% (taxa de serviço)
  total = amount_due + service_charge + tip_amount
```

### 3.3 Entidade PaymentSplit

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `split_mode` | INDIVIDUAL / SPLIT_EQUAL / SPLIT_SELECTIVE | Modo |
| `amount_due` | DECIMAL(10,2) | Valor a pagar |
| `amount_paid` | DECIMAL(10,2) | Valor pago (default 0) |
| `status` | PENDING / PARTIALLY_PAID / PAID / CANCELLED | Estado |
| `selected_items` | JSONB | Itens selecionados (modo selective) |
| `service_charge` | DECIMAL(10,2) | Taxa de serviço |
| `tip_amount` | DECIMAL(10,2) | Gorjeta incluída |

**Constraint:** `amount_paid ≤ amount_due`
**Unique:** `(order_id, guest_user_id)` — um split por pessoa por pedido

---

## 4. Tabs — Comanda de Bar/Pub

### 4.1 Fluxo da Comanda

```
1. Host abre tab no bar
   → Tab criada (OPEN)
   → Host vira primeiro TabMember

2. Convidados entram (opcional)
   → TabMember adicionado

3. Pedidos de bebidas (rounds)
   → TabItem criado com ordered_by
   → TabMember.amount_consumed atualizado
   → Tab.subtotal recalculado

4. Solicitar fechamento
   → Tab status → PENDING_PAYMENT

5. Pagamento
   → TabPayment criado
   → Tab.amount_paid atualizado
   → Se total pago ≥ (total - créditos):
     → Tab status → CLOSED
```

### 4.2 Entidade Tab

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `status` | OPEN / PENDING_PAYMENT / CLOSED | Estado |
| `type` | INDIVIDUAL / GROUP | Tipo |
| `cover_charge_credit` | DECIMAL(10,2) | Crédito de couvert |
| `deposit_credit` | DECIMAL(10,2) | Crédito de depósito |
| `subtotal` | DECIMAL(10,2) | Subtotal dos itens |
| `tip_amount` | DECIMAL(10,2) | Gorjeta |
| `total_amount` | DECIMAL(10,2) | Total |
| `amount_paid` | DECIMAL(10,2) | Valor pago |
| `preauth_amount` | DECIMAL(10,2) | Pré-autorização no cartão |
| `invite_token` | TEXT | Token para convidar membros |

### 4.3 Opções de Fechamento

O sistema calcula automaticamente:

```
amount_after_credits = total_amount - cover_charge_credit - deposit_credit
amount_remaining = amount_after_credits - amount_paid

split_options:
  equal: amount_remaining / member_count
  by_consumption: cada membro paga amount_consumed - amount_paid
```

### 4.4 Real-time

**WebSocket Gateway:** `/tabs`
**Eventos:** `tab:item_added`, `tab:payment_processed`, `tab:closed`

---

## 5. Gorjetas (Tips)

### 5.1 Tipos de Gorjeta

| Tipo | Descrição |
|------|-----------|
| `DIRECT` | Gorjeta direta para um funcionário |
| `POOLED` | Gorjeta coletiva para distribuição |
| `PERCENTAGE` | Porcentagem do pedido (ex: 10%) |
| `SPLIT` | Dividida entre múltiplos funcionários |

### 5.2 Status da Gorjeta

```
PENDING ──→ DISTRIBUTED
              │
              └──→ CANCELLED / REFUNDED
```

### 5.3 Distribuição

**3 métodos de distribuição:**

| Método | Cálculo |
|--------|---------|
| **Igual** | `total_tips / staff_count` |
| **Por Cargo** | Chef 30%, Garçons 50% (dividido), Caixa 20% |
| **Manual** | Valor definido por gestor para cada funcionário |

**Validação:** `|total_distribuído - total_gorjetas| ≤ R$ 0.01`

### 5.4 Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/tips` | Criar gorjeta |
| `GET` | `/tips/summary` | Resumo por período |
| `GET` | `/tips/transactions` | Lista paginada |
| `POST` | `/tips/distribute` | Distribuir pendentes |
| `GET` | `/tips/staff/:id` | Gorjetas de um funcionário |
| `GET` | `/tips/order/:id` | Gorjeta de um pedido |

---

## 6. Relatórios Financeiros

### 6.1 Tipos de Relatório

| Relatório | Endpoint | Descrição |
|-----------|----------|-----------|
| **Resumo** | `GET /financial/summary` | Receita total, custos, lucro líquido, margem, breakdown por categoria |
| **Diário** | `GET /financial/daily-summary` | Vendas/despesas/lucro por dia |
| **Receita por Categoria** | `GET /financial/revenue-by-category` | Food sales, beverage sales, tip income |
| **Despesas por Categoria** | `GET /financial/expenses-by-category` | Pessoal, suprimentos, aluguel, utilities, marketing |
| **P&L (DRE)** | `GET /financial/profit-loss` | Receita por categoria + despesas por categoria + lucro + margem |
| **Fluxo de Caixa** | `GET /financial/cash-flow` | Entradas/saídas com saldo corrente (running balance) |
| **Export** | `GET /financial/export` | PDF, CSV ou Excel |

### 6.2 Transações Financeiras

**Tipos:**

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `SALE` | Venda/receita | Pedido pago |
| `TIP` | Gorjeta recebida | Gorjeta de cliente |
| `REFUND` | Reembolso | Cancelamento de pedido |
| `EXPENSE` | Despesa operacional | Aluguel, pessoal |
| `ADJUSTMENT` | Ajuste manual | Correção contábil |

**Categorias:**

| Receita | Despesa |
|---------|---------|
| `FOOD_SALES` | `STAFF_WAGES` |
| `BEVERAGE_SALES` | `SUPPLIES` |
| `TIP_INCOME` | `RENT` |
| | `UTILITIES` |
| | `MARKETING` |
| | `MAINTENANCE` |
| | `OTHER` |

### 6.3 Exemplo de Resposta — Resumo Financeiro

```json
{
  "period": { "start_date": "2026-03-01", "end_date": "2026-03-31" },
  "summary": {
    "total_revenue": 15450.50,
    "sales": 13200.00,
    "tips": 2250.50,
    "total_costs": 8900.25,
    "expenses": 7650.00,
    "refunds": 1250.25,
    "net_profit": 6550.25,
    "profit_margin": 42.4,
    "transaction_count": 487
  },
  "category_breakdown": [
    { "category": "food_sales", "amount": 10200.00, "percentage": 73.5, "count": 320 },
    { "category": "beverage_sales", "amount": 3000.00, "percentage": 21.6, "count": 145 }
  ]
}
```

### 6.4 Exemplo — Fluxo de Caixa

```json
{
  "items": [
    { "date": "2026-03-15", "type": "SALE", "amount": 2100.50, "is_inflow": true, "running_balance": 12100.50 },
    { "date": "2026-03-15", "type": "EXPENSE", "amount": 650.00, "is_inflow": false, "running_balance": 11450.50 }
  ],
  "summary": {
    "total_inflow": 15450.50,
    "total_outflow": 8900.25,
    "net_cash_flow": 6550.25,
    "ending_balance": 16550.25
  }
}
```

---

## 7. Recibos Digitais

### 7.1 Entidade Receipt

**Arquivo:** `backend/src/modules/receipts/entities/receipt.entity.ts`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `order_id` | VARCHAR | FK único (1 recibo por pedido) |
| `items_snapshot` | JSONB | Snapshot imutável dos itens no momento do pagamento |
| `subtotal` | DECIMAL(10,2) | Subtotal |
| `service_fee` | DECIMAL(10,2) | Taxa de serviço |
| `tip` | DECIMAL(10,2) | Gorjeta |
| `total` | DECIMAL(10,2) | Total pago |
| `payment_method` | VARCHAR | Método utilizado |

### 7.2 Conteúdo do Recibo

```
┌────────────────────────────┐
│  NOOWE — [Restaurant Name] │
│  [Address]                  │
│  CNPJ: XX.XXX.XXX/XXXX-XX │
├────────────────────────────┤
│  Data: 15/03/2026  19:32  │
│  Mesa: 7                   │
│  Recibo: RCP-2026-001234  │
├────────────────────────────┤
│  2x Filé Mignon    R$197.80│
│  1x Risoto Funghi   R$68.90│
│  1x Caipirinha       R$32.00│
├────────────────────────────┤
│  Subtotal:         R$298.70│
│  Taxa de Serviço:   R$29.87│
│  Gorjeta:           R$30.00│
│  TOTAL:            R$358.57│
├────────────────────────────┤
│  Pagamento: Cartão ****4242│
│  Split: 2 participantes    │
│  Sua parte: R$179.29       │
└────────────────────────────┘
```

### 7.3 Ações no Mobile

- **Compartilhar** via Share API nativa
- **Salvar** como arquivo
- **Exportar** como texto formatado

---

## 8. Promoções & Fidelidade

### 8.1 Tipos de Promoção

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `PERCENTAGE` | Desconto percentual | 20% OFF |
| `FIXED` | Valor fixo de desconto | R$ 15 OFF |
| `FREE_ITEM` | Item grátis | Sobremesa grátis |
| `BOGO` | Compre 1, leve 2 | Drinks BOGO |
| `HAPPY_HOUR` | Desconto por horário | 30% OFF 17h-19h |

### 8.2 Controles de Promoção

| Controle | Descrição |
|----------|-----------|
| `min_order_value` | Valor mínimo do pedido |
| `max_uses` | Limite total de usos |
| `max_uses_per_user` | Limite por usuário (default: 1) |
| `valid_from` / `valid_until` | Período de validade |
| `days_of_week` | Dias ativos (0-6) |
| `hours_from` / `hours_until` | Horário ativo (HH:MM) |
| `applicable_categories` | Categorias do menu aplicáveis |

### 8.3 Cartão de Fidelidade (Stamp Card)

| Campo | Descrição |
|-------|-----------|
| `current_stamps` | Selos acumulados |
| `required_stamps` | Selos necessários (default: 10) |
| `completed_cycles` | Vezes que completou |
| `reward_description` | Descrição do prêmio |

**Unique:** `(user_id, restaurant_id, service_type)` — um cartão por tipo de serviço.

---

## 9. Telas Mobile

### 9.1 App Cliente

| Tela | Funcionalidade |
|------|---------------|
| **PaymentScreen** | Seleção de método, validação Luhn, detecção de bandeira, novo cartão |
| **SplitPaymentScreen** | 4 modos de divisão, status em tempo real por convidado |
| **UnifiedPaymentScreen** | Multi-tab (Pagar/Dividir/Gorjeta), integração loyalty points |
| **DigitalReceiptScreen** | Recibo completo, compartilhar, salvar, exportar |
| **TabScreen** | Comanda aberta, rounds, total corrente, WebSocket |
| **RoundBuilderSheet** | Modal para adicionar itens à comanda |
| **TabPaymentScreen** | Pagamento da comanda, opções de split, créditos |

### 9.2 App Restaurante

| Tela | Funcionalidade |
|------|---------------|
| **FinancialScreen** | Resumo do dia/semana/mês: receita, pedidos, ticket médio, gorjetas, breakdown por método |
| **FinancialReportScreen** | Gráficos (receita/despesas), P&L, export PDF/CSV/Excel |
| **TipsDistributionScreen** | Distribuição de gorjetas: igual, por cargo, manual |

### 9.3 Formatação de Moeda

**Arquivo:** `shared/utils/formatters.ts`

```typescript
formatCurrency(100, 'pt-BR')     → "R$ 100,00"
formatCurrency(100, 'en-US')     → "$100.00"
formatCurrency(100, 'es-ES')     → "100,00 €"
formatCurrency(100.5, 'pt-BR', { showCents: false }) → "R$ 100"
```

Suporta: BRL (R$), USD ($), EUR (€).

---

## 10. Segurança & Compliance

### 10.1 Segurança de Pagamento

| Feature | Implementação |
|---------|--------------|
| Tokenização | Dados de cartão nunca armazenados raw — apenas tokens do gateway |
| Criptografia | card_exp, pix_key criptografados com AES-256-GCM |
| Validação Luhn | Validação client-side do número do cartão |
| Detecção de bandeira | Visa, Mastercard, Amex, Discover, Diners, JCB, Maestro |
| Idempotência | Header X-Idempotency-Key previne cobranças duplicadas |
| Precisão decimal | Comparação de valores com arredondamento para 2 casas |
| Correlation IDs | Logs de pagamento com ID único para rastreamento |
| Imutabilidade | Valores de transações não podem ser alterados após criação |

### 10.2 Controle de Acesso (RBAC)

| Operação | Roles Permitidos |
|----------|-----------------|
| Processar pagamento | CUSTOMER, OWNER, MANAGER |
| Saque da wallet | OWNER, MANAGER |
| Relatórios financeiros | OWNER, MANAGER |
| Distribuir gorjetas | OWNER, MANAGER |
| Criar transação manual | OWNER, MANAGER |
| Ver wallet/transações | Multi-role |

### 10.3 Rate Limiting

| Endpoint | Limite |
|----------|--------|
| Pagamento | 10 req/min |
| Recarga/Saque | 5 req/min |
| Consultas | 30 req/min |

### 10.4 LGPD

| Controle | Valor Default |
|----------|--------------|
| Saldo máximo wallet | R$ 5.000 |
| Limite diário | R$ 3.000 |
| Limite mensal | R$ 15.000 |
| Dados financeiros retidos | 7 anos (obrigação fiscal) |
| Logs de segurança | 5 anos |

---

## 11. Referência de Arquivos

### Backend

| Módulo | Arquivos Principais |
|--------|-------------------|
| **Payments** | `payments.service.ts` (427 lines), `payments.controller.ts`, `payment-split.service.ts`, entidades: wallet, wallet-transaction, payment-method, payment-split |
| **Financial** | `financial-transaction.service.ts` (182 lines), `financial-report.service.ts` (231 lines), `financial.controller.ts` (233 lines), entidade: financial-transaction |
| **Tips** | `tips.service.ts` (237 lines), entidade: tip |
| **Tabs** | `tabs.service.ts` (271 lines), `tab-payments.service.ts` (97 lines), entidades: tab, tab-member, tab-item, tab-payment |
| **Receipts** | `receipts.service.ts` (88 lines), entidade: receipt |
| **Promotions** | `promotions.service.ts`, entidade: promotion |
| **Loyalty** | `loyalty.service.ts`, entidade: stamp-card |

### Mobile

| App | Telas |
|-----|-------|
| **Cliente** | PaymentScreen, SplitPaymentScreen, UnifiedPaymentScreen, DigitalReceiptScreen, TabScreen, RoundBuilderSheet, TabPaymentScreen |
| **Restaurante** | FinancialScreen, FinancialReportScreen, TipsDistributionScreen |
| **Shared** | `formatters.ts` (formatCurrency, parseCurrency, getCurrencySymbol) |

### Tabelas no Banco

| Tabela | Propósito |
|--------|-----------|
| `wallets` | Saldos + limites LGPD |
| `wallet_transactions` | Histórico (RECHARGE, WITHDRAWAL, PAYMENT) |
| `payment_methods` | Cartões/PIX salvos (criptografados) |
| `payment_splits` | Divisão de conta por convidado |
| `financial_transactions` | Contabilidade do restaurante |
| `tips` | Gorjetas (PENDING → DISTRIBUTED) |
| `receipts` | Recibos com snapshot imutável |
| `tabs` | Comandas de bar (OPEN → CLOSED) |
| `tab_members` | Membros da comanda |
| `tab_items` | Itens da comanda |
| `tab_payments` | Pagamentos da comanda |
| `promotions` | Promoções e descontos |
| `stamp_cards` | Cartões de fidelidade |
