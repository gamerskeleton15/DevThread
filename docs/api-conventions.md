# API conventions

All API responses (route handlers and server actions) follow one shape.
Clients should rely on this, not on HTTP status alone.

## URL style
- REST-ish, plural nouns, kebab-case: `/api/health`, `/api/health/live`, `/api/upload`.
- Resource IDs in the path, never in the query string: `/api/...` (no public collection routes yet).
- Cursor pagination on list endpoints (none yet — the only lists are public and
  statically generated, so they are not paginated APIs).

## Success response
```json
{ "data": ... }
```
A bare value is also acceptable for simple endpoints (e.g. `{ "url": "..." }`
from `/api/upload`). Keep it consistent per route.

## Error response
One shape, every error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please add a title."
  }
}
```

| HTTP | `code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Input failed validation (Zod / manual checks) |
| 400 | `BAD_REQUEST` | Malformed body, wrong type, missing field |
| 401 | `UNAUTHENTICATED` | No valid session cookie |
| 403 | `FORBIDDEN` | Authenticated but not allowed |
| 404 | `NOT_FOUND` | Resource absent **or** belongs to another tenant (see below) |
| 409 | `CONFLICT` | Duplicate (e.g. existing email) |
| 429 | `RATE_LIMITED` | Too many requests; `Retry-After` header set |
| 500 | `INTERNAL_ERROR` | Unexpected failure (details never shown to the client) |
| 503 | `SERVICE_UNAVAILABLE` | Dependency down (DB, email provider) |

**Never** send stack traces, SQL errors, or env values to the client. Log them
server-side; show the message only.

## Cross-tenant reads return 404, not 403
When a user requests a resource they cannot see, return **404** (not 403) so
the URL itself doesn't leak existence. A 403 means "you may not perform this
action"; a 404 means "this thing doesn't exist for you."

## Server actions
Form actions return a state object, not JSON:
```ts
{ error?: string; success?: boolean }
```
They never throw to the client — errors become the `error` field. Redirects
(`redirect('/login')`) are used for auth failures.

## Auth context in every handler
- Read the current user with `await getSessionUser()` (from `@/lib/auth`).
- If it returns `null`, return 401.
- There is no organisation concept here (single publication), so no
  `organization_id` scoping is needed. Every post is owned by `author_id`
  and ownership is checked explicitly: `if (!post || post.authorId !== user.id)`.

## Validation
Every input is validated at the boundary with explicit checks (the actions
already do this inline). Where a schema grows large, move it to Zod and call
`schema.parse()` — but keep the checks visible in the action, not hidden.

## Background jobs
Contact and newsletter submissions are currently synchronous. Before real
email sending is enabled they must move to a background job that is:
- **Idempotent** — safe to run twice (store a processed id).
- **Retried** with exponential backoff and a max retry count.
- **Logged** with enough context to debug failures.