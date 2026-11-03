import { NextResponse } from 'next/server';

/**
 * Liveness probe. Only confirms the process is up — no dependencies, no I/O.
 * Used by the platform's health check; /api/health does the full check.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}