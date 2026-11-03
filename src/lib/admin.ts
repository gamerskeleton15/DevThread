import type { User } from './auth';

/**
 * Admin authorization helpers for DevThread.
 *
 * DevThread is a single-publication blog. Only a small set of editors should
 * be able to log in, so the admin gate is driven by the ADMIN_EMAILS env var
 * (comma-separated) instead of a DB role column. This keeps bootstrap trivial:
 * add your email, deploy, log in once (auto-create), and you're an admin —
 * no one-off scripts or migrations required.
 *
 * Rules:
 *   - An email listed in ADMIN_EMAILS is an admin.
 *   - Admins can always reach /login and auto-create on first login.
 *   - Non-admins can log in ONLY if they already exist in the users table.
 */

const ADMIN_COOKIE = 'tb_admin_hint';

/**
 * Read the admin email list from the environment.
 *
 * Canonical: `ADMIN_EMAILS` (comma-separated, supports multiple editors).
 * Legacy fallback: `ADMIN_EMAIL` (single email). Both are read so a one-line
 * env var still works if that's what you already have set.
 */
function adminEmails(): Set<string> {
  const raw =
    process.env.ADMIN_EMAILS ??
    process.env.ADMIN_EMAIL ??
    '';
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

/**
 * Server-side: is a given email address an admin?
 * Used at the login gate and in the authenticate action.
 */
export function isAdminEmail(email: string): boolean {
  return adminEmails().has(email.trim().toLowerCase());
}

/**
 * Server-side: is a logged-in User an admin?
 * Used by the navbar to decide whether to show editor affordances.
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return isAdminEmail(user.email);
}

/**
 * Client/hybrid hint so the navbar can render an admin-specific affordance
 * without a server round-trip. This is NOT an authorization check — every real
 * decision is re-verified server-side (auth actions, server components, API).
 */
export function adminEmailHint(): string | null {
  'use client';
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + ADMIN_COOKIE + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}
