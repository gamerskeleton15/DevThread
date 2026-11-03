import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import {
  deleteExpiredSessions,
  deleteSessionByTokenHash,
  insertSession,
  selectSessionByTokenHash,
  selectUserById,
} from '@/db/queries';

export interface User {
  id: string;
  email: string;
  name: string;
  salt: string;
  hash: string;
  createdAt: string;
  avatar?: string;
}

const SESSION_COOKIE = 'tb_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function scryptAsync(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt);
  return { salt, hash: derivedKey.toString('hex') };
}

export async function verifyPassword(
  password: string,
  salt: string,
  hash: string
): Promise<boolean> {
  const derivedKey = await scryptAsync(password, salt);
  const expected = Buffer.from(hash, 'hex');
  return derivedKey.length === expected.length && timingSafeEqual(derivedKey, expected);
}

import type { UserRow } from '@/db/queries';

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    salt: row.salt,
    hash: row.hash,
    createdAt: row.createdAt,
    ...(row.avatar ? { avatar: row.avatar } : {}),
  };
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const record = await selectSessionByTokenHash(sha256(token));
  if (!record || record.expiresAt < Date.now()) return null;

  const user = await selectUserById(record.userId);
  return user ? toUser(user) : null;
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('hex');

  await insertSession({
    tokenHash: sha256(token),
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  void deleteExpiredSessions(Date.now());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await deleteSessionByTokenHash(sha256(token));
  }
  cookieStore.delete(SESSION_COOKIE);
}
