# NOOWE Platform - Post-Mortem Process

## Purpose

We practice **blameless post-mortems**. The goal is to understand what happened, why it happened, and how we prevent it from happening again. We focus on systemic improvements, not individual blame.

Every incident is a learning opportunity. A well-written post-mortem makes the entire platform more resilient.

---

## When to Trigger a Post-Mortem

A post-mortem is **required** when any of the following occur:

- **SLA breach**: API availability drops below 99.5% or response time exceeds SLA thresholds
- **Data loss or corruption**: Any unintended modification or loss of user/restaurant data
- **Security incident**: Unauthorized access, data breach, or vulnerability exploitation
- **Downtime > 30 minutes**: Any unplanned outage exceeding 30 minutes
- **Payment processing failure > 15 minutes**: Customers unable to complete payments
- **Data protection incident**: Any event requiring LGPD notification to ANPD or affected users

A post-mortem is **recommended** (team discretion) when:

- Near-miss incidents that could have caused the above
- Degraded performance lasting > 1 hour
- Repeated alerts requiring manual intervention
- Customer-reported issues affecting > 50 users

---

## Timeline

```
Incident Detected
    │
    ├── Immediately: Incident response, mitigate impact
    │
    ├── Within 24 hours: Initial writeup (incident lead)
    │   - Fill in the template with known facts
    │   - Share draft with the responding team
    │
    ├── Within 5 business days: Full post-mortem
    │   - Complete root cause analysis
    │   - Define action items with owners and deadlines
    │   - Review meeting with the team
    │
    └── Ongoing: Track action items to completion
        - Review in weekly engineering standup
        - Close items as they are deployed
```

---

## Post-Mortem Template

Copy and fill in this template for each incident. Save as `docs/post-mortems/YYYY-MM-DD-short-description.md`.

```markdown
# Post-Mortem: [Incident Title]

**Date:** YYYY-MM-DD
**Severity:** Critical / High / Medium
**Duration:** HH:MM (from detection to resolution)
**Author:** [Name]
**Status:** Draft / Final

---

## Incident Summary

[2-3 sentences describing what happened, what was affected, and the business impact.]

---

## Timeline (all times in UTC-3 / Brasilia)

| Time | Event |
|------|-------|
| HH:MM | [First sign of the issue / alert triggered] |
| HH:MM | [On-call engineer paged / acknowledged] |
| HH:MM | [Root cause identified] |
| HH:MM | [Mitigation applied] |
| HH:MM | [Service fully restored] |
| HH:MM | [Monitoring confirmed stable] |

---

## Root Cause

[Detailed technical explanation of why the incident occurred. Be specific — reference code, configuration, infrastructure, or process failures.]

---

## Impact

- **Users affected:** [Number or percentage]
- **Services affected:** [API, WebSocket, Payments, etc.]
- **Revenue impact:** [Estimated, if applicable]
- **Data impact:** [Any data loss or corruption — specify scope]
- **LGPD implications:** [Yes/No — if yes, was ANPD notification required?]

---

## Detection

- **How was it detected?** [Monitoring alert / customer report / manual check]
- **Time to detect (TTD):** [Minutes from incident start to detection]
- **Could detection be faster?** [Yes/No — how?]

---

## Response

- **Who responded?** [Names and roles]
- **Time to mitigate (TTM):** [Minutes from detection to mitigation]
- **Was the runbook followed?** [Yes/No — which section? Was it sufficient?]
- **Escalations:** [Who was escalated to and why?]

---

## Resolution

[What was done to fully resolve the incident. Include commands run, config changes, code deployments, etc.]

---

## What Went Well

- [Thing that worked as expected]
- [Effective process or tool]
- [Quick response or detection]

## What Went Wrong

- [Gap in monitoring or alerting]
- [Missing runbook procedure]
- [Process that slowed down response]

## Where We Got Lucky

- [Anything that could have made this worse but didn't]

---

## Action Items

| # | Action | Owner | Deadline | Status |
|---|--------|-------|----------|--------|
| 1 | [Specific, measurable action] | [Name] | YYYY-MM-DD | Open |
| 2 | [Specific, measurable action] | [Name] | YYYY-MM-DD | Open |
| 3 | [Specific, measurable action] | [Name] | YYYY-MM-DD | Open |

---

## Lessons Learned

[Key takeaways that should be shared more broadly. What would you tell another team to avoid this?]
```

---

## Distribution & Review

### Who receives the post-mortem:
- All engineers on the responding team
- Engineering leadership (Team Lead, CTO)
- DPO (if the incident involved personal data)
- Stakeholders affected by the incident

### Review meeting:
- Schedule within 5 business days of the incident
- Attendees: incident responders + team lead
- Duration: 30-60 minutes
- Agenda: Walk through the timeline, validate root cause, agree on action items
- Tone: Blameless, focused on systems and processes

### Storage:
- All post-mortems stored in `docs/post-mortems/`
- Named: `YYYY-MM-DD-short-description.md`
- Linked from the incident tracking system

---

## Follow-Up

### Tracking Action Items
- All action items are created as issues in the project management tool within 24 hours of the review meeting
- Each item has a clear owner and deadline
- Items are tagged with `post-mortem` label for tracking
- Review open post-mortem items in weekly engineering standup

### Closing a Post-Mortem
A post-mortem is considered **closed** when:
1. All action items are completed or explicitly deferred with justification
2. The post-mortem document status is updated to "Final"
3. Any runbook updates identified have been applied

### Recurring Themes
- If the same root cause appears in 3+ post-mortems, escalate to a dedicated project/initiative
- Quarterly review of all post-mortems to identify systemic patterns
