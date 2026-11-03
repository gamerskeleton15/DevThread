# Incident response — DevThread

An incident is any event where DevThread is unavailable, degraded, or leaking
data. This runbook covers declaring one, communicating, and reviewing.

## Severity levels
| Level | Definition | Response time |
|---|---|---|
| P1 | Site down, or user data at risk | 15 min |
| P2 | Major flow broken (login, writing, posting) | 1 hr |
| P3 | Minor issue (a page 404s, slow endpoint) | Same day |

## Declare an incident
1. Confirm it's real — reproduce, check `/api/health`, check Vercel deploy log.
2. Open the incident channel (the team's Slack/Signal; replace `#devthread-alerts`).
3. Post: `P# — <short title> — <what's broken> — started <UTC time>`.
4. Assign an incident commander (IC) and a scribe. IC runs the response; scribe
   writes decisions and timestamps.

## Communicate
- **Internal:** IC posts status updates in the incident channel every ~30 min
  until resolved or downgraded.
- **Users:** If the site is down, post a short notice on the status page
  (Vercel's or a simple `status.devthread.site`). Say what's broken, what
  we're doing, and an ETA. Don't speculate about causes you haven't confirmed.
- **After resolution:** post a summary within 24h — what happened, impact,
  action taken, and follow-ups.

## Likely causes
| Symptom | Check first |
|---|---|
| Whole site 5xx | Vercel deploy log; recent deploy; env vars |
| `/api/health` degraded | `checks.database` — Supabase project region/quota; `DATABASE_URL` |
| Login fails | Session cookie settings; Supabase users table; rate limit |
| Contact/newsletter fail | `RESEND_API_KEY` in production env; Resend dashboard for rejected sends |
| Article 404 | `content/posts/` file deleted; slug mismatch; user post deleted |

## Post-incident review
Within 48 hours, write a note in `docs/runbooks/incidents/`:
- Timeline (UTC).
- Root cause.
- Impact (users affected, data touched).
- What we changed to prevent recurrence.
- Open follow-ups with an owner.

## Status page
A simple status page (Vercel's built-in, or a static `status.devthread.site`)
shows: DevThread · all systems operational · last updated. Update it during
any incident.