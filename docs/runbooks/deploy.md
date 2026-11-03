# Deploy — DevThread

DevThread deploys to **Netlify** from the `main` branch. The site is a single
Next.js app; there is no separate backend process. Netlify builds with
`@netlify/plugin-nextjs` (see `netlify.toml`) and serves the result on
`devthread.site`.

**Cloudflare Tunnel is NOT the production host.** It stays in the repo for
local dev and preview only — see `docs/runbooks/cloudflared.md` and
`docs/hosting.md`.

## Environments
| Env | Branch | Database | AdSense | Email |
|---|---|---|---|---|
| Local | any | `DATABASE_URL` from `.env` | from `.env` | from `.env` |
| Staging | `main` (preview) | Supabase **staging** project | test ID or none | test key |
| Production | `main` (deploy) | Supabase **production** project | real ID | real key |

Staging and production **never share a database**.

## Pre-deploy checklist
- [ ] `npm run build` passes (CI runs this on every PR).
- [ ] `npm run lint` is clean.
- [ ] Migrations are committed (schema is bootstrapped idempotently by
      `src/db/index.ts`, so there is no separate migration tool — but any schema
      change must be reviewed before deploy).
- [ ] Env vars for the target environment are set in the shell/`.env`:
      `DATABASE_URL`, `NEXT_PUBLIC_ADSENSE_CLIENT`, `ADMIN_EMAILS`,
      `RESEND_*`, `NEXT_PUBLIC_SITE_URL`.
- [ ] `NEXT_PUBLIC_SITE_URL` matches the production domain
      (`https://devthread.site`).
- [ ] Netlify is authenticated: `netlify login` (one-time, per machine).
- [ ] The site is linked to this repo: `netlify init`.

## Deploy steps
1. Merge the feature branch into `main` (PR review required).
2. Build and verify locally: `npm run build && npm run lint`.
3. Push `main`. Netlify builds with `netlify.toml` and deploys automatically.
4. Smoke test on the deployed URL: homepage renders, an article opens,
   `/api/health` returns `ok`, admin login works, AdSense tags fire.
5. Custom domain: in the Netlify dashboard, **Settings → Domain Management →
   Add custom domain**, enter `devthread.site`, and point your registrar's
   nameservers at Netlify (or use Cloudflare DNS with a CNAME).
6. Once live: run `npm run generate-sitemap` against production so
   `sitemap.xml` reflects the real domain, then commit and redeploy.
7. Verify on the real site: article renders, admin login works,
   `/api/health` is `ok`.

## Migrations
Schema changes are applied by `src/db/index.ts` on first DB connect
(`CREATE TABLE IF NOT EXISTS`). Because it is idempotent, deploys never need a
separate migration step — but a schema change must be reviewed before deploy.

## Rollback
See `docs/runbooks/rollback.md`. Netlify keeps deploy history per branch —
revert by redeploying a previous build from the dashboard.

## First-deploy notes
- The build command is `npm run build` and the publish directory is `.next`
  (see `netlify.toml`). `@netlify/plugin-nextjs` handles routing, image
  optimization and serverless API routes.
- Uploads are written to `public/uploads/` on the running instance. Because
  the Next.js build is immutable, uploads from a previous deploy are preserved
  on disk but a new deploy's code won't see them until the next request writes.
  This is fine for a single-region deploy; revisit if you scale horizontally.
- The tunnel does **not** replace app-level auth. `authenticate` still enforces
  the admin-only gate (see `docs/permissions.md`). Secrets (`ADMIN_EMAILS`,
  `DATABASE_URL`, `RESEND_*`) come from the environment where Next.js runs —
  the tunnel only proxies traffic.
- AdSense: `public/ads.txt` contains `pub-3517858716332831`. Add
  `devthread.site` as a site in your AdSense account and verify the `ads.txt`
  record resolves at `https://devthread.site/ads.txt`.