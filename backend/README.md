# 🍱 Project Okinawa - Backend API

Backend API construído com NestJS para a plataforma de tecnologia para restaurantes.

## 📋 Índice

- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Desenvolvimento](#desenvolvimento)
- [Testes](#testes)
- [Deploy](#deploy)
- [Documentação da API](#documentação-da-api)

## 🛠️ Stack Tecnológica

- **Runtime**: Node.js 20+
- **Framework**: NestJS 10.x
- **Linguagem**: TypeScript 5.x
- **Database**: PostgreSQL 16+
- **ORM**: TypeORM 0.3.x
- **Cache**: Redis 7+
- **WebSocket**: Socket.IO 4.x
- **Queue**: Bull 4.x
- **Auth**: Passport + JWT
- **Validation**: class-validator
- **Documentation**: Swagger 8.x

## 📦 Pré-requisitos

- Node.js >= 20.0.0
- Docker & Docker Compose
- PostgreSQL 16+ (se não usar Docker)
- Redis 7+ (se não usar Docker)

## 🚀 Instalação

### 1. Clone e instale dependências

```bash
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

### 3. Inicie os serviços com Docker

```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- Backend (porta 3000)

### 4. Execute as migrations

```bash
npm run migration:run
```

### 5. (Opcional) Popule o banco com dados de teste

```bash
npm run seed
```

## 💻 Desenvolvimento

### Iniciar servidor de desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em: `http://localhost:3000/api/v1`

### Scripts disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Inicia com watch mode
npm run start:debug        # Inicia em modo debug

# Build
npm run build              # Build de produção

# Testes
npm run test               # Testes unitários
npm run test:watch         # Testes em watch mode
npm run test:cov           # Testes com coverage
npm run test:e2e           # Testes E2E

# Linting
npm run lint               # ESLint
npm run format             # Prettier

# Database
npm run migration:generate # Gera nova migration
npm run migration:run      # Executa migrations
npm run migration:revert   # Reverte última migration
npm run seed               # Popula banco com dados de teste
```

### Ferramentas de desenvolvimento

Com `docker-compose up -d`, você tem acesso a:

- **PgAdmin**: http://localhost:5050
  - Email: admin@okinawa.com
  - Senha: admin

- **Redis Commander**: http://localhost:8081

Para iniciar essas ferramentas:

```bash
docker-compose --profile tools up -d
```

## 📚 Documentação da API

A documentação Swagger está disponível em:

```
http://localhost:3000/docs
```

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts           # Root module
│   ├── common/                 # Shared code
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/                 # Configurations
│   │   ├── typeorm.config.ts
│   │   ├── redis.config.ts
│   │   └── swagger.config.ts
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   └── modules/                # Feature modules
│       ├── auth/
│       ├── identity/           # Credential & MFA management (AUDIT-010)
│       ├── users/
│       ├── restaurants/
│       ├── orders/
│       ├── reservations/
│       ├── payments/           # Split payment support (4 modes)
│       └── ...
├── test/                       # E2E tests
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 🆕 Recent Updates (v2.1.0)

### Identity Module (AUDIT-010)
- Separated identity concerns from authentication
- Credential service for password storage/validation
- MFA/TOTP support
- Token blacklisting with JTI
- Audit logging
- Password policy enforcement

### Payment Split System
- 4 split modes: Individual, Equal, Selective, Fixed Amount
- Guest-by-guest payment tracking
- Real-time status updates via WebSocket
- Secure tokenized payment processing

## 🔐 Autenticação

A API usa JWT para autenticação. Para acessar endpoints protegidos:

1. Faça login em `/api/v1/auth/login`
2. Receba o `access_token`
3. Inclua no header: `Authorization: Bearer {access_token}`

### OAuth Providers

Suporte para login via:
- Google
- Apple
- Microsoft

## 🔄 WebSocket

Namespaces Socket.IO disponíveis:

- `/orders` - Atualizações de pedidos em tempo real
- `/reservations` - Atualizações de reservas
- `/notifications` - Notificações push
- `/queues` - Fila virtual

Conexão:

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/orders', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('order:created', (data) => {
  console.log('New order:', data);
});
```

## 📊 Monitoramento

### Logs

Logs estruturados disponíveis via:
- Console (desenvolvimento)
- Arquivos (produção)
- Sentry (produção)

### Métricas

- Prometheus metrics em `/metrics`
- Dashboard Grafana configurado

### Health Check

```
GET /health
```

## 🧪 Testes

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚢 Deploy

### Build de produção

```bash
npm run build
npm run start:prod
```

### Docker

```bash
# Build image
docker build -t okinawa-backend .

# Run container
docker run -p 3000:3000 --env-file .env okinawa-backend
```

### CI/CD

Pipeline automatizado via GitHub Actions:
- Lint & type check
- Tests
- Build
- Deploy

## 🔒 Segurança

- Helmet.js para headers HTTP seguros
- Rate limiting (100 req/min por IP)
- CORS configurado
- Validação de dados em todas as camadas
- SQL injection prevention via TypeORM
- XSS protection
- JWT com refresh tokens

## 📝 Convenções de Código

- **Commits**: Conventional Commits
- **Branches**: GitFlow
- **Code Style**: ESLint + Prettier
- **TypeScript**: Strict mode
- **Design Tokens**: Semantic tokens required for UI

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](../CONTRIBUTING.md)

## 📄 Licença

MIT

---

**Version:** 2.1.0
**Last Updated:** February 2025

**Desenvolvido com ❤️ pela equipe Project Okinawa**
