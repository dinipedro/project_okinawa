# NOOWE Platform - Status Page Configuration Guide

## Recommended URL

```
https://status.noowebr.com
```

---

## Tool Options

| Tool | Type | Pros | Cons |
|------|------|------|------|
| **Cachet** | Self-hosted (open source) | Full control, no recurring cost, LGPD-friendly (data stays in your infra) | Requires maintenance, PHP stack |
| **Instatus** | SaaS | Modern UI, easy setup, generous free tier | Third-party dependency, data abroad |
| **Statuspage.io** (Atlassian) | SaaS | Industry standard, Jira integration | Expensive at scale, data abroad |

**Recommendation:** Cachet for LGPD compliance (data sovereignty) or Instatus for quick setup.

---

## Components to Monitor

Configure these components on the status page, grouped by category:

### Core Platform
| Component | Description | Check Method |
|-----------|-------------|--------------|
| **API** | REST API (all endpoints) | `GET /api/v1/health/ready` every 60s |
| **WebSocket** | Real-time communication (8 gateways) | Socket.IO connection test every 60s |
| **Database** | PostgreSQL availability | Health check reports DB status |
| **Authentication** | Login, registration, OTP | `GET /api/v1/health` — auth module status |

### Payments & Orders
| Component | Description | Check Method |
|-----------|-------------|--------------|
| **Payment Processing** | Stripe/payment gateway | Monitor gateway status + internal circuit breaker |
| **Order Processing** | Order creation and updates | Health check + Bull queue depth |

### External Services
| Component | Description | Check Method |
|-----------|-------------|--------------|
| **Push Notifications** | Expo push notification delivery | Monitor Expo push receipt errors |
| **SMS/OTP** | Phone verification messages | Monitor OTP provider success rate |
| **AI Features** | OpenAI-powered pairing assistant | Monitor API response times and fallback activation |

### Mobile Apps
| Component | Description | Check Method |
|-----------|-------------|--------------|
| **Client App** | Customer-facing mobile app | App Store/Play Store availability |
| **Restaurant App** | Restaurant management mobile app | App Store/Play Store availability |

---

## Incident Communication Templates

### Status: Investigating
```
**Investigating** - We are currently investigating reports of [brief description].
Users may experience [specific impact]. Our team is actively looking into this.

We will provide an update within 30 minutes.

Posted: YYYY-MM-DD HH:MM (Brasilia)
```

### Status: Identified
```
**Identified** - We have identified the cause of [brief description].
The issue is related to [high-level cause without exposing internals].

Our team is implementing a fix. We expect resolution within [estimated time].

Posted: YYYY-MM-DD HH:MM (Brasilia)
```

### Status: Monitoring
```
**Monitoring** - A fix has been implemented for [brief description].
We are monitoring the platform to ensure the issue is fully resolved.

Services should be operating normally. If you continue to experience issues,
please contact suporte@noowebr.com.

Posted: YYYY-MM-DD HH:MM (Brasilia)
```

### Status: Resolved
```
**Resolved** - The issue affecting [brief description] has been fully resolved.
All services are operating normally.

Total duration: [X hours Y minutes]
Impact: [brief impact summary]

We apologize for any inconvenience. A post-mortem will be conducted and
improvements will be made to prevent recurrence.

Posted: YYYY-MM-DD HH:MM (Brasilia)
```

---

## Scheduled Maintenance Template

### Advance Notice (post 48+ hours before)
```
**Scheduled Maintenance** - [Component Name]

We will be performing scheduled maintenance on [date] from [start time] to
[end time] (Brasilia time).

**What to expect:**
- [Component] will be unavailable / may experience intermittent errors
- [Other component] will remain fully operational
- Estimated duration: [X hours]

**Why:**
[Brief explanation — database upgrade, security patch, infrastructure improvement]

No action is required from users. We will update this notice when maintenance
is complete.
```

### Maintenance In Progress
```
**In Progress** - Scheduled maintenance on [Component] is currently underway.
Expected completion: [end time] (Brasilia time).
```

### Maintenance Complete
```
**Completed** - Scheduled maintenance on [Component] has been completed
successfully. All services are operating normally.

Duration: [actual duration]
```

---

## Integration with Monitoring

### Sentry to Status Page

Configure Sentry alert rules to automatically update the status page:

1. **Sentry Alert Rule**: Create an alert for error rate > 5% over 5 minutes
2. **Webhook Action**: Point to your status page's incident API
3. **Payload mapping**:
   - Sentry alert fires → Create incident (status: "Investigating")
   - Sentry alert resolves → Update incident (status: "Monitoring")

#### Cachet API Example
```bash
# Create incident via Cachet API
curl -X POST https://status.noowebr.com/api/v1/incidents \
  -H "X-Cachet-Token: YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Performance Degradation",
    "message": "We are investigating reports of increased API latency.",
    "status": 1,
    "component_id": 1,
    "component_status": 3,
    "notify": true
  }'
```

Cachet incident statuses: `1` = Investigating, `2` = Identified, `3` = Watching, `4` = Fixed
Cachet component statuses: `1` = Operational, `2` = Performance Issues, `3` = Partial Outage, `4` = Major Outage

### Health Check to Status Page

Run a cron job to poll health endpoints and update component status:

```bash
#!/bin/bash
# health-to-status.sh — run every 60 seconds via cron

HEALTH=$(curl -sf http://localhost:3000/api/v1/health/ready)
STATUS=$?

if [ $STATUS -eq 0 ]; then
  # Update component to Operational
  curl -s -X PUT https://status.noowebr.com/api/v1/components/1 \
    -H "X-Cachet-Token: $CACHET_TOKEN" \
    -d '{"status": 1}'
else
  # Update component to Major Outage
  curl -s -X PUT https://status.noowebr.com/api/v1/components/1 \
    -H "X-Cachet-Token: $CACHET_TOKEN" \
    -d '{"status": 4}'
fi
```

### Recommended Automation Flow

```
Health Checks (every 60s)
    │
    ├── Healthy → Component status: Operational
    │
    └── Unhealthy (3 consecutive) →
        ├── Create incident (Investigating)
        ├── Notify subscribers
        └── Page on-call engineer (PagerDuty/Opsgenie)

Sentry Alert (error spike)
    │
    └── Webhook → Update status page component
                → Create incident if none exists

Manual (engineer decision)
    │
    └── Update via status page dashboard
        - Scheduled maintenance
        - Nuanced incident updates
```

---

## Subscriber Notifications

Configure the status page to allow users to subscribe via:

- **Email**: Primary channel for restaurant owners and managers
- **Webhook**: For programmatic integrations
- **RSS**: For monitoring dashboards

Notification triggers:
- New incident created
- Incident status updated
- Scheduled maintenance posted
- Component status changed

---

## Best Practices

1. **Update frequently**: During an active incident, post updates every 30 minutes minimum even if there is no new information
2. **Be honest but measured**: Acknowledge the issue without exposing internal architecture or security details
3. **Use business language**: "Payment processing" not "Stripe webhook handler"; "real-time updates" not "Socket.IO gateway"
4. **Post maintenance windows early**: Minimum 48 hours advance notice, prefer 1 week
5. **Track uptime**: Display 90-day rolling uptime percentage per component
6. **Review monthly**: Check that all components listed are still relevant and monitored
