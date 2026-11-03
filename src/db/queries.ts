import { getDb } from './index';

/** Row shapes (camelCase maps from snake_case columns). */

export interface UserRow {
  id: string;
  email: string;
  name: string;
  salt: string;
  hash: string;
  avatar: string | null;
  createdAt: string;
}

export interface SessionRow {
  tokenHash: string;
  userId: string;
  expiresAt: number;
}

export interface PostRow {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  authorId: string | null;
  category: string;
  tags: string[];
  coverImage: string;
  rawMarkdown: string;
}

export interface MessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface SubscriberRow {
  email: string;
  createdAt: string;
}

/* ---------------------------------- users --------------------------------- */

/** All users. Returns [] only when DB is not configured; throws on query error. */
export async function selectAllUsers(): Promise<UserRow[]> {
  const db = await getDb();
  if (!db) return [];
  return await db<UserRow[]>`
    SELECT id, email, name, salt, hash, avatar, created_at
    FROM users
  `;
}

/** Find by email. Returns undefined only when DB is not configured or row absent; throws on query error. */
export async function selectUserByEmail(email: string): Promise<UserRow | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db<UserRow[]>`
    SELECT id, email, name, salt, hash, avatar, created_at
    FROM users WHERE email = ${email}
  `;
  return rows[0];
}

/** Find by id. Returns undefined only when DB is not configured or row absent; throws on query error. */
export async function selectUserById(id: string): Promise<UserRow | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db<UserRow[]>`
    SELECT id, email, name, salt, hash, avatar, created_at
    FROM users WHERE id = ${id}
  `;
  return rows[0];
}

/** Insert a new user. Throws on DB error; returns {ok:false} only when DB is not configured. */
export async function insertUser(
  u: Omit<UserRow, 'avatar'> & { avatar?: string | null }
): Promise<{ ok: boolean }> {
  const db = await getDb();
  if (!db) return { ok: false };
  await db`
    INSERT INTO users (id, email, name, salt, hash, avatar, created_at)
    VALUES (${u.id}, ${u.email}, ${u.name}, ${u.salt}, ${u.hash}, ${u.avatar ?? null}, ${u.createdAt})
  `;
  return { ok: true };
}

/** Update display name and optionally avatar for a user. Throws on DB error; returns {ok:false} only when DB is not configured. */
export async function updateUserProfile(
  userId: string,
  patch: { name: string; avatar?: string }
): Promise<{ ok: boolean }> {
  const db = await getDb();
  if (!db) return { ok: false };
  if (patch.avatar) {
    await db`
      UPDATE users SET name = ${patch.name}, avatar = ${patch.avatar}
      WHERE id = ${userId}
    `;
  } else {
    await db`
      UPDATE users SET name = ${patch.name}
      WHERE id = ${userId}
    `;
  }
  return { ok: true };
}

/* -------------------------------- sessions -------------------------------- */

/** Insert a session record. Throws on DB error; no-op when DB is not configured. */
export async function insertSession(s: SessionRow): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (${s.tokenHash}, ${s.userId}, ${s.expiresAt})
  `;
}

/** Remove sessions for a user that are already expired (housekeeping). Throws on DB error; no-op when DB is not configured. */
export async function deleteExpiredSessions(now: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db`DELETE FROM sessions WHERE expires_at < ${now}`;
}

/** Delete a specific session by token hash. Throws on DB error; no-op when DB is not configured. */
export async function deleteSessionByTokenHash(tokenHash: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
}

/** Look up a session by token hash. Returns undefined only when DB is not configured or row absent; throws on query error. */
export async function selectSessionByTokenHash(
  tokenHash: string
): Promise<SessionRow | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db<SessionRow[]>`
    SELECT token_hash, user_id, expires_at FROM sessions
    WHERE token_hash = ${tokenHash}
  `;
  return rows[0];
}

/* ---------------------------------- posts --------------------------------- */

/** All user-published posts, newest first. Returns [] only when DB is not configured; throws on query error. */
export async function selectAllPosts(): Promise<PostRow[]> {
  const db = await getDb();
  if (!db) return [];
  return await db<PostRow[]>`
    SELECT slug, title, date, description, author, author_id, category,
           tags, cover_image, raw_markdown
    FROM posts
    ORDER BY date DESC
  `;
}

/** A single user post by slug. Returns undefined only when DB is not configured or row absent; throws on query error. */
export async function selectPostBySlug(slug: string): Promise<PostRow | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db<PostRow[]>`
    SELECT slug, title, date, description, author, author_id, category,
           tags, cover_image, raw_markdown
    FROM posts WHERE slug = ${slug}
  `;
  return rows[0];
}

/** Insert or replace a user post (atomic upsert on the slug primary key). Throws on DB error; returns {ok:false} only when DB is not configured. */
export async function upsertPost(p: PostRow): Promise<{ ok: boolean }> {
  const db = await getDb();
  if (!db) return { ok: false };
  await db`
    INSERT INTO posts (slug, title, date, description, author, author_id,
                       category, tags, cover_image, raw_markdown)
    VALUES (${p.slug}, ${p.title}, ${p.date}, ${p.description}, ${p.author},
            ${p.authorId}, ${p.category}, ${JSON.stringify(p.tags)}, ${p.coverImage},
            ${p.rawMarkdown})
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      date = EXCLUDED.date,
      description = EXCLUDED.description,
      author = EXCLUDED.author,
      author_id = EXCLUDED.author_id,
      category = EXCLUDED.category,
      tags = EXCLUDED.tags,
      cover_image = EXCLUDED.cover_image,
      raw_markdown = EXCLUDED.raw_markdown
  `;
  return { ok: true };
}

/** Delete a user post by slug. Throws on DB error; returns {ok:false} only when DB is not configured. */
export async function deletePostBySlug(slug: string): Promise<{ ok: boolean }> {
  const db = await getDb();
  if (!db) return { ok: false };
  await db`DELETE FROM posts WHERE slug = ${slug}`;
  return { ok: true };
}

/* -------------------------------- messages -------------------------------- */

/** Insert a contact message. Throws on DB error; returns {ok:false} only when DB is not configured. */
export async function insertMessage(m: MessageRow): Promise<{ ok: boolean }> {
  const db = await getDb();
  if (!db) return { ok: false };
  await db`
    INSERT INTO messages (id, name, email, subject, message, created_at)
    VALUES (${m.id}, ${m.name}, ${m.email}, ${m.subject}, ${m.message}, ${m.createdAt})
  `;
  return { ok: true };
}

/* ------------------------------- subscribers ------------------------------ */

/** Add a subscriber; duplicates are ignored (email is the primary key). Throws on DB error; returns {ok:false} only when DB is not configured. */
export async function insertSubscriber(email: string, createdAt: string): Promise<{ ok: boolean }> {
  const db = await getDb();
  if (!db) return { ok: false };
  await db`
    INSERT INTO subscribers (email, created_at) VALUES (${email}, ${createdAt})
    ON CONFLICT (email) DO NOTHING
  `;
  return { ok: true };
}