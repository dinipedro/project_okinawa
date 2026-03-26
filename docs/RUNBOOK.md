# NOOWE Platform - Runbook Operacional

## Service Architecture Overview

| Service | Port | Description |
|---------|------|-------------|
| NestJS Backend | 3000 | REST API + WebSocket server |
| PostgreSQL 16 | 5432 | Primary database (with PostGIS) |
| Redis 7 | 6379 | Cache, Bull queues, Socket.IO adapter |
| Bull Workers | - | Background job processing (notifications, receipts, analytics) |

### WebSocket Gateways (8)

| Gateway | Namespace | Purpose |
|---------|-----------|---------|
| OrdersGateway | `/orders` | Real-time order status updates |
| TabsGateway | `/tabs` | Pub/bar tab management |
| ClubQueueGateway | `/club-queue` | Club queue and door management |
| ReservationsGateway | `/reservations` | Reservation status changes |
| EventsGateway | `/events` | General event broadcasting |
| ApprovalsGateway | `/approvals` | Manager approval workflows |
| WaitlistGateway | `/waitlist` | Restaurant waitlist updates |
| CallsGateway | `/calls` | Waiter call notifications |

---

## Health Checks

```bash
# Liveness — is the process running?
curl http://localhost:3000/api/v1/health/live

# Readiness — can it accept traffic? (checks DB + Redis)
curl http://localhost:3000/api/v1/health/ready

# Full health — detailed component status
curl http://localhost:3000/api/v1/health

# Maintenance mode check
curl http://localhost:3000/api/v1/health/maintenance
```

**Expected healthy response:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

---

## Common Incidents & Response

### 1. Database Connection Pool Exhaustion

**Symptoms:** 500 errors, "too many connections" in logs, slow API responses.

**Diagnosis:**
```bash
# Check active connections
docker exec noowe-postgres psql -U noowe -c "SELECT count(*) FROM pg_stat_activity;"

# Check waiting queries
docker exec noowe-postgres psql -U noowe -c "SELECT pid, state, query, wait_event_type FROM pg_stat_activity WHERE state != 'idle' ORDER BY query_start;"
```

**Resolution:**
1. Kill long-running queries: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes';`
2. Restart the backend service: `docker compose restart backend`
3. If recurring, increase `DB_POOL_SIZE` in `.env` (default: 10, max recommended: 50)

---

### 2. Redis Down

**Symptoms:** Bull queues stall, WebSocket cross-instance messaging fails, cache misses spike.

**Diagnosis:**
```bash
docker exec noowe-redis redis-cli ping
docker exec noowe-redis redis-cli info memory
docker exec noowe-redis redis-cli info clients
```

**Resolution:**
1. Restart Redis: `docker compose restart redis`
2. Verify Bull queues resume: check `/api/v1/health` for queue status
3. WebSocket clients will auto-reconnect; monitor gateway logs
4. If data persistence is needed, check `appendonly.aof` integrity

---

### 3. High Memory Usage

**Symptoms:** OOMKilled containers, degraded performance, swap usage.

**Diagnosis:**
```bash
docker stats --no-stream
# Check Node.js heap
curl http://localhost:3000/api/v1/metrics | grep nodejs_heap
```

**Resolution:**
1. Check for memory leaks: review recent deployments for unbounded caches or listeners
2. Restart the affected container: `docker compose restart backend`
3. If PostgreSQL: check `work_mem` and `shared_buffers` settings
4. Set Node.js memory limit: `NODE_OPTIONS="--max-old-space-size=1024"`

---

### 4. Payment Processing Failure

**Symptoms:** Payment endpoints returning 502/503, customers unable to complete orders.

**Diagnosis:**
```bash
# Check circuit breaker state in logs
docker logs noowe-backend --since 10m | grep -i "payment\|circuit"

# Verify payment gateway connectivity
curl -s https://api.stripe.com/v1/charges -H "Authorization: Bearer $STRIPE_SECRET_KEY" -o /dev/null -w "%{http_code}"
```

**Resolution:**
1. Check payment gateway status page (e.g., status.stripe.com)
2. If circuit breaker is open, it will auto-reset after the configured timeout
3. For stuck transactions, check the `payments` table for status `pending` older than 15 minutes
4. Escalate to payment gateway support if their API is degraded

---

### 5. WebSocket Disconnections

**Symptoms:** Real-time updates not reaching clients, stale order statuses.

**Diagnosis:**
```bash
# Check connected clients
docker logs noowe-backend --since 5m | grep -i "socket\|disconnect\|reconnect"

# Verify Redis adapter
docker exec noowe-redis redis-cli pubsub channels "socket.io*"
```

**Resolution:**
1. Verify Redis is healthy (Socket.IO adapter depends on it)
2. Check for network/load balancer timeout issues (WebSocket connections need long timeouts)
3. Ensure load balancer has sticky sessions or Redis adapter configured
4. Clients will auto-reconnect; if persistent, restart backend

---

### 6. Certificate Expiration

**Symptoms:** HTTPS errors, mobile apps failing to connect, browser security warnings.

**Diagnosis:**
```bash
# Check certificate expiry
echo | openssl s_client -connect noowebr.com:443 2>/dev/null | openssl x509 -noout -dates

# Check Let's Encrypt renewal status
certbot certificates
```

