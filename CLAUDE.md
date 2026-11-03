# DevThread — project CLAUDE.md

**Project type: Content site (blog with editor access).**

A tech publication built on Next.js 14+ App Router, TypeScript, Tailwind CSS 4, and Postgres.
It is a blog first (MDX content, SEO, AdSense, threaded-stream homepage) with a small
editor layer on top: email+password accounts, write/edit/delete your own posts, profile,
contact form, and newsletter. No payments, no multi-tenancy, no teams, no dashboards.

## Applicable rules (from the global matrix)
- **Applies:** foundation, security basics, responsive + accessibility, unique design
  direction, content/marketing essentials (SEO, performance, OG, sitemap, robots,
  structured data), database & migrations, login & permissions, API & backend
  conventions, rate limiting (forms + login), caching & CDN, logging & error tracking,
  uptime monitoring & alerts, backups, legal pages (privacy/terms/disclaimer/cookies),
  CI (lint/typecheck/build/tests), hosting & environment config.
- **Skipped:** payments & webhooks (no commerce), multi-tenancy / `organization_id`
  (single publication, no orgs or teams), end-to-end Playwright tests (not required for
  a content site at this stage), load testing & scaling (no traffic yet), full design
  system `/design` page (existing component set + globals.css tokens are sufficient),
  background job system (contact/newsletter run synchronously — fine until real email
  sending is added).

## Stack
- Next.js 16.3.4 App Router, React 19, TypeScript 5, Tailwind CSS 4
- Postgres via `postgres` driver (lazy client from `DATABASE_URL`)
- MDX content from `content/posts/`, rendered with `@next/mdx` + `@mdx-js/react`
- Auth: custom scrypt + cookie sessions (`src/lib/auth.ts`) — **decision pending** on
  whether to keep or migrate to a proven provider
- AdSense via `NEXT_PUBLIC_ADSENSE_CLIENT`

## Commands
- `npm run dev` — dev server
- `npm run build` / `npm start` — production
- `npm run lint` — ESLint
- `npm run generate-sitemap` — regenerate `public/sitemap.xml`

## Open decisions (need input)
1. Auth provider: keep custom scrypt sessions, or migrate to Supabase Auth / Clerk / Auth.js?
2. Database provider (Neon / Supabase / self-hosted Postgres)?
3. Real transactional email for contact + newsletter, or keep DB-only?
4. Is `ca-pub-3517858716332831` the real approved AdSense ID?
5. Priority of next work: auth/security hardening, CI, tests, or something else?

---

# Global standards for every website / app I build

These rules apply to ALL my projects: landing pages, portfolios, blogs, stores, web apps, SaaS and internal tools. Not every rule applies to every project, so always do Step 0 first. Project-level CLAUDE.md files can add to these rules or override them.

## Step 0: identify the project type (every new project)
Before anything else, tell me which type this project is and which rules apply, then wait for me to confirm. Save the result in the project's CLAUDE.md as `Project type: ...`.
- **Static / marketing site**: landing page, portfolio, brochure, event or personal site. No logins, no database. Light rules: foundation, frontend, unique design, content-site essentials, security basics, simple CI and hosting.
- **Content site**: blog, docs, news or magazine, with or without a CMS. Static rules plus a content model, editor access, deeper SEO and performance.
- **E-commerce**: online store, booking or donations. Content-site rules plus the e-commerce section, payments, orders and customer accounts.
- **Web app / SaaS / marketplace / community**: logins, user data, dashboards. The full playbook. Multi-tenancy (`organization_id`) only if separate organisations or teams share the app.
- **Internal tool / admin panel**: small private tool. Auth, roles and audit log; lighter hosting and scaling.
- **Interactive tool / game / calculator with no backend**: static rules plus tests for the logic.
If a project mixes types (a marketing site plus an app), apply each part's rules to that part. Never add a database, login, payments or backend to a site that doesn't need them. Build the smallest solution that meets the goal.

## How to work
1. Plan first, code second. Propose a plan and wait for my approval before editing.
2. Small steps, small diffs. One feature per branch, one concern per commit (Conventional Commits).
3. Never push directly to main. Open a PR describing what changed, why, how to test, and risks.
4. Ask before adding a new dependency, and say why it's needed.
5. Do not invent requirements. If something is unclear, ask.
6. If the project has no CLAUDE.md, create one with the stack, commands, and rules before building features.

