# Hosting — DevThread

DevThread is a **Next.js 16 content site** (blog + editor layer). It is hosted
on **Netlify** (free tier), with **Cloudflare Tunnel** kept as a local-dev /
preview ingress.

## Components

| Component | Provider | Plan | Cost | Notes |
|---|---|---|---|---|
| Frontend / build | Netlify | Free | $0 | `@netlify/plugin-nextjs` runs `npm run build` on every deploy |
| Domain | `devthread.site` | DNS registrar | $0–$10/yr | Point the zone at Netlify's nameservers (or use Cloudflare DNS) |
| Database | Supabase (Postgres) | Free | $0 | `DATABASE_URL` from `.env` |
| Auth | custom scrypt sessions | — | $0 | `ADMIN_EMAILS` from `.env` |
| AdSense | Google | — | $0 | `ca-pub-3517858716332831` via `NEXT_PUBLIC_ADSENSE_CLIENT` |
| Analytics | GA4 + GTM | Google | $0 | `G-G5288TP4VN` / `GTM-5NMKJB26` |
| Email (optional) | Resend | Free | $0 | `RESEND_*` from `.env` |
| Local dev / preview | Cloudflare Tunnel | — | $0 | `cloudflared/tunnel.yml` — see `docs/runbooks/cloudflared.md` |

## Why Netlify (and not Vercel)
- **Next.js 16 support.** Netlify's `@netlify/plugin-nextjs` (v5.16.5) supports
  the current Next.js line; the Cloudflare Pages adapter does not yet.
- **AdSense on the free tier.** Netlify's free plan permits a monetized hobby
  blog. Vercel's Hobby plan restricts commercial use — AdSense revenue would
  technically require Pro.
- **Simpler deploy.** Push to a branch → Netlify builds and deploys. No manual
  `npm run start` + tunnel process to keep alive.

## Why Cloudflare Tunnel is still in the repo
It is **not** the production host. It stays for:
- **Local dev** — expose `localhost:3000` to the internet for client review and
  for testing Supabase/Resend webhooks that need a public URL.
- **Preview** — a quick production build behind a tunnel before going live.

See `docs/runbooks/cloudflared.md`.

## Environment variables per environment

| Variable | Local | Staging | Production |
|---|---|---|---|
| `DATABASE_URL` | Supabase local | Supabase staging | Supabase prod |
| `ADMIN_EMAILS` | your email | your email | your email |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://devthread.site` | `https://devthread.site` |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | (unset) | (unset) | `ca-pub-3517858716332831` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | (unset) | `G-G5288TP4VN` | `G-G5288TP4VN` |
| `NEXT_PUBLIC_GTM_ID` | (unset) | `GTM-5NMKJB26` | `GTM-5NMKJB26` |
| `RESEND_API_KEY` | (unset) | test key | real key |

All secrets live in `.env`, which is git-ignored. See `.env.example`.

## Deploy steps
1. `netlify login` (one-time).
2. `netlify init` — link the site to this repo (creates a site ID in
   `.netlify/state.json`).
3. Push to a branch. Netlify builds with `netlify.toml` and deploys.
4. Custom domain: in the Netlify dashboard, **Settings → Domain Management →
   Add custom domain**, enter `devthread.site`, and point your registrar's
   nameservers at Netlify (or add a CNAME `devthread.site →
   <netlify-site>.netlify.app` if using Cloudflare DNS).
5. Verify: `https://devthread.site` renders, an article opens, `/api/health`
   returns `ok`, and AdSense tags fire.
6. Run `npm run generate-sitemap` against production and commit the result.

## Rollback
See `docs/runbooks/rollback.md`. Netlify keeps deploy history per branch —
revert by redeploying a previous build from the dashboard.

## Decisions I own
- Whether to pay for a custom domain (yes — `devthread.site`).
- Whether to move off the free tier as traffic grows.
- Whether to switch the production host later.