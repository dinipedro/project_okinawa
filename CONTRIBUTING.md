# Contributing Guide

> **Bilingual Documentation** — This document is available in both English and Portuguese.
> **Documentação Bilíngue** — Este documento está disponível em inglês e português.

---

## Table of Contents

- [English](#english)
- [Português](#português)

---

# English

Thank you for your interest in contributing to Project Okinawa. This document provides guidelines and standards for contributing to the project.

## Code of Conduct

### Our Standards

Contributors are expected to:

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the project
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, trolling, or derogatory comments
- Public or private harassment
- Publishing others' private information
- Unprofessional conduct

Violations should be reported to the project maintainers. All complaints will be reviewed and addressed appropriately.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 20.x or higher
- npm 10.x or higher
- Docker and Docker Compose
- Git
- A code editor (VS Code recommended)
- Xcode (macOS, for iOS development)
- Android Studio (for Android development)

### Initial Setup

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/project-okinawa.git
   cd project_okinawa-1
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/pedrodini/project-okinawa.git
   ```

3. **Install Dependencies**
   ```bash
   # Root dependencies
   npm install

   # Backend dependencies
   cd backend && npm install

   # Mobile dependencies
   cd ../mobile && npm install
   ```

4. **Configure Environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your local configuration
   # ⚠️ Never commit .env files — they are in .gitignore
   ```

5. **Start Infrastructure**
   ```bash
   docker-compose up -d        # PostgreSQL + Redis
   npm run migration:run       # Run database migrations
   ```

6. **Verify Setup**
   ```bash
   npm run start:dev   # Backend should start without errors
   npm run test        # All tests should pass
   ```

## Development Environment

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "mikestead.dotenv",
    "ms-azuretools.vscode-docker"
  ]
}
```

### Editor Configuration

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start backend in development mode |
| `npm run start:debug` | Start backend with debugger |
| `npm run build` | Build production bundle |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run migration:generate` | Generate new migration |
| `npm run migration:run` | Run pending migrations |

## Project Architecture

### Directory Structure

```
project_okinawa-1/
├── backend/                    # NestJS Backend (26 modules)
│   ├── src/
│   │   ├── common/            # @Global shared utilities
│   │   │   ├── cache/         # Redis CacheService
│   │   │   ├── decorators/    # @CurrentUser, @Roles, @Idempotent
│   │   │   ├── filters/       # GlobalExceptionFilter
│   │   │   ├── guards/        # JwtAuthGuard, RolesGuard, OwnershipGuard
│   │   │   ├── pipes/         # ValidationPipe config
│   │   │   ├── services/      # TranslationService, EmailService
│   │   │   ├── tracing/       # TracingModule (distributed tracing)
│   │   │   ├── logging/       # StructuredLoggerService, LoggingInterceptor
│   │   │   └── idempotency/   # IdempotencyService
│   │   ├── config/            # Configuration files
│   │   ├── modules/           # Feature modules
│   │   │   ├── identity/      # Canonical identity source
│   │   │   ├── auth/          # Authentication (depends on Identity)
│   │   │   ├── orders/        # Order lifecycle + helpers
│   │   │   ├── club/          # Nightlife (12 entities)
│   │   │   ├── tabs/          # Digital tab system
│   │   │   └── ...            # 21 more modules
│   │   └── migrations/        # Database migrations
│   └── test/                   # E2E tests
│
├── mobile/
│   ├── apps/
│   │   ├── client/            # Customer app (37 screens)
│   │   └── restaurant/        # Staff app (24 screens)
│   └── shared/                # Single source of truth for shared code
│       ├── services/api.ts    # ← All API calls centralized
│       ├── contexts/          # Auth, Cart, Restaurant, ServiceType
│       └── validation/        # Zod schemas
│
└── docs/                       # Documentation
    ├── SERVICE_TYPES.md        # v3.0 — 11 service types specification
    └── PRODUCTION_CHECKLIST.md # Production readiness
```

### Key Architecture Concepts

1. **Identity Module is Canonical** — All credential management, token blacklisting, and audit logging goes through `IdentityModule` (global).

2. **Common Module provides Cross-Cutting Concerns** — `LoggingInterceptor` is DI-injected via `APP_INTERCEPTOR`; `TracingService` uses `StructuredLoggerService`.

3. **Process Isolation** — API (`main.ts`) and Worker (`worker.ts`) are separate processes with independent healthchecks.

4. **6-Tier RBAC** — OWNER > MANAGER > MAÎTRE > CHEF > WAITER > BARMAN. Navigation is dynamically restricted by role.

