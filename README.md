# DevThread

A tech publication where working engineers share what they've learned.
Backend, platform, and ML — no fluff, no hype, just hard-won knowledge.

Built with **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS 4**, and **Postgres**.
Public content (articles, SEO, sitemap) is served from the filesystem; the editor
layer (accounts, writing, contact, newsletter) talks to Postgres.

## Features

- **Threaded-stream homepage** — reverse-chronological posts, not a hero banner.
  Category filter bar, "Active discussions" sidebar, and a Key Takeaway callout on
  every article (the DevThread signature).
- **Editor accounts** — email + password login. Your first login creates your
  account. Write, edit, and delete your own posts; profile page lists them.
- **MDX + user posts** — authored articles live in `content/posts/*.mdx`;
  community threads are stored in Postgres. Both render through the same route.
- **Contact form** + **newsletter signup** — both validated server-side and
  persisted in Postgres (email delivery via Resend when configured).
- **AdSense-ready** — ad slots read `NEXT_PUBLIC_ADSENSE_CLIENT` from the env.
  No ads load until the ID is set, and dev shows a neutral placeholder.
- **SEO essentials** — per-page titles/descriptions, Open Graph, JSON-LD
  structured data, sitemap.xml, robots.txt, friendly URLs, custom 404.

## Getting started

### Prerequisites
- Node.js 18.0.0 or later
- npm package manager

### Installation
```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, AdSense ID, etc.
npm run dev
```
Visit http://localhost:3000.

**Without a database** the site still runs in blog-only mode: articles render,
but login, writing, contact, and newsletter return friendly errors.

## Project structure
```
devthread/
├── content/posts/          # MDX articles (source of truth for public posts)
├── public/                # favicon, robots.txt, sitemap.xml, uploads/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/health/    # /api/health + /api/health/live
│   │   ├── blog/[slug]/   # article pages
│   │   ├── write/         # editor (auth-gated)
│   │   ├── profile/       # author dashboard
│   │   ├── login/         # auth page
│   │   └── ...
│   ├── components/        # Navbar, Footer, ThreadCard, AdSlot, WriteForm, ...
│   ├── db/                # Postgres client + query helpers
│   └── lib/               # auth, posts, sanitize, uploads
├── scripts/generate-sitemap.ts
└── docs/                  # design direction, runbooks, decisions
```

## Scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run generate-sitemap` | Regenerate `public/sitemap.xml` from MDX frontmatter |
| `npm run tunnel:run` | Run the Cloudflare Tunnel (proxies `localhost:3000`) |
| `npm run tunnel:deploy` | Deploy the tunnel config (`cloudflared/tunnel.yml`) |
| `npm run tunnel:route` | Route a custom domain through the tunnel |

## Environment
See `.env.example`. Every value is documented; secrets live only in `.env`,
which is git-ignored. Required for the editor layer: `DATABASE_URL` and
`ADMIN_EMAILS` (comma-separated emails allowed to log in). Optional:
`NEXT_PUBLIC_ADSENSE_CLIENT`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO`,
`NEXT_PUBLIC_SITE_URL`, `MAINTENANCE_MODE`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`,
`NEXT_PUBLIC_GTM_ID`.

## Deployment
DevThread deploys to **Netlify** (see `docs/hosting.md` and
`docs/runbooks/deploy.md`). Push `main` and Netlify builds with
`@netlify/plugin-nextjs` (see `netlify.toml`) and serves the result on
`devthread.site`.

**Cloudflare Tunnel is for local dev / preview only** (see
`docs/runbooks/cloudflared.md`) — it exposes `localhost:3000` for client review
and webhook testing, it is not the production host.

## Contributing
1. Fork the repo and create a feature branch.
2. Commit with Conventional Commits (`feat:`, `fix:`, `style:`).
3. Open a PR describing the change, why, how to test, and the risks.
4. Never push directly to `main`.

## License
MIT — see `LICENSE`.