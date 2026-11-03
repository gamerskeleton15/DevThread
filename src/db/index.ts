import postgres, { Sql } from 'postgres';

/**
 * Postgres data layer (Neon / Supabase / any Postgres).
 *
 * The client is created lazily from DATABASE_URL. When the URL is missing,
 * `db()` returns null and every read helper falls back to "empty data" so the
 * site still renders locally; mutation helpers report ok:false so actions can
 * surface a friendly error instead of clobbering anything.
 *
 * Schema is bootstrapped idempotently on first use (CREATE TABLE IF NOT
 * EXISTS) — no migration tooling needed for a database created fresh.
 */

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  salt       TEXT NOT NULL,
  hash       TEXT NOT NULL,
  avatar     TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
  slug          TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  date          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  author        TEXT NOT NULL,
  author_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  category      TEXT NOT NULL DEFAULT 'General',
  tags          JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_image   TEXT NOT NULL DEFAULT '',
  raw_markdown  TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS subscribers (
  email      TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
`;

let sqlSingleton: Sql | null | undefined;

/** Lazy client, or null when DATABASE_URL is missing/unconfigured. */
export async function getDb(): Promise<Sql | null> {
  if (sqlSingleton !== undefined) return sqlSingleton;

  const url = process.env.DATABASE_URL;
  if (!url || url.startsWith('YOUR_')) {
    sqlSingleton = null;
    return null;
  }

  sqlSingleton = postgres(url, {
    max: 5,               // small bounded pool — fine for this app and serverless
    idle_timeout: 300,    // keep connections alive longer; pgbouncer recycles fast
    connect_timeout: 10,
    prepare: false,       // pgbouncer transaction mode + unnamed statements
    transform: postgres.camel,
  });

  // Bootstrap schema on first connect. Fail loudly if it doesn't work so the
  // caller sees a real error instead of silent failures on later queries.
  await sqlSingleton.unsafe(SCHEMA);
  return sqlSingleton;
}