'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from '@/lib/auth';
import { insertUser, selectUserByEmail } from '@/db/queries';
import { isAdminEmail } from '@/lib/admin';

export interface AuthState {
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Authenticate an admin email + password.
 *
 * Rules (admin-only login):
 *   - The email MUST be in ADMIN_EMAILS, else login is denied.
 *   - Admin emails that don't yet exist in the DB are auto-created on first login.
 *   - Existing admin users verify their scrypt password normally.
 *   - Non-admin emails are rejected with a generic message (no enumeration).
 *
 * NOTE: non-admin existing users (authors) cannot log in through this path
 * anymore — admin-only gate. If you need author logins, add them to ADMIN_EMAILS.
 */
export async function authenticate(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!EMAIL_RE.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  // Admin gate: only ADMIN_EMAILS may authenticate.
  if (!isAdminEmail(email)) {
    // Same generic message as a wrong-password attempt so the user list can
    // never be enumerated by probing emails.
    return { error: 'Invalid email or password.' };
  }

  const existingUser = await selectUserByEmail(email);

  let userId: string;
  if (!existingUser) {
    // First login for an admin email: auto-create the account.
    const { salt, hash } = await hashPassword(password);
    const id = randomUUID();
    const { ok } = await insertUser({
      id,
      email,
      name: email.split('@')[0],
      salt,
      hash,
      createdAt: new Date().toISOString(),
    });
    if (!ok) {
      return { error: 'Could not sign you in right now. Please try again.' };
    }
    userId = id;
  } else {
    const ok = await verifyPassword(password, existingUser.salt, existingUser.hash);
    if (!ok) {
      return { error: 'Invalid email or password.' };
    }
    userId = existingUser.id;
  }

  await createSession(userId);
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function logout(): Promise<void> {
  await destroySession();
  revalidatePath('/', 'layout');
  redirect('/');
}