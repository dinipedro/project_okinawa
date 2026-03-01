# Testing Checklist

Complete checklist for configuring, testing, and deploying Project Okinawa.

---

## Table of Contents

1. [Pending Configurations](#pending-configurations)
2. [Environment Variables](#environment-variables)
3. [Simulator Testing (iOS)](#simulator-testing-ios)
4. [Simulator Testing (Android)](#simulator-testing-android)
5. [Backend Testing](#backend-testing)
6. [Online/Production Deployment](#onlineproduction-deployment)
7. [Pre-Launch Verification](#pre-launch-verification)

---

## Pending Configurations

### Backend Configuration

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| PostgreSQL database setup | [ ] | HIGH | Required for all operations |
| Redis server setup | [ ] | HIGH | Required for caching and queues |
| JWT secret keys generation | [ ] | HIGH | Use strong random values |
| CORS configuration | [ ] | HIGH | Configure for mobile app domains |
| Rate limiting setup | [ ] | MEDIUM | Configure throttle limits |
| Swagger documentation | [ ] | LOW | Enable in development |

### Third-Party Services

| Service | Status | Priority | Notes |
|---------|--------|----------|-------|
| Google OAuth credentials | [ ] | HIGH | For social login |
| Apple Sign-In configuration | [ ] | HIGH | For iOS social login |
| Asaas payment gateway | [ ] | HIGH | For payments in Brazil |
| AWS S3 bucket | [ ] | MEDIUM | For image uploads |
| SendGrid account | [ ] | MEDIUM | For email notifications |
| AWS SNS setup | [ ] | MEDIUM | For SMS notifications |
| Firebase Cloud Messaging | [ ] | MEDIUM | For push notifications |
| Sentry project | [ ] | LOW | For error tracking |
| OpenAI API access | [ ] | LOW | For AI features |

### Mobile Configuration

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| Expo account setup | [ ] | HIGH | Required for builds |
| EAS project ID | [ ] | HIGH | Configure in app.json |
| iOS Bundle Identifier | [ ] | HIGH | com.okinawa.client / com.okinawa.restaurant |
| Android Package Name | [ ] | HIGH | com.okinawa.client / com.okinawa.restaurant |
| App icons and splash screens | [ ] | MEDIUM | Create all required sizes |
| Push notification certificates | [ ] | MEDIUM | iOS APNs and Android FCM |
| Deep linking configuration | [ ] | MEDIUM | Configure URL schemes |

### Database Configuration

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| Run all migrations | [ ] | HIGH | 16+ migrations available |
| Create admin user | [ ] | HIGH | System administrator |
| Seed initial data | [ ] | MEDIUM | Categories, sample data |
| Configure backup strategy | [ ] | MEDIUM | Automated backups |

---

## Environment Variables

### Backend (.env)

Create `/backend/.env` with the following variables:

```bash
# ===========================================
# APPLICATION
# ===========================================
NODE_ENV=development                    # development | staging | production
PORT=3000                               # Backend server port
API_PREFIX=api/v1                       # API route prefix

# ===========================================
# DATABASE (PostgreSQL)
# ===========================================
DATABASE_HOST=localhost                 # Database host
DATABASE_PORT=5432                      # Database port
DATABASE_USER=okinawa                   # Database username
DATABASE_PASSWORD=okinawa_dev_password  # Database password (CHANGE IN PRODUCTION)
DATABASE_NAME=okinawa                   # Database name
DATABASE_SYNCHRONIZE=false              # Never true in production
DATABASE_LOGGING=true                   # Enable SQL logging

# ===========================================
# REDIS
# ===========================================
REDIS_HOST=localhost                    # Redis host
REDIS_PORT=6379                         # Redis port
REDIS_PASSWORD=okinawa_redis_password   # Redis password (CHANGE IN PRODUCTION)
REDIS_DB=0                              # Redis database number

# ===========================================
# JWT AUTHENTICATION
# ===========================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d                       # Access token expiration
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=30d              # Refresh token expiration

# ===========================================
# GOOGLE OAUTH
# ===========================================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# ===========================================
# APPLE SIGN-IN
# ===========================================
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY=your-apple-private-key
APPLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/apple/callback

# ===========================================
# MICROSOFT OAUTH (Optional)
# ===========================================
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:3000/api/v1/auth/microsoft/callback

# ===========================================
# AWS S3 (Image Storage)
# ===========================================
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=okinawa-uploads

# ===========================================
# PAYMENT GATEWAY (Asaas)
# ===========================================
ASAAS_API_KEY=your-asaas-api-key
ASAAS_WEBHOOK_URL=http://localhost:3000/api/v1/webhooks/asaas
ASAAS_ENVIRONMENT=sandbox                # sandbox | production

# ===========================================
# AI SERVICES (Optional)
# ===========================================
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview
LOVABLE_API_KEY=your-lovable-api-key

# ===========================================
# FIREBASE (Push Notifications)
# ===========================================
FCM_SERVER_KEY=your-fcm-server-key
FCM_PROJECT_ID=your-firebase-project-id

# ===========================================
# SENDGRID (Email)
# ===========================================
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@okinawa.com
SENDGRID_FROM_NAME=Project Okinawa

# ===========================================
# AWS SNS (SMS)
# ===========================================
AWS_SNS_ACCESS_KEY=your-aws-sns-access-key
AWS_SNS_SECRET_KEY=your-aws-sns-secret-key
AWS_SNS_REGION=us-east-1

# ===========================================
# RATE LIMITING
# ===========================================
THROTTLE_TTL=60                         # Time window in seconds
THROTTLE_LIMIT=100                      # Max requests per window

# ===========================================
# CORS
# ===========================================
CORS_ORIGIN=http://localhost:8081,http://localhost:19000,http://localhost:19006
CORS_CREDENTIALS=true

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=debug                         # debug | info | warn | error
LOG_FORMAT=json                         # json | pretty

# ===========================================
# SENTRY (Error Tracking)
# ===========================================
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=development

# ===========================================
# SWAGGER
# ===========================================
SWAGGER_ENABLED=true
SWAGGER_TITLE=Project Okinawa API
SWAGGER_DESCRIPTION=Restaurant Technology Platform API
SWAGGER_VERSION=1.0
SWAGGER_PATH=docs
```

### Mobile Apps Configuration

Update `mobile/apps/client/app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

Update `mobile/apps/restaurant/app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

### API URL Configuration

Update API URL in `mobile/shared/services/api.ts` for production:

```typescript
const API_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://api.your-domain.com';  // Change to your production URL
```

---

## Simulator Testing (iOS)

### Prerequisites

- [ ] macOS computer
- [ ] Xcode installed (latest version)
- [ ] Xcode Command Line Tools installed
- [ ] iOS Simulator installed
- [ ] Node.js 18+ installed
- [ ] Watchman installed (`brew install watchman`)

### Step-by-Step Setup

#### 1. Install Xcode

```bash
# Install from App Store or download from developer.apple.com
# Open Xcode and accept license agreements
sudo xcodebuild -license accept

# Install Command Line Tools
xcode-select --install
```

#### 2. Start Backend Services

```bash
# Terminal 1: Start Docker services
cd /path/to/project_okinawa-1/backend
docker-compose up -d

# Verify services are running
docker ps

# Expected output:
# - postgres:16 on port 5432
# - redis:7 on port 6379
```

#### 3. Setup Backend

```bash
# Terminal 2: Start backend
cd /path/to/project_okinawa-1/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Run migrations
npm run migration:run

# Start development server
npm run start:dev

# Verify: http://localhost:3000/docs should show Swagger
```

#### 4. Start Mobile App (Client)

```bash
# Terminal 3: Start client app
cd /path/to/project_okinawa-1/mobile

# Install dependencies
npm install

# Start Metro bundler and iOS simulator
cd apps/client
npx expo start --ios

# Or start specific simulator
npx expo start --ios --simulator="iPhone 15 Pro"
```

#### 5. Start Mobile App (Restaurant)

```bash
# Terminal 4: Start restaurant app
cd /path/to/project_okinawa-1/mobile/apps/restaurant
npx expo start --ios

# For iPad (tablet view)
npx expo start --ios --simulator="iPad Pro (12.9-inch)"
```

### iOS Testing Checklist

| Feature | Client App | Restaurant App |
|---------|------------|----------------|
| App launches | [ ] | [ ] |
| Login screen displays | [ ] | [ ] |
| Registration works | [ ] | [ ] |
| Social login (Google) | [ ] | [ ] |
| Social login (Apple) | [ ] | [ ] |
| Home screen loads | [ ] | [ ] |
| Navigation works | [ ] | [ ] |
| API calls succeed | [ ] | [ ] |
| Real-time updates (WebSocket) | [ ] | [ ] |
| Push notifications | [ ] | [ ] |
| Camera/QR scanning | [ ] | [ ] |
| Location services | [ ] | [ ] |
| Dark mode toggle | [ ] | [ ] |
| Language switching | [ ] | [ ] |

---

## Simulator Testing (Android)

### Prerequisites

- [ ] Android Studio installed
- [ ] Android SDK installed
- [ ] Android Emulator configured
- [ ] Node.js 18+ installed
- [ ] Java 17+ installed

### Step-by-Step Setup

#### 1. Install Android Studio

```bash
# Download from https://developer.android.com/studio
# Install and run Android Studio
# Complete the setup wizard
# Install Android SDK (API 34 or latest)
```

#### 2. Configure Android Emulator

1. Open Android Studio
2. Go to Tools > Device Manager
3. Create Virtual Device
4. Select device (e.g., Pixel 7)
5. Select system image (API 34)
6. Finish and launch emulator

#### 3. Add Android SDK to PATH

```bash
# Add to ~/.zshrc or ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Reload shell
source ~/.zshrc
```

#### 4. Start Backend Services

```bash
# Same as iOS - start Docker and backend
cd /path/to/project_okinawa-1/backend
docker-compose up -d
npm run start:dev
```

#### 5. Start Mobile App (Android)

```bash
# Terminal: Start client app
cd /path/to/project_okinawa-1/mobile/apps/client
npx expo start --android

# If emulator is not detected
adb devices
# Should show emulator-5554 device
```

#### 6. Configure Network for Android Emulator

Android emulator uses special IP for localhost:

```bash
# 10.0.2.2 maps to host machine localhost
# Update API_URL temporarily for Android testing:
# In mobile/shared/services/api.ts, use:
# const API_URL = __DEV__ ? 'http://10.0.2.2:3000' : 'https://api.your-domain.com';
```

Or use `adb reverse`:

```bash
# Map emulator port to host port
adb reverse tcp:3000 tcp:3000
```

### Android Testing Checklist

| Feature | Client App | Restaurant App |
|---------|------------|----------------|
| App launches | [ ] | [ ] |
| Login screen displays | [ ] | [ ] |
| Registration works | [ ] | [ ] |
| Social login (Google) | [ ] | [ ] |
| Home screen loads | [ ] | [ ] |
| Navigation works | [ ] | [ ] |
| API calls succeed | [ ] | [ ] |
| Real-time updates (WebSocket) | [ ] | [ ] |
| Push notifications | [ ] | [ ] |
| Camera/QR scanning | [ ] | [ ] |
| Location services | [ ] | [ ] |
| Back button handling | [ ] | [ ] |
| Dark mode toggle | [ ] | [ ] |
| Language switching | [ ] | [ ] |

---

## Backend Testing

### Unit Tests

```bash
cd /path/to/project_okinawa-1/backend

# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- auth.service.spec.ts
```

### E2E Tests

```bash
# Start test database (uses separate container)
docker-compose -f docker-compose.test.yml up -d

# Run E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- auth.e2e-spec.ts
```

### API Testing (Manual)

1. Open Swagger: http://localhost:3000/docs
2. Test each endpoint category:

| Endpoint Category | Status | Notes |
|-------------------|--------|-------|
| Auth (login/register) | [ ] | |
| Users (CRUD) | [ ] | |
| Restaurants (CRUD) | [ ] | |
| Menu Items | [ ] | |
| Orders | [ ] | |
| Reservations | [ ] | |
| Payments | [ ] | |
| Reviews | [ ] | |
| Notifications | [ ] | |
| Analytics | [ ] | |
| WebSockets | [ ] | Use Postman or wscat |

### Database Verification

```bash
# Connect to PostgreSQL
docker exec -it okinawa-postgres psql -U okinawa -d okinawa

# List all tables
\dt

# Check migrations
SELECT * FROM migrations ORDER BY id DESC LIMIT 10;

# Check users
SELECT id, email, role FROM users;

# Exit
\q
```

### Redis Verification

```bash
# Connect to Redis
docker exec -it okinawa-redis redis-cli

# Check connection
PING

# List keys
KEYS *

# Check specific key
GET "cache:restaurants:list"

# Exit
QUIT
```

---

## Online/Production Deployment

### Pre-Deployment Checklist

| Item | Status | Notes |
|------|--------|-------|
| All tests passing | [ ] | Unit + E2E |
| Security audit completed | [ ] | `npm audit` |
| Environment variables configured | [ ] | Production values |
| SSL certificates obtained | [ ] | For HTTPS |
| Domain DNS configured | [ ] | API and app domains |
| Database backup strategy | [ ] | Automated backups |
| Monitoring setup | [ ] | Sentry, logging |
| CI/CD pipelines tested | [ ] | GitHub Actions |

### Backend Deployment (Docker)

#### 1. Build Production Image

```bash
cd /path/to/project_okinawa-1/backend

# Build image
docker build -t okinawa-backend:latest .

# Tag for registry
docker tag okinawa-backend:latest your-registry.com/okinawa-backend:latest

# Push to registry
docker push your-registry.com/okinawa-backend:latest
```

#### 2. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  api:
    image: your-registry.com/okinawa-backend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    restart: always

  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${DATABASE_USER}
      - POSTGRES_PASSWORD=${DATABASE_PASSWORD}
      - POSTGRES_DB=${DATABASE_NAME}
    restart: always

  redis:
    image: redis:7
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    restart: always

volumes:
  postgres_data:
  redis_data:
```

#### 3. Deploy and Run Migrations

```bash
# Deploy to server
ssh user@server

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker exec okinawa-api npm run migration:run

# Check logs
docker logs -f okinawa-api
```

### Mobile App Deployment (EAS)

#### 1. Configure EAS

```bash
cd /path/to/project_okinawa-1/mobile/apps/client

# Login to Expo
npx eas login

# Configure project
npx eas build:configure
```

#### 2. Create eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services.json"
      }
    }
  }
}
```

#### 3. Build for Production

```bash
# Build iOS
npx eas build --platform ios --profile production

# Build Android
npx eas build --platform android --profile production

# Build both
npx eas build --platform all --profile production
```

#### 4. Submit to Stores

```bash
# Submit to App Store
npx eas submit --platform ios

# Submit to Google Play
npx eas submit --platform android
```

### SSL/HTTPS Configuration

#### Using Let's Encrypt with Nginx

```nginx
server {
    listen 80;
    server_name api.okinawa.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.okinawa.com;

    ssl_certificate /etc/letsencrypt/live/api.okinawa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.okinawa.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Pre-Launch Verification

### Security Checklist

| Item | Status |
|------|--------|
| JWT secrets are strong and unique | [ ] |
| Database passwords are strong | [ ] |
| Redis password is configured | [ ] |
| HTTPS is enforced | [ ] |
| CORS is properly configured | [ ] |
| Rate limiting is enabled | [ ] |
| Input validation is working | [ ] |
| SQL injection prevention | [ ] |
| XSS prevention | [ ] |
| Sensitive data is not logged | [ ] |
| Error messages don't leak info | [ ] |
| npm audit shows no critical issues | [x] | *(Resolved Dec 2025: @nestjs/cli@11, @nestjs/swagger@11)*

### Performance Checklist

| Item | Status |
|------|--------|
| Database indexes are created | [ ] |
| Redis caching is working | [ ] |
| Image optimization is configured | [ ] |
| API response times < 500ms | [ ] |
| WebSocket connections stable | [ ] |
| App bundle size optimized | [ ] |
| Lazy loading implemented | [ ] |

### Functionality Checklist

| Feature | Client App | Restaurant App |
|---------|------------|----------------|
| User registration | [ ] | [ ] |
| User login (email) | [ ] | [ ] |
| User login (social) | [ ] | [ ] |
| Password reset | [ ] | [ ] |
| Profile management | [ ] | [ ] |
| Restaurant listing | [ ] | N/A |
| Restaurant search | [ ] | N/A |
| Menu viewing | [ ] | [ ] |
| Order creation | [ ] | [ ] |
| Order tracking | [ ] | [ ] |
| Order management | N/A | [ ] |
| KDS functionality | N/A | [ ] |
| Reservation booking | [ ] | [ ] |
| Reservation management | N/A | [ ] |
| Payment processing | [ ] | [ ] |
| Digital wallet | [ ] | N/A |
| Reviews/ratings | [ ] | [ ] |
| Notifications | [ ] | [ ] |
| Push notifications | [ ] | [ ] |
| QR code scanning | [ ] | [ ] |
| Real-time updates | [ ] | [ ] |
| Offline handling | [ ] | [ ] |
| Analytics dashboard | N/A | [ ] |
| Reports | N/A | [ ] |

### Final Steps

1. [ ] Run full regression testing
2. [ ] Performance testing under load
3. [ ] Security penetration testing
4. [ ] User acceptance testing
5. [ ] Backup verification
6. [ ] Monitoring alerts configured
7. [ ] Documentation updated
8. [ ] Launch communication prepared

---

**Document Version:** 1.1
**Last Updated:** 14 December 2025

---

# Checklist de Testes

Checklist completo para configurar, testar e implantar o Project Okinawa.

---

## Sumário

1. [Configurações Pendentes](#configurações-pendentes)
2. [Variáveis de Ambiente](#variáveis-de-ambiente)
3. [Testes no Simulador (iOS)](#testes-no-simulador-ios)
4. [Testes no Simulador (Android)](#testes-no-simulador-android)
5. [Testes do Backend](#testes-do-backend)
6. [Deploy Online/Produção](#deploy-onlineprodução)
7. [Verificação Pré-Lançamento](#verificação-pré-lançamento)

---

## Configurações Pendentes

### Configuração do Backend

| Item | Status | Prioridade | Notas |
|------|--------|------------|-------|
| Configuração do PostgreSQL | [ ] | ALTA | Necessário para todas as operações |
| Configuração do Redis | [ ] | ALTA | Necessário para cache e filas |
| Geração de chaves JWT | [ ] | ALTA | Use valores aleatórios fortes |
| Configuração CORS | [ ] | ALTA | Configure para domínios do app mobile |
| Configuração de rate limiting | [ ] | MÉDIA | Configure limites de requisições |
| Documentação Swagger | [ ] | BAIXA | Ativar em desenvolvimento |

### Serviços de Terceiros

| Serviço | Status | Prioridade | Notas |
|---------|--------|------------|-------|
| Credenciais Google OAuth | [ ] | ALTA | Para login social |
| Configuração Apple Sign-In | [ ] | ALTA | Para login social no iOS |
| Gateway de pagamento Asaas | [ ] | ALTA | Para pagamentos no Brasil |
| Bucket AWS S3 | [ ] | MÉDIA | Para upload de imagens |
| Conta SendGrid | [ ] | MÉDIA | Para notificações por email |
| Configuração AWS SNS | [ ] | MÉDIA | Para notificações SMS |
| Firebase Cloud Messaging | [ ] | MÉDIA | Para push notifications |
| Projeto Sentry | [ ] | BAIXA | Para rastreamento de erros |
| Acesso API OpenAI | [ ] | BAIXA | Para funcionalidades de IA |

### Configuração Mobile

| Item | Status | Prioridade | Notas |
|------|--------|------------|-------|
| Configuração conta Expo | [ ] | ALTA | Necessário para builds |
| ID do projeto EAS | [ ] | ALTA | Configurar no app.json |
| Bundle Identifier iOS | [ ] | ALTA | com.okinawa.client / com.okinawa.restaurant |
| Package Name Android | [ ] | ALTA | com.okinawa.client / com.okinawa.restaurant |
| Ícones e splash screens | [ ] | MÉDIA | Criar todos os tamanhos necessários |
| Certificados push notification | [ ] | MÉDIA | iOS APNs e Android FCM |
| Configuração deep linking | [ ] | MÉDIA | Configurar URL schemes |

### Configuração do Banco de Dados

| Item | Status | Prioridade | Notas |
|------|--------|------------|-------|
| Executar todas as migrations | [ ] | ALTA | 16+ migrations disponíveis |
| Criar usuário admin | [ ] | ALTA | Administrador do sistema |
| Seed de dados iniciais | [ ] | MÉDIA | Categorias, dados de exemplo |
| Configurar estratégia de backup | [ ] | MÉDIA | Backups automatizados |

---

## Variáveis de Ambiente

### Backend (.env)

Crie `/backend/.env` com as seguintes variáveis:

```bash
# ===========================================
# APLICAÇÃO
# ===========================================
NODE_ENV=development                    # development | staging | production
PORT=3000                               # Porta do servidor backend
API_PREFIX=api/v1                       # Prefixo das rotas da API

# ===========================================
# BANCO DE DADOS (PostgreSQL)
# ===========================================
DATABASE_HOST=localhost                 # Host do banco de dados
DATABASE_PORT=5432                      # Porta do banco de dados
DATABASE_USER=okinawa                   # Usuário do banco de dados
DATABASE_PASSWORD=okinawa_dev_password  # Senha (MUDE EM PRODUÇÃO)
DATABASE_NAME=okinawa                   # Nome do banco de dados
DATABASE_SYNCHRONIZE=false              # Nunca true em produção
DATABASE_LOGGING=true                   # Habilitar log de SQL

# ===========================================
# REDIS
# ===========================================
REDIS_HOST=localhost                    # Host do Redis
REDIS_PORT=6379                         # Porta do Redis
REDIS_PASSWORD=okinawa_redis_password   # Senha do Redis (MUDE EM PRODUÇÃO)
REDIS_DB=0                              # Número do banco Redis

# ===========================================
# AUTENTICAÇÃO JWT
# ===========================================
JWT_SECRET=sua-chave-jwt-super-secreta-mude-em-producao
JWT_EXPIRES_IN=7d                       # Expiração do access token
JWT_REFRESH_SECRET=sua-chave-refresh-super-secreta-mude-em-producao
JWT_REFRESH_EXPIRES_IN=30d              # Expiração do refresh token

# Demais variáveis seguem o mesmo padrão da versão em inglês acima
```

---

## Testes no Simulador (iOS)

### Pré-requisitos

- [ ] Computador macOS
- [ ] Xcode instalado (última versão)
- [ ] Xcode Command Line Tools instalado
- [ ] iOS Simulator instalado
- [ ] Node.js 18+ instalado
- [ ] Watchman instalado (`brew install watchman`)

### Passo a Passo

#### 1. Instalar Xcode

```bash
# Instale da App Store ou baixe de developer.apple.com
# Abra o Xcode e aceite os termos de licença
sudo xcodebuild -license accept

# Instale Command Line Tools
xcode-select --install
```

#### 2. Iniciar Serviços do Backend

```bash
# Terminal 1: Iniciar serviços Docker
cd /caminho/para/project_okinawa-1/backend
docker-compose up -d

# Verificar se os serviços estão rodando
docker ps

# Saída esperada:
# - postgres:16 na porta 5432
# - redis:7 na porta 6379
```

#### 3. Configurar Backend

```bash
# Terminal 2: Iniciar backend
cd /caminho/para/project_okinawa-1/backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env
# Edite o .env com seus valores

# Executar migrations
npm run migration:run

# Iniciar servidor de desenvolvimento
npm run start:dev

# Verificar: http://localhost:3000/docs deve mostrar o Swagger
```

#### 4. Iniciar App Mobile (Cliente)

```bash
# Terminal 3: Iniciar app do cliente
cd /caminho/para/project_okinawa-1/mobile

# Instalar dependências
npm install

# Iniciar Metro bundler e simulador iOS
cd apps/client
npx expo start --ios

# Ou iniciar simulador específico
npx expo start --ios --simulator="iPhone 15 Pro"
```

#### 5. Iniciar App Mobile (Restaurante)

```bash
# Terminal 4: Iniciar app do restaurante
cd /caminho/para/project_okinawa-1/mobile/apps/restaurant
npx expo start --ios

# Para iPad (visualização tablet)
npx expo start --ios --simulator="iPad Pro (12.9-inch)"
```

### Checklist de Testes iOS

| Funcionalidade | App Cliente | App Restaurante |
|----------------|-------------|-----------------|
| App inicia | [ ] | [ ] |
| Tela de login aparece | [ ] | [ ] |
| Cadastro funciona | [ ] | [ ] |
| Login social (Google) | [ ] | [ ] |
| Login social (Apple) | [ ] | [ ] |
| Tela inicial carrega | [ ] | [ ] |
| Navegação funciona | [ ] | [ ] |
| Chamadas API funcionam | [ ] | [ ] |
| Atualizações em tempo real (WebSocket) | [ ] | [ ] |
| Push notifications | [ ] | [ ] |
| Câmera/QR scanning | [ ] | [ ] |
| Serviços de localização | [ ] | [ ] |
| Modo escuro | [ ] | [ ] |
| Troca de idioma | [ ] | [ ] |

---

## Testes no Simulador (Android)

### Pré-requisitos

- [ ] Android Studio instalado
- [ ] Android SDK instalado
- [ ] Android Emulator configurado
- [ ] Node.js 18+ instalado
- [ ] Java 17+ instalado

### Passo a Passo

#### 1. Instalar Android Studio

```bash
# Baixe de https://developer.android.com/studio
# Instale e execute o Android Studio
# Complete o assistente de configuração
# Instale o Android SDK (API 34 ou mais recente)
```

#### 2. Configurar Android Emulator

1. Abra o Android Studio
2. Vá em Tools > Device Manager
3. Create Virtual Device
4. Selecione o dispositivo (ex: Pixel 7)
5. Selecione a imagem do sistema (API 34)
6. Finalize e inicie o emulador

#### 3. Adicionar Android SDK ao PATH

```bash
# Adicione ao ~/.zshrc ou ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Recarregue o shell
source ~/.zshrc
```

#### 4. Configurar Rede para Emulador Android

O emulador Android usa IP especial para localhost:

```bash
# 10.0.2.2 mapeia para localhost da máquina host
# Atualize API_URL temporariamente para testes Android:
# Em mobile/shared/services/api.ts, use:
# const API_URL = __DEV__ ? 'http://10.0.2.2:3000' : 'https://api.seu-dominio.com';
```

Ou use `adb reverse`:

```bash
# Mapear porta do emulador para porta do host
adb reverse tcp:3000 tcp:3000
```

### Checklist de Testes Android

| Funcionalidade | App Cliente | App Restaurante |
|----------------|-------------|-----------------|
| App inicia | [ ] | [ ] |
| Tela de login aparece | [ ] | [ ] |
| Cadastro funciona | [ ] | [ ] |
| Login social (Google) | [ ] | [ ] |
| Tela inicial carrega | [ ] | [ ] |
| Navegação funciona | [ ] | [ ] |
| Chamadas API funcionam | [ ] | [ ] |
| Atualizações em tempo real (WebSocket) | [ ] | [ ] |
| Push notifications | [ ] | [ ] |
| Câmera/QR scanning | [ ] | [ ] |
| Serviços de localização | [ ] | [ ] |
| Botão voltar funciona | [ ] | [ ] |
| Modo escuro | [ ] | [ ] |
| Troca de idioma | [ ] | [ ] |

---

## Testes do Backend

### Testes Unitários

```bash
cd /caminho/para/project_okinawa-1/backend

# Executar todos os testes
npm run test

# Executar testes com cobertura
npm run test:cov

# Executar testes em modo watch
npm run test:watch

# Executar arquivo de teste específico
npm run test -- auth.service.spec.ts
```

### Testes E2E

```bash
# Iniciar banco de dados de teste (usa container separado)
docker-compose -f docker-compose.test.yml up -d

# Executar testes E2E
npm run test:e2e

# Executar teste E2E específico
npm run test:e2e -- auth.e2e-spec.ts
```

### Teste de API (Manual)

1. Abra o Swagger: http://localhost:3000/docs
2. Teste cada categoria de endpoint:

| Categoria de Endpoint | Status | Notas |
|----------------------|--------|-------|
| Auth (login/cadastro) | [ ] | |
| Users (CRUD) | [ ] | |
| Restaurants (CRUD) | [ ] | |
| Menu Items | [ ] | |
| Orders | [ ] | |
| Reservations | [ ] | |
| Payments | [ ] | |
| Reviews | [ ] | |
| Notifications | [ ] | |
| Analytics | [ ] | |
| WebSockets | [ ] | Use Postman ou wscat |

### Verificação do Banco de Dados

```bash
# Conectar ao PostgreSQL
docker exec -it okinawa-postgres psql -U okinawa -d okinawa

# Listar todas as tabelas
\dt

# Verificar migrations
SELECT * FROM migrations ORDER BY id DESC LIMIT 10;

# Verificar usuários
SELECT id, email, role FROM users;

# Sair
\q
```

### Verificação do Redis

```bash
# Conectar ao Redis
docker exec -it okinawa-redis redis-cli

# Verificar conexão
PING

# Listar chaves
KEYS *

# Sair
QUIT
```

---

## Deploy Online/Produção

### Checklist Pré-Deploy

| Item | Status | Notas |
|------|--------|-------|
| Todos os testes passando | [ ] | Unitários + E2E |
| Auditoria de segurança concluída | [ ] | `npm audit` |
| Variáveis de ambiente configuradas | [ ] | Valores de produção |
| Certificados SSL obtidos | [ ] | Para HTTPS |
| DNS do domínio configurado | [ ] | Domínios da API e app |
| Estratégia de backup do banco | [ ] | Backups automatizados |
| Monitoramento configurado | [ ] | Sentry, logging |
| Pipelines CI/CD testados | [ ] | GitHub Actions |

### Deploy do Backend (Docker)

#### 1. Build da Imagem de Produção

```bash
cd /caminho/para/project_okinawa-1/backend

# Build da imagem
docker build -t okinawa-backend:latest .

# Tag para o registry
docker tag okinawa-backend:latest seu-registry.com/okinawa-backend:latest

# Push para o registry
docker push seu-registry.com/okinawa-backend:latest
```

#### 2. Docker Compose de Produção

Crie `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  api:
    image: seu-registry.com/okinawa-backend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    restart: always

  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${DATABASE_USER}
      - POSTGRES_PASSWORD=${DATABASE_PASSWORD}
      - POSTGRES_DB=${DATABASE_NAME}
    restart: always

  redis:
    image: redis:7
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    restart: always

volumes:
  postgres_data:
  redis_data:
```

### Deploy do App Mobile (EAS)

#### 1. Configurar EAS

```bash
cd /caminho/para/project_okinawa-1/mobile/apps/client

# Login no Expo
npx eas login

# Configurar projeto
npx eas build:configure
```

#### 2. Build para Produção

```bash
# Build iOS
npx eas build --platform ios --profile production

# Build Android
npx eas build --platform android --profile production

# Build ambos
npx eas build --platform all --profile production
```

#### 3. Enviar para as Lojas

```bash
# Enviar para App Store
npx eas submit --platform ios

# Enviar para Google Play
npx eas submit --platform android
```

---

## Verificação Pré-Lançamento

### Checklist de Segurança

| Item | Status |
|------|--------|
| Secrets JWT são fortes e únicos | [ ] |
| Senhas do banco são fortes | [ ] |
| Senha do Redis está configurada | [ ] |
| HTTPS está sendo forçado | [ ] |
| CORS está configurado corretamente | [ ] |
| Rate limiting está ativado | [ ] |
| Validação de input funcionando | [ ] |
| Prevenção de SQL injection | [ ] |
| Prevenção de XSS | [ ] |
| Dados sensíveis não estão sendo logados | [ ] |
| Mensagens de erro não vazam informações | [ ] |
| npm audit não mostra issues críticos | [x] | *(Resolvido Dez 2025: @nestjs/cli@11, @nestjs/swagger@11)*

### Checklist de Performance

| Item | Status |
|------|--------|
| Índices do banco criados | [ ] |
| Cache Redis funcionando | [ ] |
| Otimização de imagens configurada | [ ] |
| Tempo de resposta da API < 500ms | [ ] |
| Conexões WebSocket estáveis | [ ] |
| Tamanho do bundle otimizado | [ ] |
| Lazy loading implementado | [ ] |

### Checklist de Funcionalidades

| Funcionalidade | App Cliente | App Restaurante |
|----------------|-------------|-----------------|
| Cadastro de usuário | [ ] | [ ] |
| Login por email | [ ] | [ ] |
| Login social | [ ] | [ ] |
| Recuperação de senha | [ ] | [ ] |
| Gerenciamento de perfil | [ ] | [ ] |
| Listagem de restaurantes | [ ] | N/A |
| Busca de restaurantes | [ ] | N/A |
| Visualização de cardápio | [ ] | [ ] |
| Criação de pedidos | [ ] | [ ] |
| Acompanhamento de pedidos | [ ] | [ ] |
| Gestão de pedidos | N/A | [ ] |
| Funcionalidade KDS | N/A | [ ] |
| Reserva de mesas | [ ] | [ ] |
| Gestão de reservas | N/A | [ ] |
| Processamento de pagamentos | [ ] | [ ] |
| Carteira digital | [ ] | N/A |
| Avaliações | [ ] | [ ] |
| Notificações | [ ] | [ ] |
| Push notifications | [ ] | [ ] |
| QR code scanning | [ ] | [ ] |
| Atualizações em tempo real | [ ] | [ ] |
| Tratamento offline | [ ] | [ ] |
| Dashboard de analytics | N/A | [ ] |
| Relatórios | N/A | [ ] |

### Passos Finais

1. [ ] Executar teste de regressão completo
2. [ ] Teste de performance sob carga
3. [ ] Teste de penetração de segurança
4. [ ] Teste de aceitação do usuário
5. [ ] Verificação de backups
6. [ ] Alertas de monitoramento configurados
7. [ ] Documentação atualizada
8. [ ] Comunicação de lançamento preparada

---

**Versão do Documento:** 1.1
**Última Atualização:** 14 Dezembro 2025
