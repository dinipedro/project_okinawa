# Financial Brain — Plano de desenvolvimento para Claude Code

> **Objetivo:** Evoluir o sistema financeiro de registrador passivo para cérebro autônomo da operação financeira do restaurante.
> **Gateways:** Asaas (cartão + PIX) + Stripe Terminal (Tap to Pay NFC no celular do garçom)
> **Fiscal:** Focus NFe (API intermediária, Fase 1) → SEFAZ direta (Fase 2, quando volume justificar)
> **Regra de ouro:** Nunca reescrever o que funciona. Estender entidades, criar novos módulos ao lado dos existentes.
> **Data:** Março 2026

---

## CONTEXTO DO PROJETO EXISTENTE

### Stack técnica (manter exatamente — igual ao KDS Brain)

- **Backend:** NestJS + TypeScript + PostgreSQL + TypeORM + Redis
- **Mobile:** React Native (apps: `restaurant`, `client`)
- **Shared:** Pasta shared com services e hooks reutilizáveis
- **Real-time:** WebSocket via NestJS Gateway
- **Auth:** JWT + RBAC (roles: OWNER, MANAGER, CHEF, BARMAN, WAITER, CUSTOMER)
- **Data fetching (mobile):** TanStack Query

### Módulos financeiros existentes (NÃO remover nada)

```
backend/src/modules/
├── payments/
│   ├── payments.service.ts              (427 linhas)
│   ├── payments.controller.ts
│   ├── payment-split.service.ts
│   └── entities/
│       ├── wallet.entity.ts
│       ├── wallet-transaction.entity.ts
│       ├── payment-method.entity.ts
│       └── payment-split.entity.ts
├── financial/
│   ├── financial-transaction.service.ts  (182 linhas)
│   ├── financial-report.service.ts       (231 linhas)
│   ├── financial.controller.ts           (233 linhas)
│   └── entities/
│       └── financial-transaction.entity.ts
├── tips/
│   ├── tips.service.ts                   (237 linhas)
│   └── entities/
│       └── tip.entity.ts
├── tabs/
│   ├── tabs.service.ts                   (271 linhas)
│   ├── tab-payments.service.ts           (97 linhas)
│   └── entities/
│       ├── tab.entity.ts
│       ├── tab-member.entity.ts
│       ├── tab-item.entity.ts
│       └── tab-payment.entity.ts
├── receipts/
│   ├── receipts.service.ts               (88 linhas)
│   └── entities/
│       └── receipt.entity.ts
├── promotions/
│   ├── promotions.service.ts
│   └── entities/
│       └── promotion.entity.ts
└── loyalty/
    ├── loyalty.service.ts
    └── entities/
        └── stamp-card.entity.ts
```

### Entidades financeiras existentes (campos atuais — NÃO remover)

**Wallet:** balance, wallet_type (CLIENT/RESTAURANT/STAFF), max_balance, daily_limit, monthly_limit

**WalletTransaction:** transaction_type (RECHARGE/WITHDRAWAL/PAYMENT), amount, balance_before, balance_after, order_id, external_transaction_id

**PaymentMethod:** card_last_four, card_brand, card_exp_month (encrypted), card_exp_year (encrypted), pix_key (encrypted), external_payment_method_id

**FinancialTransaction:** type (SALE/TIP/REFUND/EXPENSE/ADJUSTMENT), category, amount, description, order_id, restaurant_id

**PaymentSplit:** split_mode (INDIVIDUAL/SPLIT_EQUAL/SPLIT_SELECTIVE), amount_due, amount_paid, status, selected_items, service_charge, tip_amount

### Endpoints de pagamento existentes (manter funcionando)

```
POST   /payments/process              → CUSTOMER, OWNER, MANAGER (10/min)
GET    /payments/wallet               → Multi-role (30/min)
POST   /payments/wallet/recharge      → CUSTOMER, OWNER, MANAGER (5/min)
POST   /payments/wallet/withdraw      → OWNER, MANAGER (5/min)
GET    /payments/transactions          → Multi-role (30/min)
GET    /payments/payment-methods       → CUSTOMER, OWNER, MANAGER (30/min)
POST   /payments/payment-methods       → CUSTOMER, OWNER, MANAGER (30/min)
DELETE /payments/payment-methods/:id   → CUSTOMER, OWNER, MANAGER (30/min)
```

### Telas mobile existentes (manter todas)

**App Cliente:** PaymentScreen, SplitPaymentScreen, UnifiedPaymentScreen, DigitalReceiptScreen, TabScreen, RoundBuilderSheet, TabPaymentScreen

**App Restaurante:** FinancialScreen, FinancialReportScreen, TipsDistributionScreen

### Padrões existentes obrigatórios

- **Idempotência:** Header `X-Idempotency-Key` em endpoints de pagamento
- **Rate limiting:** conforme tabela existente
- **Criptografia:** AES-256-GCM para dados sensíveis (card_exp, pix_key)
- **Precisão decimal:** DECIMAL(10,2), comparação com arredondamento 2 casas
- **Correlation IDs:** em todos os logs de pagamento
- **formatCurrency:** `shared/utils/formatters.ts` (suporta BRL, USD, EUR)

---

## REGRAS DE DESENVOLVIMENTO

### i18n — obrigatório em TODO código novo

```typescript
// shared/i18n/locales/pt-BR/financial.json
{
  "financial": {
    "payment": {
      "processing": "Processando pagamento...",
      "success": "Pagamento realizado",
      "failed": "Falha no pagamento",
      "methods": {
        "credit_card": "Cartão de crédito",
        "debit_card": "Cartão de débito",
        "pix": "PIX",
        "wallet": "Carteira digital",
        "cash": "Dinheiro",
        "tap_to_pay": "Aproximação (NFC)"
      },
      "tap_to_pay": {
        "ready": "Aproxime o cartão ou celular",
        "reading": "Lendo...",
        "success": "Pagamento aprovado",
        "failed": "Falha na leitura, tente novamente",
        "not_supported": "Dispositivo não suporta NFC"
      },
      "pix": {
        "qr_title": "Escaneie o QR Code",
        "copy_paste": "Copiar código PIX",
        "copied": "Código copiado",
        "waiting": "Aguardando pagamento PIX...",
        "confirmed": "PIX confirmado"
      }
    },
    "cogs": {
      "cost_price": "Custo",
      "margin": "Margem",
      "margin_alert": "Margem abaixo de {{threshold}}%",
      "no_cost": "Custo não cadastrado"
    },
    "cash_register": {
      "open": "Abrir caixa",
      "close": "Fechar caixa",
      "current_balance": "Saldo atual",
      "opening_balance": "Saldo de abertura",
      "expected_balance": "Saldo esperado",
      "actual_balance": "Saldo real",
      "difference": "Diferença",
      "shortage": "Falta",
      "surplus": "Sobra",
      "movements": "Movimentações",
      "sangria": "Sangria",
      "reforco": "Reforço"
    },
    "fiscal": {
      "nfce_emitted": "NFC-e emitida",
      "nfce_pending": "NFC-e em processamento",
      "nfce_failed": "Falha na emissão da NFC-e",
      "nfce_cancelled": "NFC-e cancelada",
      "nfce_denied": "NFC-e rejeitada pela SEFAZ: {{reason}}",
      "setup": {
        "title": "Configuração fiscal",
        "cnpj": "CNPJ",
        "ie": "Inscrição Estadual",
        "regime": "Regime tributário",
        "csc_id": "ID do CSC",
        "csc_token": "Token do CSC",
        "certificate": "Certificado digital A1",
        "upload_cert": "Enviar arquivo .pfx",
        "cert_password": "Senha do certificado",
        "cert_uploaded": "Certificado enviado com sucesso",
        "cert_failed": "Falha no envio do certificado",
        "auto_emit": "Emitir NFC-e automaticamente",
        "save": "Salvar e ativar",
        "help_csc": "O CSC é gerado no portal da SEFAZ do seu estado"
      },
      "receipt": {
        "fiscal_qr": "QR Code fiscal",
        "access_key": "Chave de acesso",
        "view_danfe": "Ver DANFE"
      }
    },
    "forecast": {
      "title": "Previsão de fluxo de caixa",
      "next_7_days": "Próximos 7 dias",
      "next_30_days": "Próximos 30 dias",
      "alert_low_balance": "Saldo projetado abaixo de {{threshold}} em {{days}} dias",
      "projected_balance": "Saldo projetado"
    },
    "reconciliation": {
      "title": "Conciliação",
      "expected": "Esperado",
      "received": "Recebido",
      "difference": "Diferença",
      "pending": "Pendente",
      "reconciled": "Conciliado",
      "discrepancy": "Discrepância encontrada"
    },
    "reports": {
      "revenue": "Receita",
      "expenses": "Despesas",
      "net_profit": "Lucro líquido",
      "margin": "Margem",
      "avg_ticket": "Ticket médio",
      "top_items": "Itens mais vendidos",
      "worst_margin": "Piores margens",
      "by_source": "Por canal"
    }
  }
}
```

### Sinergia com KDS Brain

