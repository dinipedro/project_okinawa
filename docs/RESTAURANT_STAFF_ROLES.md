# Restaurant Staff Roles & Access Flows
# Perfis de Funcionários do Restaurante e Fluxos de Acesso

> **Version**: 1.0.0  
> **Last Updated**: 2025-02-04  
> **Language**: Bilingual (EN/PT)

---

## Table of Contents / Índice

1. [Overview / Visão Geral](#overview--visão-geral)
2. [Role Hierarchy / Hierarquia de Perfis](#role-hierarchy--hierarquia-de-perfis)
3. [Role Definitions / Definições de Perfis](#role-definitions--definições-de-perfis)
4. [Screen Access Matrix / Matriz de Acesso às Telas](#screen-access-matrix--matriz-de-acesso-às-telas)
5. [Flow Diagrams / Diagramas de Fluxo](#flow-diagrams--diagramas-de-fluxo)
6. [Permission System / Sistema de Permissões](#permission-system--sistema-de-permissões)
7. [Implementation Details / Detalhes de Implementação](#implementation-details--detalhes-de-implementação)

---

## Overview / Visão Geral

**EN**: The Okinawa Restaurant App implements a comprehensive Role-Based Access Control (RBAC) system that ensures each staff member only sees screens and actions relevant to their job function. This document defines each role, their permissions, and the user flows within the application.

**PT**: O App Restaurante Okinawa implementa um sistema completo de Controle de Acesso Baseado em Funções (RBAC) que garante que cada funcionário veja apenas as telas e ações relevantes para sua função. Este documento define cada perfil, suas permissões e os fluxos de usuário dentro da aplicação.

---

## Role Hierarchy / Hierarquia de Perfis

```
                    ┌─────────────┐
                    │    OWNER    │  ← Full Control / Controle Total
                    │ Proprietário│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   MANAGER   │  ← Operations Management / Gestão Operacional
                    │   Gerente   │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │   MAITRE    │  │    CHEF     │  │   WAITER    │
   │   Maître    │  │    Chef     │  │   Garçom    │
   └─────────────┘  └──────┬──────┘  └─────────────┘
                           │
                    ┌──────▼──────┐
                    │   BARMAN    │
                    │   Barman    │
                    └─────────────┘
```

---

## Role Definitions / Definições de Perfis

### 1. OWNER (Proprietário)

**EN**: Restaurant owner with full administrative control over all aspects of the establishment.

**PT**: Proprietário do restaurante com controle administrativo total sobre todos os aspectos do estabelecimento.

| Attribute | Value |
|-----------|-------|
| **Enum Value** | `owner` |
| **Label (PT)** | Proprietário |
| **Primary Focus** | Business management, analytics, strategic decisions |
| **Hierarchy Level** | 1 (Highest) |

#### Permissions / Permissões
```typescript
[
  'manage_restaurant',    // Create, update, delete restaurant settings
  'manage_staff',         // Hire, fire, change roles, manage schedules
  'view_analytics',       // Access financial and operational reports
  'manage_menu',          // Full menu CRUD operations
  'manage_orders',        // View, modify, cancel any order
  'manage_reservations',  // Full reservation management
  'manage_payments',      // Process refunds, view transactions
  'manage_tips',          // Configure and distribute tips
]
```

#### Accessible Screens / Telas Acessíveis
- ✅ Dashboard Principal
- ✅ Gestão de Funcionários (Staff Management)
- ✅ Configuração de Serviço (Service Config)
- ✅ Analytics e Relatórios
- ✅ Gestão de Cardápio
- ✅ Gestão de Mesas
- ✅ Reservas
- ✅ Pedidos
- ✅ Financeiro
- ✅ Configurações do Restaurante
- ✅ Gestão de Gorjetas
- ✅ Geração de QR Codes
- ✅ **ALL SCREENS** (Todas as Telas)

---

### 2. MANAGER (Gerente)

**EN**: Restaurant manager responsible for daily operations without ownership privileges.

**PT**: Gerente do restaurante responsável pelas operações diárias sem privilégios de propriedade.

| Attribute | Value |
|-----------|-------|
| **Enum Value** | `manager` |
| **Label (PT)** | Gerente |
| **Primary Focus** | Staff coordination, daily operations, quality control |
| **Hierarchy Level** | 2 |

#### Permissions / Permissões
```typescript
[
  'manage_staff',         // Hire, manage schedules (cannot delete restaurant)
  'view_analytics',       // Access operational reports
  'manage_menu',          // Full menu CRUD operations
  'manage_orders',        // View, modify, cancel orders
  'manage_reservations',  // Full reservation management
  'manage_tips',          // Configure and distribute tips
]
```

#### Accessible Screens / Telas Acessíveis
- ✅ Dashboard Principal
- ✅ Gestão de Funcionários
- ✅ Analytics e Relatórios
- ✅ Gestão de Cardápio
- ✅ Gestão de Mesas
- ✅ Reservas
- ✅ Pedidos
- ✅ Gestão de Gorjetas
- ✅ Geração de QR Codes
- ❌ Configurações Críticas do Restaurante
- ❌ Gestão Financeira Completa

---

### 3. MAITRE (Maître d'Hôtel)

**EN**: Front-of-house manager responsible for guest reception, reservations, and table management.

**PT**: Gerente de salão responsável pela recepção de clientes, reservas e gestão de mesas.

| Attribute | Value |
|-----------|-------|
| **Enum Value** | `maitre` |
| **Label (PT)** | Maître |
| **Primary Focus** | Guest experience, table flow, reservations |
| **Hierarchy Level** | 3 |

#### Permissions / Permissões
```typescript
[
  'manage_reservations',  // Create, modify, cancel reservations
  'manage_tables',        // Assign tables, manage seating
  'view_orders',          // View order status (read-only)
]
```

#### Accessible Screens / Telas Acessíveis
- ✅ Maître Dashboard
- ✅ Gestão de Reservas
- ✅ Mapa de Mesas
- ✅ Fila Virtual / Waitlist
- ✅ Check-in de Clientes
- ✅ Visualização de Pedidos (somente leitura)
- ❌ KDS (Cozinha/Bar)
- ❌ Gestão de Funcionários
- ❌ Cardápio (edição)
- ❌ Financeiro

#### User Flow / Fluxo de Usuário
```
┌─────────────────────────────────────────────────────────────────┐
│                    MAÎTRE WORKFLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Login ──► Maître Dashboard                                     │
│                   │                                              │
│     ┌─────────────┼─────────────┐                               │
│     │             │             │                               │
│     ▼             ▼             ▼                               │
│  Reservas    Mapa Mesas    Fila Virtual                         │
│     │             │             │                               │
│     │             │             │                               │
│     ▼             ▼             ▼                               │
│  • Ver reservas   • Status     • Adicionar à fila               │
│  • Confirmar      • Alocar     • Chamar próximo                 │
│  • Check-in       • Liberar    • Notificar cliente              │
│  • Cancelar       • Bloquear   • Tempo estimado                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4. CHEF (Chef de Cozinha)

**EN**: Kitchen chef responsible for food preparation, menu management, and kitchen operations.

**PT**: Chef de cozinha responsável pela preparação de alimentos, gestão do cardápio e operações da cozinha.

| Attribute | Value |
|-----------|-------|
| **Enum Value** | `chef` |
| **Label (PT)** | Chef |
| **Primary Focus** | Food preparation, order fulfillment, menu updates |
| **Hierarchy Level** | 3 |

#### Permissions / Permissões
```typescript
[
  'view_orders',          // View all orders
  'update_order_status',  // Mark items as preparing/ready
  'manage_menu',          // Add, edit menu items
]
```

#### Accessible Screens / Telas Acessíveis
- ✅ Chef Dashboard
- ✅ KDS Cozinha (Kitchen Display)
- ✅ Gestão de Cardápio
- ✅ Visualização de Pedidos
- ✅ Alertas de Estoque
- ❌ KDS Bar
- ❌ Gestão de Mesas
- ❌ Reservas
- ❌ Gestão de Funcionários
- ❌ Financeiro

#### User Flow / Fluxo de Usuário
```
┌─────────────────────────────────────────────────────────────────┐
│                     CHEF WORKFLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Login ──► Chef Dashboard                                       │
│                   │                                              │
│     ┌─────────────┴─────────────┐                               │
│     │                           │                               │
│     ▼                           ▼                               │
│  KDS Cozinha               Cardápio                             │
│     │                           │                               │
│     ▼                           ▼                               │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ Novo Pedido     │    │ • Adicionar     │                     │
│  │      ↓          │    │   item          │                     │
│  │ Em Preparação   │    │ • Editar preço  │                     │
│  │      ↓          │    │ • Disponibilidade│                    │
│  │ Pronto          │    │ • Ingredientes  │                     │
│  │      ↓          │    └─────────────────┘                     │
│  │ [Notifica       │                                            │
│  │  Garçom]        │                                            │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. WAITER (Garçom)

**EN**: Table server responsible for customer service, order taking, and payment processing.

**PT**: Garçom responsável pelo atendimento ao cliente, registro de pedidos e processamento de pagamentos.

| Attribute | Value |
|-----------|-------|
| **Enum Value** | `waiter` |
| **Label (PT)** | Garçom |
| **Primary Focus** | Customer service, orders, payments |
| **Hierarchy Level** | 4 |

#### Permissions / Permissões
```typescript
[
  'view_orders',          // View orders for assigned tables
  'create_order',         // Create new orders
  'update_order_status',  // Mark orders as delivered
  'view_tables',          // View table status
]
```

#### Accessible Screens / Telas Acessíveis
- ✅ Waiter Dashboard
- ✅ Minhas Mesas (Assigned Tables)
- ✅ Criar Pedido
- ✅ Visualização de Pedidos
- ✅ Processar Pagamento (TAP to Pay, PIX, Cartão)
- ✅ Chamados de Mesa
- ✅ Gorjetas Recebidas
- ❌ KDS (Cozinha/Bar)
- ❌ Gestão de Cardápio
- ❌ Reservas
- ❌ Gestão de Funcionários
- ❌ Financeiro

#### User Flow / Fluxo de Usuário
```
┌─────────────────────────────────────────────────────────────────┐
│                    WAITER WORKFLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Login ──► Waiter Dashboard                                     │
│                   │                                              │
│  ┌────────────────┼────────────────┬──────────────┐             │
│  │                │                │              │             │
│  ▼                ▼                ▼              ▼             │
│ Mesas        Criar Pedido    Chamados       Gorjetas            │
│  │                │                │              │             │
│  ▼                ▼                ▼              ▼             │
│ • Ocupada     • Selecionar    • Atender     • Ver total        │
│ • Aguardando    mesa          • Marcar       • Por período     │
│ • Pagando     • Adicionar       resolvido                      │
│ • Livre         itens                                          │
│              • Observações                                      │
│              • Enviar                                           │
│                   │                                              │
│                   ▼                                              │
│              Pagamento                                           │
│              ┌─────────────────────┐                            │
│              │ • TAP to Pay (NFC)  │                            │
│              │ • PIX QR Code       │                            │
│              │ • Cartão            │                            │
│              │ • Split (divisão)   │                            │
│              └─────────────────────┘                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Special Capability: Bridging App & Non-App Users
**EN**: Waiters can process payments for guests who don't have the Okinawa app, enabling full group payment processing even with mixed app adoption.

**PT**: Garçons podem processar pagamentos para clientes sem o app Okinawa, permitindo pagamento completo do grupo mesmo com adoção mista do app.

---

### 6. BARMAN (Bartender)

**EN**: Bartender responsible for beverage preparation and drink order management.

**PT**: Barman responsável pela preparação de bebidas e gestão de pedidos de drinks.

| Attribute | Value |
|-----------|-------|
| **Enum Value** | `barman` |
| **Label (PT)** | Barman |
| **Primary Focus** | Beverage preparation, drink orders |
| **Hierarchy Level** | 5 |

#### Permissions / Permissões
```typescript
[
  'view_orders',          // View drink orders only
  'update_order_status',  // Mark drinks as preparing/ready
]
```

#### Accessible Screens / Telas Acessíveis
- ✅ Barman Dashboard
- ✅ KDS Bar (Bar Display)
- ✅ Visualização de Pedidos de Bebidas
- ❌ KDS Cozinha
- ❌ Gestão de Cardápio
- ❌ Gestão de Mesas
- ❌ Reservas
- ❌ Criar Pedidos
- ❌ Processar Pagamentos
- ❌ Gestão de Funcionários
- ❌ Financeiro

#### User Flow / Fluxo de Usuário
```
┌─────────────────────────────────────────────────────────────────┐
│                    BARMAN WORKFLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Login ──► Barman Dashboard                                     │
│                   │                                              │
│                   ▼                                              │
│              KDS Bar                                             │
│                   │                                              │
│     ┌─────────────┴─────────────┐                               │
│     │                           │                               │
│     ▼                           ▼                               │
│  Pedidos Novos            Em Preparação                         │
│     │                           │                               │
│     ▼                           ▼                               │
│  • Aceitar              • Timer ativo                           │
│  • Ver detalhes         • Marcar pronto                         │
│  • Priorizar            • Cancelar (com aprovação)              │
│                                  │                               │
│                                  ▼                               │
│                           Pronto p/ Entrega                      │
│                           [Notifica Garçom]                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen Access Matrix / Matriz de Acesso às Telas

| Screen / Tela | OWNER | MANAGER | MAITRE | CHEF | WAITER | BARMAN |
|---------------|:-----:|:-------:|:------:|:----:|:------:|:------:|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Staff Management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Service Config | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Analytics/Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Financial | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Menu Management** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Tables Map** | ✅ | ✅ | ✅ | ❌ | ✅* | ❌ |
| QR Code Generation | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Reservations** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Waitlist | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Orders View** | ✅ | ✅ | 👁️ | ✅ | ✅ | ✅** |
| Create Order | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **KDS Kitchen** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **KDS Bar** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Process Payments | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Tips Management | ✅ | ✅ | ❌ | ❌ | 👁️ | ❌ |
| Waiter Calls | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Restaurant Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legend / Legenda:**
- ✅ = Full Access / Acesso Completo
- 👁️ = Read Only / Somente Leitura
- ❌ = No Access / Sem Acesso
- \* = Waiter sees only assigned tables / Garçom vê apenas mesas atribuídas
- \*\* = Barman sees only drink orders / Barman vê apenas pedidos de bebidas

---

## Flow Diagrams / Diagramas de Fluxo

### Authentication & Role Resolution

```
┌─────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  App Start ──► Welcome Screen                                   │
│                      │                                           │
│        ┌─────────────┴─────────────┐                            │
│        │                           │                            │
│        ▼                           ▼                            │
│   Social Login              Phone OTP                           │
│   (Google/Apple)            (SMS/WhatsApp)                      │
│        │                           │                            │
│        └─────────────┬─────────────┘                            │
│                      │                                           │
│                      ▼                                           │
│              Fetch Staff Profile                                 │
│              GET /staff/me                                       │
│                      │                                           │
│                      ▼                                           │
│            ┌─────────────────┐                                  │
│            │ RestaurantContext│                                  │
│            │ • restaurant_id  │                                  │
│            │ • role           │                                  │
│            │ • permissions    │                                  │
│            └────────┬────────┘                                  │
│                     │                                            │
│                     ▼                                            │
│            Route to Role Dashboard                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Order Lifecycle by Role

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER LIFECYCLE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐                                                   │
│  │ CUSTOMER │──► Creates order via App                          │
│  └──────────┘    (or WAITER creates for non-app guests)         │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────────────────────────────────────────┐               │
│  │              ORDER CREATED                    │               │
│  │  Status: PENDING                              │               │
│  └──────────────────────────────────────────────┘               │
│       │                                                          │
│       ├──────────────────┬──────────────────────┐               │
│       │                  │                      │               │
│       ▼                  ▼                      ▼               │
│  ┌────────┐        ┌────────┐            ┌────────┐             │
│  │  CHEF  │        │ BARMAN │            │ WAITER │             │
│  │ (food) │        │(drinks)│            │ (view) │             │
│  └───┬────┘        └───┬────┘            └────────┘             │
│      │                 │                                         │
│      ▼                 ▼                                         │
│  KDS Kitchen       KDS Bar                                       │
│  • Accept          • Accept                                      │
│  • Prepare         • Prepare                                     │
│  • Ready           • Ready                                       │
│      │                 │                                         │
│      └────────┬────────┘                                        │
│               │                                                  │
│               ▼                                                  │
│  ┌──────────────────────────────────────────────┐               │
│  │              ORDER READY                      │               │
│  │  [WebSocket: notify WAITER]                   │               │
│  └──────────────────────────────────────────────┘               │
│               │                                                  │
│               ▼                                                  │
│  ┌────────┐                                                     │
│  │ WAITER │──► Delivers to table                                │
│  └───┬────┘    Updates status: DELIVERED                        │
│      │                                                           │
│      ▼                                                           │
│  ┌──────────────────────────────────────────────┐               │
│  │           PAYMENT PROCESSING                  │               │
│  │  WAITER processes for non-app guests          │               │
│  │  • TAP to Pay (NFC)                           │               │
│  │  • PIX QR Code                                │               │
│  │  • Card Terminal                              │               │
│  │  • Split Payment                              │               │
│  └──────────────────────────────────────────────┘               │
│               │                                                  │
│               ▼                                                  │
│  ┌──────────────────────────────────────────────┐               │
│  │              ORDER COMPLETED                  │               │
│  │  [Analytics recorded]                         │               │
│  └──────────────────────────────────────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Permission System / Sistema de Permissões

### Backend Implementation

```typescript
// backend/src/common/enums/user-role.enum.ts

export enum UserRole {
  CUSTOMER = 'customer',
  OWNER = 'owner',
  MANAGER = 'manager',
  CHEF = 'chef',
  WAITER = 'waiter',
  BARMAN = 'barman',
  MAITRE = 'maitre',
}

export const USER_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.CUSTOMER]: [
    'view_restaurants',
    'create_order',
    'view_own_orders',
    'create_reservation',
    'view_own_reservations',
    'manage_wallet',
    'view_own_reviews',
    'create_review',
  ],
  [UserRole.OWNER]: [
    'manage_restaurant',
    'manage_staff',
    'view_analytics',
    'manage_menu',
    'manage_orders',
    'manage_reservations',
    'manage_payments',
    'manage_tips',
  ],
  [UserRole.MANAGER]: [
    'manage_staff',
    'view_analytics',
    'manage_menu',
    'manage_orders',
    'manage_reservations',
    'manage_tips',
  ],
  [UserRole.CHEF]: [
    'view_orders',
    'update_order_status',
    'manage_menu',
  ],
  [UserRole.WAITER]: [
    'view_orders',
    'create_order',
    'update_order_status',
    'view_tables',
  ],
  [UserRole.BARMAN]: [
    'view_orders',
    'update_order_status',
  ],
  [UserRole.MAITRE]: [
    'manage_reservations',
    'manage_tables',
    'view_orders',
  ],
};
```

### Role Guard Usage

```typescript
// Example: Protecting an endpoint
@Roles(UserRole.OWNER, UserRole.MANAGER)
@UseGuards(JwtAuthGuard, RolesGuard)
async updateRestaurant(@Body() dto: UpdateRestaurantDto) {
  // Only OWNER and MANAGER can access
}

// Example: Kitchen-only endpoint
@Roles(UserRole.CHEF)
@UseGuards(JwtAuthGuard, RolesGuard)
async updateOrderItemStatus(@Body() dto: UpdateItemStatusDto) {
  // Only CHEF can update food item status
}
```

### Frontend Role Check

```typescript
// mobile/shared/contexts/RestaurantContext.tsx

export const useRestaurantRole = () => {
  const { currentStaff } = useContext(RestaurantContext);
  
  const hasRole = (requiredRoles: UserRole[]) => {
    if (!currentStaff?.role) return false;
    return requiredRoles.includes(currentStaff.role as UserRole);
  };
  
  const hasPermission = (permission: string) => {
    if (!currentStaff?.role) return false;
    const rolePerms = USER_ROLE_PERMISSIONS[currentStaff.role];
    return rolePerms?.includes(permission) ?? false;
  };
  
  return { hasRole, hasPermission, currentRole: currentStaff?.role };
};
```

---

## Implementation Details / Detalhes de Implementação

### Role-Based Navigation

```typescript
// Navigation config based on role
const getNavigationForRole = (role: UserRole): NavigationItem[] => {
  const baseNav: NavigationItem[] = [
    { screen: 'dashboard', icon: 'home', label: 'Dashboard' },
  ];
  
  switch (role) {
    case UserRole.OWNER:
    case UserRole.MANAGER:
      return [
        ...baseNav,
        { screen: 'staff-management', icon: 'users', label: 'Equipe' },
        { screen: 'tables', icon: 'grid', label: 'Mesas' },
        { screen: 'orders', icon: 'clipboard', label: 'Pedidos' },
        { screen: 'menu', icon: 'book', label: 'Cardápio' },
        { screen: 'reservations', icon: 'calendar', label: 'Reservas' },
        { screen: 'analytics', icon: 'bar-chart', label: 'Relatórios' },
        { screen: 'settings', icon: 'settings', label: 'Configurações' },
      ];
      
    case UserRole.MAITRE:
      return [
        ...baseNav,
        { screen: 'maitre-dashboard', icon: 'users', label: 'Recepção' },
        { screen: 'tables', icon: 'grid', label: 'Mesas' },
        { screen: 'reservations', icon: 'calendar', label: 'Reservas' },
        { screen: 'waitlist', icon: 'clock', label: 'Fila' },
      ];
      
    case UserRole.CHEF:
      return [
        ...baseNav,
        { screen: 'kitchen-kds', icon: 'flame', label: 'Cozinha' },
        { screen: 'menu', icon: 'book', label: 'Cardápio' },
      ];
      
    case UserRole.WAITER:
      return [
        ...baseNav,
        { screen: 'waiter-dashboard', icon: 'users', label: 'Atendimento' },
        { screen: 'my-tables', icon: 'grid', label: 'Minhas Mesas' },
        { screen: 'waiter-calls', icon: 'bell', label: 'Chamados' },
        { screen: 'tips', icon: 'dollar-sign', label: 'Gorjetas' },
      ];
      
    case UserRole.BARMAN:
      return [
        ...baseNav,
        { screen: 'bar-kds', icon: 'wine', label: 'Bar' },
      ];
      
    default:
      return baseNav;
  }
};
```

### Role-Specific Dashboards

Each role has a customized dashboard showing relevant KPIs:

| Role | Dashboard KPIs |
|------|---------------|
| **OWNER** | Revenue, Orders, Staff Online, Alerts |
| **MANAGER** | Orders Today, Staff Status, Reservations, Issues |
| **MAITRE** | Reservations Today, Tables Available, Queue Size, Wait Time |
| **CHEF** | Pending Orders, High Priority, Avg Prep Time, Completed Today |
| **WAITER** | My Tables, Active Orders, Tips Today, Pending Calls |
| **BARMAN** | Pending Drinks, In Progress, Completed Today, Avg Time |

---

## Security Considerations / Considerações de Segurança

### Backend Validation

**EN**: All role checks are performed server-side. Frontend role checks are for UX only and must not be trusted for security.

**PT**: Todas as verificações de perfil são realizadas no servidor. Verificações no frontend são apenas para UX e não devem ser confiadas para segurança.

```typescript
// ALWAYS validate on backend
@Get('orders')
async getOrders(@CurrentUser() user: User) {
  const roles = await this.getUserRoles(user.id);
  
  // Filter based on role
  if (roles.includes(UserRole.BARMAN)) {
    return this.ordersService.getDrinkOrders();
  }
  
  if (roles.includes(UserRole.WAITER)) {
    return this.ordersService.getOrdersForWaiter(user.id);
  }
  
  // Manager/Owner see all
  return this.ordersService.getAllOrders();
}
```

### Sensitive Actions Requiring Approval

| Action | Required Approval |
|--------|-------------------|
| Delete order item | MANAGER or OWNER |
| Cancel order | MANAGER or OWNER |
| Process refund | OWNER only |
| Delete staff member | OWNER only |
| Change restaurant settings | OWNER only |

---

## Related Documentation / Documentação Relacionada

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Full system architecture
- [SERVICE_TYPES.md](./SERVICE_TYPES.md) - Service type configurations
- [QR_CODE_SYSTEM_SPECIFICATION.md](./QR_CODE_SYSTEM_SPECIFICATION.md) - QR Code system

---

**Document maintained by**: Okinawa Development Team  
**Review cycle**: Monthly or upon role/permission changes
