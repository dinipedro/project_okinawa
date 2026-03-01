# Installation and Usage Guide

Complete installation and configuration instructions for Project Okinawa.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation Methods](#installation-methods)
- [Backend Setup](#backend-setup)
- [Mobile Setup](#mobile-setup)
- [Configuration](#configuration)
- [Running the Applications](#running-the-applications)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| Operating System | macOS 12+, Windows 10+, Ubuntu 20.04+ |
| Node.js | 18.0.0 or higher |
| npm | 9.0.0 or higher |
| RAM | 8 GB |
| Storage | 10 GB free space |
| Docker | 20.0.0 or higher |

### Recommended Requirements

| Component | Recommendation |
|-----------|----------------|
| Operating System | macOS 14+, Windows 11, Ubuntu 22.04+ |
| Node.js | 20.x LTS |
| npm | 10.x |
| RAM | 16 GB |
| Storage | 20 GB SSD |
| Docker | Latest stable |

### Mobile Development Additional Requirements

**For iOS Development:**
- macOS required
- Xcode 15+ (download from App Store)
- iOS Simulator
- Apple Developer account (for device testing)

**For Android Development:**
- Android Studio (any OS)
- Android SDK
- Android Emulator or physical device
- JDK 11+

---

## Installation Methods

### Method 1: Automated Script (Recommended)

```bash
# Clone repository
git clone https://github.com/pedrodini/project-okinawa.git
cd project_okinawa-1

# Run automated installation
./install-dependencies-fixed.sh
```

### Method 2: Manual Installation

Follow the detailed steps below.

---

## Backend Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/pedrodini/project-okinawa.git
cd project_okinawa-1
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your editor
nano .env  # or code .env, vim .env
```

**Required Environment Variables:**

```bash
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=okinawa
DATABASE_PASSWORD=okinawa_dev_password
DATABASE_NAME=okinawa
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=okinawa_redis_password

# JWT (IMPORTANT: Generate secure keys for production)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-at-least-32-characters
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:8081,http://localhost:19000,http://localhost:19006

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=docs
```

### Step 4: Start Docker Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services are running
docker-compose ps
```

Expected output:
```
NAME                 STATUS
okinawa-postgres    running (healthy)
okinawa-redis       running (healthy)
```

### Step 5: Run Database Migrations

```bash
npm run migration:run
```

### Step 6: Seed Database (Optional)

```bash
npm run seed
```

### Step 7: Start Backend Server

```bash
npm run start:dev
```

**Verify Installation:**
- API: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/docs
- Health Check: http://localhost:3000/health

---

## Mobile Setup

### Step 1: Install Mobile Dependencies

```bash
cd mobile
npm install

# Install app-specific dependencies
cd apps/client && npm install
cd ../restaurant && npm install
```

### Step 2: Configure Mobile Environment

Create environment files for each app:

**mobile/apps/client/.env:**
```bash
API_URL=http://localhost:3000/api/v1
WEBSOCKET_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=your-google-maps-key  # Optional
```

**mobile/apps/restaurant/.env:**
```bash
API_URL=http://localhost:3000/api/v1
WEBSOCKET_URL=http://localhost:3000
```

### Step 3: Install Expo CLI (if not installed)

```bash
npm install -g expo-cli
```

### Step 4: Start Mobile Apps

**Client App:**
```bash
cd mobile/apps/client
npm start
```

**Restaurant App:**
```bash
cd mobile/apps/restaurant
npm start
```

### Step 5: Run on Simulator/Emulator

In the Expo terminal:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app for physical device

---

## Configuration

### OAuth Setup (Optional)

**Google OAuth:**
1. Go to Google Cloud Console
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add credentials to `.env`:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
   ```

**Apple Sign In:**
1. Apple Developer account required
2. Create App ID with Sign In with Apple capability
3. Create Service ID
4. Generate Private Key
5. Add to `.env`:
   ```bash
   APPLE_CLIENT_ID=your-service-id
   APPLE_TEAM_ID=your-team-id
   APPLE_KEY_ID=your-key-id
   APPLE_PRIVATE_KEY=your-private-key-content
   ```

### Push Notifications (Optional)

**Firebase Cloud Messaging:**
1. Create Firebase project
2. Add Android/iOS apps
3. Download configuration files
4. Add to `.env`:
   ```bash
   FCM_SERVER_KEY=your-fcm-server-key
   FCM_PROJECT_ID=your-project-id
   ```

### Email Service (Optional)

**SendGrid:**
```bash
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Project Okinawa
```

### Payment Gateway (Optional)

**Asaas:**
```bash
ASAAS_API_KEY=your-asaas-api-key
ASAAS_WEBHOOK_URL=https://yourdomain.com/api/v1/webhooks/asaas
ASAAS_ENVIRONMENT=sandbox  # or 'production'
```

---

## Running the Applications

### Development Mode

**Terminal 1 - Infrastructure:**
```bash
cd backend
docker-compose up -d
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 3 - Client App:**
```bash
cd mobile/apps/client
npm start
```

**Terminal 4 - Restaurant App:**
```bash
cd mobile/apps/restaurant
npm start
```

### Production Mode

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Mobile:**
```bash
# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run start:dev
```

#### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

#### Redis Connection Failed

```bash
# Check if Redis is running
docker-compose ps

# Restart Redis
docker-compose restart redis

# Test connection
docker exec -it okinawa-redis redis-cli -a okinawa_redis_password ping
```

#### Migration Errors

```bash
# Revert last migration
npm run migration:revert

# Drop all tables (CAUTION: destroys data)
docker exec -it okinawa-postgres psql -U okinawa -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Run migrations again
npm run migration:run
```

#### Node Modules Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

#### Mobile Build Issues

```bash
# Clear Expo cache
expo r -c

# Reset Metro bundler
npx react-native start --reset-cache

# Clean iOS build (macOS)
cd ios && pod deintegrate && pod install && cd ..
```

### Health Check Endpoints

```bash
# Backend health
curl http://localhost:3000/health

# Expected response
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

### Log Files

```bash
# Backend logs
docker-compose logs -f backend

# PostgreSQL logs
docker-compose logs -f postgres

# Redis logs
docker-compose logs -f redis
```

### Support Resources

- Documentation: `/docs` folder
- API Documentation: http://localhost:3000/docs
- Issues: GitHub Issues page

---

**Document Version:** 1.0
**Last Updated:** December 2025

---

# Guia de Instalação e Uso

Instruções completas de instalação e configuração para o Project Okinawa.

## Sumário

- [Requisitos do Sistema](#requisitos-do-sistema)
- [Métodos de Instalação](#métodos-de-instalação)
- [Configuração do Backend](#configuração-do-backend)
- [Configuração Mobile](#configuração-mobile)
- [Configuração](#configuração)
- [Executando as Aplicações](#executando-as-aplicações)
- [Solução de Problemas](#solução-de-problemas)

---

## Requisitos do Sistema

### Requisitos Mínimos

| Componente | Requisito |
|------------|-----------|
| Sistema Operacional | macOS 12+, Windows 10+, Ubuntu 20.04+ |
| Node.js | 18.0.0 ou superior |
| npm | 9.0.0 ou superior |
| RAM | 8 GB |
| Armazenamento | 10 GB de espaço livre |
| Docker | 20.0.0 ou superior |

### Requisitos Recomendados

| Componente | Recomendação |
|------------|--------------|
| Node.js | 20.x LTS |
| npm | 10.x |
| RAM | 16 GB |
| Armazenamento | 20 GB SSD |

### Requisitos Adicionais para Mobile

**Para desenvolvimento iOS:**
- macOS obrigatório
- Xcode 15+
- iOS Simulator

**Para desenvolvimento Android:**
- Android Studio
- Android SDK
- Emulador Android ou dispositivo físico

---

## Métodos de Instalação

### Método 1: Script Automatizado (Recomendado)

```bash
git clone https://github.com/pedrodini/project-okinawa.git
cd project_okinawa-1
./install-dependencies-fixed.sh
```

### Método 2: Instalação Manual

Siga os passos detalhados abaixo.

---

## Configuração do Backend

### Passo 1: Clonar Repositório

```bash
git clone https://github.com/pedrodini/project-okinawa.git
cd project_okinawa-1
```

### Passo 2: Instalar Dependências

```bash
cd backend
npm install
```

### Passo 3: Configurar Ambiente

```bash
cp .env.example .env
# Edite .env com suas configurações
```

### Passo 4: Iniciar Serviços Docker

```bash
docker-compose up -d
```

### Passo 5: Executar Migrations

```bash
npm run migration:run
```

### Passo 6: Iniciar Servidor

```bash
npm run start:dev
```

**Verificar Instalação:**
- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/docs

---

## Configuração Mobile

### Passo 1: Instalar Dependências

```bash
cd mobile
npm install
cd apps/client && npm install
cd ../restaurant && npm install
```

### Passo 2: Configurar Ambiente

Criar arquivos `.env` em cada app com:
```bash
API_URL=http://localhost:3000/api/v1
WEBSOCKET_URL=http://localhost:3000
```

### Passo 3: Iniciar Apps

```bash
# App Cliente
cd mobile/apps/client
npm start

# App Restaurante
cd mobile/apps/restaurant
npm start
```

---

## Executando as Aplicações

### Modo Desenvolvimento

**Terminal 1 - Infraestrutura:**
```bash
cd backend && docker-compose up -d
```

**Terminal 2 - Backend:**
```bash
cd backend && npm run start:dev
```

**Terminal 3 - App Cliente:**
```bash
cd mobile/apps/client && npm start
```

**Terminal 4 - App Restaurante:**
```bash
cd mobile/apps/restaurant && npm start
```

---

## Solução de Problemas

### Porta em Uso

```bash
lsof -i :3000
kill -9 <PID>
```

### Erro de Conexão com Banco

```bash
docker-compose restart postgres
docker-compose logs postgres
```

### Erro de Conexão Redis

```bash
docker-compose restart redis
```

### Problemas com Node Modules

```bash
rm -rf node_modules package-lock.json
npm install
```

### Health Check

```bash
curl http://localhost:3000/health
```

---

## New Features (v2.1.0)

### UX Improvements Included

After installation, the following enhanced features are available:

| Feature | Description | Location |
|---------|-------------|----------|
| **Unified Payment** | Single tabbed interface for all payment operations | Client App |
| **Quick Actions FAB** | Context-aware floating button for rapid task access | Both Apps |
| **Role-Adaptive Dashboard** | Dashboard adapts to staff role | Restaurant App |
| **KDS Swipe Gestures** | Touch-friendly kitchen display | Restaurant App |
| **Payment Tracking** | Real-time guest payment status | Restaurant App |

### Split Payment Modes

All 4 split payment modes are fully functional:

1. **Individual** - Primary guest pays entire bill
2. **Equal** - Total divided equally among guests
3. **Selective** - Each guest selects specific items
4. **Fixed Amount** - User defines custom contribution

### Design Token System

The UI uses semantic design tokens for theming. When customizing:

```css
/* Modify in index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}
```

---

**Versão do Documento:** 2.1
**Última Atualização:** Fevereiro 2025