5. **26 Feature Flags** — `ServiceTypeContext` adapts UI/logic for 11 service types.

### Module Structure (Backend)

Each feature module follows this structure:

```
modules/feature/
├── dto/                    # Data Transfer Objects
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
├── entities/               # TypeORM entities
│   └── feature.entity.ts
├── helpers/                # Business logic helpers (Injectable)
├── feature.controller.ts   # HTTP endpoints
├── feature.service.ts      # Business logic
├── feature.module.ts       # Module definition
├── feature.gateway.ts      # WebSocket gateway (if needed)
├── feature.controller.spec.ts
└── feature.service.spec.ts
```

### Screen Structure (Mobile)

```
screens/feature/
├── FeatureScreen.tsx       # Main screen component
├── components/             # Screen-specific components
├── hooks/                  # Screen-specific hooks
└── styles.ts               # Styled components (if used)
```

## Coding Standards

### TypeScript

1. **Use Strict Mode** — `"strict": true` in tsconfig
2. **Explicit Types** — No `any` (use `unknown` if truly unknown)
3. **Use Interfaces for Objects**

```typescript
// ✅ Good
function getUser(id: string): Promise<User> {
  return this.userRepository.findOne({ where: { id } });
}

// ❌ Avoid
function getUser(id: any): any { ... }
```

### NestJS Conventions

1. **Dependency Injection** — Always use constructor injection
2. **DTO Validation** — Use class-validator with `whitelist: true`
3. **Controller Patterns** — Swagger decorators on all endpoints
4. **Structured Logging** — Use `StructuredLoggerService`; never use `console.log` in production code

```typescript
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly logger: StructuredLoggerService,
  ) {}
}
```

### React Native Conventions

1. **Functional Components** with typed props
2. **Custom Hooks** for business logic (`useAuth`, `useSocket`)
3. **Error Handling** with React Query's `onError`

### Design System

1. **Use Theme Colors** — Never hardcode colors

```tsx
// ✅ Good (Mobile)
<View style={{ backgroundColor: theme.colors.primary }} />

// ❌ Avoid
<View style={{ backgroundColor: '#FF6B35' }} />
```

2. **Use Semantic Design Tokens (Web/Preview)**

```tsx
// ❌ NEVER use hardcoded colors
<div className="bg-white text-black" />

// ✅ ALWAYS use semantic tokens
<div className="bg-background text-foreground" />
<div className="bg-card border-border" />
<div className="text-muted-foreground" />
```

3. **Required Token Categories**

| Category | Examples |
|----------|----------|
| Backgrounds | `bg-background`, `bg-card`, `bg-muted` |
| Text | `text-foreground`, `text-muted-foreground`, `text-primary` |
| Borders | `border-border`, `border-input` |
| Status | `text-success`, `text-warning`, `text-destructive` |

4. **Use React Native Paper Components** for mobile

## Git Workflow

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/order-tracking` |
| Bug Fix | `fix/description` | `fix/payment-validation` |
| Hotfix | `hotfix/description` | `hotfix/auth-crash` |
| Refactor | `refactor/description` | `refactor/order-service` |
| Documentation | `docs/description` | `docs/api-readme` |
| Chore | `chore/description` | `chore/update-deps` |

### Branch Flow

```
main (production)
  └── develop (staging)
       ├── feature/order-tracking
       ├── fix/payment-bug
       └── refactor/auth-module
```

### Creating a Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name

# Work on your changes...

git push origin feature/your-feature-name
```

## Commit Conventions

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Build, CI, dependencies |
| `security` | Security-related changes |

### Scopes

| Scope | Description |
|-------|-------------|
| `backend` | Backend API changes |
| `client` | Client mobile app |
| `restaurant` | Restaurant mobile app |
| `identity` | Identity module |
| `auth` | Authentication module |
| `orders` | Orders module |
| `club` | Club/nightlife module |
| `payments` | Payments module |
| `ui` | UI components |
| `db` | Database changes |
| `ci` | CI/CD changes |

### Examples

```bash
feat(orders): add real-time order tracking

Implement WebSocket connection for live order status updates.
Includes KDS notification when order is ready.

Closes #123

---

fix(auth): resolve token refresh race condition

Prevent multiple simultaneous refresh requests that could
cause authentication failures.

---

security(identity): enforce bcrypt cost 12 for all password hashing
```

### Commit Guidelines

1. **Atomic Commits**: Each commit = one logical change
2. **Present Tense**: Use "add" not "added"
3. **Imperative Mood**: Use "fix" not "fixes"
4. **No Period**: Don't end subject line with a period
5. **72 Characters**: Keep subject line under 72 characters
6. **Reference Issues**: Include issue numbers when applicable