O Financial Brain se conecta ao KDS Brain em vários pontos:
- **Pedido delivery criado (KDS)** → Financial registra receita bruta + comissão estimada da plataforma
- **Item marcado ready (KDS)** → Financial registra custo do item (COGS)
- **Item 86 / esgotado (KDS)** → Financial recalcula forecast de vendas
- **Pedido concluído** → Financial emite NFC-e automaticamente
- Os dois módulos compartilham as entidades Order e OrderItem

---

## SPRINT 1 — PAYMENT HUB: ASAAS + STRIPE TAP TO PAY (semanas 1-4)

### Objetivo
Integrar gateway real de pagamentos. Asaas processa cartão de crédito, débito e PIX. Stripe Terminal transforma o celular do garçom em maquininha NFC. Ao final, o restaurante aceita todos os métodos de pagamento sem hardware adicional.

---

### Task 1.1 — Módulo Payment Gateway (estrutura + adapter pattern)

**Criar:**
```
backend/src/modules/payment-gateway/
├── payment-gateway.module.ts
├── interfaces/
│   └── gateway-adapter.interface.ts
├── services/
│   ├── gateway-router.service.ts         // Decide qual adapter usar
│   └── payment-webhook.service.ts        // Processa webhooks Asaas
├── adapters/
│   ├── asaas/
│   │   ├── asaas.adapter.ts              // Implementa GatewayAdapter
│   │   ├── asaas.auth.service.ts         // API key management
│   │   ├── asaas.types.ts                // DTOs da API Asaas
│   │   └── asaas.pix.service.ts          // QR code PIX específico
│   ├── stripe-terminal/
│   │   ├── stripe-terminal.adapter.ts    // Tap to Pay
│   │   ├── stripe-terminal.service.ts    // Connection tokens, readers
│   │   └── stripe-terminal.types.ts
│   └── wallet/
│       └── wallet.adapter.ts             // Adapter para wallet existente
├── controllers/
│   ├── gateway.controller.ts             // Endpoints de pagamento
│   └── webhook.controller.ts             // Recebe webhooks Asaas
├── entities/
│   ├── gateway-transaction.entity.ts     // Log de todas as transações gateway
│   └── gateway-config.entity.ts          // Config por restaurante
├── dto/
│   ├── process-payment.dto.ts
│   ├── pix-payment.dto.ts
│   └── tap-to-pay.dto.ts
└── i18n/
    └── payment-gateway.i18n.ts
```

### Task 1.2 — GatewayAdapter interface

**Criar:** `interfaces/gateway-adapter.interface.ts`

```typescript
export interface GatewayAdapter {
  readonly provider: 'asaas' | 'stripe_terminal' | 'wallet' | 'cash';

  // Processar pagamento
  processPayment(params: ProcessPaymentParams): Promise<PaymentResult>;

  // Estornar
  refundPayment(transactionId: string, amount?: number): Promise<RefundResult>;

  // Verificar status
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
}

export interface ProcessPaymentParams {
  amount: number;                    // Em centavos (ex: 9890 = R$98,90)
  payment_method: PaymentMethodType;
  order_id: string;
  restaurant_id: string;
  customer_id?: string;
  idempotency_key: string;

  // Para cartão (Asaas)
  card_token?: string;               // Token Asaas do cartão
  installments?: number;             // Parcelas (1-12)

  // Para PIX (Asaas)
  pix_expiration_seconds?: number;   // Default: 600 (10min)

  // Para Tap to Pay (Stripe Terminal)
  stripe_payment_intent_id?: string;

  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transaction_id: string;            // ID interno
  external_id: string;               // ID no gateway (Asaas/Stripe)
  status: 'completed' | 'pending' | 'failed';
  
  // PIX específico
  pix_qr_code?: string;             // QR code base64
  pix_copy_paste?: string;          // Código copia-e-cola
  pix_expiration?: Date;

  // Erro
  error_code?: string;
  error_message?: string;
}

export type PaymentMethodType = 
  | 'credit_card' 
  | 'debit_card' 
  | 'pix' 
  | 'wallet' 
  | 'cash' 
  | 'tap_to_pay';
```

### Task 1.3 — Asaas adapter

**Criar:** `adapters/asaas/asaas.adapter.ts`

```typescript
/**
 * Adapter para API Asaas v3 (https://docs.asaas.com)
 * 
 * Fluxo de pagamento com cartão:
 * 1. Frontend tokeniza cartão via Asaas.js SDK → retorna card_token
 * 2. Backend cria customer no Asaas (se não existe)
 * 3. Backend cria cobrança: POST /v3/payments
 *    - billingType: CREDIT_CARD ou DEBIT_CARD
 *    - creditCard: { holderName, number, expiryMonth, expiryYear, ccv }
 *      OU creditCardToken (se já tokenizado)
 * 4. Asaas processa e retorna status
 * 5. Webhook confirma pagamento assíncrono
 * 
 * Fluxo PIX:
 * 1. Backend cria cobrança: POST /v3/payments
 *    - billingType: PIX
 * 2. Asaas retorna: encodedImage (QR base64) + payload (copia-e-cola)
 * 3. Frontend exibe QR Code
 * 4. Webhook PAYMENT_RECEIVED confirma pagamento
 * 
 * Endpoints Asaas utilizados:
 * - POST /v3/customers           → Criar/buscar customer
 * - POST /v3/payments            → Criar cobrança
 * - GET  /v3/payments/:id        → Status da cobrança
 * - POST /v3/payments/:id/refund → Estorno
 * - GET  /v3/payments/:id/pixQrCode → QR Code PIX
 * 
 * Webhooks Asaas (receber em POST /payment-gateway/webhooks/asaas):
 * - PAYMENT_CONFIRMED    → Cartão aprovado
 * - PAYMENT_RECEIVED     → PIX recebido
 * - PAYMENT_OVERDUE      → Pagamento expirado
 * - PAYMENT_REFUNDED     → Estorno processado
 * 
 * Auth: API Key no header "access_token"
 * Base URL prod: https://api.asaas.com
 * Base URL sandbox: https://sandbox.asaas.com/api
 * 
 * IMPORTANTE: Consultar https://docs.asaas.com antes de implementar.
 * Endpoints e campos podem mudar. Este spec é referência, não gospel.
 */
@Injectable()
export class AsaasAdapter implements GatewayAdapter {
  readonly provider = 'asaas';

  async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    // 1. Buscar ou criar customer no Asaas
    // 2. Criar cobrança com billingType baseado em params.payment_method
    // 3. Para PIX: retornar QR code e copia-e-cola
    // 4. Para cartão: processar e retornar resultado
    // 5. Registrar GatewayTransaction com correlation_id
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundResult> {
    // POST /v3/payments/:id/refund
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    // GET /v3/payments/:id
  }
}
```

**Criar:** `adapters/asaas/asaas.pix.service.ts`

```typescript
/**
 * Serviço dedicado para pagamentos PIX via Asaas.
 * 
 * Fluxo:
 * 1. Criar cobrança PIX → receber QR code
 * 2. Polling ou webhook para confirmar recebimento
 * 3. Atualizar status do pedido quando PIX é confirmado
 * 
 * O QR Code tem expiração configurável (default 10min).
 * Se expirar, nova cobrança deve ser criada.
 */
```

**Criar config entity:** `entities/gateway-config.entity.ts`

```typescript
@Entity('gateway_configs')
export class GatewayConfig {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) restaurant_id: string;
  @Column({ type: 'varchar', length: 20 }) provider: string; // 'asaas' | 'stripe_terminal'
  @Column({ type: 'jsonb' }) credentials: Record<string, any>;
  // Asaas: { api_key, webhook_token, environment: 'sandbox'|'production' }
  // Stripe: { secret_key, publishable_key, location_id }
  @Column({ type: 'boolean', default: true }) is_active: boolean;
  @Column({ type: 'jsonb', nullable: true }) settings: Record<string, any>;
  // settings: { max_installments, pix_expiration_seconds, auto_refund_on_cancel }
}
```

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
  updated_at TIMESTAMP DEFAULT now(),
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
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_gateway_tx_order ON gateway_transactions(order_id);
CREATE INDEX idx_gateway_tx_external ON gateway_transactions(external_id);
CREATE INDEX idx_gateway_tx_idempotency ON gateway_transactions(idempotency_key);
```

**Critério de aceite:**
- [ ] Pagamento com cartão de crédito via Asaas funciona (sandbox)
- [ ] Pagamento PIX gera QR Code e confirma via webhook
- [ ] Idempotência previne cobrança duplicada
- [ ] GatewayTransaction registra cada operação com correlation_id
- [ ] Webhook Asaas atualiza status do pagamento e do pedido

---

### Task 1.4 — Stripe Terminal adapter (Tap to Pay)

**Criar:** `adapters/stripe-terminal/stripe-terminal.adapter.ts`

```typescript
/**
 * Adapter para Stripe Terminal — Tap to Pay.
 * Transforma o celular do garçom em maquininha NFC.
 * 
 * Dependências mobile:
 * - @stripe/stripe-terminal-react-native (npm package)
 * - iOS: Tap to Pay on iPhone entitlement (Apple Developer)
 * - Android: NFC capability, minSDK 30
 * 
 * Fluxo Tap to Pay:
 * 1. Backend cria ConnectionToken → POST /v1/terminal/connection_tokens
 * 2. Mobile inicializa StripeTerminalProvider com tokenProvider
 * 3. Mobile descobre reader local (discoverReaders, type: tapToPay)
 * 4. Mobile conecta ao reader (connectReader)
 * 5. Backend cria PaymentIntent → POST /v1/payment_intents
 * 6. Mobile coleta pagamento (collectPaymentMethod) → garçom aproxima cartão/celular
 * 7. Mobile confirma (confirmPaymentIntent)
 * 8. Backend recebe webhook payment_intent.succeeded
 * 
 * Endpoints Stripe utilizados:
 * - POST /v1/terminal/connection_tokens → Gerar token de conexão
 * - POST /v1/terminal/locations        → Registrar localização do restaurante
 * - POST /v1/payment_intents           → Criar intent para Tap to Pay
 * - POST /v1/payment_intents/:id/capture → Capturar pagamento
 * - POST /v1/refunds                   → Estorno
 * 
 * IMPORTANTE: Stripe Terminal requer conta Stripe com Terminal habilitado.
 * Tap to Pay on iPhone requer Apple Developer Program + entitlement.
 * Consultar https://docs.stripe.com/terminal antes de implementar.
 */
