# 🎯 Sistema de QR Codes - Especificação Técnica Completa

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Modelo de Dados](#modelo-de-dados)
4. [Fluxos de Usuário](#fluxos-de-usuário)
5. [Backend - APIs e Serviços](#backend---apis-e-serviços)
6. [Restaurant App - Telas e Funcionalidades](#restaurant-app---telas-e-funcionalidades)
7. [Client App - Scanner e Experiência](#client-app---scanner-e-experiência)
8. [Segurança](#segurança)
9. [Plano de Desenvolvimento](#plano-de-desenvolvimento)
10. [Testes](#testes)

---

## Visão Geral

### Objetivo
Criar um sistema completo de QR Codes que permita:
- **Restaurantes**: Gerar, gerenciar e imprimir QR Codes únicos para cada mesa
- **Clientes**: Escanear QR Codes para iniciar sua experiência no restaurante

### Proposta de Valor
```
┌─────────────────────────────────────────────────────────────────────┐
│                     JORNADA COMPLETA DO QR CODE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  RESTAURANTE                    CLIENTE                             │
│  ┌──────────┐                  ┌──────────┐                        │
│  │ Cadastra │                  │ Entra no │                        │
│  │  Mesas   │                  │Restaurant│                        │
│  └────┬─────┘                  └────┬─────┘                        │
│       │                             │                               │
│       ▼                             ▼                               │
│  ┌──────────┐                  ┌──────────┐                        │
│  │  Gera    │                  │ Escaneia │                        │
│  │ QR Codes │───── QR ────────▶│ QR Code  │                        │
│  └────┬─────┘                  └────┬─────┘                        │
│       │                             │                               │
│       ▼                             ▼                               │
│  ┌──────────┐                  ┌──────────┐                        │
│  │ Imprime  │                  │ Inicia   │                        │
│  │ p/ Mesas │                  │Experiência│                        │
│  └──────────┘                  └────┬─────┘                        │
│                                     │                               │
│                                     ▼                               │
│                               ┌───────────┐                        │
│                               │ Menu │ Pedido │ Pagamento           │
│                               └───────────┘                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Arquitetura do Sistema

### Componentes Principais

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ARQUITETURA GERAL                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐  │
│  │  RESTAURANT APP │    │    BACKEND      │    │   CLIENT APP   │  │
│  │                 │    │    (NestJS)     │    │                │  │
│  │  ┌───────────┐  │    │                 │    │  ┌──────────┐  │  │
│  │  │ Table     │  │    │  ┌───────────┐  │    │  │ QR       │  │  │
│  │  │ Manager   │◀─┼───▶│  │ Tables    │  │◀───┼─▶│ Scanner  │  │  │
│  │  └───────────┘  │    │  │ Module    │  │    │  └──────────┘  │  │
│  │                 │    │  └───────────┘  │    │                │  │
│  │  ┌───────────┐  │    │                 │    │  ┌──────────┐  │  │
│  │  │ QR Code   │  │    │  ┌───────────┐  │    │  │ Session  │  │  │
│  │  │ Generator │◀─┼───▶│  │ QR Code   │  │◀───┼─▶│ Manager  │  │  │
│  │  └───────────┘  │    │  │ Module    │  │    │  └──────────┘  │  │
│  │                 │    │  └───────────┘  │    │                │  │
│  │  ┌───────────┐  │    │                 │    │  ┌──────────┐  │  │
│  │  │ Print     │  │    │  ┌───────────┐  │    │  │ Table    │  │  │
│  │  │ Manager   │  │    │  │ Sessions  │  │◀───┼─▶│ Session  │  │  │
│  │  └───────────┘  │    │  │ Module    │  │    │  └──────────┘  │  │
│  │                 │    │  └───────────┘  │    │                │  │
│  └─────────────────┘    └────────┬────────┘    └────────────────┘  │
│                                  │                                  │
│                         ┌────────▼────────┐                        │
│                         │   PostgreSQL    │                        │
│                         │   (Supabase)    │                        │
│                         └─────────────────┘                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Estrutura do QR Code Data

O QR Code conterá uma URL estruturada que permite:
1. Identificar o restaurante
2. Identificar a mesa específica
3. Validar autenticidade via signature

```
Formato do QR Code:
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  https://app.okinawa.com/scan/{restaurant_id}/{table_id}?sig={sig} │
│                                                                     │
│  Onde:                                                              │
│  - restaurant_id: UUID do restaurante                               │
│  - table_id: UUID da mesa                                           │
│  - sig: Assinatura HMAC SHA-256 para validação                     │
│                                                                     │
│  Alternativa (Deep Link para App Nativo):                          │
│  okinawa://table/{restaurant_id}/{table_id}?sig={sig}              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Modelo de Dados

### Entidades Principais

```sql
-- ============================================
-- TABELA: tables (já existe, expandir)
-- ============================================
-- Representa as mesas físicas do restaurante

CREATE TABLE tables (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number    VARCHAR(20) NOT NULL,           -- "T-01", "Mesa 1", "VIP-A"
    seats           INTEGER NOT NULL DEFAULT 4,      -- Capacidade de assentos
    status          table_status DEFAULT 'available', -- available, occupied, reserved, etc.
    section         VARCHAR(50),                     -- "Área Interna", "Terraço", "VIP"
    position_x      INTEGER,                         -- Posição X no mapa (opcional)
    position_y      INTEGER,                         -- Posição Y no mapa (opcional)
    qr_code_id      UUID REFERENCES table_qr_codes(id), -- QR Code ativo
    notes           TEXT,                            -- Observações
    is_active       BOOLEAN DEFAULT true,            -- Mesa ativa ou desativada
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(restaurant_id, table_number)
);

-- ============================================
-- TABELA: table_qr_codes (NOVA)
-- ============================================
-- QR Codes gerados para mesas

CREATE TABLE table_qr_codes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id        UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    
    -- Dados do QR Code
    qr_code_data    TEXT NOT NULL,                  -- URL/Deep link completo
    qr_code_image   TEXT,                           -- Base64 da imagem PNG
    signature       VARCHAR(64) NOT NULL,           -- HMAC signature para validação
    
    -- Metadados de design
    style           VARCHAR(20) DEFAULT 'minimal',  -- minimal, premium, bold, elegant
    color_primary   VARCHAR(7) DEFAULT '#000000',   -- Cor primária
    color_secondary VARCHAR(7),                     -- Cor secundária (opcional)
    logo_included   BOOLEAN DEFAULT false,          -- Inclui logo do restaurante
    
    -- Controle de versão/validade
    version         INTEGER DEFAULT 1,              -- Versão do QR (para regeneração)
    is_active       BOOLEAN DEFAULT true,           -- QR ativo ou revogado
    expires_at      TIMESTAMPTZ,                    -- Data de expiração (opcional)
    
    -- Auditoria
    generated_by    UUID REFERENCES profiles(id),   -- Quem gerou
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índices
    UNIQUE(table_id, version)
);

-- ============================================
-- TABELA: table_sessions (NOVA)
-- ============================================
-- Sessões de clientes nas mesas (iniciadas via QR)

CREATE TABLE table_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id        UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    qr_code_id      UUID REFERENCES table_qr_codes(id),
    
    -- Cliente (pode ser anônimo ou autenticado)
    customer_id     UUID REFERENCES profiles(id),   -- NULL se cliente anônimo
    guest_name      VARCHAR(100),                   -- Nome informado (opcional)
    guest_count     INTEGER DEFAULT 1,              -- Número de pessoas na mesa
    
    -- Status da sessão
    status          session_status DEFAULT 'active', -- active, completed, abandoned
    
    -- Timestamps
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    last_activity   TIMESTAMPTZ DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    
    -- Métricas
    total_orders    INTEGER DEFAULT 0,
    total_spent     DECIMAL(10,2) DEFAULT 0,
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: qr_scan_logs (NOVA)
-- ============================================
-- Log de escaneamentos para analytics

CREATE TABLE qr_scan_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id      UUID NOT NULL REFERENCES table_qr_codes(id),
    restaurant_id   UUID NOT NULL REFERENCES restaurants(id),
    table_id        UUID NOT NULL REFERENCES tables(id),
    
    -- Dados do scan
    scanned_by      UUID REFERENCES profiles(id),   -- NULL se anônimo
    device_info     JSONB,                          -- Info do dispositivo
    ip_address      INET,                           -- IP (para geolocalização)
    
    -- Resultado
    scan_result     VARCHAR(20) NOT NULL,           -- success, invalid, expired, revoked
    session_id      UUID REFERENCES table_sessions(id), -- Sessão criada (se sucesso)
    
    scanned_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE table_status AS ENUM (
    'available',    -- Disponível
    'occupied',     -- Ocupada
    'reserved',     -- Reservada
    'cleaning',     -- Em limpeza
    'maintenance',  -- Manutenção
    'blocked'       -- Bloqueada
);

CREATE TYPE session_status AS ENUM (
    'active',       -- Sessão ativa
    'completed',    -- Finalizada com pagamento
    'abandoned'     -- Abandonada (timeout)
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_qr_codes_restaurant ON table_qr_codes(restaurant_id);
CREATE INDEX idx_qr_codes_table ON table_qr_codes(table_id);
CREATE INDEX idx_qr_codes_active ON table_qr_codes(is_active) WHERE is_active = true;

CREATE INDEX idx_sessions_restaurant ON table_sessions(restaurant_id);
CREATE INDEX idx_sessions_table ON table_sessions(table_id);
CREATE INDEX idx_sessions_active ON table_sessions(status) WHERE status = 'active';
CREATE INDEX idx_sessions_customer ON table_sessions(customer_id);

CREATE INDEX idx_scan_logs_qr ON qr_scan_logs(qr_code_id);
CREATE INDEX idx_scan_logs_time ON qr_scan_logs(scanned_at DESC);
```

### Diagrama ER

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MODELO ENTIDADE-RELACIONAMENTO                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐    │
│  │  RESTAURANT  │       │    TABLE     │       │  QR_CODE     │    │
│  ├──────────────┤       ├──────────────┤       ├──────────────┤    │
│  │ id           │──┐    │ id           │──┐    │ id           │    │
│  │ name         │  │    │ restaurant_id│◀─┘    │ restaurant_id│    │
│  │ ...          │  │    │ table_number │       │ table_id     │◀──┐│
│  └──────────────┘  │    │ seats        │       │ qr_code_data │   ││
│                    │    │ status       │       │ signature    │   ││
│                    │    │ qr_code_id   │──────▶│ style        │   ││
│                    │    │ ...          │       │ is_active    │   ││
│                    │    └──────────────┘       └──────────────┘   ││
│                    │           │                      │            ││
│                    │           │                      │            ││
│                    │    ┌──────▼──────┐        ┌──────▼──────┐    ││
│                    │    │   SESSION   │        │  SCAN_LOG   │    ││
│                    │    ├─────────────┤        ├─────────────┤    ││
│                    └───▶│ restaurant_id│        │ qr_code_id  │────┘│
│                         │ table_id    │◀───────│ table_id    │     │
│                         │ customer_id │        │ session_id  │     │
│                         │ status      │        │ scan_result │     │
│                         │ started_at  │        │ scanned_at  │     │
│                         └─────────────┘        └─────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Fluxos de Usuário

### Fluxo 1: Restaurante Cadastra Mesas e Gera QR Codes

```
┌─────────────────────────────────────────────────────────────────────┐
│           FLUXO: CADASTRO DE MESAS E GERAÇÃO DE QR CODES           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐          │
│  │ OWNER/  │    │ Acessa  │    │Cadastra │    │ Revisa  │          │
│  │ MANAGER │───▶│ Setup   │───▶│ Mesas   │───▶│ Lista   │          │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘          │
│                                                     │               │
│                                   ┌─────────────────┼───────────┐  │
│                                   │                 │           │  │
│                                   ▼                 ▼           ▼  │
│                            ┌──────────┐     ┌──────────┐ ┌───────┐ │
│                            │ Gera QR  │     │ Gera QR  │ │Gera   │ │
│                            │ Unitário │     │ em Lote  │ │Todos  │ │
│                            └────┬─────┘     └────┬─────┘ └───┬───┘ │
│                                 │                │           │     │
│                                 └────────┬───────┴───────────┘     │
│                                          │                         │
│                                          ▼                         │
│                                   ┌─────────────┐                  │
│                                   │  Escolhe    │                  │
│                                   │  Estilo     │                  │
│                                   │  do QR Code │                  │
│                                   └──────┬──────┘                  │
│                                          │                         │
│                            ┌─────────────┼─────────────┐           │
│                            ▼             ▼             ▼           │
│                     ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│                     │ Minimal  │  │ Premium  │  │  Bold    │       │
│                     └──────────┘  └──────────┘  └──────────┘       │
│                                          │                         │
│                                          ▼                         │
│                                   ┌─────────────┐                  │
│                                   │  Preview    │                  │
│                                   │  & Download │                  │
│                                   └──────┬──────┘                  │
│                                          │                         │
│                            ┌─────────────┼─────────────┐           │
│                            ▼             ▼             ▼           │
│                     ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│                     │ Download │  │ Download │  │  Enviar  │       │
│                     │   PNG    │  │   PDF    │  │  p/Email │       │
│                     └──────────┘  └──────────┘  └──────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Fluxo 2: Cliente Escaneia QR Code

```
┌─────────────────────────────────────────────────────────────────────┐
│              FLUXO: CLIENTE ESCANEIA QR E INICIA SESSÃO            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐          │
│  │ CLIENTE │    │  Abre   │    │ Aponta  │    │   App   │          │
│  │ no Rest │───▶│Client App───▶│ Camera  │───▶│ Detecta │          │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘          │
│                                                     │               │
│                                                     ▼               │
│                                              ┌─────────────┐        │
│                                              │  Valida QR  │        │
│                                              │  no Backend │        │
│                                              └──────┬──────┘        │
│                                                     │               │
│                          ┌──────────────────────────┼────────┐      │
│                          │                          │        │      │
│                          ▼                          ▼        ▼      │
│                   ┌────────────┐            ┌────────────┐ ┌─────┐  │
│                   │  VÁLIDO    │            │ INVÁLIDO   │ │EXPI-│  │
│                   │            │            │            │ │RADO │  │
│                   └─────┬──────┘            └─────┬──────┘ └──┬──┘  │
│                         │                         │           │     │
│                         ▼                         ▼           ▼     │
│                  ┌─────────────┐           ┌─────────────────────┐  │
│                  │ Cria/Retoma │           │   Mostra Erro com   │  │
│                  │   Sessão    │           │   Opção de Retry    │  │
│                  └──────┬──────┘           └─────────────────────┘  │
│                         │                                           │
│           ┌─────────────┼─────────────┐                            │
│           ▼             ▼             ▼                            │
│    ┌────────────┐ ┌───────────┐ ┌───────────┐                      │
│    │  Usuário   │ │  Usuário  │ │  Convidar │                      │
│    │ Autenticado│ │  Anônimo  │ │  Amigos   │                      │
│    └─────┬──────┘ └─────┬─────┘ └───────────┘                      │
│          │              │                                           │
│          └──────┬───────┘                                          │
│                 ▼                                                   │
│          ┌─────────────┐                                           │
│          │  WELCOME    │                                           │
│          │  SCREEN     │                                           │
│          │             │                                           │
│          │ • Mesa: T-05│                                           │
│          │ • Rest: XYZ │                                           │
│          │ • Ver Menu  │                                           │
│          └─────────────┘                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Fluxo 3: Sessão Ativa na Mesa

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUXO: SESSÃO ATIVA NA MESA                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                         ┌─────────────┐                            │
│                         │   SESSÃO    │                            │
│                         │   ATIVA     │                            │
│                         └──────┬──────┘                            │
│                                │                                    │
│        ┌───────────────────────┼───────────────────────┐           │
│        ▼                       ▼                       ▼           │
│  ┌───────────┐          ┌───────────┐          ┌───────────┐       │
│  │ Ver Menu  │          │  Fazer    │          │  Chamar   │       │
│  │ Interativo│          │  Pedido   │          │  Garçom   │       │
│  └───────────┘          └───────────┘          └───────────┘       │
│        │                       │                       │           │
│        │                       ▼                       │           │
│        │                ┌───────────┐                  │           │
│        │                │  Pedido   │                  │           │
│        │                │  no KDS   │                  │           │
│        │                └───────────┘                  │           │
│        │                       │                       │           │
│        │                       ▼                       │           │
│        │                ┌───────────┐                  │           │
│        │                │  Recebe   │                  │           │
│        │                │  Pedido   │                  │           │
│        │                └───────────┘                  │           │
│        │                       │                       │           │
│        └───────────────────────┼───────────────────────┘           │
│                                │                                    │
│                                ▼                                    │
│                         ┌───────────┐                              │
│                         │ Solicitar │                              │
│                         │   Conta   │                              │
│                         └─────┬─────┘                              │
│                               │                                     │
│              ┌────────────────┼────────────────┐                   │
│              ▼                ▼                ▼                   │
│       ┌───────────┐    ┌───────────┐    ┌───────────┐             │
│       │ Pagar     │    │  Dividir  │    │  Pagar    │             │
│       │ Integral  │    │  Conta    │    │  no Caixa │             │
│       └───────────┘    └───────────┘    └───────────┘             │
│              │                │                │                   │
│              └────────────────┼────────────────┘                   │
│                               ▼                                     │
│                        ┌───────────┐                               │
│                        │  SESSÃO   │                               │
│                        │ ENCERRADA │                               │
│                        └───────────┘                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Backend - APIs e Serviços

### Módulos NestJS

```
backend/src/modules/
├── tables/                      # Módulo de Mesas
│   ├── tables.module.ts
│   ├── tables.controller.ts
│   ├── tables.service.ts
│   ├── dto/
│   │   ├── create-table.dto.ts
│   │   ├── update-table.dto.ts
│   │   └── table-response.dto.ts
│   └── entities/
│       └── table.entity.ts
│
├── qr-code/                     # Módulo de QR Codes (expandir existente)
│   ├── qr-code.module.ts
│   ├── qr-code.controller.ts
│   ├── qr-code.service.ts
│   ├── qr-code-security.service.ts  # Assinaturas e validação
│   ├── dto/
│   │   ├── generate-qr.dto.ts
│   │   ├── validate-qr.dto.ts
│   │   └── qr-code-response.dto.ts
│   └── entities/
│       └── table-qr-code.entity.ts
│
└── sessions/                    # Módulo de Sessões
    ├── sessions.module.ts
    ├── sessions.controller.ts
    ├── sessions.service.ts
    ├── dto/
    │   ├── create-session.dto.ts
    │   ├── update-session.dto.ts
    │   └── session-response.dto.ts
    └── entities/
        ├── table-session.entity.ts
        └── qr-scan-log.entity.ts
```

### API Endpoints

#### Tables API (Restaurant App)

```yaml
# ============================================
# TABLES ENDPOINTS
# ============================================

POST /api/v1/restaurants/{restaurantId}/tables
  Description: Criar nova mesa
  Auth: Owner, Manager
  Body:
    table_number: string (required)
    seats: number (required)
    section: string (optional)
    position_x: number (optional)
    position_y: number (optional)
    notes: string (optional)
  Response: 201 Created
    {
      id: uuid,
      table_number: "T-01",
      seats: 4,
      status: "available",
      qr_code: null,
      ...
    }

GET /api/v1/restaurants/{restaurantId}/tables
  Description: Listar todas as mesas do restaurante
  Auth: Owner, Manager, Waiter, Maitre
  Query:
    status: string (optional) - Filtrar por status
    section: string (optional) - Filtrar por seção
    has_qr: boolean (optional) - Filtrar se tem QR
  Response: 200 OK
    {
      data: Table[],
      meta: { total, page, limit }
    }

GET /api/v1/restaurants/{restaurantId}/tables/{tableId}
  Description: Detalhes de uma mesa
  Auth: Owner, Manager, Waiter, Maitre
  Response: 200 OK - Table object with QR code details

PATCH /api/v1/restaurants/{restaurantId}/tables/{tableId}
  Description: Atualizar mesa
  Auth: Owner, Manager
  Body: Partial<CreateTableDto>
  Response: 200 OK - Updated Table

DELETE /api/v1/restaurants/{restaurantId}/tables/{tableId}
  Description: Remover mesa
  Auth: Owner, Manager
  Response: 204 No Content

PATCH /api/v1/restaurants/{restaurantId}/tables/{tableId}/status
  Description: Alterar status da mesa (ocupada, disponível, etc.)
  Auth: Owner, Manager, Waiter, Maitre
  Body:
    status: TableStatus
  Response: 200 OK
```

#### QR Code API (Restaurant App)

```yaml
# ============================================
# QR CODE ENDPOINTS
# ============================================

POST /api/v1/restaurants/{restaurantId}/tables/{tableId}/qr-code
  Description: Gerar QR Code para mesa específica
  Auth: Owner, Manager
  Body:
    style: "minimal" | "premium" | "bold" | "elegant"
    color_primary: string (hex color)
    color_secondary: string (optional)
    include_logo: boolean
  Response: 201 Created
    {
      id: uuid,
      qr_code_data: "https://app.okinawa.com/scan/...",
      qr_code_image: "data:image/png;base64,...",
      style: "premium",
      version: 1,
      created_at: timestamp
    }

POST /api/v1/restaurants/{restaurantId}/qr-codes/batch
  Description: Gerar QR Codes para múltiplas mesas
  Auth: Owner, Manager
  Body:
    table_ids: uuid[]
    style: string
    color_primary: string
  Response: 201 Created
    {
      generated: QRCode[],
      failed: { table_id: uuid, error: string }[]
    }

GET /api/v1/restaurants/{restaurantId}/qr-codes
  Description: Listar todos os QR Codes do restaurante
  Auth: Owner, Manager
  Response: 200 OK - QRCode[]

GET /api/v1/restaurants/{restaurantId}/tables/{tableId}/qr-code
  Description: Obter QR Code ativo de uma mesa
  Auth: Owner, Manager
  Response: 200 OK - QRCode

DELETE /api/v1/restaurants/{restaurantId}/tables/{tableId}/qr-code
  Description: Revogar/Invalidar QR Code de uma mesa
  Auth: Owner, Manager
  Response: 204 No Content

POST /api/v1/restaurants/{restaurantId}/tables/{tableId}/qr-code/regenerate
  Description: Regenerar QR Code (nova versão)
  Auth: Owner, Manager
  Response: 201 Created - New QRCode

GET /api/v1/restaurants/{restaurantId}/qr-codes/export
  Description: Exportar todos os QR Codes em PDF/ZIP
  Auth: Owner, Manager
  Query:
    format: "pdf" | "zip"
    style: string
  Response: 200 OK - Binary file
```

#### QR Validation API (Client App)

```yaml
# ============================================
# QR VALIDATION & SESSION ENDPOINTS
# ============================================

POST /api/v1/qr/validate
  Description: Validar QR Code escaneado
  Auth: Public (mas loga se autenticado)
  Body:
    qr_code_data: string (URL completa do QR)
  Response: 200 OK
    {
      valid: true,
      restaurant: {
        id: uuid,
        name: "Restaurant Name",
        logo: "url",
        service_type: "casual_dining"
      },
      table: {
        id: uuid,
        table_number: "T-05",
        seats: 4,
        status: "available"
      },
      session: {
        id: uuid,           # Sessão criada/existente
        status: "active"
      }
    }
  Error Responses:
    400 - QR Code inválido (formato incorreto)
    404 - Restaurante ou mesa não encontrado
    410 - QR Code expirado ou revogado
    423 - Mesa ocupada (outra sessão ativa)

POST /api/v1/sessions/start
  Description: Iniciar sessão na mesa
  Auth: Optional (autenticado ou anônimo)
  Body:
    qr_code_id: uuid
    guest_name: string (se anônimo)
    guest_count: number
  Response: 201 Created
    {
      session_id: uuid,
      table: Table,
      restaurant: Restaurant,
      started_at: timestamp
    }

GET /api/v1/sessions/{sessionId}
  Description: Obter detalhes da sessão
  Auth: Session Owner ou Staff
  Response: 200 OK - Session with orders

PATCH /api/v1/sessions/{sessionId}
  Description: Atualizar sessão (guest_count, etc.)
  Auth: Session Owner
  Body: Partial session data
  Response: 200 OK

POST /api/v1/sessions/{sessionId}/end
  Description: Encerrar sessão
  Auth: Session Owner ou Staff
  Body:
    reason: "payment_completed" | "staff_closed" | "customer_left"
  Response: 200 OK
```

### Serviços Core

#### QRCodeSecurityService

```typescript
// backend/src/modules/qr-code/qr-code-security.service.ts

@Injectable()
export class QRCodeSecurityService {
  
  /**
   * Gera assinatura HMAC SHA-256 para o QR Code
   * Garante que o QR não foi adulterado
   */
  generateSignature(
    restaurantId: string, 
    tableId: string, 
    version: number
  ): string {
    const payload = `${restaurantId}:${tableId}:${version}`;
    const secret = this.configService.get('QR_CODE_SECRET');
    
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
      .substring(0, 16); // Primeiros 16 chars para URL curta
  }
  
  /**
   * Valida assinatura do QR Code
   */
  validateSignature(
    qrCodeData: string
  ): { valid: boolean; restaurantId?: string; tableId?: string } {
    // Parse URL: https://app.okinawa.com/scan/{rid}/{tid}?sig={sig}&v={version}
    // ou: okinawa://table/{rid}/{tid}?sig={sig}&v={version}
    
    const parsed = this.parseQRCodeUrl(qrCodeData);
    if (!parsed) return { valid: false };
    
    const expectedSig = this.generateSignature(
      parsed.restaurantId,
      parsed.tableId,
      parsed.version
    );
    
    if (expectedSig !== parsed.signature) {
      return { valid: false };
    }
    
    return {
      valid: true,
      restaurantId: parsed.restaurantId,
      tableId: parsed.tableId
    };
  }
  
  /**
   * Gera URL completa do QR Code
   */
  generateQRCodeUrl(
    restaurantId: string,
    tableId: string,
    version: number = 1
  ): string {
    const signature = this.generateSignature(restaurantId, tableId, version);
    const baseUrl = this.configService.get('APP_URL');
    
    return `${baseUrl}/scan/${restaurantId}/${tableId}?sig=${signature}&v=${version}`;
  }
}
```

---

## Restaurant App - Telas e Funcionalidades

### Estrutura de Telas

```
mobile/apps/restaurant/src/
├── screens/
│   ├── tables/
│   │   ├── TableListScreen.tsx        # Lista de mesas
│   │   ├── TableDetailScreen.tsx      # Detalhes da mesa
│   │   ├── TableFormScreen.tsx        # Criar/Editar mesa
│   │   └── TableMapScreen.tsx         # Mapa visual das mesas
│   │
│   └── qr-codes/
│       ├── QRCodeManagerScreen.tsx    # Gerenciador de QR Codes
│       ├── QRCodeGeneratorScreen.tsx  # Gerar QR para mesa
│       ├── QRCodePreviewScreen.tsx    # Preview antes de salvar
│       ├── QRCodeBatchScreen.tsx      # Geração em lote
│       └── QRCodeExportScreen.tsx     # Exportar para impressão
│
├── components/
│   ├── tables/
│   │   ├── TableCard.tsx
│   │   ├── TableStatusBadge.tsx
│   │   ├── TableQuickActions.tsx
│   │   └── TableMapView.tsx
│   │
│   └── qr-codes/
│       ├── QRCodeCard.tsx
│       ├── QRCodeStyleSelector.tsx
│       ├── QRCodeColorPicker.tsx
│       ├── QRCodePreview.tsx
│       └── QRCodePrintLayout.tsx
│
└── hooks/
    ├── useTables.ts
    ├── useTableQRCode.ts
    └── useQRCodeGeneration.ts
```

### Wireframes das Telas

#### TableListScreen

```
┌─────────────────────────────────────────────────────┐
│ ◀ Mesas                               + Adicionar  │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🔍 Buscar mesa...                   ▼ Filtros  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Área Interna (12 mesas)                    ▼    │ │
│ │                                                 │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│ │
│ │ │  T-01   │ │  T-02   │ │  T-03   │ │  T-04   ││ │
│ │ │ 4 lug.  │ │ 4 lug.  │ │ 2 lug.  │ │ 6 lug.  ││ │
│ │ │ 🟢 Disp │ │ 🔴 Ocup │ │ 🟢 Disp │ │ 🟡 Res  ││ │
│ │ │ [QR ✓]  │ │ [QR ✓]  │ │ [QR ✗]  │ │ [QR ✓]  ││ │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘│ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Terraço (6 mesas)                          ▼    │ │
│ │                                                 │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐            │ │
│ │ │  T-10   │ │  T-11   │ │  T-12   │            │ │
│ │ │ 4 lug.  │ │ 8 lug.  │ │ 4 lug.  │            │ │
│ │ │ 🟢 Disp │ │ 🟢 Disp │ │ 🔵 Limp │            │ │
│ │ │ [QR ✗]  │ │ [QR ✗]  │ │ [QR ✗]  │            │ │
│ │ └─────────┘ └─────────┘ └─────────┘            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [🗺️ Ver Mapa]    [📱 Gerar QR Codes em Lote]      │
└─────────────────────────────────────────────────────┘
```

#### QRCodeGeneratorScreen

```
┌─────────────────────────────────────────────────────┐
│ ◀ Gerar QR Code                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Mesa: T-05                                        │
│  Seção: Área Interna                               │
│  Capacidade: 4 lugares                             │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │              ESTILO DO QR CODE                  │ │
│ ├─────────────────────────────────────────────────┤ │
│ │                                                 │ │
│ │   ┌────────┐  ┌────────┐  ┌────────┐          │ │
│ │   │ ▢▢▢▢▢▢ │  │ ▣▣▣▣▣▣ │  │ ▤▤▤▤▤▤ │          │ │
│ │   │ ▢    ▢ │  │ ▣    ▣ │  │ ▤    ▤ │          │ │
│ │   │ ▢▢▢▢▢▢ │  │ ▣▣▣▣▣▣ │  │ ▤▤▤▤▤▤ │          │ │
│ │   │Minimal │  │Premium │  │  Bold  │          │ │
│ │   │   ○    │  │   ●    │  │   ○    │          │ │
│ │   └────────┘  └────────┘  └────────┘          │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │              PERSONALIZAÇÃO                     │ │
│ ├─────────────────────────────────────────────────┤ │
│ │                                                 │ │
│ │  Cor Principal                                  │ │
│ │  [■ #1A1A2E ▼]                                 │ │
│ │                                                 │ │
│ │  ☑️ Incluir logo do restaurante                │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │                  PREVIEW                        │ │
│ │                                                 │ │
│ │         ┌──────────────────────┐               │ │
│ │         │    RESTAURANTE XYZ   │               │ │
│ │         │                      │               │ │
│ │         │     ▢▢▢▢▢▢▢▢▢▢      │               │ │
│ │         │     ▢        ▢      │               │ │
│ │         │     ▢  LOGO  ▢      │               │ │
│ │         │     ▢        ▢      │               │ │
│ │         │     ▢▢▢▢▢▢▢▢▢▢      │               │ │
│ │         │                      │               │ │
│ │         │      Mesa T-05       │               │ │
│ │         │   Escaneie para      │               │ │
│ │         │   ver o cardápio     │               │ │
│ │         └──────────────────────┘               │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│         [Cancelar]     [✓ Gerar QR Code]          │
└─────────────────────────────────────────────────────┘
```

#### QRCodeExportScreen

```
┌─────────────────────────────────────────────────────┐
│ ◀ Exportar para Impressão                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │           FORMATO DE IMPRESSÃO                  │ │
│ ├─────────────────────────────────────────────────┤ │
│ │                                                 │ │
│ │   ┌─────────────┐    ┌─────────────┐           │ │
│ │   │   ┌────┐   │    │    ╱╲      │           │ │
│ │   │   │ QR │   │    │   ╱QR╲     │           │ │
│ │   │   └────┘   │    │  ╱────╲    │           │ │
│ │   │  Mesa T-05  │    │  ╲────╱    │           │ │
│ │   └─────────────┘    └─────────────┘           │ │
│ │     Display Plano      Tent Card               │ │
│ │         ●                 ○                    │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │           TAMANHO                               │ │
│ ├─────────────────────────────────────────────────┤ │
│ │  ○ Pequeno (5x5cm)                             │ │
│ │  ● Médio (8x8cm)                               │ │
│ │  ○ Grande (12x12cm)                            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │           MESAS SELECIONADAS                    │ │
│ ├─────────────────────────────────────────────────┤ │
│ │  ☑️ T-01  ☑️ T-02  ☑️ T-03  ☑️ T-04          │ │
│ │  ☑️ T-05  ☐ T-06  ☐ T-07  ☐ T-08          │ │
│ │  ☐ T-09  ☑️ T-10  ☐ T-11  ☐ T-12          │ │
│ │                                                 │ │
│ │  [Selecionar Todas]  [Limpar Seleção]          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│   [📥 Baixar PDF]   [📧 Enviar por Email]         │
└─────────────────────────────────────────────────────┘
```

---

## Client App - Scanner e Experiência

### Estrutura de Telas

```
mobile/apps/client/src/
├── screens/
│   ├── scanner/
│   │   ├── QRScannerScreen.tsx        # Scanner de QR Code
│   │   ├── ScanResultScreen.tsx       # Resultado do scan
│   │   └── SessionWelcomeScreen.tsx   # Boas-vindas na mesa
│   │
│   └── session/
│       ├── ActiveSessionScreen.tsx    # Sessão ativa na mesa
│       ├── SessionMenuScreen.tsx      # Menu contextual da mesa
│       └── SessionCheckoutScreen.tsx  # Finalizar sessão
│
├── components/
│   ├── scanner/
│   │   ├── CameraOverlay.tsx
│   │   ├── ScanFeedback.tsx
│   │   └── ManualCodeInput.tsx
│   │
│   └── session/
│       ├── SessionHeader.tsx
│       ├── TableInfo.tsx
│       └── QuickActions.tsx
│
└── hooks/
    ├── useQRScanner.ts
    ├── useTableSession.ts
    └── useSessionActions.ts
```

### Wireframes das Telas

#### QRScannerScreen

```
┌─────────────────────────────────────────────────────┐
│ ◀                    Escanear                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│     ┌─────────────────────────────────────────┐    │
│     │                                         │    │
│     │                                         │    │
│     │                                         │    │
│     │       ┌───────────────────────┐        │    │
│     │       │                       │        │    │
│     │       │     📷 CÂMERA        │        │    │
│     │       │                       │        │    │
│     │       │   ┌─────────────┐    │        │    │
│     │       │   │  ▢▢▢▢▢▢    │    │        │    │
│     │       │   │  ▢    ▢    │    │        │    │
│     │       │   │  ▢▢▢▢▢▢    │    │        │    │
│     │       │   └─────────────┘    │        │    │
│     │       │                       │        │    │
│     │       │   Aponte para o QR   │        │    │
│     │       │   Code da mesa       │        │    │
│     │       └───────────────────────┘        │    │
│     │                                         │    │
│     │                                         │    │
│     └─────────────────────────────────────────┘    │
│                                                     │
│                                                     │
│     ┌─────────────────────────────────────────┐    │
│     │     💡 Posicione o código dentro       │    │
│     │        do quadro para escanear         │    │
│     └─────────────────────────────────────────┘    │
│                                                     │
├─────────────────────────────────────────────────────┤
│           [🔦 Flash]     [📝 Digitar Código]       │
└─────────────────────────────────────────────────────┘
```

#### SessionWelcomeScreen

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│                  ┌──────────────┐                  │
│                  │              │                  │
│                  │    🍽️ LOGO   │                  │
│                  │              │                  │
│                  └──────────────┘                  │
│                                                     │
│              Bem-vindo ao                          │
│           RESTAURANTE XYZ                          │
│                                                     │
│         ━━━━━━━━━━━━━━━━━━━━━━                     │
│                                                     │
│              Você está na                          │
│             📍 Mesa T-05                           │
│           4 lugares • Área Interna                 │
│                                                     │
│         ━━━━━━━━━━━━━━━━━━━━━━                     │
│                                                     │
│    ┌─────────────────────────────────────────┐    │
│    │         Quantas pessoas?                │    │
│    │                                         │    │
│    │   [ 1 ]  [ 2 ]  [ 3 ]  [ 4 ]  [+]      │    │
│    │                                         │    │
│    └─────────────────────────────────────────┘    │
│                                                     │
│    ┌─────────────────────────────────────────┐    │
│    │  👥 Convidar amigos para esta mesa     │    │
│    └─────────────────────────────────────────┘    │
│                                                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│           [  📖 Ver Cardápio  ]                    │
│                                                     │
│     Ao continuar, você concorda com os             │
│     termos de uso do estabelecimento               │
└─────────────────────────────────────────────────────┘
```

#### ActiveSessionScreen

```
┌─────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐ │
│ │  RESTAURANTE XYZ              Mesa T-05  👥 2  │ │
│ │  🟢 Sessão ativa há 45min                      │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                AÇÕES RÁPIDAS                │   │
│  ├─────────────────────────────────────────────┤   │
│  │                                             │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │  📖    │  │  🛎️    │  │  💳    │    │   │
│  │  │  Menu   │  │ Chamar  │  │  Pagar  │    │   │
│  │  │         │  │ Garçom  │  │         │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘    │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │              SEUS PEDIDOS                   │   │
│  ├─────────────────────────────────────────────┤   │
│  │                                             │   │
│  │  🍕 Pizza Margherita           R$ 45,00    │   │
│  │     ⏳ Preparando (15min)                  │   │
│  │                                             │   │
│  │  🥤 Coca-Cola 600ml            R$ 12,00    │   │
│  │     ✅ Entregue                            │   │
│  │                                             │   │
│  │  🍰 Tiramisu                   R$ 28,00    │   │
│  │     📋 Aguardando                          │   │
│  │                                             │   │
│  │  ─────────────────────────────────────     │   │
│  │  Total:                        R$ 85,00    │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [+ Fazer Novo Pedido]    [💬 Precisa de Ajuda?]   │
└─────────────────────────────────────────────────────┘
```

---

## Segurança

### Medidas de Segurança Implementadas

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CAMADAS DE SEGURANÇA                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. ASSINATURA HMAC SHA-256                                        │
│     ├── Cada QR contém signature única                             │
│     ├── Validado no backend antes de criar sessão                  │
│     └── Impossível falsificar sem a secret key                     │
│                                                                     │
│  2. VERSIONAMENTO                                                   │
│     ├── QR Codes têm número de versão                              │
│     ├── Regenerar QR invalida versões anteriores                   │
│     └── Útil se QR Code vazar                                      │
│                                                                     │
│  3. RATE LIMITING                                                   │
│     ├── Máximo de scans por IP/minuto                              │
│     ├── Previne brute force de signatures                          │
│     └── Logs de tentativas suspeitas                               │
│                                                                     │
│  4. VALIDAÇÃO DE CONTEXTO                                           │
│     ├── Verificar se mesa existe e está ativa                      │
│     ├── Verificar se restaurante está operando                     │
│     └── Verificar se não há sessão conflitante                     │
│                                                                     │
│  5. EXPIRAÇÃO OPCIONAL                                              │
│     ├── QR Codes podem ter validade                                │
│     ├── Útil para eventos especiais                                │
│     └── Configurável por restaurante                               │
│                                                                     │
│  6. AUDIT LOG                                                       │
│     ├── Registrar todos os scans                                   │
│     ├── Rastrear dispositivos suspeitos                            │
│     └── Detectar padrões de fraude                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Fluxo de Validação

```
┌─────────────────────────────────────────────────────────────────────┐
│                   FLUXO DE VALIDAÇÃO DE QR CODE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SCAN                                                               │
│    │                                                                │
│    ▼                                                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │   Parse     │───▶│   Validar   │───▶│  Verificar  │             │
│  │    URL      │    │  Signature  │    │   Versão    │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│    │                     │                    │                     │
│    │ ❌ Formato          │ ❌ Inválida        │ ❌ Revogada         │
│    │    inválido         │                    │                     │
│    ▼                     ▼                    ▼                     │
│  [ERRO 400]          [ERRO 401]          [ERRO 410]                │
│                                                                     │
│                          │ ✅                                       │
│                          ▼                                          │
│                    ┌─────────────┐                                  │
│                    │  Verificar  │                                  │
│                    │ Restaurant  │                                  │
│                    │   & Table   │                                  │
│                    └─────────────┘                                  │
│                          │                                          │
│                          │ ❌ Não encontrado                        │
│                          ▼                                          │
│                     [ERRO 404]                                      │
│                          │                                          │
│                          │ ✅ Existe                                │
│                          ▼                                          │
│                    ┌─────────────┐                                  │
│                    │  Verificar  │                                  │
│                    │   Status    │                                  │
│                    │    Mesa     │                                  │
│                    └─────────────┘                                  │
│                          │                                          │
│                     ┌────┴────┐                                     │
│                     │         │                                     │
│              available    occupied                                  │
│                     │         │                                     │
│                     ▼         ▼                                     │
│              [Criar Nova] [Retomar Sessão?]                        │
│                Sessão     │                                         │
│                     │     ├─▶ Mesmo cliente: Retomar               │
│                     │     └─▶ Outro cliente: Erro 423              │
│                     │                                               │
│                     ▼                                               │
│              ┌─────────────┐                                        │
│              │   Log Scan  │                                        │
│              │  Analytics  │                                        │
│              └─────────────┘                                        │
│                     │                                               │
│                     ▼                                               │
│              [SUCESSO 200]                                          │
│              Retornar Session + Restaurant + Table                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Plano de Desenvolvimento

### Fases do Projeto

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CRONOGRAMA DE DESENVOLVIMENTO                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FASE 1: FUNDAÇÃO (Semana 1-2)                                     │
│  ├── Backend: Entidades e Migrations                               │
│  ├── Backend: QR Code Security Service                             │
│  └── Backend: APIs básicas de Tables                               │
│                                                                     │
│  FASE 2: GERAÇÃO (Semana 2-3)                                      │
│  ├── Backend: QR Code Generation Service                           │
│  ├── Backend: APIs de QR Codes                                     │
│  └── Restaurant App: Tela de gerenciamento de mesas                │
│                                                                     │
│  FASE 3: EXPERIÊNCIA (Semana 3-4)                                  │
│  ├── Restaurant App: Telas de geração de QR                        │
│  ├── Restaurant App: Preview e personalização                      │
│  └── Restaurant App: Exportação para impressão                     │
│                                                                     │
│  FASE 4: VALIDAÇÃO (Semana 4-5)                                    │
│  ├── Backend: API de validação de QR                               │
│  ├── Backend: Sessions Module                                      │
│  └── Client App: Scanner e validação                               │
│                                                                     │
│  FASE 5: SESSÃO (Semana 5-6)                                       │
│  ├── Client App: Welcome Screen e Session                          │
│  ├── Client App: Integração com Menu/Orders                        │
│  └── Backend: WebSocket para updates em tempo real                 │
│                                                                     │
│  FASE 6: POLIMENTO (Semana 6-7)                                    │
│  ├── Testes E2E                                                    │
│  ├── Performance optimization                                      │
│  └── Analytics e métricas                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Detalhamento por Fase

#### FASE 1: Fundação

```yaml
Objetivo: Criar a base de dados e serviços de segurança

Tarefas Backend:
  - [ ] Criar migration para table_qr_codes
  - [ ] Criar migration para table_sessions  
  - [ ] Criar migration para qr_scan_logs
  - [ ] Atualizar entity de Tables
  - [ ] Criar TableQRCode entity
  - [ ] Criar TableSession entity
  - [ ] Criar QRScanLog entity
  - [ ] Implementar QRCodeSecurityService
        - generateSignature()
        - validateSignature()
        - generateQRCodeUrl()
  - [ ] Criar TablesModule completo
        - CRUD de mesas
        - Validações de negócio
  
Testes:
  - [ ] Unit tests para QRCodeSecurityService
  - [ ] Unit tests para TablesService
  - [ ] Integration tests para Tables API

Entregáveis:
  - Database schema migrado
  - APIs de CRUD de mesas funcionando
  - Serviço de segurança testado
```

#### FASE 2: Geração de QR Codes

```yaml
Objetivo: Permitir geração de QR Codes com customização

Tarefas Backend:
  - [ ] Criar QRCodeModule
  - [ ] Implementar QRCodeService
        - generateQRCode() - gera imagem PNG/SVG
        - generateForTable() - cria registro + imagem
        - generateBatch() - geração em lote
        - revokeQRCode() - invalida código
        - regenerateQRCode() - nova versão
  - [ ] Implementar QRCodeController
        - POST /tables/{id}/qr-code
        - POST /qr-codes/batch
        - DELETE /tables/{id}/qr-code
        - POST /tables/{id}/qr-code/regenerate
  - [ ] Implementar estilos de QR Code
        - Minimal (preto e branco)
        - Premium (com logo)
        - Bold (cores vibrantes)
        - Elegant (gradientes suaves)

Tarefas Restaurant App:
  - [ ] Criar hook useTables()
  - [ ] Criar hook useTableQRCode()
  - [ ] Implementar TableListScreen
        - Lista de mesas por seção
        - Status badges
        - Indicador de QR Code

Testes:
  - [ ] Unit tests para QRCodeService
  - [ ] Integration tests para QR Code API
  - [ ] Snapshot tests para estilos de QR

Entregáveis:
  - APIs de geração de QR funcionando
  - Estilos de QR implementados
  - Lista de mesas no app
```

#### FASE 3: Experiência de Geração

```yaml
Objetivo: Interface completa para gerar e exportar QR Codes

Tarefas Restaurant App:
  - [ ] Implementar QRCodeGeneratorScreen
        - Seleção de estilo
        - Customização de cores
        - Toggle de logo
        - Preview em tempo real
  - [ ] Implementar QRCodePreviewScreen
        - Preview em tamanho real
        - Opções de formato (display/tent card)
        - Download direto
  - [ ] Implementar QRCodeBatchScreen
        - Seleção múltipla de mesas
        - Geração em lote
        - Progress indicator
  - [ ] Implementar QRCodeExportScreen
        - Escolha de formato (PDF/ZIP)
        - Escolha de tamanho
        - Envio por email
  - [ ] Criar componentes reutilizáveis
        - QRCodeCard
        - QRCodeStyleSelector
        - QRCodeColorPicker
        - QRCodePrintLayout

Tarefas Backend:
  - [ ] Implementar geração de PDF
        - Layout para impressão
        - Múltiplas mesas por página
  - [ ] Implementar envio por email
        - Template de email
        - Anexo PDF

Testes:
  - [ ] Component tests para cada tela
  - [ ] E2E test para fluxo de geração

Entregáveis:
  - Fluxo completo de geração no app
  - Exportação PDF funcionando
  - Envio por email funcionando
```

#### FASE 4: Validação de QR

```yaml
Objetivo: API de validação e scanner no client app

Tarefas Backend:
  - [ ] Criar endpoint POST /qr/validate
        - Parse da URL
        - Validação de signature
        - Verificação de versão
        - Verificação de status
  - [ ] Implementar rate limiting
  - [ ] Implementar logging de scans
  - [ ] Criar SessionsModule
        - startSession()
        - endSession()
        - getActiveSession()

Tarefas Client App:
  - [ ] Implementar QRScannerScreen
        - Integração com câmera
        - Overlay de scan
        - Feedback visual/háptico
  - [ ] Implementar ManualCodeInput
        - Input para código manual
        - Validação em tempo real
  - [ ] Criar hook useQRScanner()
  - [ ] Criar hook useTableSession()

Testes:
  - [ ] Unit tests para validação
  - [ ] Integration tests para scan flow
  - [ ] Mock camera tests

Entregáveis:
  - API de validação funcionando
  - Scanner implementado
  - Rate limiting ativo
```

#### FASE 5: Sessão do Cliente

```yaml
Objetivo: Experiência completa na mesa após scan

Tarefas Client App:
  - [ ] Implementar SessionWelcomeScreen
        - Info do restaurante
        - Info da mesa
        - Seleção de número de pessoas
        - Convite para amigos
  - [ ] Implementar ActiveSessionScreen
        - Header com info da sessão
        - Ações rápidas (menu, garçom, pagar)
        - Lista de pedidos
        - Status em tempo real
  - [ ] Integrar com sistema de pedidos existente
        - Passar session_id nos pedidos
        - Filtrar pedidos por sessão
  - [ ] Integrar com sistema de pagamentos
        - Checkout vinculado à sessão
        - Encerramento automático após pagamento

Tarefas Backend:
  - [ ] Implementar WebSocket para sessão
        - Eventos de atualização de pedido
        - Notificações de garçom
  - [ ] Vincular orders com sessions
  - [ ] Vincular payments com sessions

Testes:
  - [ ] E2E tests para fluxo completo
  - [ ] WebSocket tests
  - [ ] Integration tests com orders/payments

Entregáveis:
  - Sessão completa funcionando
  - Integração com módulos existentes
  - Atualizações em tempo real
```

#### FASE 6: Polimento

```yaml
Objetivo: Qualidade, performance e analytics

Tarefas:
  - [ ] Otimização de performance
        - Lazy loading de imagens QR
        - Cache de validações
        - Otimização de queries
  - [ ] Analytics e métricas
        - Dashboard de scans por mesa
        - Tempo médio de sessão
        - Taxa de conversão
  - [ ] Tratamento de edge cases
        - QR Code danificado
        - Múltiplos scans simultâneos
        - Reconexão de sessão
  - [ ] Documentação
        - API documentation
        - User guide para restaurantes
  - [ ] Testes finais
        - Load testing
        - Security audit
        - Accessibility audit

Entregáveis:
  - Sistema otimizado
  - Dashboard de analytics
  - Documentação completa
```

---

## Testes

### Estratégia de Testes

```yaml
Unit Tests:
  Backend:
    - QRCodeSecurityService (100% coverage)
    - QRCodeService
    - TablesService
    - SessionsService
    - Validators e DTOs
  
  Mobile:
    - Hooks (useTables, useQRScanner, useTableSession)
    - Componentes isolados
    - Utils e helpers

Integration Tests:
  Backend:
    - Tables API endpoints
    - QR Code API endpoints
    - Validation API endpoint
    - Session lifecycle
  
  Mobile:
    - API calls via MSW
    - Navigation flows
    - State management

E2E Tests:
  Scenarios:
    - Restaurante cadastra mesa e gera QR
    - Restaurante gera QR em lote e exporta PDF
    - Cliente escaneia QR e inicia sessão
    - Cliente faz pedido na sessão
    - Cliente encerra sessão com pagamento
    - QR Code expirado é rejeitado
    - Múltiplos clientes na mesma mesa
```

### Exemplo de Testes

```typescript
// backend/src/modules/qr-code/qr-code-security.service.spec.ts

describe('QRCodeSecurityService', () => {
  describe('generateSignature', () => {
    it('should generate consistent signature for same inputs', () => {
      const sig1 = service.generateSignature('rest-1', 'table-1', 1);
      const sig2 = service.generateSignature('rest-1', 'table-1', 1);
      expect(sig1).toBe(sig2);
    });

    it('should generate different signatures for different versions', () => {
      const sig1 = service.generateSignature('rest-1', 'table-1', 1);
      const sig2 = service.generateSignature('rest-1', 'table-1', 2);
      expect(sig1).not.toBe(sig2);
    });
  });

  describe('validateSignature', () => {
    it('should validate correct signature', () => {
      const url = service.generateQRCodeUrl('rest-1', 'table-1', 1);
      const result = service.validateSignature(url);
      expect(result.valid).toBe(true);
      expect(result.restaurantId).toBe('rest-1');
      expect(result.tableId).toBe('table-1');
    });

    it('should reject tampered signature', () => {
      const url = 'https://app.okinawa.com/scan/rest-1/table-1?sig=invalid&v=1';
      const result = service.validateSignature(url);
      expect(result.valid).toBe(false);
    });

    it('should reject malformed URL', () => {
      const result = service.validateSignature('invalid-url');
      expect(result.valid).toBe(false);
    });
  });
});
```

```typescript
// mobile/apps/client/src/hooks/useQRScanner.test.ts

describe('useQRScanner', () => {
  it('should validate QR code and return session', async () => {
    const { result } = renderHook(() => useQRScanner());
    
    await act(async () => {
      await result.current.handleScan('https://app.okinawa.com/scan/rest-1/table-1?sig=valid&v=1');
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.session).toBeDefined();
    expect(result.current.restaurant.name).toBe('Test Restaurant');
    expect(result.current.table.table_number).toBe('T-01');
  });

  it('should show error for invalid QR code', async () => {
    const { result } = renderHook(() => useQRScanner());
    
    await act(async () => {
      await result.current.handleScan('invalid-qr');
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe('QR Code inválido');
  });
});
```

---

## Checklist Final

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CHECKLIST DE ENTREGA                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  BACKEND                                                            │
│  ☐ Migrations executadas                                           │
│  ☐ Entities criadas                                                │
│  ☐ Services implementados                                          │
│  ☐ Controllers com Swagger docs                                    │
│  ☐ DTOs com validação                                              │
│  ☐ Guards de autorização                                           │
│  ☐ Rate limiting configurado                                       │
│  ☐ Testes com 90%+ coverage                                        │
│                                                                     │
│  RESTAURANT APP                                                     │
│  ☐ Tela de lista de mesas                                          │
│  ☐ Tela de criação/edição de mesa                                  │
│  ☐ Tela de geração de QR Code                                      │
│  ☐ Tela de preview e customização                                  │
│  ☐ Tela de exportação para impressão                               │
│  ☐ Geração em lote funcionando                                     │
│  ☐ Download de PDF funcionando                                     │
│  ☐ Testes de componentes                                           │
│                                                                     │
│  CLIENT APP                                                         │
│  ☐ Scanner de QR Code funcionando                                  │
│  ☐ Validação com feedback visual                                   │
│  ☐ Tela de boas-vindas                                             │
│  ☐ Sessão ativa com ações                                          │
│  ☐ Integração com menu/pedidos                                     │
│  ☐ Integração com pagamentos                                       │
│  ☐ Testes E2E                                                      │
│                                                                     │
│  SEGURANÇA                                                          │
│  ☐ HMAC signatures funcionando                                     │
│  ☐ Rate limiting testado                                           │
│  ☐ Logs de auditoria ativos                                        │
│  ☐ Versionamento de QR Codes                                       │
│  ☐ Revogação funcionando                                           │
│                                                                     │
│  QUALIDADE                                                          │
│  ☐ Code review completo                                            │
│  ☐ Performance testada                                             │
│  ☐ Acessibilidade verificada                                       │
│  ☐ Documentação atualizada                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Próximos Passos

1. **Validar Especificação**: Revisar este documento com stakeholders
2. **Priorizar Features**: Definir MVP vs. Nice-to-have
3. **Iniciar Fase 1**: Começar pelas migrations e serviços de segurança
4. **Setup de Ambiente**: Garantir que todos os devs têm ambiente configurado
5. **Sprint Planning**: Criar tickets no board com base nas tarefas detalhadas

---

*Documento criado em: 2025*
*Última atualização: 2025*
*Versão: 1.0*
