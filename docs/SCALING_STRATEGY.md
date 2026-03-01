# Scaling Strategy & Database Hardening

> Last Updated: 2026-02-24

## Current Architecture Limits

| Component | Current Config | Max Capacity (est.) | Bottleneck |
|---|---|---|---|
| DB Connection Pool | max=20 (prod), min=2 | ~500 concurrent requests | Pool exhaustion under sustained load |
| Redis | Single instance, password auth | ~50k ops/sec | Memory-bound |
| API Server | Single instance | ~1000 req/sec | CPU-bound (bcrypt, JWT) |
| Worker | Single instance | ~100 jobs/sec | Queue depth |
| Entity Glob | `**/*.entity{.ts,.js}` | ~100 entities | Startup scan time |

## Database Hardening

### Connection Pooling (Current)

```typescript
extra: {
  max: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),  // Production
  min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
}
```

**Recommendation for 10x:**
- `DATABASE_POOL_MAX=50` (with pgBouncer in front)
- Add `statement_timeout: '30s'` to prevent runaway queries
- Enable `pg_stat_statements` for query performance monitoring

### Critical Indexes (Required)

```sql
-- Already created via migrations:
CREATE INDEX idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_token_blacklist_jti ON token_blacklist(jti);
CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- Recommended additions for scale:
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_otp_tokens_phone_number ON otp_tokens(phone_number, is_used);
```

### Entity Glob Performance

Current: `resolveGlob('**/*.entity')` scans entire `src/` tree.

**Mitigation:**
- At 31 tables this is acceptable (~50ms startup)
- At 100+ tables: switch to explicit entity registration
- TypeORM `autoLoadEntities: true` with `forFeature()` is already the NestJS best practice
- Current glob approach is safe for current scale

### Migration Consistency

- 20 migrations in chronological order ✅
- `synchronize: false` enforced ✅
- CLI DataSource export exists for `migration:generate` ✅
- Migration verification in CI pipeline ✅

## Scaling Roadmap

### Level 1: 10x Users (~10k DAU)

| Action | Component | Effort |
|---|---|---|
| Add pgBouncer | Database | 2h |
| Increase pool to 50 | Database | Config change |
| Scale workers to 3 | Bull Queue | Docker config |
| Add Redis Sentinel | Cache | 4h |
| CDN for static assets | Frontend | 2h |

**Estimated infra cost:** $150-300/mo

### Level 2: 100x Users (~100k DAU)

| Action | Component | Effort |
|---|---|---|
| Read replicas (1-2) | Database | 1d |
| Connection via pgBouncer pool | Database | 4h |
| Redis Cluster (3 nodes) | Cache | 1d |
| Horizontal API scaling (3+ pods) | API | 4h (K8s config) |
| Auto-scaling based on CPU/memory | Infrastructure | 1d |
| CDN with edge caching | Frontend | 4h |
| WebSocket sticky sessions | Load Balancer | 2h |
| Database query optimization | Database | 2-3d |

**Architecture for 100x:**

```
                    ┌─────────────┐
                    │  CloudFlare  │
                    │  CDN + WAF   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  ALB / NLB  │
                    │  (sticky)   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌───▼─────┐ ┌───▼─────┐
        │  API Pod 1 │ │ API Pod 2│ │ API Pod 3│
        └─────┬─────┘ └───┬─────┘ └───┬─────┘
              └────────────┼────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
   ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
   │  PG Primary│    │  PG Read  │    │  Redis     │
   │            │    │  Replica  │    │  Cluster   │
   └────────────┘    └───────────┘    └────────────┘
```

**Estimated infra cost:** $800-2000/mo

### Level 3: 1000x Users (~1M DAU)

- Database sharding by restaurant_id
- Event-driven architecture (Kafka/SQS)
- Microservice decomposition (Orders, Payments, Notifications)
- Global CDN with edge compute
- Multi-region deployment

**This level requires architectural redesign — not achievable with current monolith.**

## Current Hardening Status

| Category | Status | Notes |
|---|---|---|
| Connection pooling | ✅ Configured | Env-configurable max/min |
| SSL/TLS for DB | ✅ Supported | `DATABASE_SSL=true` |
| Query logging | ✅ Configurable | `DATABASE_LOGGING=true` |
| Retry on failure | ✅ 10 attempts (prod) | 3s delay between |
| Redis cache auth | ✅ Fixed | Password + separate DB |
| Keep-alive | ✅ Enabled | Long-running connections |
| Idle timeout | ✅ 30s | Prevents connection leaks |
