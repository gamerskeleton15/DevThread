# Monitoring — DevThread

DevThread is a small publication, so the monitoring plan is intentionally
light: catch the things that need a human, and nothing else.

## Uptime checks (Vercel / external monitor)
| Check | What it verifies | Cadence |
|---|---|---|
| Homepage `/` | 200 + "DevThread" in body | every 1 min |
| Article `/blog/understanding-neural-networks` | 200 | every 5 min |
| `/api/health/live` | 200 | every 1 min |
| `/api/health` | 200 and `status: "ok"` | every 5 min |

Alert if the homepage or `/api/health` fails for **2 of 5 minutes**.

## Technical metrics
| Metric | Source | Alert threshold |
|---|---|---|
| 5xx rate | Vercel Analytics | >1% over 5 min |
| p95 edge latency | Vercel | >2s over 10 min |
| `/api/health` degraded | health check | 2 failures |
| Database connection errors | `checks.database: "error"` in health payload | 2 failures |
| Failed email sends | Resend dashboard | any in production |

## Business metrics
| Metric | Source |
|---|---|
| New signups / day | `users.created_at` |
| Posts published / week | `posts.date` |
| Newsletter signups / day | `subscribers.created_at` |
| Contact messages / day | `messages.created_at` |

Review weekly. Alert only on anomalies (e.g. signups drop to 0 for 3 days).

## Alert routing
- P1 (down): SMS + email to the owner within 5 min.
- P2 (degraded): email within 1 hour.
- P3 (info): dashboard only.

Every alert has a runbook in `docs/runbooks/`. Alert only on things a human must
act on.

## Dashboards
- Vercel Analytics: edge latency, errors, requests by route.
- Supabase: database size, active connections, slow queries.
- Resend: sent/rejected/delivered counts.

## Review cadence
Look at the dashboard at least weekly. Revisit thresholds after the first month
of real traffic.