## Definition of done
Before saying a task is done:
1. Run lint, typecheck and tests, and show me the output.
2. List every file you changed and why.
3. List anything skipped, stubbed, mocked or hard-coded.
4. List assumptions I should confirm.

Never describe work as complete if any test is failing or skipped.
Never edit a test just to make it pass. Fix the code. If a test reveals a bug, stop and report it.

## Planning first (new projects)
Do not write feature code until the plan is written down and I've approved it.
- Static, content and no-backend interactive sites: a short brief is enough. Write `/docs/system-design.md` with goal, audience, pages and content, brand and design direction, features, out-of-scope items and open questions. Pick the simplest stack (a static site generator or plain HTML/CSS/JS is often right). Skip the rest of this Planning section unless the site gains backend features.
- E-commerce, apps, SaaS and internal tools: do the full system design and architecture below.

### System design (docs/system-design.md)
- Interview me first, one group of questions at a time (skip questions that don't apply to this project type): users and roles, core workflows (the 3-5 things users actually do), tenancy (individual vs team vs organisation accounts), data stored and its sensitivity, expected year-one scale, billing and plans, compliance or regional requirements (GDPR, DPDP Act, HIPAA, etc.), and integrations.
- Then write `/docs/system-design.md`: problem statement, user roles, core user flows, functional requirements, non-functional requirements (performance, availability, security), out-of-scope items, open questions.
- The tenancy model must be written down explicitly, and there must be an "out of scope" section (otherwise features keep creeping in).
- Don't design for a toy (one user, no concurrency) and don't over-engineer (microservices for 10 users).
- Stress-test the design as a skeptical staff engineer (missing requirements, ambiguous flows, scaling/security/privacy risks, over-engineering), ranked by severity, before building.
- Do a back-of-envelope capacity estimate for year one (peak requests per second, database size, file storage, background job volume), show the math, and name the first bottleneck.
- Decisions I own: who the customer is (individuals, teams, companies), pricing model, realistic year-one load, and non-negotiables (uptime, privacy, compliance).

### System architecture (docs/architecture.md)
- Optimise for a solo/small team, low ops burden and easy debugging. Default to a modular monolith and managed services unless there's a strong reason not to.
- `/docs/architecture.md` contains: a component diagram (Mermaid), the stack choice for each layer with one rejected alternative and why, the repo folder structure, where background jobs run, third-party services with cost at our scale, and the 3 riskiest decisions.
- Record each major decision as an Architecture Decision Record in `/docs/decisions/NNNN-short-title.md` (Context, Decision, Alternatives considered, Consequences), and summarise the stack in the project's CLAUDE.md.
- Business logic lives in a dedicated layer (`/services` or `/domain`), never inside UI components or route files.
- Every dependency must have a reason. Don't end up with three date libraries and two HTTP clients.
- Scaffold exactly as the architecture describes: folder structure, strict mode, linter, formatter, `.env.example`, README, and `/api/health`. No features yet. Run the dev server and the health check to prove it works.
- Decisions I own: monolith vs services, managed vs self-hosted, language and framework (what I can debug at 2 a.m.).

## Rules by area (apply according to the project type in Step 0; see the matrix at the end)
### Foundation
- Git initialised, with a proper `.gitignore` (env files, build output, OS/editor files).
- `.env.example` documenting every variable. Secrets only in environment variables, never in code or git.
- Startup validation of required env variables that fails loudly with a clear message.
- A `README` with setup steps, and a `/api/health` endpoint (if there's a backend).
- No hard-coded URLs, keys or IDs. Config differs per environment (local, staging, production).

### Security
- Treat all user input as hostile: validate on the server (Zod/Pydantic or equivalent) at every boundary.
- Never trust the frontend. Validation, permissions and limits are enforced on the server.
- Authentication and authorization: follow the "Auth and permissions" section below.
- Protect against XSS, SQL injection, CSRF, open redirects and SSRF.
- Security headers (CSP, HSTS, X-Frame-Options, etc.) and secure cookie settings.
- Never log passwords, tokens, secrets or personal data.
- No debug endpoints or verbose error messages in production.
- Rate limiting, dependency audits, threat model and data protection: see the sections below.

### Data: databases and storage
Applies only when the site actually stores data. Don't add a database to a static site. Default database is Postgres unless I say otherwise. Design the schema before writing migrations, and show me the schema (with an ERD as a Mermaid diagram) for approval first.

Schema rules
- Every schema change is a migration file in version control. Never edit the DB by hand, and never regenerate the schema from scratch.
- Every table has `id` (UUID), `created_at`, `updated_at`.
- Use soft deletes (`deleted_at`) where users might want to recover data.
- Add an index for every foreign key and every column we filter or sort by, and explain each index.
- Use proper constraints (NOT NULL, UNIQUE, CHECK, foreign keys) in the database, not only in app code.
- Money is stored as integer minor units (paise/cents), never floats.
- Multi-tenant apps: every tenant-owned table has `organization_id` with a foreign key, and every query on it filters by `organization_id`.

Seed data and migrations
- Create the initial migration from the approved schema only. Do not run migrations until the schema is approved.
- Write a seed script with at least 2 organisations, each with 3 users and realistic sample data, so tenant isolation can be tested.
- Run the migration and seed locally and show me the output.

File storage
- Files are private by default. Never store files in the database, and never make uploads publicly readable.
- Upload via pre-signed URLs directly from the browser (don't stream through our server).
- Validate file type and size on the server before issuing the URL.
- Store only the file key and metadata in the database.
- Downloads use short-lived signed URLs, and only after an authorization check.
- Scope storage paths by `organization_id`.
- Tests required for: wrong file type, file too large, and a user from another org trying to download.

Query performance review (run before release)
- Flag N+1 queries, queries without a supporting index, `SELECT *` where only a few columns are needed, list endpoints without pagination, and any tenant-table query that doesn't filter by `organization_id`.
- Report as a table (file, line, problem, fix), then fix the high-severity ones.

Backups
- Backups enabled on the production database from day one.
- Document in `/docs/runbooks/backups.md`: how often backups run, how long they're kept, and step-by-step point-in-time restore.
- Provide a script that restores the latest backup into a separate database, so restores can be tested without touching production.
- A restore must be actually tested at least once.

Decisions I own (ask me, don't assume)
- Database provider (Supabase, Neon, RDS, etc.), backup and retention policy, and what gets deleted when a user deletes their account.

How to verify
- Every schema change exists as a migration file in git.
- Logged in as a user from Org A, changing an ID in the URL to Org B's data must fail.
- A backup has been restored at least once.

### Auth and permissions
Applies to any site with logins (customer accounts, admin areas, members). If only one owner or admin logs in, use a proven provider with a single role. Organisation scoping applies only when several organisations or teams share the app.

Authentication = who you are (login, signup, sessions, password reset, SSO). Authorization = what you're allowed to do (roles, permissions, which organisation's data you can see).

Authentication
- Use a proven provider or library (Clerk, Auth0, Supabase Auth, Auth.js, or WorkOS if enterprise SSO is needed). Never hand-roll password hashing or session management. No file may contain custom password hashing code.
- Include: signup, login, logout, email verification, password reset (with expiry), session expiry, and session revocation.
- Login methods (email + password, magic link, Google, SSO): ask me which ones I want.
- Protect all app and API routes by default. Only routes I explicitly list as public are open.
- Add middleware that attaches the current user and current organization to every request.

Authorization
- Start with simple roles (e.g. Owner, Admin, Member, Viewer) unless I say otherwise.
- Write a permissions matrix (role x action) as a table in `/docs/permissions.md`.
- Implement ONE central function, e.g. `can(user, action, resource)`, used by every endpoint. No ad-hoc role checks scattered around.
- Every read or write of a tenant resource must verify the resource's `organization_id` matches the user's current organization. Checking only that the user is logged in is not enough (this is IDOR / broken object-level authorization, the most common SaaS vulnerability).
- The frontend may hide actions the user can't take, but the server is always the source of truth.

Authorization tests (critical)
- For every API endpoint, write integration tests proving:
  - unauthenticated requests get 401
  - authenticated users without permission get 403
  - a user from Org A requesting Org B's resource by ID gets 404 (not 403)
  - each role can do exactly what `/docs/permissions.md` says, nothing more
- Generate these tests from the permissions matrix so they stay in sync.

Team features (when the app has teams or organisations)
- Invite a teammate by email, accept invite, change role, remove member, transfer ownership, leave organization.
- Edge cases: the last owner can't leave, invite links expire after 7 days, removed members lose access immediately (their sessions are revoked).

Decisions I own (ask me, don't assume)
- Auth provider, the list of roles, and which login methods to support.

How to verify
- In DevTools, copy an API request and change the resource ID to one from another org: it must return 404.
- A Viewer calling a delete endpoint directly (not through the UI) must get 403.
- No custom password hashing code anywhere in the codebase.

### APIs and backend logic
- Define API conventions in `/docs/api-conventions.md` and summarise them in the project CLAUDE.md: URL and naming style, ONE error response format with error codes, validation (Zod/Pydantic) on every input at the boundary, cursor pagination on all list endpoints, how auth and org context are read in every handler, and which HTTP status codes we use and when.
- Thin route handlers; business logic in `/services`. Validate every input. Authorization check on every operation via `can()`. Filter every query by `organization_id`.
- Tests: unit tests for each service and integration tests for each endpoint, including permission-denied and cross-tenant cases.
- One consistent error format. Clean 4xx errors, never stack traces to users.
- Background jobs (emails, exports, third-party API calls) never run inside the request. Every job must be idempotent (safe to run twice), retry with exponential backoff, have a max retry count, and log failures with enough context to debug. Provide a way to see failed jobs.
- Payments and webhooks: treat webhooks as the source of truth for subscription state (not the redirect after checkout), verify signatures, make handlers idempotent by storing processed event IDs, and handle payment success, failure, cancellation, plan change and refund. Gate features by plan with a single helper such as `hasFeature(org, feature)`. Test by replaying each webhook event twice and asserting no duplicates. Use test-mode keys only in dev/staging.
- Decisions I own: REST vs tRPC vs GraphQL (REST or tRPC is plenty for most), payment provider (Stripe, Razorpay for India, Paddle/Lemon Squeezy as merchant of record), and the background job system (Inngest, Trigger.dev, BullMQ, Cloud Tasks).
- Verify: garbage JSON to an endpoint gives a clean 400 in our error format; replaying the same webhook twice duplicates nothing; any request taking over ~1 second has a reason or has moved to a background job.

### Frontend
- Responsive from 375px mobile to desktop. Test on a real phone.
- Every data view handles loading, empty, error (with retry) and success states.
- Forms: client validation matching server rules, disabled submit while pending, inline errors, success feedback.
- Accessible (WCAG 2.1 AA): labels, keyboard navigation, visible focus, contrast, alt text, heading order.
- No secrets in client-side code. Only intentionally public variables reach the browser.
- Avoid the generic "AI template" look. Use a consistent design system (colors, type, spacing, components).
- Basics: page titles, meta descriptions, favicon, Open Graph tags, sitemap and robots.txt for public sites.
- Optimised images (modern formats, lazy loading, correct sizes).

Frontend process
- Design system first: color tokens (with dark mode), typography scale, spacing scale, radii, and base components (Button, Input, Select, Modal, Toast, Table, EmptyState, ErrorState, Skeleton), with a `/design` page showing every component in every state. Use these components everywhere afterwards.
- Build each screen using the design system and the existing API, handling loading, empty, error and success states, at 375px and desktop widths.
- Accessibility audit (WCAG 2.1 AA): labels on all inputs, keyboard navigation, visible focus, contrast, alt text, heading order, ARIA only where needed. Add an automated accessibility check (e.g. axe) to the tests.
- Secrets check: search all client-side code and the bundle for API keys, secrets or private URLs. Only variables meant to be public reach the browser.
- Decisions I own: design direction and brand (I'll give references), component library (shadcn/ui, Radix, MUI), and which screens matter for launch.
- Verify: turn off Wi-Fi and every screen shows a sensible error; use the whole app with only a keyboard; open it on a real phone.

### Landing pages and design: never repeat the same design
- Every landing page / website must have its own unique design. Never reuse the layout, style or structure of a previous project or of a generic template.
- Before building, write a short design direction (3-5 lines): brand personality, audience, color palette, typefaces, layout idea, and one distinctive visual feature. Show it to me and wait for approval.
- Avoid the default "AI landing page" look: purple/blue gradient on white, centered hero with two buttons, three identical feature cards, generic stock-style icons, Inter/Roboto/system fonts only, and the same section order every time.
- Vary the things that make designs feel different: hero structure, grid and layout, section order, typography pairing, color system, spacing rhythm, imagery style, motion, and tone of copy.
- Choose the design from the brand and audience of THIS project (a law firm, a game, and a bakery should look nothing alike). If I give references or screenshots, follow their spirit without copying them.
- Write original copy. No filler text like "Welcome to our website" or "Unlock your potential".
- If I ask for a redesign or a second version, make it clearly different from the first, not a recolor.
- Still keep the quality basics: responsive, accessible, fast, and consistent inside the project (design tokens and reusable components).

### Content and marketing sites (landing pages, portfolios, blogs, stores)
- SEO basics on every public page: unique title and meta description, one H1, logical heading order, canonical URL, Open Graph and social share image, sitemap.xml, robots.txt, structured data where relevant (articles, products, organisation, local business), friendly URLs, a real 404 page, and redirects when URLs change.
- Performance: aim for good Core Web Vitals. Optimise and lazy-load images (modern formats, correct sizes, width/height set), limit fonts and preload the critical one, ship minimal JavaScript, avoid layout shift, and run Lighthouse before launch.
- Forms (contact, newsletter, lead capture): server-side validation, spam protection (honeypot or bot check), rate limiting, reliable email delivery, a clear success and error state, and never expose the destination address or API keys in client code.
- Analytics, cookies and legal: add privacy-respecting analytics only if I want it, cookie consent when tracking requires it, and a privacy policy (plus terms where relevant). Ask me about my region's rules.
- Content: write original copy (no lorem ipsum or filler). Make content easy to update, either as markdown/data files or through a CMS I choose. Check for broken links and missing alt text.
- Polish: favicon and app icons, a custom 404, print/OG previews, a sensible `lang` attribute, and everything working on a real phone.
- Decisions I own: brand and design direction, CMS or no CMS, analytics tool, languages, and which pages exist at launch.

### E-commerce sites
- Never handle or store raw card data. Use the provider's hosted checkout or hosted fields (Stripe, Razorpay, PayPal, etc.) and keep the payment keys on the server.
- Treat payment webhooks as the source of truth for order status: verify signatures, store processed event IDs, handle replays idempotently, and handle success, failure, refund and cancellation.
- Model products, variants, prices (integer minor units), inventory, carts, orders, order items, shipping and tax. Prevent overselling with database transactions or stock reservations.
- Guest checkout and customer accounts: ask me which. Order confirmation and shipping emails go through background jobs.
- Policies and legal pages required before launch: shipping, returns/refunds, privacy, terms. Ask me about tax and invoice rules in my region.
- Abuse protection: rate limit and bot-protect checkout and login (card-testing attacks), and make failed payments recoverable.
- Product pages need strong SEO (structured data, unique descriptions, fast images). Admin changes (prices, stock, refunds) need roles and an audit log.
- Test the full flow end to end with test-mode keys: browse, add to cart, pay, webhook, order, email, refund.

### Internal tools and admin panels
- Never public by default: require login (SSO if the company has it), assign roles, and keep an audit log of who did what.
- Keep it simple: clear tables, filters, search, exports and confirmations before destructive actions.
- Still follow input validation, secrets handling, backups and error tracking. Skip public-facing extras like SEO and marketing design.

### Testing
- Scale to the project: static and content sites need a passing build, link check, Lighthouse and accessibility checks, and tests for any custom logic; apps and stores need the full set below.
- Write `/docs/testing.md` with the strategy: unit tests for `/services` business logic, integration tests for every API endpoint using a real test database, and end-to-end tests (Playwright) for critical flows: signup, login, core workflow, upgrade plan, invite teammate, and data isolation.
- Mock only external APIs. Never mock our database or our auth/permission checks.
- Coverage target: roughly 70-80% on business logic. 100% is rarely worth it.
- Tests must cover happy path, invalid input, boundary values, permission denied, and cross-tenant access.
- When writing tests for existing code: do NOT modify the code under test. If a test reveals a bug, stop and report it instead of changing the test to pass.
- Fix bugs test-first: write a failing test that reproduces the bug and show it failing, then fix the code, then show it passing with the full suite green.
- Never change a test to make it pass, and never skip or delete a failing test quietly.
- Periodic test quality review: find tests that would still pass if the feature were broken, tests that only assert on mocks, skipped tests, flaky tests, and important paths with no coverage. Give a prioritised list.
- Verify: deliberately break a line of business logic and at least one test must fail; grep for `.skip`, `xit`, `@pytest.mark.skip` and make sure every skip has a reason; after each session, check the diff for test-file changes I didn't ask for.

### Version control, CI and CD
- Git hygiene: complete `.gitignore`, a pre-commit hook running lint and format on staged files, a secret scanner in pre-commit (e.g. gitleaks), Conventional Commits documented in the project CLAUDE.md, and a scan of the full git history for committed secrets.
- Never commit `.env` files or secrets. No huge commits mixing unrelated changes.
- `main` is always deployable. Feature branches plus pull requests. Never push directly to main.
- CI (GitHub Actions) on every PR and push to main: install (cached), lint, typecheck, unit tests, integration tests against a real Postgres service container, build. Fail fast, under 10 minutes, with a status badge in the README.
- CD: every PR gets a preview deployment; merge to main deploys to staging automatically; production deploy requires manual approval. Database migrations run automatically as part of deploy before the new code goes live, and the deploy fails if a migration fails. Document rollback in `/docs/runbooks/rollback.md`.
- Environments: at minimum local, staging and production.
- Verify: a PR with a deliberately failing test is blocked by CI; practise one deliberate rollback; `git log` reads like a story, not "fix", "fix2", "final fix".

### Hosting and cloud
- Prefer managed platforms (Vercel, Netlify, Railway, Render, Fly.io) early. No Kubernetes or full Terraform too early.
- Write `/docs/hosting.md`: for each component (frontend, backend, database, storage, background jobs, email) give provider, plan, estimated monthly cost at launch and at 10x users, and what changes at 10x. Choose a region close to users (and mind data-residency rules).
- Make the app fully configurable by environment variables: documented `.env.example`, runtime validation that fails loudly, separate values for local/staging/production, nothing hard-coded.
- Production readiness: custom domain and HTTPS, security headers, a separate production database with automated backups, a health check wired to the platform, graceful shutdown so in-flight requests finish during deploys, and `/docs/runbooks/deploy.md` with first-deploy steps.
- Never share a database between staging and production.
- Decisions I own: platform, region, budget ceiling and billing alerts.
- Verify: staging and production use different databases and API keys; billing alerts are set on every provider; removing a required env variable makes the app refuse to start with a clear message.

### Security: threat model, reviews, dependencies, data protection
- Create a threat model in `/docs/security/threat-model.md`: assets, entry points (every endpoint, upload, webhook, form), relevant OWASP Top 10 threats per entry point, likelihood and impact, mitigations we have and are missing.
- Security review before every release (ideally in a fresh session or the security-reviewer subagent, not the one that wrote the code). Check: broken access control and missing org scoping, SQL/NoSQL injection and unsafe raw queries, XSS, CSRF, open redirects and SSRF, insecure file uploads, secrets in code or logs, missing security headers (CSP, HSTS, X-Frame-Options), verbose errors, insecure cookies. Report each finding with file, line, severity, exploit scenario and fix. Don't fix anything until I approve.
- Dependencies: run a vulnerability audit, list packages with severity and whether the vulnerable code path is used, upgrade what's safe, explain what can't be upgraded, set up Dependabot or Renovate, and add the audit to CI.
- Data protection: encrypt sensitive fields at rest, redact passwords/tokens/personal data from all logs, account deletion that removes or anonymises user data, and a data export feature.
- Verify: paste `<script>alert(1)</script>` into every text field and nothing pops up; check logs for emails, tokens or passwords.
- AI security reviews are not a substitute for a professional audit when handling payments, health, financial or other sensitive data.

### Rate limiting
- Use a shared store (Redis/Upstash) so limits work across multiple instances and survive deploys. Never in-memory counters.
- Different limits per route and per plan, not one global limit: login/signup/password reset strictest (e.g. 5 per 15 min per IP and per email), expensive endpoints (AI generation, exports) per org per minute, general API per user per minute, public endpoints per IP per minute. Ask me for the numbers.
- Return 429 with a `Retry-After` header and our standard error format. Write tests that exceed each limit.
- Paid APIs (e.g. LLM calls): per-org daily and monthly quotas tied to plan, usage tracking in the database, a hard global spending cap that disables the feature, alerts at 80% of quota or cap, and a usage page for customers.
- Abuse review: signup spam, email sending abuse (invites, password resets), user enumeration via error messages, scraping, flooded webhook endpoints, and bot protection on signup.
- Verify: hitting login 20 times in a loop gets blocked; limits still work after a redeploy; "wrong password" and "no such user" return the same message.

### Caching and CDN
- Write `/docs/caching.md`: for each candidate (static assets, public pages, API responses, expensive queries, third-party API results) specify where it's cached, TTL, cache key, and how it's invalidated.
- Any cache of tenant data must include `organization_id` in the key. Authenticated responses must never be cached at a shared CDN layer.
- Serve static assets via CDN with long cache lifetimes and content-hashed filenames. Optimise images (modern formats, responsive sizes, lazy loading). Set correct Cache-Control headers for static assets, public pages, and authenticated API responses (private/no-store where needed).
- Application caching (Redis): cache-aside, keys include `organization_id`, invalidate on every write that affects the data, with a debug bypass. Test that the cache is invalidated on update and that two orgs never receive each other's cached data.
- Decisions I own: what can be stale and for how long, and the cache store.
- Verify: two users from different orgs in two browsers never see each other's data; an updated record shows the new value immediately (or within the agreed TTL); run a Lighthouse audit on main pages.

### Logging and error tracking
- Replace `console.log`/`print` with a structured logger (JSON, levels debug/info/warn/error). Every request gets a request ID included in every log line and returned in a response header. Every log line includes `user_id` and `organization_id` when available. Automatically redact `password`, `token`, `secret`, `authorization` and any personal-data fields. Debug level is off in production.
- Integrate error tracking (e.g. Sentry) on frontend and backend with `user_id`, `organization_id` and request ID attached (no emails or personal data unless I approve). Upload source maps but don't serve them publicly. Separate staging and production environments. Add a staging-only test route that throws an error.
- No empty or overly broad catch blocks and no ignored promise rejections. Errors are handled meaningfully or reported. Users see friendly messages; full detail goes to error tracking.
- Verify: an error triggered in staging shows up in the tracker with a readable stack trace within a minute; a request ID from a response header finds every log line for that request; searching logs for "password" gives zero results.

### Monitoring and alerts
- Write `/docs/monitoring.md`: uptime checks for homepage, login, `/api/health` and the core workflow endpoint; technical metrics (error rate, p95 latency per endpoint, database connections, job queue depth and failure rate); business metrics (signups, active orgs, successful and failed payments); alert rules with threshold, duration, severity and who is notified. Alert only on things that need a human to act.
- Real health check at `/api/health` verifying database, cache and job system with timeouts and component-level status, plus a lightweight `/api/health/live` that only confirms the process is up.
- Every alert has a runbook in `/docs/runbooks/` (what it means, how to check impact, likely causes, step-by-step fixes, when to escalate).
- Set up a simple public status page and `/docs/runbooks/incident.md` (how to declare an incident, how to communicate with customers, post-incident review template).
- Decisions I own: what counts as "down" or "degraded", who gets alerted and how, and the uptime target (e.g. 99.9%).
- Verify: stop the staging database and an alert reaches me in the defined time; every alert has a runbook; I look at the dashboard at least weekly.

### Scaling
- Measure first, then optimise the actual bottleneck. Don't over-engineer (sharding, microservices, Kubernetes on day one), but don't ignore the basics that break first: missing indexes, N+1 queries, no connection pooling, synchronous heavy work.
- Load test (e.g. k6) the 5 most important endpoints and the core user flow against staging with realistic concurrent users ramping up over 10 minutes. Report p50/p95/p99 latency, error rate, the degradation point and the bottleneck.
- Scaling readiness review: stateless app (no in-memory sessions, uploads or rate-limit counters), connection pooling for serverless/multiple instances, slow queries via EXPLAIN, heavy work in background jobs, unbounded queries, large payloads. Rank by what breaks first at 10x and 100x.
- Targeted optimisation: propose 3 options (simplest to most complex, with cost and effort), implement the simplest that meets the target, re-run the load test and show before/after numbers.
- Model monthly infrastructure cost at 10x and 100x users.
- Verify: a load test with real numbers; two backend instances run at once without breaking anything; every optimisation has before/after numbers.

### Golden rules
1. I'm the architect and you're the builder. Decide, then delegate.
2. Plan before code, every time.
3. Write it down: CLAUDE.md and /docs are your memory.
4. Small tasks, small diffs.
5. Prove it works with tests, lint, typecheck, and shown output.
6. Never edit a test to make it pass. Fix the code.
7. Review security and code in a fresh session or reviewer subagent.
8. The server is the source of truth for validation, permissions and limits.
9. Every tenant query is scoped by `organization_id`, and tested.
10. If I don't understand a change, explain it before merging.

### Later (plan, review, implement small, verify, record the decision)
Transactional emails (SPF/DKIM/DMARC), product analytics, feature flags, legal pages (terms, privacy, cookie consent, DPAs), admin panel with audit logs, audit logs per organisation, onboarding, internationalisation, and a tested disaster recovery plan.

### Pre-launch checklist: all sites
- Responsive and checked on a real phone; keyboard accessible
- Lighthouse run (performance, accessibility, SEO, best practices) and issues addressed
- Titles, meta descriptions, Open Graph tags, favicon and a custom 404 are in place
- No lorem ipsum, placeholder text, test data or broken links
- Forms tested end to end, with spam protection
- HTTPS on the custom domain; security headers set
- Privacy policy published (and cookie consent if tracking)
- Analytics (if used) verified
- No secrets in the repo; source is backed up and DNS/domain notes are recorded
- The design is original and doesn't copy a previous project

### Pre-launch checklist: sites with accounts, data or payments
- Cross-tenant data access tested and blocked
- Auth via a proven provider; no custom password handling
- Every endpoint validates input and checks permissions on the server
- Payments driven by verified, idempotent webhooks
- CI blocks merges on failing tests; production deploy has rollback
- Critical flows covered by end-to-end tests
- Separate staging and production environments and databases
- Backups enabled and a restore actually tested
- Security review done; dependencies audited
- Rate limits on login, signup and expensive endpoints
- No tenant data cached at shared layers
- Errors reach the error tracker; logs are structured and redacted
- Uptime checks and alerts, each with a runbook
- Load tested at expected launch traffic
- Billing alerts set on every provider
- Terms of service and privacy policy published

## Which rules apply (matrix)
Legend: Y = required, ? = only if the project needs it, - = skip. Columns: Static/marketing, Content/blog, E-commerce, App/SaaS, Internal tool.

| Area | Static | Content | E-com | App/SaaS | Internal |
|---|---|---|---|---|---|
| Foundation (git, README, env, no secrets) | Y | Y | Y | Y | Y |
| Security basics (headers, validation, secrets) | Y | Y | Y | Y | Y |
| Responsive + accessibility | Y | Y | Y | Y | Y |
| Unique design direction | Y | Y | Y | Y | ? |
| Content/marketing essentials (SEO, performance) | Y | Y | Y | ? | - |
| Database and migrations | - | ? | Y | Y | Y |
| Login and permissions | - | ? | Y | Y | Y |
| API and backend rules | - | ? | Y | Y | Y |
| Payments and webhooks | - | - | Y | ? | - |
| Multi-tenancy (organization_id) | - | - | - | ? | ? |
| Unit and integration tests | ? | ? | Y | Y | Y |
| End-to-end tests of critical flows | ? | ? | Y | Y | ? |
| CI (lint, build, tests) | Y | Y | Y | Y | Y |
| Hosting and environment config | Y | Y | Y | Y | Y |
| Rate limiting (forms, login) | ? | ? | Y | Y | ? |
| Caching and CDN | Y | Y | Y | Y | - |
| Logging and error tracking | ? | Y | Y | Y | Y |
| Uptime monitoring and alerts | Y | Y | Y | Y | ? |
| Backups | - | ? | Y | Y | Y |
| Load testing and scaling | - | ? | ? | Y | - |
| Legal pages (privacy, terms, cookies) | ? | ? | Y | Y | - |

When unsure which rules apply, ask me. When you skip a rule because it doesn't apply, say so in one line so I know it was a decision and not an omission.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
