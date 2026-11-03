# Cloudflare Tunnel — DevThread

Cloudflare Tunnel is a reverse proxy that connects your app to the Cloudflare
network **without opening inbound firewall ports**. It's useful for:

- **Local dev** — expose `localhost:3000` to the internet for client review or
  webhook testing (e.g. Supabase, Resend) without a public domain.
- **Production** — serve the Next.js app through Cloudflare instead of Vercel,
  or as a backup ingress.

It is **not** a replacement for Vercel. The primary production host is Vercel
(see `docs/runbooks/deploy.md`). This runbook covers the tunnel as an
alternative/preview ingress.

## Prerequisites
- `cloudflared` CLI installed: `npm i -g cloudflared` or download from
  https://developers.cloudflare.com/cloudflare-tunnel/
- A Cloudflare account with a zone for your domain.

## One-time setup
```bash
# 1. Authenticate (one-time, per machine)
cloudflared login

# 2. Create the tunnel
cloudflared tunnel create devthread

# 3. Deploy the config file (writes cloudflared/tunnel.yml with the UUID)
npm run tunnel:deploy
```

After step 3, `cloudflared/tunnel.yml` is written with your tunnel's UUID.

## Daily use

### Local dev behind a tunnel
```bash
# Terminal A — start the app
npm run dev

# Terminal B — run the tunnel
npm run tunnel:run
```

The tunnel prints a hostname like `https://devthread-<id>.cfargotunnel.com`.
Open it in a browser — it proxies to `localhost:3000`.

### Production behind a tunnel
```bash
npm start              # serve the production build on localhost:3000
npm run tunnel:run     # proxy localhost:3000 through Cloudflare
```

### Point a custom domain at the tunnel
```bash
npm run tunnel:route
# → creates a CNAME in Cloudflare: devthread.site → tunnel
```

## Config file
`cloudflared/tunnel.yml`:

```yaml
tunnel: devthread
credentials-file: ~/.cloudflared/creds-devthread.json

ingress:
  - hostname: devthread.local
    service: http://localhost:3000
  - service: status:404
```

- `service: status:404` is the **required catch-all** — every hostname not
  listed above returns 404.
- Add more `ingress` entries for additional local services (e.g. a separate
  backend on port 8080) without changing app code.
- `credentials-file` uses `~/.cloudflared/...` so it resolves correctly on
  both Windows (`C:\Users\<you>\.cloudflared\...`) and Linux/Mac.

## Security notes
- The tunnel itself is encrypted (Cloudflare → your machine).
- **Env vars still matter**: `ADMIN_EMAILS`, `DATABASE_URL`, `RESEND_*`, etc.
  must be set in the environment running the app — the tunnel only proxies
  traffic, it doesn't inject secrets.
- The tunnel does **not** replace app-level auth. `authenticate` still
  enforces the admin-only gate (see `docs/permissions.md`).
- Never expose `/api/upload`, `/write`, or `/edit` to the public tunnel in
  production without auth — the app already requires a session for these.

## Troubleshooting
| Symptom | Likely cause | Fix |
|---|---|---|
| `tunnel:run` exits immediately | Tunnel name mismatch or stale creds | Re-run `npm run tunnel:deploy` |
| 404 on the tunnel hostname | Catch-all rule misconfigured | Check `ingress` in `cloudflared/tunnel.yml` |
| Site loads but login fails | `ADMIN_EMAILS` not set in this env | Set it in the shell or `.env` before `npm run dev` |
| Env-var errors at runtime | `.env` not loaded by `next dev` | `next dev` reads `.env.local` — confirm the file exists |

## Decisions I own
- Whether to use the tunnel for production or only for dev/preview.
- Which hostnames to route through the tunnel.
- Whether to add a `--no-verify` flag to skip TLS verification in dev.