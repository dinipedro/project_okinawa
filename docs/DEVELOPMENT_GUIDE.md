# Development and Testing Guide / Guia de Desenvolvimento e Testes

> **Version**: 2.1.0  
> **Last Updated**: February 2025  
> **Language**: Bilingual (EN/PT)  
> **Status**: Active Development

Complete guide for developers and QA engineers working on Project Okinawa.

## Table of Contents / Índice

- [Environment Setup / Configuração de Ambiente](#environment-setup)
- [Development Workflow / Fluxo de Desenvolvimento](#development-workflow)
- [Backend Development / Desenvolvimento Backend](#backend-development)
- [Mobile Development / Desenvolvimento Mobile](#mobile-development)
- [Design System / Sistema de Design](#design-system)
- [Testing Strategy / Estratégia de Testes](#testing-strategy)
- [Code Quality Standards / Padrões de Qualidade](#code-quality-standards)
- [Debugging / Depuração](#debugging)
- [UX Components (v2.0+)](#ux-components-v20)
- [Deployment / Deploy](#deployment)

---

## Environment Setup

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | 18.x | 20.x |
| npm | 9.x | 10.x |
| RAM | 8GB | 16GB |
| Storage | 10GB | 20GB |
| OS | macOS 12+, Windows 10+, Ubuntu 20.04+ | macOS 14+ |

### Required Software

```bash
# Node.js (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Docker
# macOS: Download Docker Desktop from docker.com
# Linux: sudo apt-get install docker.io docker-compose

# Mobile Development
# iOS: Install Xcode from App Store
# Android: Install Android Studio

# Expo CLI
npm install -g expo-cli
```

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/pedrodini/project-okinawa.git
cd project_okinawa-1

# 2. Install dependencies
npm install
cd backend && npm install
cd ../mobile && npm install

# 3. Configure environment
cd ../backend
cp .env.example .env
# Edit .env with your configuration

# 4. Start infrastructure
docker-compose up -d

# 5. Run migrations
npm run migration:run

# 6. Seed database (optional)
npm run seed

# 7. Verify setup
npm run start:dev
# API should be available at http://localhost:3000
```

### Environment Variables

Create `backend/.env` with:

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

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=okinawa_redis_password

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# Swagger
SWAGGER_ENABLED=true
```

---

## Development Workflow

### Branch Strategy

```
main (production)
└── develop (staging)
    ├── feature/feature-name
    ├── fix/bug-description
    └── refactor/area-name
```

### Daily Workflow

```bash
# 1. Update local repository
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Start development servers
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Mobile (Client or Restaurant)
cd mobile/apps/client && npm start

# 4. Make changes, test locally

# 5. Run tests before committing
npm run test
npm run lint

# 6. Commit with conventional format
git add .
git commit -m "feat(module): description"

# 7. Push and create PR
git push origin feature/my-feature
```

### Commit Standards

```bash
# Format
<type>(<scope>): <description>

# Types
feat     # New feature
fix      # Bug fix
docs     # Documentation
style    # Formatting
refactor # Code restructuring
test     # Adding tests
chore    # Maintenance

# Examples
feat(orders): add real-time status tracking
fix(auth): resolve token refresh issue
docs(readme): update installation steps
```

---

## Backend Development

### Creating a New Module

```bash
# Generate module scaffold
nest generate module modules/feature-name
nest generate controller modules/feature-name
nest generate service modules/feature-name
```

### Module Structure

```
modules/feature/
├── dto/
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
├── entities/
│   └── feature.entity.ts
├── feature.controller.ts
├── feature.service.ts
├── feature.module.ts
└── feature.spec.ts
```

### Entity Example

```typescript
// entities/feature.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from '@/modules/restaurants/entities/restaurant.entity';

@Entity('features')
export class Feature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'restaurant_id' })
  restaurantId: string;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### DTO Example

```typescript
// dto/create-feature.dto.ts
import {
  IsString,
  IsUUID,
  IsOptional,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeatureDto {
  @ApiProperty({ example: 'Feature Name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Feature description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  restaurantId: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
```

### Controller Example

```typescript
// feature.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';

@ApiTags('features')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Create new feature' })
  @ApiResponse({ status: 201, description: 'Feature created' })
  create(@Body() dto: CreateFeatureDto) {
    return this.featureService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List features' })
  findAll(@Query('restaurantId') restaurantId?: string) {
    return this.featureService.findAll(restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.featureService.findOne(id);
  }
}
```

### Service Example

```typescript
// feature.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from './entities/feature.entity';
import { CreateFeatureDto } from './dto/create-feature.dto';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
  ) {}

  async create(dto: CreateFeatureDto): Promise<Feature> {
    const feature = this.featureRepository.create(dto);
    return this.featureRepository.save(feature);
  }

  async findAll(restaurantId?: string): Promise<Feature[]> {
    const query = this.featureRepository.createQueryBuilder('feature');

    if (restaurantId) {
      query.where('feature.restaurant_id = :restaurantId', { restaurantId });
    }

    return query.orderBy('feature.created_at', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Feature> {
    const feature = await this.featureRepository.findOne({ where: { id } });
    if (!feature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
    return feature;
  }
}
```

### Creating Migrations

```bash
# Generate migration from entity changes
npm run migration:generate src/database/migrations/AddFeatureTable

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

---

## Mobile Development

### Running Apps

```bash
# Client App
cd mobile/apps/client
npm start
# Press 'i' for iOS or 'a' for Android

# Restaurant App
cd mobile/apps/restaurant
npm start
```

### Creating Screens

```typescript
// screens/feature/FeatureScreen.tsx
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from 'react-native-paper';
import { api } from '../../services/api';

interface Feature {
  id: string;
  name: string;
  description?: string;
}

export const FeatureScreen: React.FC = () => {
  const theme = useTheme();

  const { data: features, isLoading, error } = useQuery({
    queryKey: ['features'],
    queryFn: () => api.get<Feature[]>('/features'),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error loading features</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={features}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title title={item.name} />
            <Card.Content>
              <Text>{item.description}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 12,
  },
});
```

### Custom Hooks

```typescript
// hooks/useFeatures.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useFeatures(restaurantId?: string) {
  return useQuery({
    queryKey: ['features', restaurantId],
    queryFn: () => api.get('/features', { params: { restaurantId } }),
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeatureDto) => api.post('/features', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}
```

---

## Design System

### Semantic Design Tokens (MANDATORY)

All UI components MUST use semantic design tokens. Hardcoded colors are **strictly forbidden**.

#### Token Categories

| Category | Tokens | Usage |
|----------|--------|-------|
| **Backgrounds** | `bg-background`, `bg-card`, `bg-muted`, `bg-popover` | Container backgrounds |
| **Foregrounds** | `text-foreground`, `text-muted-foreground`, `text-card-foreground` | Text colors |
| **Primary** | `bg-primary`, `text-primary`, `text-primary-foreground` | Brand/accent elements |
| **Secondary** | `bg-secondary`, `text-secondary-foreground` | Secondary actions |
| **Borders** | `border-border`, `border-input` | Lines and separators |
| **Status** | `text-success`, `text-warning`, `text-destructive`, `text-info` | Status indicators |
| **Special** | `text-pix` (teal for PIX payments) | Payment-specific |

#### Correct Usage Examples

```tsx
// ✅ CORRECT - Using semantic tokens
<div className="bg-background text-foreground border-border">
  <h1 className="text-foreground">Title</h1>
  <p className="text-muted-foreground">Description</p>
  <button className="bg-primary text-primary-foreground">Action</button>
</div>

// ✅ CORRECT - Status colors
<span className="text-success">Paid</span>
<span className="text-warning">Processing</span>
<span className="text-destructive">Failed</span>

// ❌ FORBIDDEN - Hardcoded colors
<div className="bg-white text-black">Wrong</div>
<div className="bg-[#FF6B35]">Wrong</div>
<div style={{ backgroundColor: 'white' }}>Wrong</div>
```

#### CSS Variable Structure (index.css)

```css
:root {
  /* Light mode */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --success: 142.1 76.2% 36.3%;
  --warning: 45 93% 47%;
  --destructive: 0 84.2% 60.2%;
}

.dark {
  /* Dark mode overrides */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Mobile Theme Integration

For React Native, use the `useColors()` hook:

```typescript
import { useColors } from '@/shared/hooks/useColors';

const MyComponent = () => {
  const colors = useColors();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.foreground }}>Content</Text>
      <TouchableOpacity style={{ backgroundColor: colors.primary }}>
        <Text style={{ color: colors.primaryForeground }}>Button</Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

## Testing Strategy

### Testing Pyramid

```
         /\
        /  \     E2E Tests (10%)
       /────\    Integration Tests (20%)
      /──────\   Unit Tests (70%)
     /────────\
```

### Backend Unit Tests

```typescript
// feature.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureService } from './feature.service';
import { Feature } from './entities/feature.entity';

describe('FeatureService', () => {
  let service: FeatureService;
  let repository: jest.Mocked<Repository<Feature>>;

  const mockFeature: Feature = {
    id: 'uuid',
    name: 'Test Feature',
    description: 'Description',
    restaurantId: 'restaurant-uuid',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureService,
        {
          provide: getRepositoryToken(Feature),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
    repository = module.get(getRepositoryToken(Feature));
  });

  describe('create', () => {
    it('should create a feature', async () => {
      const dto = { name: 'Test', restaurantId: 'uuid' };
      repository.create.mockReturnValue(mockFeature);
      repository.save.mockResolvedValue(mockFeature);

      const result = await service.create(dto);

      expect(result).toEqual(mockFeature);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a feature', async () => {
      repository.findOne.mockResolvedValue(mockFeature);

      const result = await service.findOne('uuid');

      expect(result).toEqual(mockFeature);
    });

    it('should throw NotFoundException', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid')).rejects.toThrow('not found');
    });
  });
});
```

### Backend E2E Tests

```typescript
// test/feature.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Feature (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /features', () => {
    it('should create feature', () => {
      return request(app.getHttpServer())
        .post('/api/v1/features')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Feature',
          restaurantId: 'valid-uuid',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('Test Feature');
        });
    });

    it('should reject invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/features')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('GET /features', () => {
    it('should return features list', () => {
      return request(app.getHttpServer())
        .get('/api/v1/features')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });
});
```

### Running Tests

```bash
# Backend
cd backend

# Unit tests
npm run test

# Unit tests with watch
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e

# Single test file
npm run test -- feature.service.spec.ts
```

### Coverage Requirements

| Area | Minimum Coverage |
|------|------------------|
| Services | 80% |
| Controllers | 70% |
| Guards | 90% |
| Utilities | 90% |
| Overall | 75% |

---

## Code Quality Standards

### ESLint Configuration

The project uses ESLint with TypeScript rules:

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Prettier Configuration

```bash
# Format code
npm run format

# Check formatting
npm run format -- --check
```

### Pre-commit Checklist

- [ ] Code compiles without errors: `npm run build`
- [ ] All tests pass: `npm run test`
- [ ] No lint errors: `npm run lint`
- [ ] Code is formatted: `npm run format`
- [ ] Commit message follows convention
- [ ] Documentation updated if needed

---

## Debugging

### Backend Debugging

```bash
# Start with debugger
npm run start:debug
```

VS Code launch configuration:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to NestJS",
      "port": 9229,
      "restart": true
    }
  ]
}
```

### Mobile Debugging

```bash
# Start with React DevTools
npm start

# In Expo, shake device or press 'd' for DevTools
```

### Database Debugging

```bash
# Access PostgreSQL
docker exec -it okinawa-postgres psql -U okinawa

# View logs
docker-compose logs -f postgres
```

### Redis Debugging

```bash
# Access Redis CLI
docker exec -it okinawa-redis redis-cli -a okinawa_redis_password

# View all keys
KEYS *

# Get specific value
GET key_name
```

---

## Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Docker build
docker build -t okinawa-backend:latest .
```

### Environment Variables (Production)

```bash
NODE_ENV=production
DATABASE_HOST=production-db-host
DATABASE_PASSWORD=strong-production-password
JWT_SECRET=production-secret-64-chars-minimum
CORS_ORIGIN=https://app.yourdomain.com
```

### Health Check

```bash
# API health
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

---

**Document Version:** 1.0
**Last Updated:** December 2025

---

# Guia de Desenvolvimento e Testes

Guia completo para desenvolvedores e engenheiros de QA trabalhando no Project Okinawa.

## Sumário

- [Configuração do Ambiente](#configuração-do-ambiente)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
- [Desenvolvimento Backend](#desenvolvimento-backend)
- [Desenvolvimento Mobile](#desenvolvimento-mobile)
- [Estratégia de Testes](#estratégia-de-testes)
- [Padrões de Qualidade de Código](#padrões-de-qualidade-de-código)
- [Debugging](#debugging)
- [Deploy](#deploy)

---

## Configuração do Ambiente

### Requisitos do Sistema

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| Node.js | 18.x | 20.x |
| npm | 9.x | 10.x |
| RAM | 8GB | 16GB |
| Armazenamento | 10GB | 20GB |

### Setup Inicial

```bash
# 1. Clonar repositório
git clone https://github.com/pedrodini/project-okinawa.git
cd project_okinawa-1

# 2. Instalar dependências
npm install
cd backend && npm install
cd ../mobile && npm install

# 3. Configurar ambiente
cd ../backend
cp .env.example .env

# 4. Iniciar infraestrutura
docker-compose up -d

# 5. Executar migrations
npm run migration:run

# 6. Verificar setup
npm run start:dev
```

---

## Fluxo de Desenvolvimento

### Estratégia de Branches

```
main (produção)
└── develop (staging)
    ├── feature/nome-feature
    ├── fix/descricao-bug
    └── refactor/nome-area
```

### Fluxo Diário

1. Atualizar repositório local
2. Criar branch de feature
3. Iniciar servidores de desenvolvimento
4. Fazer alterações, testar localmente
5. Executar testes antes de commitar
6. Commit com formato convencional
7. Push e criar PR

### Padrão de Commits

```bash
# Formato
<tipo>(<escopo>): <descrição>

# Tipos
feat     # Nova funcionalidade
fix      # Correção de bug
docs     # Documentação
style    # Formatação
refactor # Reestruturação
test     # Testes
chore    # Manutenção
```

---

## Desenvolvimento Backend

### Criando Novo Módulo

```bash
nest generate module modules/nome-feature
nest generate controller modules/nome-feature
nest generate service modules/nome-feature
```

### Estrutura do Módulo

```
modules/feature/
├── dto/
├── entities/
├── feature.controller.ts
├── feature.service.ts
├── feature.module.ts
└── feature.spec.ts
```

### Criando Migrations

```bash
# Gerar migration
npm run migration:generate src/database/migrations/NomeMigration

# Executar migrations
npm run migration:run

# Reverter última migration
npm run migration:revert
```

---

## Desenvolvimento Mobile

### Executando Apps

```bash
# App Cliente
cd mobile/apps/client
npm start

# App Restaurante
cd mobile/apps/restaurant
npm start
```

### Criando Telas

Usar componentes React Native Paper e hooks do TanStack Query para busca de dados.

---

## Estratégia de Testes

### Pirâmide de Testes

- **70%** Testes Unitários
- **20%** Testes de Integração
- **10%** Testes E2E

### Executando Testes

```bash
cd backend

# Testes unitários
npm run test

# Com watch
npm run test:watch

# Cobertura
npm run test:cov

# Testes E2E
npm run test:e2e
```

### Requisitos de Cobertura

| Área | Cobertura Mínima |
|------|------------------|
| Services | 80% |
| Controllers | 70% |
| Guards | 90% |
| Geral | 75% |

---

## Padrões de Qualidade de Código

### Checklist Pré-Commit

- [ ] Código compila sem erros
- [ ] Todos os testes passam
- [ ] Sem erros de lint
- [ ] Código formatado
- [ ] Mensagem de commit segue convenção
- [ ] Documentação atualizada

---

## Debugging

### Backend

```bash
npm run start:debug
```

### Mobile

```bash
npm start
# Pressione 'd' para DevTools
```

### Banco de Dados

```bash
docker exec -it okinawa-postgres psql -U okinawa
```

---

## Deploy

### Build de Produção

```bash
cd backend
npm run build
npm run start:prod
```

### Health Check

```bash
curl http://localhost:3000/health
```

---

## UX Components (v2.0+)

### New Components Created

| Component | Location | Purpose |
|-----------|----------|---------|
| `QuickActionsFAB` | `components/QuickActionsFAB.tsx` | Context-aware floating action button |
| `UnifiedPaymentScreenV2` | `screens/UnifiedPaymentScreenV2.tsx` | Consolidated payment with 3 tabs |
| `RoleDashboardScreenV2` | `screens/restaurant/RoleDashboardScreenV2.tsx` | Role-adaptive dashboard |
| `KitchenDisplayScreenV2` | `screens/restaurant/KitchenDisplayScreenV2.tsx` | KDS with swipe gestures |
| `OrderPaymentTrackingScreenV2` | `screens/restaurant/OrderPaymentTrackingScreenV2.tsx` | Staff payment tracking |

### Design Token Requirements

All components MUST use semantic tokens:

```tsx
// ✅ Correct
<div className="bg-background text-foreground border-border" />
<div className="bg-card text-muted-foreground" />
<div className="text-primary bg-primary/10" />

// ❌ Forbidden
<div className="bg-white text-black" />
<div className="bg-[#FF6B35]" />
```

### KDS Swipe Gestures

```typescript
// Swipe right to progress status
const handleSwipeRight = (orderId: string) => {
  // New → Preparing → Ready
};

// Swipe left to regress status
const handleSwipeLeft = (orderId: string) => {
  // Ready → Preparing → New
};

// SLA Thresholds
const SLA_WARNING = 300;  // 5 minutes
const SLA_CRITICAL = 480; // 8 minutes
```

### Role-Adaptive Dashboard Logic

```typescript
type UserRole = 'owner' | 'manager' | 'waiter' | 'chef' | 'barman' | 'maitre';

const getStatsForRole = (role: UserRole): Stat[] => {
  switch (role) {
    case 'owner': return [/* revenue, orders, customers, avg ticket */];
    case 'manager': return [/* active orders, avg time, payments, staff */];
    case 'waiter': return [/* my tables, orders, pending, tips */];
    case 'chef': return [/* pending, preparing, completed, avg time */];
    case 'barman': return [/* drink orders, avg time, completed, top */];
    case 'maitre': return [/* reservations, queue, occupancy, vips */];
  }
};
```

---

**Versão do Documento:** 2.1
**Última Atualização:** Fevereiro 2025