@Injectable()
export class StripeTerminalAdapter implements GatewayAdapter {
  readonly provider = 'stripe_terminal';

  async createConnectionToken(restaurantId: string): Promise<string> {
    // POST /v1/terminal/connection_tokens
    // Retorna secret para o mobile inicializar
  }

  async createPaymentIntent(params: ProcessPaymentParams): Promise<{
    client_secret: string;
    payment_intent_id: string;
  }> {
    // POST /v1/payment_intents
    // capture_method: 'automatic'
    // payment_method_types: ['card_present']
  }

  async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    // Para Tap to Pay, o processamento acontece no mobile
    // Este método cria o PaymentIntent e retorna client_secret
    // O mobile faz o collect e confirm
    // Webhook confirma o sucesso
  }
}
```

**Mobile — alterações no app restaurant:**

**Criar:** `restaurant/src/services/tap-to-pay.service.ts`

```typescript
/**
 * Service que encapsula a integração Stripe Terminal no app restaurant.
 * 
 * Setup (uma vez ao abrir o app):
 * 1. Chamar ApiService.getStripeConnectionToken()
 * 2. Inicializar StripeTerminalProvider com tokenProvider
 * 3. Discover readers (tipo tapToPay)
 * 4. Conectar ao reader
 * 
 * Cobrar (a cada pagamento):
 * 1. Chamar ApiService.createTapToPayIntent(orderId, amount)
 * 2. Receber client_secret
 * 3. Chamar collectPaymentMethod(client_secret) → tela "Aproxime o cartão"
 * 4. Chamar confirmPaymentIntent() → processa
 * 5. Retornar resultado
 * 
 * Pacotes necessários:
 * - npm install @stripe/stripe-terminal-react-native
 * - iOS: pod install + entitlement Tap to Pay
 * - Android: AndroidManifest NFC permission
 */
```

**Criar:** `restaurant/src/screens/payment/TapToPayScreen.tsx`

```
┌──────────────────────────────────────┐
│  Pagamento por aproximação           │
├──────────────────────────────────────┤
│                                      │
│          R$ 358,57                   │  ← Total grande
│                                      │
│     Mesa 7 │ Pedido #a1b2c3         │
│                                      │
│  ┌──────────────────────────────┐    │
│  │                              │    │
│  │    ╔══════════════╗          │    │
│  │    ║  (((  NFC    ║          │    │  ← Animação NFC
│  │    ╚══════════════╝          │    │
│  │                              │    │
│  │  Aproxime o cartão ou celular│    │
│  │  do cliente                  │    │
│  └──────────────────────────────┘    │
│                                      │
│  [Cancelar]        [Digitar valor]   │
│                                      │
└──────────────────────────────────────┘

// Após leitura:
┌──────────────────────────────────────┐
│  ✓ Pagamento aprovado                │
│                                      │
│  R$ 358,57                          │
│  Cartão ****4242 (Visa)             │
│                                      │
│  [Emitir recibo]     [Novo pedido]   │
└──────────────────────────────────────┘
```

**Novos endpoints backend:**

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `POST` | `/payment-gateway/connection-token` | OWNER, MANAGER, WAITER | Token Stripe Terminal |
| `POST` | `/payment-gateway/tap-to-pay/intent` | OWNER, MANAGER, WAITER | Criar PaymentIntent |
| `POST` | `/payment-gateway/process` | CUSTOMER, OWNER, MANAGER, WAITER | Processar pagamento (qualquer método) |
| `POST` | `/payment-gateway/webhooks/asaas` | Public (validar signature) | Webhooks Asaas |
| `POST` | `/payment-gateway/webhooks/stripe` | Public (validar signature) | Webhooks Stripe |
| `GET` | `/payment-gateway/pix/:orderId/qrcode` | CUSTOMER | QR Code PIX do pedido |
| `POST` | `/payment-gateway/refund/:transactionId` | OWNER, MANAGER | Estorno |

**Critério de aceite:**
- [ ] Garçom abre TapToPayScreen, aproxima cartão do cliente, pagamento é processado
- [ ] Funciona em iPhone (Tap to Pay on iPhone) e Android (Tap to Pay on Android)
- [ ] Sem necessidade de hardware adicional (maquininha)
- [ ] Webhook Stripe confirma pagamento
- [ ] i18n completo na tela de Tap to Pay

---

### Task 1.5 — Integrar gateway ao fluxo de pagamento existente

**Alterar:** `payments.service.ts`

O `processPayment` existente deve rotear para o adapter correto:

```typescript
/**
 * Evolução do método processPayment existente.
 * 
 * ANTES: switch por método, wallet funcional, outros fazem log
 * DEPOIS: switch por método, roteia para o adapter correto
 * 
 * Fluxo:
 * 1. Validações existentes (idempotência, ownership, valor)
 * 2. Determinar adapter baseado no payment_method:
 *    - wallet → WalletAdapter (lógica existente)
 *    - credit_card, debit_card → AsaasAdapter
 *    - pix → AsaasAdapter (retorna QR code)
 *    - tap_to_pay → StripeTerminalAdapter
 *    - cash → Lógica existente (status pending)
 * 3. Chamar adapter.processPayment()
 * 4. Registrar GatewayTransaction
 * 5. Criar FinancialTransaction (SALE)
 * 6. Atualizar status do pedido
 * 7. Retornar resultado com dados relevantes (QR PIX, status, etc.)
 * 
 * RETROCOMPATIBILIDADE: endpoint POST /payments/process continua funcionando.
 * O novo POST /payment-gateway/process é um alias que chama o mesmo service.
 */
```

**Alterar:** PIX no app cliente — `PaymentScreen.tsx`

Quando método PIX é selecionado:
1. Chamar API para criar cobrança PIX
2. Receber QR code (base64) e código copia-e-cola
3. Exibir QR code na tela + botão "Copiar código PIX"
4. WebSocket listener para `payment:pix_confirmed` → navegar para tela de sucesso
5. Timer de expiração visível (default: 10 min)
6. Se expirar: botão "Gerar novo QR Code"

**Critério de aceite:**
- [ ] Pagamento via cartão (Asaas) funciona end-to-end
- [ ] Pagamento via PIX mostra QR Code e confirma automaticamente via webhook
- [ ] Pagamento via Tap to Pay funciona no celular do garçom
- [ ] Pagamento via wallet continua funcionando (retrocompatível)
- [ ] Pagamento via dinheiro continua funcionando (retrocompatível)
- [ ] FinancialTransaction é criada para cada pagamento
- [ ] Rate limiting e idempotência mantidos

---

### Task 1.6 — Controle de caixa (abertura/fechamento)

**Criar:** `backend/src/modules/cash-register/`

```
cash-register/
├── cash-register.module.ts
├── entities/
│   ├── cash-register-session.entity.ts
│   └── cash-register-movement.entity.ts
├── services/
│   └── cash-register.service.ts
├── controllers/
│   └── cash-register.controller.ts
└── dto/
    ├── open-register.dto.ts
    ├── close-register.dto.ts
    └── register-movement.dto.ts
```

**Entidades:**

```typescript
@Entity('cash_register_sessions')
export class CashRegisterSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) restaurant_id: string;
  @Column({ type: 'uuid' }) opened_by: string;      // FK → Profile (quem abriu)
  @Column({ type: 'uuid', nullable: true }) closed_by: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) opening_balance: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) expected_balance: number; // Calculado
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) actual_balance: number;   // Informado no fechamento
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) difference: number;       // actual - expected
  @Column({ type: 'varchar', length: 20, default: 'open' }) status: string; // 'open' | 'closed'
  @Column({ type: 'timestamp' }) opened_at: Date;
  @Column({ type: 'timestamp', nullable: true }) closed_at: Date;
  @Column({ type: 'text', nullable: true }) closing_notes: string;
}

