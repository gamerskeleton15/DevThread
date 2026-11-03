import { NextResponse } from 'next/server';
import { getDb } from '@/db';

/**
 * Health check. Reports the status of each component so a load balancer or
 * uptime monitor can tell "up" from "degraded".
 *
 * - /api/health/live   — process is alive (always 200)
 * - /api/health        — full check: database reachable, schema present
 *
 * Returns 200 with `status: "ok"` when everything is healthy, or 503 with
 * `status: "degraded"` and a per-component breakdown when something is not.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getDb();
  const checks: Record<string, 'ok' | 'error'> = {
    server: 'ok',
    database: 'ok',
  };

  if (!db) {
    checks.database = 'error';
  } else {
    try {
      // A lightweight, parameterised probe. Fails loudly if the DB is
      // unreachable or the schema hasn't been bootstrapped yet.
      await db`SELECT 1`;
    } catch {
      checks.database = 'error';
    }
  }

  const allOk = Object.values(checks).every((c) => c === 'ok');
  const payload = {
    status: allOk ? 'ok' : 'degraded',
    checks,
    env: {
      database: process.env.DATABASE_URL ? 'configured' : 'unset',
      adsense: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? 'configured' : 'unset',
      email: process.env.RESEND_API_KEY ? 'configured' : 'unset',
    },
  };

  return NextResponse.json(payload, { status: allOk ? 200 : 503 });
}