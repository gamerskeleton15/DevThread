'use client';

import { useActionState } from 'react';
import { submitMessage, ContactState } from '@/app/contact/actions';

export default function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    submitMessage,
    {}
  );

  if (state.success) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center my-6">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">
          Message received
        </h3>
        <p className="text-sm text-muted max-w-sm mx-auto">
          Thanks for reaching out to DevThread! We&apos;ll get back to you within 48 hours on business days.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Your Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          autoComplete="name"
          placeholder="Jane Doe"
          className="w-full px-4 py-2.5 border border-border bg-surface rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-foreground text-sm transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
          placeholder="jane@example.com"
          className="w-full px-4 py-2.5 border border-border bg-surface rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-foreground text-sm transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          placeholder="Technical inquiry / Partnership"
          className="w-full px-4 py-2.5 border border-border bg-surface rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-foreground text-sm transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="How can we help you?"
          className="w-full px-4 py-2.5 border border-border bg-surface rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-foreground text-sm transition-colors resize-y"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto bg-accent hover:opacity-90 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm text-sm"
      >
        {pending ? 'Sending message…' : 'Send Message'}
      </button>
    </form>
  );
}