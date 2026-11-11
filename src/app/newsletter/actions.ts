'use server';

import { Resend } from 'resend';
import { insertSubscriber } from '@/db/queries';

export interface NewsletterState {
  error?: string;
  success?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Add an email to the subscriber list in Postgres and trigger a welcome email via Resend.
 * Duplicates are ignored (email is the primary key). Returns an inline success/error state.
 */
export async function subscribe(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  // 1. Save subscriber to PostgreSQL database
  const { ok } = await insertSubscriber(email, new Date().toISOString());
  if (!ok) {
    return { error: 'Could not save your subscription right now. Please try again.' };
  }

  // 2. Dispatch Welcome Email via Resend using your verified domain
  try {
    const { data, error } = await resend.emails.send({
      from: 'DevThread <newsletter@techinsight.site>',
      to: email,
      subject: 'Welcome to DevThread! 🚀',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
            Welcome to DevThread! 👋
          </h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            Thanks for subscribing! You'll receive our weekly technical breakdowns on Next.js 16 performance, PostgreSQL database migrations, and self-hosted n8n automation blueprints directly in your inbox.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 13px; color: #94a3b8;">
            DevThread — Practical threads from working engineers.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API returned error:', error);
    } else {
      console.log('Resend email sent successfully:', data?.id);
    }
  } catch (resendError) {
    console.error('Resend execution error:', resendError);
  }

  return { success: true };
}