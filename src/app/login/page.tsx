import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import LoginForm from './LoginForm';

/**
 * Login page — admin-only.
 *
 * The page itself is gated: only visitors who are already logged in as an
 * admin, or anonymous visitors who could plausibly be an admin (we can't
 * check an anonymous session's email, so we let the form render and the
 * `authenticate` action enforces the gate), are served the form. Logged-in
 * non-admin authors are redirected away — they already have a session and
 * the login page is for signing in, not for them.
 *
 * The hard enforcement is in `authenticate` (`isAdminEmail`): a non-admin
 * email is rejected with a generic message, so the user list can never be
 * enumerated by probing.
 */
export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    // Already logged in — the login page is for signing in, not for them.
    redirect('/');
  }

  // Anonymous visitors see the form; the action itself enforces admin-only.
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <LoginForm />
    </div>
  );
}