**Resolution:**
1. Force renewal: `certbot renew --force-renewal`
2. Reload reverse proxy: `nginx -s reload` or `docker compose restart nginx`
3. Verify: `curl -vI https://noowebr.com 2>&1 | grep "expire date"`
4. Set up cron for auto-renewal: `0 0 1 * * certbot renew --post-hook "nginx -s reload"`

---

## Restart Procedures

### Docker Compose — Single Service Restart
```bash
docker compose restart backend    # Backend only
docker compose restart redis      # Redis only
docker compose restart postgres   # Database only (caution: drops all connections)
```

### Rolling Restart (Zero Downtime)
```bash
# Scale up, then scale down old instances
docker compose up -d --scale backend=2 --no-recreate
sleep 10
docker compose up -d --scale backend=1
```

### Full Stack Restart
```bash
docker compose down
docker compose up -d
# Verify all services
docker compose ps
curl http://localhost:3000/api/v1/health
```

### Emergency Full Restart (Data Preserved)
```bash
docker compose down
docker system prune -f          # Clean dangling resources
docker compose up -d --build    # Rebuild and start
```

---

## Rollback Procedures

### Application Rollback
```bash
# Roll back to previous Docker image tag
docker compose pull backend:previous-tag
docker compose up -d backend

# Or via deploy.yml CI/CD
# Trigger rollback workflow with target commit SHA
```

### Database Migration Rollback
```bash
# Revert last migration
npx typeorm migration:revert -d src/database/data-source.ts

# Check current migration state
npx typeorm migration:show -d src/database/data-source.ts
```

**Important:** Always take a database snapshot before running migrations in production:
```bash
docker exec noowe-postgres pg_dump -U noowe noowe_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## Scaling

### Horizontal Scaling — Backend
- Socket.IO uses Redis adapter for cross-instance communication
- Bull uses Redis for distributed job processing
- Ensure sticky sessions at load balancer level OR rely on Redis adapter

```bash
docker compose up -d --scale backend=3
```

### Database Scaling
- Read replicas for heavy read workloads (analytics, reports)
- Connection pooling via PgBouncer if pool exhaustion is recurring
- PostGIS queries (geofencing) can be CPU-intensive; monitor query times

### Redis Scaling
- Redis Sentinel for high availability
- Separate Redis instances for cache vs. Bull queues if load requires it

---

## Monitoring

| Tool | Purpose | Endpoint/Config |
|------|---------|-----------------|
| Sentry | Error tracking & alerting | `SENTRY_DSN` env var |
| Prometheus | Metrics collection | `GET /api/v1/metrics` |
| Health checks | Service availability | `GET /api/v1/health/*` |
| Docker logs | Application logging | `docker logs noowe-backend` |

### Key Metrics to Watch
- `http_request_duration_seconds` — API latency (p95 < 500ms)
- `nodejs_heap_used_bytes` — Memory usage
- `bull_queue_waiting` — Queued jobs count
- `pg_stat_activity` — Active database connections
- WebSocket connected clients count

### Alerting Thresholds (Recommended)
| Metric | Warning | Critical |
|--------|---------|----------|
| API p95 latency | > 1s | > 5s |
| Error rate (5xx) | > 1% | > 5% |
| DB connections | > 70% pool | > 90% pool |
| Memory usage | > 70% | > 90% |
| Queue backlog | > 100 jobs | > 500 jobs |
| Health check | 1 failure | 3 consecutive failures |

---

## Contact Escalation

| Role | Contact | When to Escalate |
|------|---------|------------------|
| On-call Engineer | Check rotation schedule | First responder for all incidents |
| DPO (Data Protection) | dpo@noowebr.com | Data breach, LGPD concerns |
| Security Team | security@noowebr.com | Security incidents, vulnerabilities |
| Platform Support | suporte@noowebr.com | Customer-facing issues |
| Payment Gateway | Provider support portal | Payment processing failures > 15min |

**Escalation order:** On-call Engineer → Team Lead → CTO → External vendors (if applicable)

---

## Useful Commands

```bash
# === Docker & Logs ===
docker compose ps                                    # Service status
docker logs noowe-backend --since 30m --tail 200     # Recent backend logs
docker logs noowe-backend 2>&1 | grep -i error       # Filter errors
docker stats --no-stream                              # Resource usage

# === Database ===
docker exec noowe-postgres psql -U noowe -c "SELECT count(*) FROM pg_stat_activity;"
docker exec noowe-postgres psql -U noowe -c "SELECT pg_database_size('noowe_db');"
docker exec noowe-postgres psql -U noowe -c "\dt"     # List all tables
docker exec noowe-postgres pg_dump -U noowe noowe_db > backup.sql

# === Redis ===
docker exec noowe-redis redis-cli ping
docker exec noowe-redis redis-cli info memory
docker exec noowe-redis redis-cli dbsize              # Key count
docker exec noowe-redis redis-cli keys "bull:*"       # Bull queue keys

# === Bull Queue Status ===
docker exec noowe-redis redis-cli llen "bull:notifications:wait"
docker exec noowe-redis redis-cli llen "bull:notifications:active"
docker exec noowe-redis redis-cli llen "bull:notifications:failed"

# === Application ===
curl -s http://localhost:3000/api/v1/health | jq .
curl -s http://localhost:3000/api/v1/metrics
```