## Pull Request Process

### Before Creating a PR

1. **Run Tests**: `npm run test` — all must pass
2. **Check Linting**: `npm run lint` — no warnings
3. **Build Successfully**: `npm run build` — clean build
4. **Run Security Check**: `npm audit` — no high/critical
5. **Update Documentation** if needed

### PR Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that changes existing functionality)
- [ ] Security fix (addresses a vulnerability)
- [ ] Documentation update

## Changes Made
- List specific changes made
- Be detailed and clear

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass (if applicable)
- [ ] Manual testing performed
- [ ] Security check clean (`npm audit`)

## Screenshots (if UI changes)
Add screenshots here.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review performed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests added for new functionality
- [ ] No console.log in production code (use StructuredLoggerService)
- [ ] Uses semantic design tokens (no hardcoded colors)

## Related Issues
Closes #123
```

### PR Guidelines

1. **Small, Focused PRs**: One feature or fix per PR
2. **Clear Title**: Use conventional commit format
3. **Detailed Description**: Explain what, why, and how
4. **Screenshots**: Include for any UI changes
5. **Test Coverage**: Add tests for new functionality (95%+ for new code)
6. **No Conflicts**: Resolve merge conflicts before review

### Review Process

1. Request review from at least one maintainer
2. Address all review comments
3. Re-request review after changes
4. Squash commits if requested
5. Wait for approval before merging

## Testing Guidelines

### Unit Tests

```typescript
describe('OrdersService', () => {
  let service: OrdersService;
  let repository: MockType<Repository<Order>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get(OrdersService);
    repository = module.get(getRepositoryToken(Order));
  });

  it('should create an order', async () => {
    const dto = { restaurantId: 'uuid', items: [] };
    const expected = { id: 'uuid', ...dto };
    repository.save.mockResolvedValue(expected);

    const result = await service.create(dto);
    expect(result).toEqual(expected);
  });
});
```

### E2E Tests

```typescript
describe('Orders (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = response.body.accessToken;
  });

  it('should create order', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ restaurantId: 'uuid', items: [] })
      .expect(201);
  });

  it('should require authentication', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .send({})
      .expect(401);
  });
});
```

### Test Coverage Requirements

- Minimum **95% coverage** for new code
- All public methods should have tests
- Edge cases and error scenarios covered
- Integration tests for critical flows

## Documentation

### Code Documentation

```typescript
/**
 * Creates a new order for the specified restaurant.
 *
 * @param dto - Order creation data transfer object
 * @param user - Authenticated user creating the order
 * @returns The created order with all items
 * @throws NotFoundException if restaurant doesn't exist
 * @throws BadRequestException if menu items are invalid
 */
async create(dto: CreateOrderDto, user: User): Promise<Order> {
  // Implementation
}
```

### API Documentation

Use Swagger decorators for API documentation (disabled in production):

```typescript
@Post()
@ApiOperation({ summary: 'Create new order' })
@ApiBody({ type: CreateOrderDto })
@ApiResponse({ status: 201, type: Order })
@ApiResponse({ status: 401, description: 'Unauthorized' })
async create(@Body() dto: CreateOrderDto): Promise<Order> {}
```

## Review Checklist

### For Reviewers

1. **Code Quality** — Standards compliance, no unnecessary complexity
2. **Security** — No secrets, input validation, authorization checks
3. **Performance** — No N+1 queries, appropriate caching
4. **Testing** — Adequate coverage (95%+), edge cases, meaningful tests
5. **Documentation** — Self-documenting code, complex logic explained
6. **Design System** — Semantic tokens, no hardcoded colors

### Providing Feedback

- Be constructive and specific
- Suggest improvements, don't just criticize
- Explain reasoning behind suggestions
- Use "nit:" prefix for minor suggestions
- Approve when satisfied, request changes when necessary

## Questions and Support

- Open an issue for questions
- Tag issues appropriately
- Check existing issues before creating new ones
- Join discussions on pull requests

## License

By contributing to Project Okinawa, you agree that your contributions will be subject to the project's proprietary license. All intellectual property rights for contributions will transfer to the project owner.

---

# Português

Obrigado pelo seu interesse em contribuir para o Project Okinawa. Este documento fornece diretrizes e padrões para contribuir com o projeto.

## Código de Conduta

### Nossos Padrões

- Usar linguagem acolhedora e inclusiva
- Respeitar pontos de vista diferentes
- Aceitar críticas construtivas
- Focar no melhor para o projeto

## Começando

### Pré-requisitos

- Node.js 20.x+, npm 10.x+, Docker, Git, VS Code
- Xcode (iOS), Android Studio (Android)

### Setup Inicial

```bash
git clone https://github.com/SEU_USUARIO/project-okinawa.git
cd project_okinawa-1
git remote add upstream https://github.com/pedrodini/project-okinawa.git

