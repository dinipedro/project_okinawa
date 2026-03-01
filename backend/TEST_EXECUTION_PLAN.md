# Plano de Execução de Testes E2E - Project Okinawa

## Status Atual

### ✅ Completado
1. Migrations do TypeORM criadas
2. Seeds de dados de teste criados
3. Testes E2E configurados:
   - auth.e2e-spec.ts
   - restaurants.e2e-spec.ts
   - orders.e2e-spec.ts
4. Configuração jest-e2e.json criada

### 🔶 Arquivos de Configuração Necessários

Os seguintes arquivos precisam ser criados manualmente no diretório `backend/src/config/`:

#### 1. typeorm.config.ts
```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'okinawa',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'okinawa',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
};

export const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
```

#### 2. redis.config.ts
```typescript
import { BullModuleOptions } from '@nestjs/bull';

export const redisConfig = (): BullModuleOptions => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
```

#### 3. throttler.config.ts
```typescript
import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig = (): ThrottlerModuleOptions => ({
  throttlers: [
    {
      ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60000,
      limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
    },
  ],
});
```

## Passo a Passo para Executar Testes

### 1. Preparar Ambiente

```bash
cd backend

# Instalar dependências se ainda não instalou
npm install

# Iniciar infraestrutura (PostgreSQL + Redis)
docker-compose up -d

# Aguardar serviços iniciarem
sleep 5
```

### 2. Executar Migrations

```bash
# Rodar migrations para criar tabelas
npm run migration:run
```

### 3. Popular Banco com Seeds

```bash
# Executar seeds
npm run seed
```

### 4. Executar Testes E2E

```bash
# Executar todos os testes E2E
npm run test:e2e

# Ou executar teste específico
npm run test:e2e -- auth.e2e-spec.ts
npm run test:e2e -- restaurants.e2e-spec.ts
npm run test:e2e -- orders.e2e-spec.ts
```

### 5. Verificar Resultados

Os testes devem validar:

**Auth Tests**:
- ✓ Registro de novo usuário
- ✓ Validação de email
- ✓ Validação de senha
- ✓ Detecção de email duplicado
- ✓ Login com credenciais válidas
- ✓ Rejeição de senha inválida
- ✓ Rejeição de email inexistente
- ✓ Obter usuário autenticado
- ✓ Rejeição sem token
- ✓ Rejeição com token inválido

**Restaurants Tests**:
- ✓ Listar todos os restaurantes
- ✓ Filtrar por cidade
- ✓ Filtrar por tipo de serviço
- ✓ Obter restaurante por ID
- ✓ Erro 404 para restaurante inexistente
- ✓ Criar novo restaurante (autenticado)
- ✓ Rejeição sem autenticação
- ✓ Validação de campos obrigatórios

**Orders Tests**:
- ✓ Criar novo pedido
- ✓ Cálculo correto de totais (subtotal, tax, tip)
- ✓ Rejeição sem autenticação
- ✓ Validação de itens vazios
- ✓ Listar pedidos do usuário
- ✓ Obter pedido por ID
- ✓ Atualizar status do pedido
- ✓ Validação de status inválido

## Troubleshooting

### Problema: Erro de conexão com banco de dados
**Solução**:
```bash
# Verificar se Docker está rodando
docker ps

# Verificar logs do PostgreSQL
docker-compose logs postgres

# Restartar containers
docker-compose restart
```

### Problema: Migrations não rodam
**Solução**:
```bash
# Dropar banco e recriar
docker-compose down -v
docker-compose up -d
sleep 5
npm run migration:run
```

### Problema: Testes falham por timeout
**Solução**: Aumentar timeout no `test/jest-e2e.json`:
```json
{
  "testTimeout": 60000
}
```

### Problema: Seeds falham
**Solução**: Verificar se migrations rodaram primeiro:
```bash
npm run migration:run && npm run seed
```

## Dados de Teste (Seeds)

### Usuários Criados:
- **Owner**: owner@okinawa.com / password123
- **Customer 1**: customer1@example.com / password123
- **Customer 2**: customer2@example.com / password123
- **Chef**: chef@okinawa.com / password123
- **Waiter**: waiter@okinawa.com / password123

### Restaurante Criado:
- **Nome**: Okinawa Sushi Bar
- **Cidade**: São Paulo
- **Tipo**: Fine Dining
- **14 itens de menu** em categorias variadas

### Mesas:
- 10 mesas criadas (T01 a T10)
- Capacidades variadas (2, 4, 6 lugares)

## Próximos Passos Após Testes

1. Corrigir erros encontrados
2. Adicionar mais testes para outros módulos
3. Implementar testes unitários
4. Configurar CI/CD com testes automáticos
5. Adicionar cobertura de código (coverage)

## Comandos Úteis

```bash
# Limpar banco e recomeçar
docker-compose down -v && docker-compose up -d && sleep 5 && npm run migration:run && npm run seed

# Rodar testes com verbose
npm run test:e2e -- --verbose

# Rodar testes com coverage
npm run test:e2e -- --coverage

# Rodar apenas um teste
npm run test:e2e -- -t "should register a new user"

# Ver logs do servidor durante testes
npm run start:dev
# Em outro terminal:
npm run test:e2e
```

## Checklist de Execução

- [ ] Docker containers rodando (postgres + redis)
- [ ] Migrations executadas com sucesso
- [ ] Seeds popularam banco com dados
- [ ] Arquivos de configuração criados
- [ ] Variáveis de ambiente configuradas (.env)
- [ ] Testes E2E executados
- [ ] Todos os testes passando
- [ ] Cobertura de código verificada
- [ ] Documentação atualizada

---

**Status**: Pronto para execução
**Data**: Dezembro 2025
**Testes Criados**: 3 arquivos (30+ test cases)
