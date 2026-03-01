# Testing Documentation

> Bilingual Documentation: This document is available in both English and Portuguese.
> Documentacao Bilingue: Este documento esta disponivel em ingles e portugues.

---

## Table of Contents

- [English](#english)
- [Portugues](#portugues)

---

# English

## Overview

Project Okinawa implements a comprehensive **Behavior Testing** architecture with **850+ tests** achieving **95%+ coverage** across all core modules.

### Test Summary

| Category | Files | Tests | Coverage |
|----------|-------|-------|----------|
| Shared Components | 7 | 180+ | 95%+ |
| Shared Services | 4 | 75+ | 95%+ |
| Shared Validation | 1 | 28+ | 100% |
| Shared Integration | 3 | 50+ | 95%+ |
| Shared Utils | 4 | 150+ | 95%+ |
| Shared Hooks | 4 | 120+ | 95%+ |
| Shared Contexts | 3 | 80+ | 95%+ |
| Client App | 3 | 85+ | 90%+ |
| Restaurant App | 3 | 85+ | 90%+ |
| **Total** | **32** | **850+** | **95%+** |

## Technology Stack

| Tool | Purpose |
|------|---------|
| Vitest | Test runner and framework |
| @testing-library/react-native | Component testing |
| Mock Service Worker (MSW) | API mocking |
| Zod | Schema validation testing |

## Architecture

```
mobile/
├── shared/
│   ├── __tests__/
│   │   ├── api-integration.test.ts      # MSW-powered API tests
│   │   ├── AdvancedIntegration.test.ts  # WebSocket, offline, sync
│   │   ├── integration.test.ts          # Basic contract tests
│   │   └── msw-handlers.ts              # Mock Service Worker handlers
│   ├── components/__tests__/
│   │   ├── Button.test.tsx              # Button behavior tests
│   │   ├── Input.test.tsx               # Input behavior tests
│   │   ├── Accessibility.test.tsx       # WCAG compliance tests
│   │   ├── ErrorHandling.test.tsx       # Error boundary tests
│   │   ├── Performance.test.tsx         # Performance tests
│   │   ├── components.test.ts           # Component structure tests
│   │   └── setup.ts                     # Test setup
│   ├── services/__tests__/
│   │   ├── api.test.ts                  # API service tests
│   │   ├── auth.test.ts                 # Auth service tests
│   │   ├── storage.test.ts              # Storage service tests
│   │   └── socket.test.ts               # WebSocket service tests
│   ├── utils/__tests__/
│   │   ├── formatters.test.ts           # Currency/date formatters
│   │   ├── error-handler.test.ts        # Error classification
│   │   ├── logger.test.ts               # PII sanitization, log levels
│   │   └── deep-linking.test.ts         # URL parsing, routing
│   ├── hooks/__tests__/
│   │   ├── useAuth.test.ts              # Authentication hooks
│   │   ├── useWebSocket.test.ts         # WebSocket hooks
│   │   ├── useOffline.test.ts           # Offline sync hooks
│   │   └── useAnalytics.test.ts         # Analytics hooks
│   ├── contexts/__tests__/
│   │   ├── CartContext.test.tsx         # Cart context tests
│   │   ├── ThemeContext.test.tsx        # Theme switching tests
│   │   └── RestaurantContext.test.tsx   # Restaurant context tests
│   └── validation/__tests__/
│       └── schemas.test.ts              # Zod schema tests
├── apps/client/src/__tests__/
│   ├── api.test.ts                      # Client API tests
│   ├── e2e.test.ts                      # Client E2E flows
│   ├── screens.test.ts                  # Screen rendering tests
│   └── setup.ts                         # Client test setup
└── apps/restaurant/src/__tests__/
    ├── api.test.ts                      # Restaurant API tests
    ├── e2e.test.ts                      # Restaurant E2E flows
    ├── screens.test.ts                  # Screen rendering tests
    └── setup.ts                         # Restaurant test setup
```

## Test Categories

### 1. Unit Tests (Component Level)

Unit tests validate individual component behavior, props, and rendering logic.

**Location:** `mobile/shared/components/__tests__/`

**Features:**
- Real component rendering simulation
- Prop validation (variants, sizes, states)
- Event handler testing
- Accessibility attribute validation
- Haptic feedback verification

**Example - Button.test.tsx:**
```typescript
describe('Button Component', () => {
  it('should compute correct properties for primary variant', () => {
    const behavior = getButtonBehavior({ children: 'Test', variant: 'primary' });
    expect(behavior.useGradient).toBe(true);
    expect(behavior.textColor).toBe('#FFFFFF');
  });

  it('should be disabled when loading', () => {
    const behavior = getButtonBehavior({ children: 'Test', loading: true });
    expect(behavior.isDisabled).toBe(true);
    expect(behavior.showLoading).toBe(true);
  });
});
```

### 2. Integration Tests (API Level)

Integration tests use **Mock Service Worker (MSW)** to intercept HTTP requests and validate API contracts.

**Location:** `mobile/shared/__tests__/`

**Features:**
- Real HTTP request interception
- Request payload validation
- Response structure verification
- Error handling scenarios
- Authentication flow testing

**Example - api-integration.test.ts:**
```typescript
describe('API Integration: Reservations', () => {
  it('should create reservation with valid data', async () => {
    const { status, data } = await apiClient.createReservation({
      restaurant_id: 'rest-123',
      date: '2024-01-20',
      time: '19:00',
      party_size: 4,
    });
    
    expect(status).toBe(200);
    expect(data.status).toBe('confirmed');
  });
});
```

### 3. E2E Tests (Flow Level)

End-to-end tests validate complete user journeys across multiple screens and API calls.

**Location:** `mobile/apps/*/src/__tests__/e2e.test.ts`

**Features:**
- Complete user flow simulation
- Multi-step journey validation
- State management verification
- Payment flow testing
- Reservation guest invitation flows

### 4. Accessibility Tests

Tests for WCAG compliance and assistive technology support.

**Location:** `mobile/shared/components/__tests__/Accessibility.test.tsx`

**Coverage:**
- Screen reader announcements
- Color contrast ratios (4.5:1 minimum)
- Touch target sizes (44x44 minimum)
- Focus management
- Keyboard navigation
- ARIA attributes

### 5. Error Handling Tests

Tests for error boundaries, network errors, and graceful degradation.

**Location:** `mobile/shared/components/__tests__/ErrorHandling.test.tsx`

**Coverage:**
- Error boundary behavior
- Network error classification (timeout, 4xx, 5xx)
- Automatic retry mechanisms with exponential backoff
- Graceful degradation for offline mode
- Sentry integration for error reporting

### 6. Performance Tests

Tests for render optimization, memory leaks, and animation performance.

**Location:** `mobile/shared/components/__tests__/Performance.test.tsx`

**Coverage:**
- Render performance (16ms budget for 60fps)
- List virtualization (FlatList optimization)
- Memory leak prevention (cleanup on unmount)
- Animation configuration (native driver usage)
- Image optimization (lazy loading, caching)
- Bundle size analysis

### 7. Validation Tests

Tests for Zod schema validation across all form inputs.

**Location:** `mobile/shared/validation/__tests__/schemas.test.ts`

**Schemas Tested:**
| Schema | Validations |
|--------|-------------|
| `loginSchema` | Email format, password length |
| `registerSchema` | Name, email, password requirements |
| `createReservationSchema` | Party size (1-20), date, time |
| `addOrderItemSchema` | Quantity limits (1-99) |
| `splitPaymentSchema` | Participant requirements (min 2) |
| `reviewSchema` | Rating (1-5), comment length |
| `menuItemSchema` | Price (positive), name required |

### 8. Utils Tests

Tests for utility functions with edge case coverage.

**Location:** `mobile/shared/utils/__tests__/`

**Coverage:**
| File | Tests |
|------|-------|
| `formatters.test.ts` | Multi-locale currency (BRL, USD, EUR), date formats |
| `error-handler.test.ts` | Error classification, toast generation |
| `logger.test.ts` | PII sanitization (email, phone, CPF), log levels |
| `deep-linking.test.ts` | URL parsing, route matching, parameter extraction |

### 9. Hooks Tests

Tests for custom React hooks with state and side effects.

**Location:** `mobile/shared/hooks/__tests__/`

**Coverage:**
| File | Tests |
|------|-------|
| `useAuth.test.ts` | Login/logout, session persistence, token refresh |
| `useWebSocket.test.ts` | Exponential backoff, room subscriptions, reconnection |
| `useOffline.test.ts` | Sync queue, cache TTL, auto-sync on reconnect |
| `useAnalytics.test.ts` | Event tracking, screen views, user properties |

### 10. Context Tests

Tests for React Context providers and consumers.

**Location:** `mobile/shared/contexts/__tests__/`

**Coverage:**
| File | Tests |
|------|-------|
| `ThemeContext.test.tsx` | Dark/light/system mode switching, persistence |
| `RestaurantContext.test.tsx` | RBAC roles, staff profiles, data caching |
| `CartContext.test.tsx` | Add/remove items, quantity updates, total calculation |

## Running Tests

### All Tests
```bash
cd mobile
npm run test
```

### Specific App
```bash
# Client App
cd mobile/apps/client
npx vitest run

# Restaurant App
cd mobile/apps/restaurant
npx vitest run

# Shared
cd mobile/shared
npx vitest run
```

### With Coverage
```bash
cd mobile
npm run test -- --coverage
```

### Watch Mode
```bash
cd mobile
npm run test -- --watch
```

### Specific Test File
```bash
npx vitest run src/components/__tests__/Button.test.tsx
```

## MSW Handlers

The project uses Mock Service Worker for realistic API mocking.

### Handler Categories

| Category | Endpoints | Purpose |
|----------|-----------|---------|
| `authHandlers` | login, register, refresh, logout | Authentication flows |
| `reservationHandlers` | create, fetch, invite, cancel | Booking management |
| `orderHandlers` | create, update, status, fetch | Order lifecycle |
| `paymentHandlers` | process, split, refund | Payment processing |

### Example Handler
```typescript
http.post(`${API_BASE}/auth/login`, async ({ request }) => {
  const body = await request.json();
  
  if (body.password === 'wrongpassword') {
    return HttpResponse.json(
      { statusCode: 401, message: 'Invalid credentials' },
      { status: 401 }
    );
  }
  
  return HttpResponse.json({
    access_token: 'mock_jwt_token',
    user: { id: 'user-123', email: body.email },
  });
});
```

## Regression Detection

The test suite is designed to catch regressions when code changes:

| Change Type | Detection Method |
|-------------|------------------|
| Button color change | Variant color assertions |
| Height/size changes | Dimension assertions |
| API payload changes | MSW handler validation |
| Validation rules | Zod schema tests |
| Haptic mapping | Haptic type assertions |
| Accessibility | ARIA attribute validation |
| Performance | Render time budgets |

## Coverage Thresholds

The project enforces minimum 95% coverage:

```javascript
// vitest.config.ts
coverageThreshold: {
  global: {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95,
  },
}
```

## Best Practices

### Writing Tests

1. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should add item to cart', () => {
     // Arrange
     const item = { id: '1', name: 'Pizza', price: 25.00 };
     
     // Act
     addToCart(item);
     
     // Assert
     expect(cart.items).toContain(item);
   });
   ```

2. **Test Behavior, Not Implementation**
   - Focus on what the component does, not how it does it
   - Avoid testing internal state directly

3. **Use Meaningful Test Names**
   ```typescript
   // Good
   it('should display error message when login fails with invalid credentials')
   
   // Bad
   it('test error')
   ```

4. **Keep Tests Independent**
   - Each test should set up its own state
   - Use beforeEach for common setup
   - Clean up after tests

### Maintenance

When adding new features, ensure:

1. Unit tests for new components
2. API handler updates for new endpoints
3. E2E tests for new user flows
4. Validation schema tests for new forms
5. Accessibility tests for interactive elements

---

# Portugues

## Visao Geral

O Project Okinawa implementa uma arquitetura abrangente de **Testes Comportamentais** com **850+ testes** alcancando **95%+ de cobertura** em todos os modulos principais.

### Resumo de Testes

| Categoria | Arquivos | Testes | Cobertura |
|-----------|----------|--------|-----------|
| Componentes Compartilhados | 7 | 180+ | 95%+ |
| Servicos Compartilhados | 4 | 75+ | 95%+ |
| Validacao Compartilhada | 1 | 28+ | 100% |
| Integracao Compartilhada | 3 | 50+ | 95%+ |
| Utils Compartilhados | 4 | 150+ | 95%+ |
| Hooks Compartilhados | 4 | 120+ | 95%+ |
| Contextos Compartilhados | 3 | 80+ | 95%+ |
| App Cliente | 3 | 85+ | 90%+ |
| App Restaurante | 3 | 85+ | 90%+ |
| **Total** | **32** | **850+** | **95%+** |

## Stack Tecnologica

| Ferramenta | Proposito |
|------------|-----------|
| Vitest | Runner e framework de testes |
| @testing-library/react-native | Testes de componentes |
| Mock Service Worker (MSW) | Mock de APIs |
| Zod | Testes de validacao de schema |

## Arquitetura

```
mobile/
├── shared/
│   ├── __tests__/
│   │   ├── api-integration.test.ts      # Testes de API com MSW
│   │   ├── AdvancedIntegration.test.ts  # WebSocket, offline, sync
│   │   ├── integration.test.ts          # Testes basicos de contrato
│   │   └── msw-handlers.ts              # Handlers do Mock Service Worker
│   ├── components/__tests__/
│   │   ├── Button.test.tsx              # Testes de comportamento do Button
│   │   ├── Input.test.tsx               # Testes de comportamento do Input
│   │   ├── Accessibility.test.tsx       # Testes de conformidade WCAG
│   │   ├── ErrorHandling.test.tsx       # Testes de error boundary
│   │   ├── Performance.test.tsx         # Testes de performance
│   │   ├── components.test.ts           # Testes de estrutura de componentes
│   │   └── setup.ts                     # Configuracao de testes
│   ├── services/__tests__/
│   │   ├── api.test.ts                  # Testes de servico de API
│   │   ├── auth.test.ts                 # Testes de servico de autenticacao
│   │   ├── storage.test.ts              # Testes de servico de storage
│   │   └── socket.test.ts               # Testes de servico WebSocket
│   ├── utils/__tests__/
│   │   ├── formatters.test.ts           # Formatadores de moeda/data
│   │   ├── error-handler.test.ts        # Classificacao de erros
│   │   ├── logger.test.ts               # Sanitizacao PII, niveis de log
│   │   └── deep-linking.test.ts         # Parsing de URL, roteamento
│   ├── hooks/__tests__/
│   │   ├── useAuth.test.ts              # Hooks de autenticacao
│   │   ├── useWebSocket.test.ts         # Hooks de WebSocket
│   │   ├── useOffline.test.ts           # Hooks de sync offline
│   │   └── useAnalytics.test.ts         # Hooks de analytics
│   ├── contexts/__tests__/
│   │   ├── CartContext.test.tsx         # Testes de contexto de carrinho
│   │   ├── ThemeContext.test.tsx        # Testes de troca de tema
│   │   └── RestaurantContext.test.tsx   # Testes de contexto de restaurante
│   └── validation/__tests__/
│       └── schemas.test.ts              # Testes de schemas Zod
├── apps/client/src/__tests__/
│   ├── api.test.ts                      # Testes de API do cliente
│   ├── e2e.test.ts                      # Fluxos E2E do cliente
│   ├── screens.test.ts                  # Testes de renderizacao de telas
│   └── setup.ts                         # Configuracao de testes do cliente
└── apps/restaurant/src/__tests__/
    ├── api.test.ts                      # Testes de API do restaurante
    ├── e2e.test.ts                      # Fluxos E2E do restaurante
    ├── screens.test.ts                  # Testes de renderizacao de telas
    └── setup.ts                         # Configuracao de testes do restaurante