@Entity('cash_register_movements')
export class CashRegisterMovement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) session_id: string;       // FK → CashRegisterSession
  @Column({ type: 'varchar', length: 20 }) type: string;
  // 'sale_cash' | 'sale_card' | 'sale_pix' | 'sale_tap' | 'sale_wallet' 
  // | 'tip' | 'sangria' | 'reforco' | 'refund' | 'expense'
  @Column({ type: 'decimal', precision: 10, scale: 2 }) amount: number;
  @Column({ type: 'boolean' }) is_cash: boolean;       // Se afeta caixa físico
  @Column({ type: 'uuid', nullable: true }) order_id: string;
  @Column({ type: 'uuid' }) created_by: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @CreateDateColumn() created_at: Date;
}
```

**Lógica:**

```typescript
/**
 * CashRegisterService
 * 
 * Abertura:
 * - Apenas 1 sessão aberta por restaurante por vez
 * - Registrar opening_balance (contagem manual do caixa)
 * 
 * Durante operação (automático):
 * - Cada pagamento processado → criar CashRegisterMovement
 *   - sale_cash: is_cash=true (entra no caixa físico)
 *   - sale_card/pix/tap/wallet: is_cash=false (não entra no caixa físico)
 * - Sangria (retirada): OWNER/MANAGER retira dinheiro → is_cash=true, amount negativo
 * - Reforço (troco): OWNER/MANAGER coloca dinheiro → is_cash=true, amount positivo
 * 
 * Fechamento:
 * - Calcular expected_balance:
 *   opening_balance + SUM(movements WHERE is_cash=true)
 * - Operador informa actual_balance (contagem manual)
 * - difference = actual_balance - expected_balance
 *   - Positivo → sobra
 *   - Negativo → falta
 * - Gerar relatório de fechamento
 * - Status → 'closed'
 */
```

**Endpoints:**

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `POST` | `/cash-register/open` | OWNER, MANAGER | Abrir caixa |
| `GET` | `/cash-register/current` | OWNER, MANAGER, WAITER | Sessão ativa |
| `POST` | `/cash-register/movement` | OWNER, MANAGER | Sangria/reforço |
| `POST` | `/cash-register/close` | OWNER, MANAGER | Fechar caixa |
| `GET` | `/cash-register/history` | OWNER, MANAGER | Histórico de sessões |
| `GET` | `/cash-register/sessions/:id/report` | OWNER, MANAGER | Relatório de fechamento |

**Critério de aceite:**
- [ ] Abertura de caixa com saldo inicial
- [ ] Cada pagamento gera movimento automático no caixa
- [ ] Sangria e reforço funcionam com registro de quem fez
- [ ] Fechamento calcula diferença entre esperado e real
- [ ] Apenas 1 caixa aberto por restaurante por vez
- [ ] Relatório de fechamento com breakdown por método de pagamento

---

### Entregáveis Sprint 1

1. **Backend:** Payment Gateway module (Asaas + Stripe Terminal adapters), webhook handlers, Cash Register module
2. **Mobile restaurant:** TapToPayScreen, integração Stripe Terminal SDK, fluxo de abertura/fechamento de caixa
3. **Mobile client:** PIX QR Code screen, confirmação real-time via WebSocket
4. **Migrations:** gateway_configs, gateway_transactions, cash_register_sessions, cash_register_movements
5. **Testes:** Asaas adapter (sandbox), Stripe Terminal adapter (mock), Cash Register service

---

## SPRINT 2 — COGS, MARGEM E CONTROLE DE CUSTOS (semanas 5-8)

### Objetivo
Cada prato vendido tem custo rastreado. O owner vê margem em tempo real. Items com margem ruim são identificados automaticamente.

---

### Task 2.1 — Entidades de custo

**Criar:** `backend/src/modules/cost-control/`

```
cost-control/
├── cost-control.module.ts
├── entities/
│   ├── ingredient.entity.ts
│   ├── ingredient-price.entity.ts
│   ├── recipe.entity.ts              // Ficha técnica do prato
│   └── recipe-ingredient.entity.ts
├── services/
│   ├── ingredient.service.ts
│   ├── recipe.service.ts
│   ├── cogs.service.ts               // Calcula custo por venda
│   └── margin-tracker.service.ts     // Margem em tempo real
├── controllers/
│   └── cost-control.controller.ts
└── dto/
```

**Entidades:**

```typescript
// Ingrediente (insumo)
@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) restaurant_id: string;
  @Column({ type: 'varchar', length: 200 }) name: string; // "Filé Mignon", "Azeite"
  @Column({ type: 'varchar', length: 20 }) unit: string;  // 'kg', 'l', 'un', 'g', 'ml'
  @Column({ type: 'varchar', length: 50, nullable: true }) category: string; // 'proteína', 'vegetal', etc.
  @Column({ type: 'boolean', default: true }) is_active: boolean;
}

// Preço do ingrediente (histórico — último preço é o corrente)
@Entity('ingredient_prices')
export class IngredientPrice {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) ingredient_id: string;
  @Column({ type: 'decimal', precision: 10, scale: 4 }) price_per_unit: number; // R$ por unidade
  @Column({ type: 'varchar', length: 200, nullable: true }) supplier: string;
  @Column({ type: 'date' }) effective_date: Date;
}

// Ficha técnica (receita do prato)
@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) menu_item_id: string; // FK → MenuItem (1:1)
  @Column({ type: 'uuid' }) restaurant_id: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) 
  calculated_cost: number; // Custo calculado (cache)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) 
  calculated_margin_pct: number; // Margem % calculada (cache)
  @Column({ type: 'timestamp', nullable: true }) last_calculated_at: Date;
}

// Ingrediente na receita
@Entity('recipe_ingredients')
export class RecipeIngredient {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) recipe_id: string;
  @Column({ type: 'uuid' }) ingredient_id: string;
  @Column({ type: 'decimal', precision: 10, scale: 4 }) quantity: number; // Qtd do ingrediente
  // Ex: Filé Mignon → 0.3 kg de filé, 0.02 l de azeite, etc.
}
```

### Task 2.2 — COGS Service (custo automático por venda)

**Criar:** `services/cogs.service.ts`

```typescript
/**
 * Chamado automaticamente quando um OrderItem é pago/concluído.
 * 
 * Para cada item vendido:
 * 1. Buscar Recipe do MenuItem
 * 2. Para cada RecipeIngredient:
 *    - Buscar último IngredientPrice (effective_date <= hoje)
 *    - custo_ingrediente = quantity × price_per_unit
 * 3. cost_total = SUM(custo_ingrediente) × OrderItem.quantity
 * 4. Registrar FinancialTransaction tipo 'COGS' com o custo
 * 5. Atualizar Recipe.calculated_cost e calculated_margin_pct
 * 
 * Se Recipe não existe para o MenuItem:
 * - Registrar com custo 0 e flag 'no_recipe'
 * - Alerta para owner: "Prato X vendido sem ficha técnica cadastrada"
 * 
 * Margem = (sale_price - cost) / sale_price × 100
 */
```

### Task 2.3 — Margin tracker (margem em tempo real)

**Criar:** `services/margin-tracker.service.ts`

```typescript
/**
 * Endpoints de margem para dashboard do owner.
 * 
 * GET /cost-control/margins
 * Retorna para cada MenuItem:
 * {
 *   menu_item_id, name, category,
 *   sale_price, cost_price, margin_pct,
 *   units_sold_period, revenue_period, cogs_period,
 *   profit_period
 * }
 * 
 * GET /cost-control/alerts
 * Retorna items com margem abaixo de threshold (default: 25%):
 * - Items sem ficha técnica (custo desconhecido)
 * - Items com margem < threshold
 * - Items com ingrediente que subiu de preço recentemente (>10%)
 * 
 * GET /cost-control/food-cost
 * Food cost % do período = total COGS / total receita food × 100
 * Benchmark restaurante: 28-35% é saudável
 * Retorna: { food_cost_pct, benchmark, status: 'healthy'|'warning'|'critical' }
 */