# Instalar dependências
npm install
cd backend && npm install
cd ../mobile && npm install

# Configurar ambiente
cd backend && cp .env.example .env  # ⚠️ Nunca commite .env

# Infraestrutura
docker-compose up -d
npm run migration:run

# Verificar
npm run start:dev
npm run test
```

### Scripts de Desenvolvimento

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Iniciar backend em modo desenvolvimento |
| `npm run start:debug` | Iniciar com debugger |
| `npm run build` | Build para produção |
| `npm run test` | Executar testes unitários |
| `npm run test:cov` | Testes com cobertura |
| `npm run test:e2e` | Testes end-to-end |
| `npm run lint` | Executar ESLint |
| `npm run migration:run` | Executar migrations pendentes |

## Conceitos Chave da Arquitetura

1. **Módulo Identity é Canônico** — Toda gestão de credenciais, blacklisting de tokens e auditoria passa pelo `IdentityModule` (global).

2. **Módulo Common para Cross-Cutting** — `LoggingInterceptor` é DI-injected via `APP_INTERCEPTOR`; `TracingService` usa `StructuredLoggerService`.

3. **Isolamento de Processo** — API (`main.ts`) e Worker (`worker.ts`) são processos separados.

4. **RBAC 6 Níveis** — OWNER > MANAGER > MAÎTRE > CHEF > WAITER > BARMAN.

5. **26 Feature Flags** — `ServiceTypeContext` adapta UI/lógica para 11 tipos de serviço.

## Padrões de Código

### TypeScript

- Modo estrito (`"strict": true`)
- Tipos explícitos (nunca `any`)
- Use `StructuredLoggerService` — **nunca** `console.log` em código de produção

### NestJS

- Injeção de dependência via construtor
- Validação com DTOs e class-validator (`whitelist: true`)
- Decorators Swagger em todos os endpoints

### React Native

- Componentes funcionais com props tipadas
- Custom hooks para lógica de negócio
- Tratamento de erros com React Query

### Design System

- **Mobile**: Use cores do tema (`theme.colors.primary`)
- **Web/Preview**: Use tokens semânticos (`bg-background`, `text-foreground`)
- **Nunca** use cores hardcoded (`bg-white`, `#FF6B35`)

## Fluxo Git

### Nomenclatura de Branches

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Feature | `feature/descrição` | `feature/rastreamento-pedidos` |
| Bug Fix | `fix/descrição` | `fix/validação-pagamento` |
| Hotfix | `hotfix/descrição` | `hotfix/crash-auth` |
| Security | `security/descrição` | `security/csrf-hardening` |

### Fluxo

```
main (produção)
  └── develop (staging)
       ├── feature/rastreamento-pedidos
       ├── fix/bug-pagamento
       └── security/csrf-hardening
```

## Convenções de Commit

### Formato

```
<tipo>(<escopo>): <assunto>
```

### Tipos

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Mudanças de documentação |
| `refactor` | Refatoração |
| `test` | Testes |
| `security` | Mudanças de segurança |
| `chore` | Build, CI, dependências |

### Exemplos

```bash
feat(orders): adicionar rastreamento em tempo real
fix(auth): resolver race condition no refresh de token
security(identity): aplicar bcrypt custo 12 em todo hashing de senha
```

## Processo de Pull Request

### Antes de Criar um PR

1. Testes passam: `npm run test`
2. Linting limpo: `npm run lint`
3. Build funciona: `npm run build`
4. Check de segurança limpo: `npm audit`
5. Documentação atualizada

### Checklist do PR

- [ ] Código segue padrões do projeto
- [ ] Self-review realizado
- [ ] Testes adicionados para novas funcionalidades
- [ ] Sem `console.log` em código de produção
- [ ] Usa tokens semânticos de design (sem cores hardcoded)
- [ ] Documentação atualizada
- [ ] `npm audit` limpo

### Requisitos de Cobertura

- Mínimo **95%** para código novo
- Todos os métodos públicos testados
- Casos de borda cobertos
- Testes de integração para fluxos críticos

## Licença

Ao contribuir para o Project Okinawa, você concorda que suas contribuições estarão sujeitas à licença proprietária do projeto.

---

**Document Version:** 3.1
**Last Updated:** February 2025

**Versão do Documento:** 3.1
**Última Atualização:** Fevereiro 2025

**Built with ❤️ by the Project Okinawa team**
