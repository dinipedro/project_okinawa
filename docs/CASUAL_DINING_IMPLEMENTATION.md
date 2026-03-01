# 🍽️ Implementação Casual Dining - Plano Completo

> **Versão**: 1.1  
> **Última Atualização**: Janeiro 2026  
> **Status**: Em Implementação  
> **Idioma**: Português (Brasil)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Análise de Lacuna](#análise-de-lacuna)
3. [Especificação Funcional](#especificação-funcional)
4. [Arquitetura Técnica](#arquitetura-técnica)
5. [TODO de Implementação](#todo-de-implementação)
6. [Progresso](#progresso)

---

## Visão Geral

### O Problema da Lacuna

O Okinawa agora suporta **9 tipos de serviço**. O Casual Dining preenche o gap entre Fine Dining e Fast Casual:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    POSICIONAMENTO DE MERCADO                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Fine Dining (R$150-500) ─────────────────── 🍷 Premium, formal     │
│        │                                                            │
│        │  ┌───────────────────────────────────────┐                 │
│        │  │    ✅ CASUAL DINING (R$60-150)        │                 │
│        │  │    ✓ Garçom na mesa                   │                 │
│        │  │    ✓ Reserva opcional                 │                 │
│        │  │    ✓ Ambiente familiar                │                 │
│        │  │    ✓ Lista de espera inteligente      │                 │
│        │  │    ✓ Suporte a grupos                 │                 │
│        │  └───────────────────────────────────────┘                 │
│        │                                                            │
│  Fast Casual (R$40-80) ───────────────────── 🥗 Semi-self-service   │
│        │                                                            │
│  Quick Service (R$25-60) ─────────────────── ⚡ Fast food, balcão   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Definição Casual Dining

| Característica | Casual Dining |
|----------------|---------------|
| **Ticket Médio** | R$ 60-150 por pessoa |
| **Tempo de Permanência** | 60-90 minutos |
| **Reserva** | Opcional (aceita walk-in) |
| **Serviço de Mesa** | Sim, garçom dedicado |
| **Dress Code** | Não |
| **Ambiente** | Familiar, descontraído |
| **Rotatividade** | Média (3-5 giros/dia) |

### Exemplos Reais no Brasil

- 🥩 Churrascarias (não rodízio premium)
- 🍝 Cantinas italianas tradicionais
- 🍖 Restaurantes de comida regional (mineira, nordestina, gaúcha)
- 🍕 Pizzarias com salão
- 🍣 Restaurantes japoneses mid-range
- 🍢 Espetinhos/petiscarias com estrutura
- 🏪 Restaurantes de shopping (Outback, Applebee's, Madero)

---

## Especificação Funcional

### Interface de Configuração

```typescript
interface CasualDiningConfig {
  // === RESERVAS E ENTRADA ===
  reservations_optional: boolean;        // Aceita walk-in E reserva
  reservation_grace_period: number;      // Tolerância em minutos (ex: 15)
  waitlist_enabled: boolean;             // Lista de espera para walk-ins
  waitlist_advance_drinks: boolean;      // Pedir bebidas na fila
  estimated_wait_display: boolean;       // Mostrar tempo estimado
  
  // === SERVIÇO DE MESA ===
  table_service: boolean;                // Garçom na mesa
  order_at_table: boolean;               // Pedido pelo app NA mesa
  call_waiter_button: boolean;           // Botão "chamar garçom" no app
  partial_order_enabled: boolean;        // Pedir mais itens sem garçom
  
  // === GRUPOS ===
  group_friendly: boolean;               // Aceita grupos grandes
  max_group_size: number;                // Limite de pessoas
  group_reservation_required: number;    // A partir de X pessoas, reserva obrigatória
  
  // === PAGAMENTO ===
  suggested_tip_percentage: number;      // Gorjeta sugerida (ex: 10%)
  service_charge_included: boolean;      // Taxa de serviço já inclusa
  split_bill_promoted: boolean;          // Destaque divisão de conta
  
  // === OPERACIONAL ===
  average_meal_duration: number;         // Duração média (minutos)
  table_turnover_target: number;         // Meta de giros por dia
}
  // === RESERVAS E ENTRADA ===
  reservations_optional: boolean;        // Aceita walk-in E reserva
  reservation_grace_period: number;      // Tolerância em minutos (ex: 15)
  waitlist_enabled: boolean;             // Lista de espera para walk-ins
  waitlist_advance_drinks: boolean;      // Pedir bebidas na fila
  estimated_wait_display: boolean;       // Mostrar tempo estimado
  
  // === SERVIÇO DE MESA ===
  table_service: boolean;                // Garçom na mesa
  order_at_table: boolean;               // Pedido pelo app NA mesa
  call_waiter_button: boolean;           // Botão "chamar garçom" no app
  partial_order_enabled: boolean;        // Pedir mais itens sem garçom
  
  // === MODO FAMÍLIA ===
  kids_menu_highlighted: boolean;        // Destaque cardápio infantil
  high_chair_available: boolean;         // Cadeirão disponível
  kids_activity_kit: boolean;            // Kit de atividades
  kids_first_policy: boolean;            // Pratos kids chegam primeiro
  family_suggestions: boolean;           // Sugestões family-friendly
  
  // === GRUPOS ===
  group_friendly: boolean;               // Aceita grupos grandes
  max_group_size: number;                // Limite de pessoas
  group_reservation_required: number;    // A partir de X pessoas, reserva obrigatória
  
  // === OCASIÕES ESPECIAIS ===
  birthday_celebration: boolean;         // Pacote aniversário
  simple_decoration: boolean;            // Decoração básica disponível
  birthday_song: boolean;                // Parabéns cantado pela equipe
  photo_service: boolean;                // Foto com moldura
  
  // === PAGAMENTO ===
  suggested_tip_percentage: number;      // Gorjeta sugerida (ex: 10%)
  service_charge_included: boolean;      // Taxa de serviço já inclusa
  split_bill_promoted: boolean;          // Destaque divisão de conta
  
  // === OPERACIONAL ===
  average_meal_duration: number;         // Duração média (minutos)
  table_turnover_target: number;         // Meta de giros por dia
}
```

### Features Exclusivas do Casual Dining

#### 1. Lista de Espera Inteligente 🕐

Diferente da "Fila Virtual" do Quick Service:

```
┌────────────────────────────────────────────────────────────────┐
│                  LISTA DE ESPERA INTELIGENTE                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  🏃 Você está em 4º lugar na fila                        │ │
│  │  ⏱️ Tempo estimado: ~15 minutos                          │ │
│  │  📊 Baseado em ocupação atual + histórico                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  💡 Enquanto espera, você pode:                          │ │
│  │                                                          │ │
│  │  🍺 Pedir bebidas/aperitivos                             │ │
│  │     (valores já vão para sua comanda)                    │ │
│  │                                                          │ │
│  │  🚶 Passear e ser notificado                             │ │
│  │     (push quando mesa estiver próxima)                   │ │
│  │                                                          │ │
│  │  📋 Ver cardápio e favoritar itens                       │ │
│  │     (acelera pedido quando sentar)                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Diferenciais:**
- ✅ Estimativa baseada em ocupação REAL (mesas, tempo médio, histórico)
- ✅ Cliente pode "passear" e receber notificação
- ✅ Posição visível em tempo real
- ✅ Pedir bebidas/aperitivos ANTES de sentar (valores na comanda)
- ✅ Favoritar itens do menu antecipadamente

#### 2. Modo Família 👨‍👩‍👧‍👦

```
┌─────────────────────────────────────────┐
│  👨‍👩‍👧‍👦 MODO FAMÍLIA ATIVADO              │
├─────────────────────────────────────────┤
│                                         │
│  ✓ Cardápio Kids em destaque            │
│    → Filtro automático de itens kids    │
│                                         │
│  ✓ Cadeirão reservado                   │
│    → Notifica equipe automaticamente    │
│                                         │
│  ✓ Kit de colorir disponível            │
│    → Incluso no setup da mesa           │
│                                         │
│  ✓ Pratos kids chegam primeiro          │
│    → Prioridade no KDS                  │
│                                         │
│  ✓ Sugestões family-friendly            │
│    → IA adapta recomendações            │
│                                         │
└─────────────────────────────────────────┘
```

**Implementação:**
- Toggle no app cliente para ativar
- Afeta ordenação de itens no menu
- Notifica restaurante sobre necessidades
- Prioriza pratos infantis no KDS

#### 3. Botão Chamar Garçom 🔔

```
┌────────────────────────────────────────────────────────────────┐
│                      CHAMAR GARÇOM                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Por que você precisa de ajuda?                                │
│                                                                │
│  ┌────────────────┐  ┌────────────────┐                       │
│  │  📋 Pedir      │  │  ❓ Dúvida     │                       │
│  │     mais       │  │     cardápio   │                       │
│  └────────────────┘  └────────────────┘                       │
│                                                                │
│  ┌────────────────┐  ┌────────────────┐                       │
│  │  💧 Refil      │  │  🍰 Sobremesa  │                       │
│  │     bebida     │  │     /Café      │                       │
│  └────────────────┘  └────────────────┘                       │
│                                                                │
│  ┌────────────────┐  ┌────────────────┐                       │
│  │  ⚠️ Problema   │  │  ♿ Assistência│                       │
│  │     prato      │  │     especial   │                       │
│  └────────────────┘  └────────────────┘                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Integração:**
- Garçom recebe no smartwatch/celular
- Categorização ajuda priorização
- Reduz tempo de espera percebido
- Analytics de tipos de chamada

#### 4. Pedido Parcial pelo App 📱

```
┌────────────────────────────────────────────────────────────────┐
│                     ADICIONAR AO PEDIDO                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Você já pediu:                                                │
│  • 1x Picanha ao ponto (PREPARANDO)                           │
│  • 1x Arroz + Feijão (PRONTO)                                 │
│  • 2x Coca-Cola (ENTREGUE)                                    │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  Quer adicionar mais alguma coisa?                            │
│                                                                │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  🍺 Bebidas    │  │  🍰 Sobremesa  │  │  ☕ Café       │   │
│  │     Rápido     │  │     Doces      │  │     Digestivo  │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                │
│  Modo de envio:                                                │
│  ○ Enviar direto para cozinha                                 │
│  ● Confirmar com garçom antes                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Benefícios:**
- Cliente não espera garçom passar
- Útil para refil, sobremesa, café
- Opção de confirmar com garçom OU enviar direto
- Mantém contexto do pedido existente

#### 5. Pacote Aniversário Simples 🎂

Diferente do Fine Dining (que tem concierge), aqui é **prático e acessível**:

```
┌────────────────────────────────────────────────────────────────┐
│                   🎂 PACOTE ANIVERSÁRIO                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Incluso no pacote (R$ 49,90):                                │
│                                                                │
│  ✓ Bolo cortesia (ou com desconto especial)                   │
│  ✓ Parabéns cantado pela equipe                               │
│  ✓ Foto com moldura personalizada do restaurante              │
│  ✓ Sobremesa especial para o aniversariante                   │
│  ✓ Decoração básica da mesa (balões, faixa)                   │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  Opcionais:                                                    │
│  [ ] Bolo personalizado (+R$ 80)                              │
│  [ ] Decoração premium (+R$ 120)                              │
│  [ ] Champagne (R$ 150)                                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Arquitetura Técnica

### Enum de Tipo de Serviço

```typescript
// backend/src/common/enums/service-type.enum.ts

export enum ServiceType {
  FINE_DINING = 'fine_dining',
  QUICK_SERVICE = 'quick_service',
  FAST_CASUAL = 'fast_casual',
  COFFEE_SHOP = 'coffee_shop',
  BUFFET = 'buffet',
  DRIVE_THRU = 'drive_thru',
  FOOD_TRUCK = 'food_truck',
  CHEFS_TABLE = 'chefs_table',
  CASUAL_DINING = 'casual_dining',  // ← NOVO
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  // ... existentes
  [ServiceType.CASUAL_DINING]: 'Casual Dining',
};

export const SERVICE_TYPE_DESCRIPTIONS: Record<ServiceType, string> = {
  // ... existentes
  [ServiceType.CASUAL_DINING]:
    'Restaurante tradicional com serviço de mesa, ambiente familiar e reserva opcional',
};

export const SERVICE_TYPE_FEATURES: Record<ServiceType, string[]> = {
  // ... existentes
  [ServiceType.CASUAL_DINING]: [
    'Reserva opcional',
    'Lista de espera inteligente',
    'Serviço de mesa',
    'Modo família',
    'Chamar garçom',
    'Pedido parcial pelo app',
    'Pacote aniversário',
  ],
};
```

### Entidade de Configuração

```typescript
// backend/src/modules/restaurants/entities/restaurant-service-config.entity.ts

// Adicionar campos para Casual Dining:

// Casual Dining - Reservas
@Column({ nullable: true })
reservations_optional: boolean;

@Column({ type: 'int', nullable: true })
reservation_grace_period: number;

@Column({ nullable: true })
waitlist_enabled: boolean;

@Column({ nullable: true })
waitlist_advance_drinks: boolean;

// Casual Dining - Modo Família
@Column({ nullable: true })
kids_menu_highlighted: boolean;

@Column({ nullable: true })
high_chair_available: boolean;

@Column({ nullable: true })
kids_activity_kit: boolean;

@Column({ nullable: true })
kids_first_policy: boolean;

// Casual Dining - Grupos
@Column({ nullable: true })
group_friendly: boolean;

@Column({ type: 'int', nullable: true })
max_group_size: number;

@Column({ type: 'int', nullable: true })
group_reservation_required: number;

// Casual Dining - Ocasiões
@Column({ nullable: true })
birthday_celebration: boolean;

@Column({ nullable: true })
simple_decoration: boolean;

@Column({ nullable: true })
birthday_song: boolean;

// Casual Dining - Pagamento
@Column({ type: 'int', nullable: true })
suggested_tip_percentage: number;

@Column({ nullable: true })
service_charge_included: boolean;
```

### DTO de Configuração

```typescript
// backend/src/modules/restaurants/dto/casual-dining-config.dto.ts

import { IsBoolean, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CasualDiningConfigDto {
  // Reservas
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  reservations_optional?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(30)
  reservation_grace_period?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  waitlist_enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  waitlist_advance_drinks?: boolean;

  // Modo Família
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  kids_menu_highlighted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  high_chair_available?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  kids_activity_kit?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  kids_first_policy?: boolean;

  // Grupos
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  group_friendly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(50)
  max_group_size?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(20)
  group_reservation_required?: number;

  // Ocasiões
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  birthday_celebration?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  simple_decoration?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  birthday_song?: boolean;

  // Pagamento
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  suggested_tip_percentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  service_charge_included?: boolean;
}
```

### Configuração Frontend

```typescript
// src/components/mobile-preview/context/MobilePreviewContext.tsx

export enum ServiceType {
  // ... existentes
  CASUAL_DINING = 'casual_dining',
}

export const SERVICE_TYPE_CONFIG: Record<ServiceType, ServiceTypeConfig> = {
  // ... existentes
  [ServiceType.CASUAL_DINING]: {
    label: 'Casual Dining',
    description: 'Restaurante tradicional com serviço de mesa e ambiente familiar',
    icon: '🍽️',
    features: [
      'Reserva Opcional',
      'Lista de Espera Inteligente',
      'Modo Família',
      'Chamar Garçom',
      'Pacote Aniversário',
    ],
    hasTableService: true,
    hasReservations: true,      // Mas opcional!
    hasQueue: true,             // Lista de espera
    hasDeliveryToTable: true,
    hasDishBuilder: false,
    hasGeolocation: false,
    hasSommelier: false,
    hasBuffetScale: false,
    // Novos flags para Casual Dining:
    hasWaitlistAdvanceDrinks: true,
    hasFamilyMode: true,
    hasCallWaiter: true,
    hasPartialOrdering: true,
    hasBirthdayPackage: true,
    hasGroupSupport: true,
  },
};
```

---

## TODO de Implementação

### Checklist Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                     TODO: CASUAL DINING                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📌 FASE 1: BACKEND (Estimativa: 2-3 dias)                         │
│  ─────────────────────────────────────────────────────────────────  │
│  [ ] 1.1 Atualizar enum ServiceType                                │
│      → backend/src/common/enums/service-type.enum.ts               │
│      → Adicionar CASUAL_DINING = 'casual_dining'                   │
│      → Adicionar label, description, features                      │
│                                                                     │
│  [ ] 1.2 Atualizar entidade RestaurantServiceConfig                │
│      → backend/src/modules/restaurants/entities/                   │
│      → Adicionar campos Casual Dining (15+ colunas)                │
│                                                                     │
│  [ ] 1.3 Criar migration PostgreSQL                                │
│      → Adicionar 'casual_dining' ao ENUM                           │
│      → Adicionar novas colunas à tabela                            │
│                                                                     │
│  [ ] 1.4 Criar DTO CasualDiningConfigDto                           │
│      → backend/src/modules/restaurants/dto/                        │
│      → Validações com class-validator                              │
│                                                                     │
│  [ ] 1.5 Atualizar UpdateServiceConfigDto                          │
│      → Adicionar CasualDiningConfigDto como campo opcional         │
│                                                                     │
│  [ ] 1.6 Criar testes unitários                                    │
│      → Validação de DTO                                            │
│      → Persistência de configuração                                │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📌 FASE 2: FRONTEND CONTEXT (Estimativa: 1 dia)                   │
│  ─────────────────────────────────────────────────────────────────  │
│  [ ] 2.1 Atualizar MobilePreviewContext                            │
│      → src/components/mobile-preview/context/                      │
│      → Adicionar CASUAL_DINING ao enum                             │
│      → Adicionar SERVICE_TYPE_CONFIG entry                         │
│                                                                     │
│  [ ] 2.2 Adicionar novos flags de feature                          │
│      → hasWaitlistAdvanceDrinks                                    │
│      → hasFamilyMode                                               │
│      → hasCallWaiter                                               │
│      → hasPartialOrdering                                          │
│      → hasBirthdayPackage                                          │
│      → hasGroupSupport                                             │
│                                                                     │
│  [ ] 2.3 Atualizar tipagens TypeScript                             │
│      → Interface ServiceTypeConfig expandida                       │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📌 FASE 3: TELAS MOBILE PREVIEW V2 (Estimativa: 4-5 dias)         │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  === Cliente App ===                                               │
│                                                                     │
│  [ ] 3.1 WaitlistScreenV2 (Lista de Espera Inteligente)            │
│      → Posição na fila em tempo real                               │
│      → Estimativa baseada em ocupação                              │
│      → Opção de pedir bebidas/aperitivos                           │
│      → Notificação quando mesa próxima                             │
│                                                                     │
│  [ ] 3.2 WaitlistDrinksScreenV2 (Pedido na Fila)                   │
│      → Seleção de bebidas/aperitivos                               │
│      → Valores vão para comanda futura                             │
│      → Confirmação de pedido antecipado                            │
│                                                                     │
│  [ ] 3.3 FamilyModeScreenV2 (Ativação Modo Família)                │
│      → Toggle para ativar/desativar                                │
│      → Lista de benefícios ativos                                  │
│      → Seleção de necessidades (cadeirão, etc)                     │
│                                                                     │
│  [ ] 3.4 KidsMenuScreenV2 (Cardápio Infantil)                      │
│      → Filtro automático de itens kids                             │
│      → Apresentação lúdica                                         │
│      → Alérgenos destacados                                        │
│                                                                     │
│  [ ] 3.5 CallWaiterScreenV2 (Chamar Garçom)                        │
│      → Categorias de motivo                                        │
│      → Confirmação de chamada                                      │
│      → Status de atendimento                                       │
│                                                                     │
│  [ ] 3.6 PartialOrderScreenV2 (Adicionar ao Pedido)                │
│      → Visualização do pedido atual                                │
│      → Acesso rápido a bebidas/sobremesas                          │
│      → Opção envio direto vs confirmar com garçom                  │
│                                                                     │
│  [ ] 3.7 BirthdayPackageScreenV2 (Pacote Aniversário)              │
│      → Seleção de pacote                                           │
│      → Opcionais                                                   │
│      → Agendamento                                                 │
│                                                                     │
│  [ ] 3.8 GroupReservationScreenV2 (Reserva Grupo)                  │
│      → Seleção de tamanho do grupo                                 │
│      → Requisitos especiais                                        │
│      → Preferências de mesa                                        │
│                                                                     │
│  === Restaurante App ===                                           │
│                                                                     │
│  [ ] 3.9 Atualizar ServiceTypeConfigScreenV2                       │
│      → Adicionar Casual Dining à lista                             │
│      → Ícone apropriado                                            │
│                                                                     │
│  [ ] 3.10 CasualDiningConfigScreenV2                               │
│      → Configuração de todas as features                           │
│      → Toggles organizados por categoria                           │
│      → Preview de experiência                                      │
│                                                                     │
│  [ ] 3.11 WaitlistManagementScreenV2 (Gestão de Fila)              │
│      → Lista de espera em tempo real                               │
│      → Chamar próximo cliente                                      │
│      → Reorganizar prioridades                                     │
│                                                                     │
│  [ ] 3.12 BirthdayManagementScreenV2 (Gestão Aniversários)         │
│      → Calendário de reservas especiais                            │
│      → Preparação de kits                                          │
│      → Notificações para equipe                                    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📌 FASE 4: ASSETS E UI (Estimativa: 1 dia)                        │
│  ─────────────────────────────────────────────────────────────────  │
│  [ ] 4.1 Criar ícone Casual Dining                                 │
│      → Estilo 3D minimalista consistente                           │
│      → Fundo transparente                                          │
│                                                                     │
│  [ ] 4.2 Criar ícones de features                                  │
│      → Modo Família                                                │
│      → Lista de Espera                                             │
│      → Pacote Aniversário                                          │
│      → Grupos                                                      │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📌 FASE 5: DOCUMENTAÇÃO (Estimativa: 1 dia)                       │
│  ─────────────────────────────────────────────────────────────────  │
│  [ ] 5.1 Atualizar docs/SERVICE_TYPES.md                           │
│      → Adicionar seção completa Casual Dining                      │
│      → Fluxos de usuário                                           │
│      → Diagramas                                                   │
│                                                                     │
│  [ ] 5.2 Atualizar ARCHITECTURE.md                                 │
│      → Mencionar 9 tipos de serviço                                │
│      → Atualizar diagramas                                         │
│                                                                     │
│  [ ] 5.3 Criar memory file                                         │
│      → Casual Dining features e configuração                       │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📌 FASE 6: INTEGRAÇÃO E TESTES (Estimativa: 2 dias)               │
│  ─────────────────────────────────────────────────────────────────  │
│  [ ] 6.1 Testes de integração backend                              │
│      → CRUD de configuração                                        │
│      → Validações                                                  │
│                                                                     │
│  [ ] 6.2 Testes E2E mobile preview                                 │
│      → Fluxo completo de configuração                              │
│      → Todas as telas funcionando                                  │
│                                                                     │
│  [ ] 6.3 Verificar dark mode em todas as telas                     │
│      → Semantic tokens aplicados                                   │
│                                                                     │
│  [ ] 6.4 Testar navegação entre telas                              │
│      → Fluxos coerentes                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Detalhamento por Camada

### Backend - Arquivos a Modificar/Criar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `backend/src/common/enums/service-type.enum.ts` | MODIFICAR | Adicionar CASUAL_DINING ao enum e constantes |
| `backend/src/modules/restaurants/entities/restaurant-service-config.entity.ts` | MODIFICAR | Adicionar 15+ colunas para Casual Dining |
| `backend/src/modules/restaurants/dto/casual-dining-config.dto.ts` | CRIAR | DTO com validações específicas |
| `backend/src/modules/restaurants/dto/update-service-config.dto.ts` | MODIFICAR | Incluir CasualDiningConfigDto |
| `backend/src/modules/restaurants/dto/index.ts` | MODIFICAR | Exportar novo DTO |
| `migrations/XXXXXX-add-casual-dining.ts` | CRIAR | Migration para PostgreSQL |

### Frontend - Arquivos a Modificar/Criar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/mobile-preview/context/MobilePreviewContext.tsx` | MODIFICAR | Adicionar enum + config |
| `src/components/mobile-preview-v2/screens/restaurant/ServiceTypeConfigScreenV2.tsx` | MODIFICAR | Adicionar Casual Dining à lista |
| `src/components/mobile-preview-v2/screens/client/WaitlistScreenV2.tsx` | CRIAR | Tela de lista de espera |
| `src/components/mobile-preview-v2/screens/client/WaitlistDrinksScreenV2.tsx` | CRIAR | Pedido na fila |
| `src/components/mobile-preview-v2/screens/client/FamilyModeScreenV2.tsx` | CRIAR | Ativação modo família |
| `src/components/mobile-preview-v2/screens/client/KidsMenuScreenV2.tsx` | CRIAR | Cardápio infantil |
| `src/components/mobile-preview-v2/screens/client/CallWaiterScreenV2.tsx` | CRIAR | Chamar garçom |
| `src/components/mobile-preview-v2/screens/client/PartialOrderScreenV2.tsx` | CRIAR | Adicionar ao pedido |
| `src/components/mobile-preview-v2/screens/client/BirthdayPackageScreenV2.tsx` | CRIAR | Pacote aniversário |
| `src/components/mobile-preview-v2/screens/client/GroupReservationScreenV2.tsx` | CRIAR | Reserva de grupo |
| `src/components/mobile-preview-v2/screens/restaurant/CasualDiningConfigScreenV2.tsx` | CRIAR | Config específica |
| `src/components/mobile-preview-v2/screens/restaurant/WaitlistManagementScreenV2.tsx` | CRIAR | Gestão de fila |
| `src/components/mobile-preview-v2/screens/restaurant/BirthdayManagementScreenV2.tsx` | CRIAR | Gestão aniversários |
| `src/assets/icons/casual-dining.png` | CRIAR | Ícone do tipo |

---

## Fluxos de Usuário

### Jornada Completa Cliente

```
┌──────────────────────────────────────────────────────────────────┐
│                   JORNADA CASUAL DINING                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    DUAS ENTRADAS                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│              │                              │                    │
│              ▼                              ▼                    │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │   WALK-IN           │        │   RESERVA           │         │
│  │   (Lista de Espera) │        │   (Opcional)        │         │
│  └─────────────────────┘        └─────────────────────┘         │
│              │                              │                    │
│              ▼                              ▼                    │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │   NOTIFICAÇÃO       │        │   CHECK-IN          │         │
│  │   "Mesa Pronta!"    │        │   no App            │         │
│  └─────────────────────┘        └─────────────────────┘         │
│              │                              │                    │
│              └──────────────┬───────────────┘                   │
│                             ▼                                    │
│              ┌─────────────────────────────────┐                │
│              │         SENTADO NA MESA         │                │
│              │    Scan QR → Cardápio Digital   │                │
│              └─────────────────────────────────┘                │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   DURANTE A REFEIÇÃO                      │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐ │   │
│  │  │ 📱 Pedir mais  │  │ 🔔 Chamar      │  │ 👶 Menu     │ │   │
│  │  │    pelo App    │  │    Garçom      │  │    Kids     │ │   │
│  │  └────────────────┘  └────────────────┘  └─────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      PAGAMENTO                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │   │
│  │  │ Pagar no App│  │ Dividir     │  │ Gorjeta Sugerida │  │   │
│  │  │ (sem espera)│  │ por Pessoa  │  │ 10% pré-selecionado│ │   │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│              ┌─────────────────────────────────┐                │
│              │   AVALIAÇÃO + CONVITE RETORNO   │                │
│              │   "Volte em 30 dias e ganhe     │                │
│              │    sobremesa grátis!"           │                │
│              └─────────────────────────────────┘                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo Lista de Espera com Pedido Antecipado

```
┌──────────────────────────────────────────────────────────────────┐
│               LISTA DE ESPERA + PEDIDO ANTECIPADO                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Cliente chega (walk-in)                                      │
│     │                                                            │
│     ▼                                                            │
│  2. Scan QR na entrada                                           │
│     │                                                            │
│     ▼                                                            │
│  3. Entra na lista de espera                                     │
│     ├── Vê posição (#4 na fila)                                 │
│     ├── Vê tempo estimado (~15 min)                             │
│     └── Recebe opções:                                          │
│         │                                                        │
│         ├── 🍺 Pedir bebidas enquanto espera                    │
│         │   │                                                    │
│         │   ▼                                                    │
│         │   → Seleciona itens                                   │
│         │   → Confirma pedido                                   │
│         │   → Recebe no bar/área de espera                      │
│         │   → Valores vão para comanda futura                   │
│         │                                                        │
│         ├── 📋 Ver cardápio e favoritar                         │
│         │                                                        │
│         └── 🚶 Receber notificação para "passear"               │
│                                                                  │
│  4. Notificação push: "Sua mesa está quase pronta!"             │
│     │                                                            │
│     ▼                                                            │
│  5. Notificação push: "Mesa 12 liberada! Dirija-se ao salão"    │
│     │                                                            │
│     ▼                                                            │
│  6. Cliente senta, bebidas já pagas na comanda                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo Modo Família

```
┌──────────────────────────────────────────────────────────────────┐
│                       FLUXO MODO FAMÍLIA                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Cliente faz reserva/entra na fila                            │
│     │                                                            │
│     ▼                                                            │
│  2. Toggle "Modo Família" no app                                 │
│     │                                                            │
│     ▼                                                            │
│  3. Seleciona necessidades:                                      │
│     ├── [ ] Cadeirão para bebê                                  │
│     ├── [ ] Kit de colorir                                      │
│     └── [ ] Mesa com mais espaço                                │
│                                                                  │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  No Backend (Restaurante):                                       │
│                                                                  │
│  4. Maître recebe notificação:                                   │
│     "Família chegando - cadeirão + kit colorir"                 │
│     │                                                            │
│     ▼                                                            │
│  5. Mesa preparada com itens solicitados                        │
│                                                                  │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  No App Cliente:                                                 │
│                                                                  │
│  6. Menu exibe:                                                  │
│     ├── Seção "Para os Pequenos" em destaque                    │
│     ├── Alérgenos destacados                                    │
│     └── Porções kids indicadas                                  │
│                                                                  │
│  7. No KDS:                                                      │
│     Pedidos kids marcados com 🏃 (prioridade)                   │
│                                                                  │
│  8. Pratos kids chegam PRIMEIRO                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Telas Mobile Preview

### Resumo de Telas a Criar

| # | Tela | App | Descrição |
|---|------|-----|-----------|
| 1 | WaitlistScreenV2 | Cliente | Lista de espera inteligente |
| 2 | WaitlistDrinksScreenV2 | Cliente | Pedido de bebidas na fila |
| 3 | FamilyModeScreenV2 | Cliente | Ativação modo família |
| 4 | KidsMenuScreenV2 | Cliente | Cardápio infantil |
| 5 | CallWaiterScreenV2 | Cliente | Chamar garçom |
| 6 | PartialOrderScreenV2 | Cliente | Adicionar ao pedido |
| 7 | BirthdayPackageScreenV2 | Cliente | Pacote aniversário |
| 8 | GroupReservationScreenV2 | Cliente | Reserva de grupo |
| 9 | CasualDiningConfigScreenV2 | Restaurante | Configuração específica |
| 10 | WaitlistManagementScreenV2 | Restaurante | Gestão de fila |
| 11 | BirthdayManagementScreenV2 | Restaurante | Gestão aniversários |

**Total: 11 novas telas** (8 cliente + 3 restaurante)

---

## Cronograma Estimado

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CRONOGRAMA DE IMPLEMENTAÇÃO                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Semana 1                                                           │
│  ──────────────────────────────────────────────────────────────     │
│  │ Dia 1-2 │ Backend: Enum, Entity, Migration                      │
│  │ Dia 3   │ Backend: DTOs, Validações                             │
│  │ Dia 4   │ Frontend: Context, ServiceTypeConfig                   │
│  │ Dia 5   │ Assets: Ícones, UI components base                     │
│                                                                     │
│  Semana 2                                                           │
│  ──────────────────────────────────────────────────────────────     │
│  │ Dia 1-2 │ Telas Cliente: Waitlist, WaitlistDrinks               │
│  │ Dia 3   │ Telas Cliente: FamilyMode, KidsMenu                   │
│  │ Dia 4   │ Telas Cliente: CallWaiter, PartialOrder               │
│  │ Dia 5   │ Telas Cliente: Birthday, GroupReservation             │
│                                                                     │
│  Semana 3                                                           │
│  ──────────────────────────────────────────────────────────────     │
│  │ Dia 1   │ Telas Restaurante: CasualDiningConfig                 │
│  │ Dia 2   │ Telas Restaurante: WaitlistManagement                 │
│  │ Dia 3   │ Telas Restaurante: BirthdayManagement                 │
│  │ Dia 4   │ Documentação, Testes, Dark Mode                       │
│  │ Dia 5   │ Review final, ajustes, deploy                         │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│  TOTAL ESTIMADO: 15 dias úteis (3 semanas)                         │
│  ═══════════════════════════════════════════════════════════════   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Próximos Passos

Após aprovação deste plano, a implementação seguirá a ordem:

1. **Backend primeiro** - Garantir estrutura de dados sólida
2. **Context/Config** - Atualizar frontend para reconhecer novo tipo
3. **Telas Core** - Waitlist e Family Mode (diferenciais principais)
4. **Telas Secundárias** - Demais funcionalidades
5. **Restaurante** - Gestão e configuração
6. **Documentação** - Atualizar SERVICE_TYPES.md

---

> **Documento criado em**: Janeiro 2026  
> **Autor**: Lovable AI  
> **Projeto**: Okinawa Platform
