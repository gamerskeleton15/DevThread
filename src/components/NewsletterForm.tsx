'use client';

import { useActionState } from 'react';
import { subscribe, NewsletterState } from '@/app/newsletter/actions';

export default function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [state, formAction, pending] = useActionState<NewsletterState, FormData>(
    subscribe,
    {}
  );

  if (state.success) {
    return (
      <div
        className={`p-4 rounded-xl border text-sm font-medium ${
          dark
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-success/10 border-success/20 text-success'
        }`}
      >
        <p className="flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Thank you — you&apos;re subscribed to DevThread!
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3 w-full max-w-md">
      {state.error && (
        <p
          className={`text-xs font-medium px-3 py-2 rounded-lg border ${
            dark
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}
        >
          {state.error}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Enter your email address"
          aria-label="Email address for newsletter subscription"
          className={
            dark
              ? 'flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-accent text-sm transition-colors'
              : 'flex-1 px-4 py-2.5 border border-border bg-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-foreground text-sm transition-colors'
          }
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-accent hover:opacity-90 text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shrink-0 text-sm shadow-sm"
        >
          {pending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
    </form>
  );
}