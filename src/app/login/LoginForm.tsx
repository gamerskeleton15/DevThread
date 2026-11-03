'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { authenticate, AuthState } from '@/app/auth/actions';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    authenticate,
    {}
  );

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground font-display tracking-tight">
            Welcome to <span className="text-accent">DevThread</span>
          </h1>
          <p className="mt-2 text-muted">
            Log in to write and publish posts.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              autoComplete="current-password"
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 text-white font-semibold bg-accent hover:opacity-90 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Only editors listed in ADMIN_EMAILS can sign in.
        </p>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-accent hover:underline text-sm">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}