```

### Task 2.4 — Tela de ficha técnica (mobile restaurant)

**Criar:** `restaurant/src/screens/cost-control/RecipeScreen.tsx`

Tela para cadastrar ficha técnica (receita) de cada prato:
- Selecionar MenuItem
- Adicionar ingredientes com quantidade e unidade
- Ver custo calculado e margem em tempo real
- Alertas visuais para margem baixa

**Criar:** `restaurant/src/screens/cost-control/MarginDashboardScreen.tsx`

Dashboard de margem:
- Cards: food cost %, margem média, piores margens
- Lista de items ordenados por margem (ascendente — piores primeiro)
- Alertas de items sem ficha técnica
- Filtros por categoria

---

## SPRINT 3 — FISCAL, RECONCILIAÇÃO E DELIVERY FINANCE (semanas 9-12)

### Objetivo
Emissão automática de NFC-e, reconciliação de repasses de delivery, e integração financeira completa com o KDS Brain.

---

### Task 3.1 — Módulo fiscal (NFC-e) com adapter pattern

**Estratégia de custo:**
- **Fase 1 (agora):** Usar API intermediária (Focus NFe) para emissão de NFC-e.
  A NOOWE envia JSON via REST, a Focus NFe monta XML, assina, transmite à SEFAZ e retorna resultado.
  Custo: ~R$0,05-0,10 por nota em plano Enterprise/SaaS de volume alto.
  Vantagem: zero complexidade com XML, certificados, webservices de 27 estados, contingência.
- **Fase 2 (50+ restaurantes):** Criar adapter de comunicação direta com SEFAZ.
  Custo por nota: zero (só infraestrutura). Justifica quando volume > 150.000 notas/mês.
  O adapter pattern permite trocar sem alterar código de negócio.

**O adapter pattern é o mesmo usado no Payment Gateway (Asaas/Stripe) e no KDS Brain (iFood/Rappi/UberEats).**

**Criar:**
```
backend/src/modules/fiscal/
├── fiscal.module.ts
├── interfaces/
│   └── fiscal-adapter.interface.ts     // Interface que todo adapter implementa
├── adapters/
│   ├── focus-nfe/
│   │   ├── focus-nfe.adapter.ts        // FASE 1: API intermediária
│   │   ├── focus-nfe.types.ts          // DTOs da API Focus NFe
│   │   └── focus-nfe.webhook.service.ts // Processa callbacks da Focus
│   └── sefaz-direct/
│       ├── sefaz-direct.adapter.ts     // FASE 2: comunicação direta (futuro)
│       ├── sefaz-xml-builder.ts        // Gera XML NFC-e conforme MOC
│       ├── sefaz-signer.service.ts     // Assinatura com certificado A1
│       └── sefaz-urls.config.ts        // URLs dos webservices por UF
├── entities/
│   ├── fiscal-document.entity.ts       // NFC-e emitidas (log)
│   └── fiscal-config.entity.ts         // Config fiscal por restaurante
├── services/
│   ├── fiscal-emission.service.ts      // Orquestra emissão (usa adapter)
│   ├── fiscal-onboarding.service.ts    // Onboarding fiscal do restaurante
│   └── fiscal-menu-item.service.ts     // Dados fiscais por item do menu
├── controllers/
│   ├── fiscal.controller.ts
│   └── fiscal-webhook.controller.ts    // Recebe callbacks Focus NFe
├── dto/
│   ├── emit-nfce.dto.ts
│   ├── fiscal-config.dto.ts
│   └── fiscal-document.dto.ts
└── i18n/
    └── fiscal.i18n.ts
```

**Criar:** `interfaces/fiscal-adapter.interface.ts`

```typescript
/**
 * Interface que todo adapter fiscal implementa.
 * Focus NFe (Fase 1) e SEFAZ Direct (Fase 2) usam a mesma interface.
 * O FiscalEmissionService não sabe qual adapter está sendo usado.
 */
export interface FiscalAdapter {
  readonly provider: 'focus_nfe' | 'sefaz_direct';

  // Emitir NFC-e
  emitNfce(params: EmitNfceParams): Promise<FiscalEmissionResult>;

  // Cancelar NFC-e (até 24h após emissão)
  cancelNfce(accessKey: string, reason: string): Promise<FiscalCancelResult>;

  // Consultar status de uma NFC-e
  consultNfce(accessKey: string): Promise<FiscalConsultResult>;

  // Inutilizar faixa de numeração (quando necessário)
  invalidateRange(series: number, startNumber: number, endNumber: number, reason: string): Promise<void>;
}

export interface EmitNfceParams {
  // Emitente (restaurante)
  restaurant_id: string;
  cnpj: string;
  ie: string;
  razao_social: string;
  nome_fantasia: string;
  endereco: FiscalAddress;
  regime_tributario: 'simples_nacional' | 'lucro_presumido' | 'lucro_real';

  // Config fiscal
  serie: number;
  numero: number;               // Sequencial da NFC-e
  csc_id: string;               // ID do CSC na SEFAZ
  csc_token: string;            // Token CSC

  // Items
  items: FiscalItem[];

  // Pagamento
  payments: FiscalPayment[];

  // Totais
  total_amount: number;

  // Consumidor (opcional — obrigatório se valor >= R$10.000 ou se solicitado)
  consumer_cpf?: string;
  consumer_name?: string;

  // Referência interna
  order_id: string;
  idempotency_key: string;
}

export interface FiscalItem {
  description: string;         // Nome do item
  ncm: string;                 // NCM (8 dígitos, "00000000" para alimento servido em restaurante)
  cfop: string;                // CFOP (geralmente "5102" para venda no estado)
  quantity: number;
  unit_price: number;
  total_price: number;
  unit: string;                // "UN", "KG", etc.

  // Tributos (depende do regime)
  icms: {
    origem: string;            // '0' = Nacional
    cst?: string;              // Para Lucro Presumido/Real
    csosn?: string;            // Para Simples Nacional (ex: '102' = sem tributação)
    aliquota?: number;
    valor?: number;
  };
  pis: { cst: string; aliquota?: number; valor?: number };
  cofins: { cst: string; aliquota?: number; valor?: number };
}

export interface FiscalPayment {
  method: string;              // '01'=Dinheiro, '03'=Cartão Crédito, '04'=Cartão Débito, '17'=PIX
  amount: number;
}

export interface FiscalEmissionResult {
  success: boolean;
  access_key?: string;          // Chave de acesso 44 dígitos
  number?: number;              // Número da NFC-e
  series?: number;
  protocol?: string;            // Protocolo de autorização SEFAZ
  xml?: string;                 // XML autorizado
  qr_code_url?: string;         // URL do QR Code para consulta
  danfe_url?: string;           // URL do DANFE em HTML/PDF (Focus NFe gera)
  error_code?: string;
  error_message?: string;
}
```

**Criar:** `adapters/focus-nfe/focus-nfe.adapter.ts`

```typescript
/**
 * Adapter para API Focus NFe (https://focusnfe.com.br/doc/)
 * 
 * FASE 1 da estratégia fiscal — API intermediária.
 * A NOOWE envia os dados da nota em JSON, a Focus NFe faz tudo:
 * monta XML, assina com certificado do restaurante, transmite à SEFAZ,
 * lida com contingência, e retorna o resultado.
 * 
 * Endpoints Focus NFe utilizados:
 * - POST /v2/nfce?ref={ref}           → Emitir NFC-e
 * - DELETE /v2/nfce/{ref}             → Cancelar NFC-e
 * - GET /v2/nfce/{ref}               → Consultar NFC-e
 * - POST /v2/nfce/inutilizar          → Inutilizar numeração
 * 
 * Auth: Token no header "Authorization: Token token={api_token}"
 * Base URL prod: https://api.focusnfe.com.br
 * Base URL homolog: https://homologacao.focusnfe.com.br
 * 
 * Certificado digital A1:
 * O certificado do restaurante é enviado UMA VEZ para a Focus NFe
 * via endpoint POST /v2/uploads/certificate (arquivo .pfx + senha).
 * Depois disso, a Focus assina as notas automaticamente.
 * A NOOWE NÃO precisa armazenar o certificado no próprio servidor.
 * 
 * Webhooks Focus NFe:
 * A Focus envia callback para URL configurada quando NFC-e é autorizada,
 * rejeitada, ou cancelada. Receber em POST /fiscal/webhooks/focus-nfe.
 * 
 * IMPORTANTE: Consultar https://focusnfe.com.br/doc/ antes de implementar.
 * O formato JSON dos campos pode mudar. Este spec é referência.
 * 
 * Custo: plano Enterprise/SaaS com pricing por volume.
 * Negociar com Focus NFe diretamente — informar que é SaaS multicliente.
 */
@Injectable()
export class FocusNfeAdapter implements FiscalAdapter {
  readonly provider = 'focus_nfe';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async emitNfce(params: EmitNfceParams): Promise<FiscalEmissionResult> {
    // 1. Montar payload JSON conforme doc Focus NFe:
    //    { natureza_operacao, tipo_documento, consumidor_final,
    //      presenca_comprador, items[], formas_pagamento[], ... }
    //
    // 2. POST /v2/nfce?ref={order_id}
    //    Header: Authorization: Token token={restaurant_api_token}
    //
    // 3. Focus NFe retorna status:
    //    - 'autorizado': NFC-e emitida com sucesso
    //    - 'processando_autorizacao': aguardar webhook
    //    - 'erro_autorizacao': rejeição da SEFAZ (ver motivo)
    //
    // 4. Se 'autorizado': retornar access_key, protocol, xml, qr_code
    // 5. Se 'processando': retornar success=true, status='pending'
    //    (webhook vai confirmar depois)
    // 6. Se 'erro': retornar success=false com error_code e error_message
  }

  async cancelNfce(accessKey: string, reason: string): Promise<FiscalCancelResult> {
    // DELETE /v2/nfce/{ref}
    // Body: { justificativa: reason } (mínimo 15 caracteres)
    // Cancelamento só permitido até 24h após emissão
  }

  async consultNfce(accessKey: string): Promise<FiscalConsultResult> {
    // GET /v2/nfce/{ref}
    // Retorna status atual, XML, DANFE URL
  }