```

## Categorias de Testes

### 1. Testes Unitarios (Nivel de Componente)

Testes unitarios validam comportamento individual de componentes, props e logica de renderizacao.

**Localizacao:** `mobile/shared/components/__tests__/`

**Caracteristicas:**
- Simulacao de renderizacao real de componentes
- Validacao de props (variantes, tamanhos, estados)
- Teste de event handlers
- Validacao de atributos de acessibilidade
- Verificacao de feedback haptico

### 2. Testes de Integracao (Nivel de API)

Testes de integracao usam **Mock Service Worker (MSW)** para interceptar requisicoes HTTP e validar contratos de API.

**Localizacao:** `mobile/shared/__tests__/`

**Caracteristicas:**
- Interceptacao real de requisicoes HTTP
- Validacao de payload de requisicoes
- Verificacao de estrutura de respostas
- Cenarios de tratamento de erros
- Teste de fluxo de autenticacao

### 3. Testes E2E (Nivel de Fluxo)

Testes end-to-end validam jornadas completas do usuario atraves de multiplas telas e chamadas de API.

**Localizacao:** `mobile/apps/*/src/__tests__/e2e.test.ts`

**Caracteristicas:**
- Simulacao de fluxo completo do usuario
- Validacao de jornada multi-step
- Verificacao de gerenciamento de estado
- Teste de fluxo de pagamento
- Fluxos de convite de convidados para reservas

### 4. Testes de Acessibilidade

Testes para conformidade WCAG e suporte a tecnologias assistivas.

**Localizacao:** `mobile/shared/components/__tests__/Accessibility.test.tsx`

**Cobertura:**
- Anuncios para leitores de tela
- Proporcoes de contraste de cores (minimo 4.5:1)
- Tamanhos de touch target (minimo 44x44)
- Gerenciamento de foco
- Navegacao por teclado
- Atributos ARIA

### 5. Testes de Tratamento de Erros

Testes para error boundaries, erros de rede e degradacao graceful.

**Localizacao:** `mobile/shared/components/__tests__/ErrorHandling.test.tsx`

**Cobertura:**
- Comportamento de error boundary
- Classificacao de erros de rede (timeout, 4xx, 5xx)
- Mecanismos de retry automatico com backoff exponencial
- Degradacao graceful para modo offline
- Integracao com Sentry para relatorio de erros

### 6. Testes de Performance

Testes para otimizacao de renderizacao, memory leaks e performance de animacoes.

**Localizacao:** `mobile/shared/components/__tests__/Performance.test.tsx`

**Cobertura:**
- Performance de renderizacao (budget de 16ms para 60fps)
- Virtualizacao de listas (otimizacao FlatList)
- Prevencao de memory leaks (cleanup no unmount)
- Configuracao de animacoes (uso de native driver)
- Otimizacao de imagens (lazy loading, caching)
- Analise de tamanho de bundle

### 7. Testes de Validacao

Testes para validacao de schemas Zod em todas as entradas de formulario.

**Localizacao:** `mobile/shared/validation/__tests__/schemas.test.ts`

**Schemas Testados:**
| Schema | Validacoes |
|--------|------------|
| `loginSchema` | Formato de email, tamanho de senha |
| `registerSchema` | Nome, email, requisitos de senha |
| `createReservationSchema` | Tamanho do grupo (1-20), data, horario |
| `addOrderItemSchema` | Limites de quantidade (1-99) |
| `splitPaymentSchema` | Requisitos de participantes (min 2) |
| `reviewSchema` | Rating (1-5), tamanho do comentario |
| `menuItemSchema` | Preco (positivo), nome obrigatorio |

### 8. Testes de Utils

Testes para funcoes utilitarias com cobertura de casos de borda.

**Localizacao:** `mobile/shared/utils/__tests__/`

**Cobertura:**
| Arquivo | Testes |
|---------|--------|
| `formatters.test.ts` | Moeda multi-locale (BRL, USD, EUR), formatos de data |
| `error-handler.test.ts` | Classificacao de erros, geracao de toast |
| `logger.test.ts` | Sanitizacao PII (email, telefone, CPF), niveis de log |
| `deep-linking.test.ts` | Parsing de URL, matching de rotas, extracao de parametros |

### 9. Testes de Hooks

Testes para hooks React customizados com estado e efeitos colaterais.

**Localizacao:** `mobile/shared/hooks/__tests__/`

**Cobertura:**
| Arquivo | Testes |
|---------|--------|
| `useAuth.test.ts` | Login/logout, persistencia de sessao, refresh de token |
| `useWebSocket.test.ts` | Backoff exponencial, inscricoes em rooms, reconexao |
| `useOffline.test.ts` | Fila de sync, TTL de cache, auto-sync ao reconectar |
| `useAnalytics.test.ts` | Rastreamento de eventos, visualizacoes de tela, propriedades de usuario |

### 10. Testes de Contexto

Testes para providers e consumers de React Context.

**Localizacao:** `mobile/shared/contexts/__tests__/`

**Cobertura:**
| Arquivo | Testes |
|---------|--------|
| `ThemeContext.test.tsx` | Troca de modo dark/light/system, persistencia |
| `RestaurantContext.test.tsx` | Papeis RBAC, perfis de staff, cache de dados |
| `CartContext.test.tsx` | Adicionar/remover itens, atualizacao de quantidade, calculo de total |

## Executando Testes

### Todos os Testes
```bash
cd mobile
npm run test
```

### App Especifico
```bash
# Client App
cd mobile/apps/client
npx vitest run

# Restaurant App
cd mobile/apps/restaurant
npx vitest run

# Shared
cd mobile/shared
npx vitest run
```

### Com Cobertura
```bash
cd mobile
npm run test -- --coverage
```

### Modo Watch
```bash
cd mobile
npm run test -- --watch
```

### Arquivo de Teste Especifico
```bash
npx vitest run src/components/__tests__/Button.test.tsx
```

## Handlers MSW

O projeto usa Mock Service Worker para mock realistico de API.

### Categorias de Handlers

| Categoria | Endpoints | Proposito |
|-----------|-----------|-----------|
| `authHandlers` | login, register, refresh, logout | Fluxos de autenticacao |
| `reservationHandlers` | create, fetch, invite, cancel | Gestao de reservas |
| `orderHandlers` | create, update, status, fetch | Ciclo de vida de pedidos |
| `paymentHandlers` | process, split, refund | Processamento de pagamentos |

## Deteccao de Regressao

A suite de testes e projetada para detectar regressoes quando o codigo muda:

| Tipo de Mudanca | Metodo de Deteccao |
|-----------------|-------------------|
| Mudanca de cor de botao | Assertions de cor de variante |
| Mudancas de altura/tamanho | Assertions de dimensao |
| Mudancas de payload de API | Validacao de handler MSW |
| Regras de validacao | Testes de schema Zod |
| Mapeamento de haptic | Assertions de tipo de haptic |
| Acessibilidade | Validacao de atributo ARIA |
| Performance | Budgets de tempo de render |

## Limites de Cobertura

O projeto exige cobertura minima de 95%:

```javascript
// vitest.config.ts
coverageThreshold: {
  global: {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95,
  },
}
```

## Boas Praticas

### Escrevendo Testes

1. **Padrao Arrange-Act-Assert**
   ```typescript
   it('should add item to cart', () => {
     // Arrange
     const item = { id: '1', name: 'Pizza', price: 25.00 };
     
     // Act
     addToCart(item);
     
     // Assert
     expect(cart.items).toContain(item);
   });
   ```

2. **Teste Comportamento, Nao Implementacao**
   - Foque no que o componente faz, nao como faz
   - Evite testar estado interno diretamente

3. **Use Nomes de Teste Significativos**
   ```typescript
   // Bom
   it('should display error message when login fails with invalid credentials')
   
   // Ruim
   it('test error')
   ```

4. **Mantenha Testes Independentes**
   - Cada teste deve configurar seu proprio estado
   - Use beforeEach para setup comum
   - Limpe apos os testes

### Manutencao

Ao adicionar novas features, garanta:

1. Testes unitarios para novos componentes
2. Atualizacoes de handlers de API para novos endpoints
3. Testes E2E para novos fluxos de usuario
4. Testes de schema de validacao para novos formularios
5. Testes de acessibilidade para elementos interativos

---

**Document Version:** 2.0
**Last Updated:** January 2026

**Versao do Documento:** 2.0
**Ultima Atualizacao:** Janeiro 2026
