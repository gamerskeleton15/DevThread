# Testing strategy

DevThread is a content site with an editor layer, so the bar is: the public
site must build and render, and every authenticated action must be proven
secure. We mock nothing but external APIs — the database and auth checks are
real.

## What we test
| Layer | Tool | Scope |
|---|---|---|
| Unit | `vitest` | `src/lib/*.ts` (auth helpers, posts, sanitize, uploads) and `src/db/queries.ts` — pure logic, no HTTP |
| Integration | `vitest` + a real Postgres container | Every server action and route handler: happy path, invalid input, permission denied, cross-tenant |
| End-to-end | (deferred) | Playwright for signup → write → publish once traffic exists |

## Coverage targets
- ~70–80% on business logic (`src/lib`, `src/db`, action files).
- 100% on the authz matrix (every role × every action).
- 100% on input validation (every field, every boundary).

## What the authz tests must prove
For every authenticated endpoint, write tests proving:
1. **Unauthenticated → 401** (no session cookie).
2. **No permission → 403** (logged in, but not the owner).
3. **Cross-tenant → 404** (user A requests user B's post by slug: must 404, not 403).
4. **Owner → success** (the owning user can read/write/delete).

These are generated from the permissions matrix in `docs/permissions.md` so they
stay in sync with the code.

## Rules
- **Never mock the database or the auth/permission checks.** Spin up a real
  Postgres container (testcontainers) and a real session cookie.
- **Mock only external APIs** (Resend, AdSense, filesystem where a temp dir is
  better).
- **Never edit a test to make it pass.** If a test reveals a bug, stop and
  report it; fix the code.
- **Test bugs test-first:** write the failing test, show it fail, fix, show it
  pass.

## Commands
```bash
npm install                      # vitest, testcontainers, postgres come in devDeps
npm test                         # unit + integration
npm test -- --coverage           # with coverage report
```

## Test quality review
Periodically run the test-reviewer subagent to find:
- tests that would still pass if the feature were broken
- tests that only assert on mocks
- skipped tests (every skip needs a reason)
- important paths with no coverage