  async invalidateRange(series: number, start: number, end: number, reason: string): Promise<void> {
    // POST /v2/nfce/inutilizar
    // Usado quando há gap na numeração (ex: sistema pulou números)
  }
}
```

**Criar (esqueleto para Fase 2):** `adapters/sefaz-direct/sefaz-direct.adapter.ts`

```typescript
/**
 * Adapter para comunicação direta com webservice SEFAZ.
 * FASE 2 — implementar quando volume justificar (50+ restaurantes, 150k+ notas/mês).
 * 
 * Este adapter substitui a Focus NFe e faz tudo internamente:
 * 1. Monta XML da NFC-e conforme layout MOC (Manual de Orientação do Contribuinte)
 * 2. Assina XML com certificado digital A1 do restaurante (armazenado criptografado)
 * 3. Transmite para webservice SEFAZ do estado (URL por UF)
 * 4. Processa retorno (autorização ou rejeição)
 * 5. Gerencia contingência offline (emissão em contingência, retransmissão)
 * 
 * Dependências adicionais (instalar quando implementar):
 * - xml2js ou fast-xml-parser (montar/parsear XML)
 * - node-forge ou xml-crypto (assinatura digital)
 * - Mapa de URLs SEFAZ por UF (sefaz-urls.config.ts)
 * 
 * Custo por nota: R$ 0,00 (apenas infraestrutura de servidor)
 * Complexidade: alta (XML signing, certificados, contingência, 27 UFs)
 * 
 * POR ENQUANTO: este arquivo é um placeholder. Implementar na Fase 2.
 */
@Injectable()
export class SefazDirectAdapter implements FiscalAdapter {
  readonly provider = 'sefaz_direct';

  async emitNfce(params: EmitNfceParams): Promise<FiscalEmissionResult> {
    throw new NotImplementedException(
      'SEFAZ Direct adapter será implementado na Fase 2. Use Focus NFe adapter.'
    );
  }

  async cancelNfce(accessKey: string, reason: string): Promise<FiscalCancelResult> {
    throw new NotImplementedException('Fase 2');
  }

  async consultNfce(accessKey: string): Promise<FiscalConsultResult> {
    throw new NotImplementedException('Fase 2');
  }

  async invalidateRange(series: number, start: number, end: number, reason: string): Promise<void> {
    throw new NotImplementedException('Fase 2');
  }
}
```

**Entidades (mantidas — servem para ambas as fases):**

```typescript
@Entity('fiscal_documents')
export class FiscalDocument {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) restaurant_id: string;
  @Column({ type: 'uuid' }) order_id: string;
  @Column({ type: 'varchar', length: 20 }) type: string; // 'nfce' | 'nfe'
  @Column({ type: 'varchar', length: 20 }) status: string;
  // 'authorized' | 'cancelled' | 'denied' | 'pending' | 'contingency' | 'failed'
  @Column({ type: 'varchar', length: 20 }) provider: string; // 'focus_nfe' | 'sefaz_direct'
  @Column({ type: 'varchar', length: 44, nullable: true }) access_key: string;
  @Column({ type: 'int', nullable: true }) number: number;
  @Column({ type: 'int', nullable: true }) series: number;
  @Column({ type: 'text', nullable: true }) xml: string;
  @Column({ type: 'text', nullable: true }) qr_code_url: string;
  @Column({ type: 'text', nullable: true }) danfe_url: string; // URL do DANFE (Focus gera)
  @Column({ type: 'text', nullable: true }) protocol: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) total_amount: number;
  @Column({ type: 'jsonb', nullable: true }) items_snapshot: any;
  @Column({ type: 'varchar', length: 255, nullable: true }) external_ref: string; // Ref na Focus NFe
  @Column({ type: 'text', nullable: true }) error_message: string;
  @CreateDateColumn() created_at: Date;
}

@Entity('fiscal_configs')
export class FiscalConfig {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) restaurant_id: string;

  // Dados do emitente
  @Column({ type: 'varchar', length: 14 }) cnpj: string;
  @Column({ type: 'varchar', length: 15, nullable: true }) ie: string;
  @Column({ type: 'varchar', length: 200 }) razao_social: string;
  @Column({ type: 'varchar', length: 200, nullable: true }) nome_fantasia: string;
  @Column({ type: 'varchar', length: 2 }) state_code: string; // UF
  @Column({ type: 'jsonb' }) endereco: Record<string, any>;

  // Regime e tributos
  @Column({ type: 'varchar', length: 30 }) regime_tributario: string;
  // 'simples_nacional' | 'lucro_presumido' | 'lucro_real'
  @Column({ type: 'jsonb' }) tax_defaults: Record<string, any>;
  // { cfop: '5102', ncm_default: '00000000', icms_csosn: '102',
  //   pis_cst: '99', cofins_cst: '99', pis_aliquota: 0, cofins_aliquota: 0 }

  // CSC (Código de Segurança do Contribuinte — gerado na SEFAZ)
  @Column({ type: 'varchar', length: 10, nullable: true }) csc_id: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) csc_token: string; // Encrypted

  // Numeração
  @Column({ type: 'int', default: 1 }) current_series: number;
  @Column({ type: 'int', default: 1 }) next_number: number;

  // Provider fiscal
  @Column({ type: 'varchar', length: 20, default: 'focus_nfe' }) fiscal_provider: string;
  // 'focus_nfe' | 'sefaz_direct' | 'none'

  // Focus NFe specific
  @Column({ type: 'varchar', length: 255, nullable: true }) focus_nfe_token: string; // Encrypted
  // Token da API Focus NFe para este restaurante (cada CNPJ tem seu token)
  // O certificado A1 é enviado uma vez para a Focus NFe via upload endpoint
  @Column({ type: 'boolean', default: false }) certificate_uploaded: boolean;

  // SEFAZ Direct specific (Fase 2)
  @Column({ type: 'text', nullable: true }) certificate_base64: string; // Encrypted, só Fase 2
  @Column({ type: 'varchar', length: 255, nullable: true }) certificate_password: string; // Encrypted

  // Comportamento
  @Column({ type: 'boolean', default: true }) auto_emit: boolean;
  @Column({ type: 'boolean', default: true }) is_active: boolean;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
```

**Novos campos no MenuItem (dados fiscais por item):**

```typescript
// Adicionar ao MenuItem existente (migration):
@Column({ type: 'varchar', length: 8, default: '00000000' }) ncm: string;
// NCM: "00000000" para alimento preparado servido em restaurante
// Outros itens (bebida industrializada, por ex) precisam do NCM real

@Column({ type: 'varchar', length: 4, default: '5102' }) cfop: string;
// CFOP: "5102" = venda de mercadoria adquirida de terceiros (padrão restaurante)
// "5101" = venda de produção própria (menos comum em restaurante)
```

**Migration:**
```sql
CREATE TABLE fiscal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  access_key VARCHAR(44),
  number INT,
  series INT,
  xml TEXT,
  qr_code_url TEXT,
  danfe_url TEXT,
  protocol TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  items_snapshot JSONB,
  external_ref VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE fiscal_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  cnpj VARCHAR(14) NOT NULL,
  ie VARCHAR(15),
  razao_social VARCHAR(200) NOT NULL,
  nome_fantasia VARCHAR(200),
  state_code VARCHAR(2) NOT NULL,
  endereco JSONB NOT NULL,
  regime_tributario VARCHAR(30) NOT NULL,
  tax_defaults JSONB NOT NULL,
  csc_id VARCHAR(10),
  csc_token VARCHAR(255),
  current_series INT DEFAULT 1,
  next_number INT DEFAULT 1,
  fiscal_provider VARCHAR(20) DEFAULT 'focus_nfe',
  focus_nfe_token VARCHAR(255),
  certificate_uploaded BOOLEAN DEFAULT false,
  certificate_base64 TEXT,
  certificate_password VARCHAR(255),
  auto_emit BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(restaurant_id)
);

ALTER TABLE menu_items ADD COLUMN ncm VARCHAR(8) DEFAULT '00000000';
ALTER TABLE menu_items ADD COLUMN cfop VARCHAR(4) DEFAULT '5102';

CREATE INDEX idx_fiscal_docs_order ON fiscal_documents(order_id);
CREATE INDEX idx_fiscal_docs_restaurant ON fiscal_documents(restaurant_id);
CREATE INDEX idx_fiscal_docs_access_key ON fiscal_documents(access_key);
CREATE INDEX idx_fiscal_configs_restaurant ON fiscal_configs(restaurant_id);
```

**Criar:** `services/fiscal-emission.service.ts`

```typescript
/**
 * Orquestrador de emissão fiscal. NÃO sabe qual adapter está sendo usado.
 * Mesmo padrão do GatewayRouterService no Payment Gateway.
 * 
 * Chamado automaticamente quando pagamento é confirmado (se auto_emit=true).
 * 
 * Fluxo:
 * 1. Buscar FiscalConfig do restaurante
 * 2. Se fiscal_provider='none' ou is_active=false, pular
 * 3. Determinar adapter: config.fiscal_provider → Focus NFe ou SEFAZ Direct
 * 4. Montar EmitNfceParams com dados do pedido:
 *    - Dados do emitente (da FiscalConfig)
 *    - Items (do pedido, com NCM e CFOP do MenuItem)
 *    - Pagamentos (método usado no pagamento, mapeado para código fiscal)
 *    - Consumidor (CPF se disponível ou se valor >= R$10.000)
 * 5. Chamar adapter.emitNfce(params)
 * 6. Salvar FiscalDocument com resultado
 * 7. Incrementar FiscalConfig.next_number
 * 8. Se sucesso: emitir evento 'fiscal.nfce.authorized'
 * 9. Se erro: emitir evento 'fiscal.nfce.failed', notificar owner
 * 
 * Mapeamento de método de pagamento → código fiscal NFC-e:
 * - cash → '01' (Dinheiro)
 * - credit_card → '03' (Cartão de Crédito)
 * - debit_card → '04' (Cartão de Débito)
 * - pix → '17' (Pagamento Instantâneo / PIX)
 * - wallet → '05' (Crédito Loja) 
 * - tap_to_pay → '03' ou '04' (depende se crédito ou débito no NFC)
 */
