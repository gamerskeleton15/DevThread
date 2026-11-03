# Permissions matrix

DevThread has two roles: **Admin** and **Author**.

- **Admin** — anyone whose email is listed in the `ADMIN_EMAILS` env var.
  Admins can log in, auto-create on first login, and write/edit/delete posts.
- **Author** — any user with a valid session. Authors can write/edit/delete
  their own posts. Authors log in with their existing scrypt password.

The matrix below is the contract. Tests in `src/**/__tests__/` are generated
from it, so keep this in sync when anything changes.

## Roles
| Role | Who |
|---|---|
| `Admin` | Email listed in `ADMIN_EMAILS` (env var) |
| `Author` | Any user with a valid session |

## Admin gate
Login is **admin-only**. The `authenticate` action enforces:

```ts
if (!isAdminEmail(email)) {
  return { error: 'Invalid email or password.' }; // generic — no enumeration
}
```

- An email in `ADMIN_EMAILS` is always allowed to log in (auto-create on first login).
- A non-admin email is rejected, even if it already exists in the `users` table.
- The generic error message is identical for "wrong password" and "not allowed",
  so the user list can never be probed.

## Matrix (role × action)
Legend: ✅ allowed · ❌ denied · — not applicable

| Action | Anonymous | Admin | Author |
|---|---|---|---|
| Read homepage `/` | ✅ | ✅ | ✅ |
| Read `/blog`, `/blog/[slug]`, `/about`, `/contact`, `/terms`, `/privacy-policy`, `/disclaimer` | ✅ | ✅ | ✅ |
| Read `/login` | ✅ (form shown) | ✅ | ❌ (redirected to `/`) |
| `authenticate` (login) | ❌ 401 | ✅ | ❌ (admin-only gate) |
| Read `/profile` | ❌ 401 | ✅ | ✅ |
| Read `/write` | ❌ 401 | ✅ | ✅ |
| Read `/edit/[slug]` | ❌ 401 | ✅ | ✅ (own posts only) |
| `POST /api/upload` | ❌ 401 | ✅ | ✅ |
| `createPost` (write) | ❌ 401 | ✅ | ✅ |
| `updatePost` (edit) | ❌ 401 | ✅ | ✅ only if `author_id === session user id` |
| `deletePost` | ❌ 401 | ✅ | ✅ only if `author_id === session user id` |
| `logout` | ❌ 401 | ✅ | ✅ |
| `updateProfile` (name + avatar) | ❌ 401 | ✅ | ✅ (own record only) |
| `submitMessage` (contact) | ✅ | ✅ | ✅ |
| `subscribe` (newsletter) | ✅ | ✅ | ✅ |

## Ownership rule
Posts and profiles are owned by `author_id` / the user's own `id`. The single
central check, used by every endpoint:

```ts
const target = await selectPostBySlug(slug);
if (!target || target.authorId !== user.id) {
  // 404, not 403 — don't let URLs leak existence
  notFound();
}
```

A 403 means "you may not perform this action"; a 404 means "this thing doesn't
exist for you." Never return 403 for a missing/foreign resource.

## Decisions I own
- Whether to add more roles (Editor / Viewer) later. Not now.
- Whether guest checkout / anonymous commenting ever ships. Not now.
- Whether to switch from `ADMIN_EMAILS` env var to a DB role column. Not now.