@Injectable()
export class FiscalEmissionService {
  constructor(
    @Inject('FISCAL_ADAPTER') private readonly adapter: FiscalAdapter,
    private readonly fiscalConfigRepo: Repository<FiscalConfig>,
    private readonly fiscalDocRepo: Repository<FiscalDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async emitForOrder(orderId: string): Promise<FiscalDocument | null> {
    // Implementação conforme fluxo acima
  }

  async cancelDocument(fiscalDocumentId: string, reason: string): Promise<void> {
    // Buscar FiscalDocument, chamar adapter.cancelNfce, atualizar status
  }
}
```

**Criar:** `services/fiscal-onboarding.service.ts`

```typescript
/**
 * Serviço de onboarding fiscal para novos restaurantes.
 * 
 * Quando restaurante ativa a emissão fiscal na NOOWE:
 * 
 * Para Focus NFe (Fase 1):
 * 1. Restaurante preenche dados fiscais (CNPJ, IE, regime, CSC)
 * 2. NOOWE cria FiscalConfig no banco
 * 3. NOOWE faz upload do certificado A1 (.pfx) para a Focus NFe
 *    POST https://api.focusnfe.com.br/v2/uploads/certificate
 *    (arquivo .pfx + senha do certificado)
 * 4. Focus NFe armazena o certificado e retorna confirmação
 * 5. FiscalConfig.certificate_uploaded = true
 * 6. Pronto para emitir
 * 
 * O certificado A1 do restaurante NÃO fica armazenado nos servidores NOOWE
 * na Fase 1 — apenas na Focus NFe. Isso simplifica compliance PCI/segurança.
 * 
 * Para SEFAZ Direct (Fase 2):
 * 1. Certificado A1 é armazenado criptografado (AES-256-GCM) no banco
 * 2. Usado pelo SefazDirectAdapter para assinar XML localmente
 */
```

**Criar:** `controllers/fiscal-webhook.controller.ts`

```typescript
/**
 * Recebe callbacks da Focus NFe.
 * 
 * POST /fiscal/webhooks/focus-nfe
 * 
 * A Focus NFe envia webhook quando:
 * - NFC-e é autorizada (pode demorar até 30s em horários de pico)
 * - NFC-e é cancelada
 * - Erro na emissão
 * 
 * Fluxo:
 * 1. Validar autenticidade do webhook (token no header)
 * 2. Buscar FiscalDocument pelo external_ref
 * 3. Atualizar status, access_key, protocol, xml
 * 4. Emitir evento interno (fiscal.nfce.authorized ou fiscal.nfce.failed)
 */
@Controller('fiscal/webhooks')
export class FiscalWebhookController {
  @Post('focus-nfe')
  async handleFocusNfeWebhook(@Body() body: any, @Headers() headers: any) { }
}
```

**Endpoints do módulo fiscal:**

| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `POST` | `/fiscal/config` | OWNER | Criar/atualizar config fiscal do restaurante |
| `GET` | `/fiscal/config` | OWNER, MANAGER | Config fiscal atual |
| `POST` | `/fiscal/certificate/upload` | OWNER | Upload certificado A1 (envia para Focus NFe) |
| `POST` | `/fiscal/emit/:orderId` | OWNER, MANAGER | Emitir NFC-e manualmente (se auto_emit=false) |
| `POST` | `/fiscal/cancel/:documentId` | OWNER, MANAGER | Cancelar NFC-e |
| `GET` | `/fiscal/documents` | OWNER, MANAGER | Listar NFC-e emitidas |
| `GET` | `/fiscal/documents/:id` | OWNER, MANAGER | Detalhes de uma NFC-e |
| `POST` | `/fiscal/webhooks/focus-nfe` | Public (validar token) | Webhook Focus NFe |

**Tela mobile — onboarding fiscal:**

**Criar:** `restaurant/src/screens/fiscal/FiscalSetupScreen.tsx`

```
┌──────────────────────────────────────┐
│  Configuração fiscal                 │
├──────────────────────────────────────┤
│                                      │
│  CNPJ: 12.345.678/0001-90    [auto] │  ← Preenche do cadastro
│  IE: 123.456.789.123         [edit] │
│  Regime: [Simples Nacional ▼]        │
│                                      │
│  CSC ID: ________                    │  ← Gerado na SEFAZ
│  CSC Token: ________                 │
│                                      │
│  Certificado A1:                     │
│  [📎 Enviar arquivo .pfx]           │
│  Senha: ________                     │
│                                      │
│  ☑ Emitir NFC-e automaticamente     │
│                                      │
│  [Salvar e ativar]                   │
│                                      │
│  ℹ Precisa de ajuda?                │
│  O CSC é gerado no portal da SEFAZ  │
│  do seu estado. Seu contador pode    │
│  ajudar com esse processo.           │
│                                      │
└──────────────────────────────────────┘
```

**Alterar:** `DigitalReceiptScreen.tsx` — se NFC-e foi emitida, exibir:
- QR Code do documento fiscal (link de consulta na SEFAZ)
- Chave de acesso (44 dígitos)
- Botão "Ver DANFE" (abre URL do DANFE gerado pela Focus NFe)

**Critério de aceite:**
- [ ] Focus NFe adapter emite NFC-e via API (sandbox)
- [ ] Webhook Focus NFe atualiza status da NFC-e
- [ ] Upload de certificado A1 para Focus NFe funciona
- [ ] NFC-e é emitida automaticamente quando pagamento é confirmado
- [ ] Cancelamento de NFC-e funciona (até 24h)
- [ ] QR Code fiscal aparece no recibo digital
- [ ] Onboarding fiscal do restaurante completo com tela no app
- [ ] FiscalDocument registra cada emissão com log completo
- [ ] Adapter SEFAZ Direct existe como placeholder (NotImplementedException)
- [ ] Trocar de Focus NFe para SEFAZ Direct requer apenas mudar fiscal_provider na config
- [ ] i18n completo em todas as telas e mensagens fiscais
- [ ] NCM e CFOP cadastráveis por MenuItem

### Task 3.2 — Reconciliação de delivery

**Criar:** `backend/src/modules/reconciliation/`

```typescript
/**
 * Para cada pedido de delivery (source != 'noowe'):
 * 
 * Na CRIAÇÃO do pedido:
 * 1. Registrar FinancialTransaction com:
 *    - gross_amount: valor bruto do pedido
 *    - estimated_commission: valor * taxa da plataforma
 *    - estimated_net: gross - commission
 *    - status: 'pending_settlement'
 * 
 * Quando REPASSE chega (via webhook da plataforma ou import manual):
 * 1. Buscar transações pending_settlement do período
 * 2. Comparar valor recebido vs estimado
 * 3. Se diferença > threshold (R$0.50): marcar como 'discrepancy'
 * 4. Se ok: marcar como 'reconciled'
 * 
 * Taxas configuráveis por plataforma:
 * - iFood: commission_rate (ex: 0.23 = 23%)
 * - Rappi: commission_rate (ex: 0.20)
 * - UberEats: commission_rate (ex: 0.25)
 * 
 * Dashboard de reconciliação:
 * - Total vendido por plataforma
 * - Total esperado de repasse
 * - Total recebido
 * - Discrepâncias pendentes
 */
```

**Nova entidade:**

```typescript
@Entity('delivery_settlements')
export class DeliverySettlement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) restaurant_id: string;
  @Column({ type: 'varchar', length: 20 }) platform: string;
  @Column({ type: 'date' }) settlement_date: Date;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) gross_amount: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) commission_amount: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) expected_net: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) actual_received: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) difference: number;
  @Column({ type: 'varchar', length: 20, default: 'pending' }) status: string;
  // 'pending' | 'reconciled' | 'discrepancy' | 'manual_override'
  @Column({ type: 'int' }) order_count: number;
}
```

### Task 3.3 — Sinergia KDS Brain → Financial Brain

**Criar:** Event listeners que conectam os dois sistemas:

```typescript
// Em payment-gateway ou financial module:

@OnEvent('order.payment.confirmed')
async onPaymentConfirmed(event: PaymentConfirmedEvent) {
  // 1. Registrar FinancialTransaction (SALE)
  // 2. Criar CashRegisterMovement na sessão ativa
  // 3. Se auto_emit: emitir NFC-e
  // 4. Se delivery: registrar DeliverySettlement pendente
}

@OnEvent('order.item.ready') // Emitido pelo KDS Brain
async onItemReady(event: ItemReadyEvent) {
  // Registrar COGS para o item
  // (custo do ingrediente contabilizado quando prato fica pronto)
}

@OnEvent('menu.item.unavailable') // Emitido pelo KDS Brain (86)
async onItemUnavailable(event: ItemUnavailableEvent) {
  // Recalcular forecast de vendas (item não será vendido)
}
```

---

## SPRINT 4 — FORECAST, ANALYTICS AVANÇADO E AUTOMAÇÕES (semanas 13-16)

### Objetivo
Previsão de fluxo de caixa, dashboard financeiro inteligente, automação de gorjetas, e export contábil.

---

### Task 4.1 — Cash flow forecast

**Criar:** `backend/src/modules/financial-brain/services/forecast.service.ts`

```typescript
/**
 * Previsão de fluxo de caixa para 7, 30 e 90 dias.
 * 
 * Inputs:
 * - Vendas históricas (últimos 90 dias), segmentadas por dia da semana
 * - Contas a pagar agendadas (se cadastradas)
 * - Repasses de delivery pendentes (DeliverySettlement)
 * - Despesas recorrentes (aluguel, folha)
 * 
 * Algoritmo:
 * 1. Para cada dia futuro:
 *    a. projected_revenue = média_ponderada das vendas nos mesmos dias_da_semana
 *       (peso maior para semanas recentes)
 *    b. projected_expenses = despesas recorrentes do dia + contas agendadas
 *    c. projected_settlements = repasses de delivery esperados
 *    d. projected_balance = previous_balance + revenue - expenses + settlements
 * 
 * 2. Alertas:
 *    - Se projected_balance < threshold em qualquer dia → alerta
 *    - Se food_cost projetado > 35% → alerta
 * 
 * Endpoint: GET /financial-brain/forecast?restaurant_id=X&days=30
 * 
 * Response:
 * {
 *   current_balance: number,
 *   projections: Array<{
 *     date: string,
 *     projected_revenue: number,
 *     projected_expenses: number,
 *     projected_balance: number,
 *   }>,
 *   alerts: Array<{
 *     type: 'low_balance' | 'high_food_cost',
 *     date: string,
 *     message_key: string, // i18n
 *     projected_value: number,
 *     threshold: number,
 *   }>
 * }
 */
```

### Task 4.2 — Dashboard financeiro inteligente (mobile)

**Evoluir:** `restaurant/src/screens/financial/FinancialScreen.tsx`

Adicionar ao dashboard existente:

```
┌──────────────────────────────────────┐
│  Financeiro                   Hoje ▼ │
├──────────────────────────────────────┤
│                                      │
│  ┌────────┐  ┌────────┐  ┌────────┐ │
│  │R$4.230 │  │R$1.480 │  │ 65%    │ │
│  │Receita │  │Custo   │  │Margem  │ │  ← NOVO: margem
│  └────────┘  └────────┘  └────────┘ │
│                                      │
│  ┌────────┐  ┌────────┐  ┌────────┐ │
│  │R$68,50 │  │  62    │  │R$320   │ │
│  │Ticket  │  │Pedidos │  │Gorjetas│ │
│  └────────┘  └────────┘  └────────┘ │
│                                      │
│  Receita por canal:                  │
│  ██████████████ Salão    R$2.800     │
│  ████████       iFood    R$890      │  ← NOVO: por canal
│  █████          Rappi    R$540      │
│                                      │
│  ⚠ Alertas:                         │
│  • Filé Mignon: margem 18% (< 25%) │  ← NOVO: alertas
│  • Saldo projetado baixo em 5 dias  │
│  • 3 pratos sem ficha técnica       │
│                                      │
│  Caixa: Aberto │ R$1.240 em espécie │  ← NOVO: status caixa
│                                      │
│  [Ver forecast]  [Fechar caixa]      │
│                                      │
└──────────────────────────────────────┘
```

### Task 4.3 — Automação de gorjetas

**Alterar:** `tips.service.ts`

```typescript
/**
 * Automação no fechamento do turno:
 * 
 * Quando o caixa é fechado (CashRegisterSession.close):
 * 1. Buscar gorjetas PENDING do período da sessão
 * 2. Aplicar regra de distribuição configurada pelo restaurante:
 *    - equal: divide igualmente entre staff do turno
 *    - by_role: percentuais por cargo (configurável)
 *    - manual: mantém pendente para distribuição manual
 * 3. Se modo automático: criar distribuição e marcar como DISTRIBUTED
 * 4. Registrar WalletTransaction para cada staff member
 * 
 * Config por restaurante:
 * {
 *   tip_distribution_mode: 'auto_equal' | 'auto_by_role' | 'manual',
 *   tip_role_splits: { chef: 0.15, waiter: 0.60, barman: 0.15, host: 0.10 },
 *   auto_distribute_on_close: true
 * }
 */
```

### Task 4.4 — Export contábil

**Criar:** `backend/src/modules/accounting-export/`

```typescript
/**
 * Export de dados financeiros para sistemas contábeis.
 * 
 * Formatos suportados:
 * - CSV genérico (Omie, Contabilizei, qualquer sistema)
 * - OFX (para conciliação bancária)
 * - PDF (relatório formatado para contador)
 * 
 * Endpoint: GET /financial/export?format=csv&period=2026-03
 * 
 * CSV contém:
 * data, tipo, categoria, descricao, valor, metodo_pagamento, nota_fiscal, 
 * plataforma_delivery, comissao_delivery
 * 
 * Agendamento automático (opcional):
 * - Enviar por email no dia 1 de cada mês
 * - Relatório do mês anterior completo
 */
```

### Task 4.5 — Contas a pagar (básico)

**Criar:** `backend/src/modules/accounts-payable/`

```typescript
@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) restaurant_id: string;
  @Column({ type: 'varchar', length: 200 }) description: string;
  @Column({ type: 'varchar', length: 200, nullable: true }) supplier: string;
  @Column({ type: 'varchar', length: 50 }) category: string;
  // 'rent' | 'utilities' | 'supplies' | 'staff' | 'marketing' | 'maintenance' | 'other'
  @Column({ type: 'decimal', precision: 10, scale: 2 }) amount: number;
  @Column({ type: 'date' }) due_date: Date;
  @Column({ type: 'date', nullable: true }) paid_date: Date;
  @Column({ type: 'varchar', length: 20, default: 'pending' }) status: string;
  // 'pending' | 'paid' | 'overdue' | 'cancelled'
  @Column({ type: 'boolean', default: false }) is_recurring: boolean;
  @Column({ type: 'varchar', length: 20, nullable: true }) recurrence: string;
  // 'monthly' | 'weekly' | 'yearly'
}
```

CRUD simples + integração com forecast (contas agendadas entram na projeção).

---

## CHECKLIST FINAL

### Retrocompatibilidade
- [ ] POST /payments/process continua funcionando para wallet e cash
- [ ] Todos os endpoints existentes de financial, tips, tabs inalterados
- [ ] App cliente não quebra para pagamentos via wallet

### Pagamentos
- [ ] Cartão de crédito/débito via Asaas funciona
- [ ] PIX gera QR Code e confirma via webhook
- [ ] Tap to Pay funciona no celular do garçom (iPhone e Android)
- [ ] Wallet e cash continuam funcionando
- [ ] Idempotência previne cobrança duplicada em todos os métodos
- [ ] Rate limiting aplicado

### Controle financeiro
- [ ] Abertura e fechamento de caixa com contagem
- [ ] Sangria e reforço com registro
- [ ] Diferença (sobra/falta) calculada no fechamento
- [ ] Cada pagamento gera movimento automático no caixa

### Custos
- [ ] Ficha técnica (receita) cadastrável por prato
- [ ] COGS calculado automaticamente a cada venda
- [ ] Margem por prato visível no dashboard
- [ ] Alerta de margem baixa
- [ ] Food cost % do período

### Fiscal
- [ ] Focus NFe adapter emite NFC-e automaticamente ao confirmar pagamento
- [ ] Upload de certificado A1 do restaurante para Focus NFe funciona
- [ ] QR Code fiscal e chave de acesso no recibo digital
- [ ] Cancelamento de NFC-e (até 24h)
- [ ] Webhook Focus NFe atualiza status corretamente
- [ ] Tela de onboarding fiscal no app restaurant
- [ ] NCM e CFOP cadastráveis por MenuItem
- [ ] Adapter SEFAZ Direct existe como placeholder pronto para Fase 2
- [ ] Trocar provider requer apenas alterar fiscal_provider na config (sem mudar código)

### Delivery
- [ ] Comissão estimada registrada para cada pedido delivery
- [ ] Reconciliação de repasses
- [ ] Dashboard de vendas por plataforma

### Forecast
- [ ] Projeção de fluxo de caixa 7/30/90 dias
- [ ] Alerta de saldo baixo projetado
- [ ] Contas a pagar integradas na projeção

### i18n
- [ ] Zero strings hardcoded em telas novas
- [ ] pt-BR, en, es completos

### Segurança
- [ ] Credenciais de gateway criptografadas em repouso
- [ ] Webhooks validam signature (Asaas + Stripe)
- [ ] Certificado digital A1 armazenado de forma segura
- [ ] RBAC em todos os endpoints novos
- [ ] Rate limiting mantido
