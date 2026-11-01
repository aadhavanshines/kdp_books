import type { Context, MiddlewareHandler } from 'hono';
import { sign, verify } from 'hono/jwt';

import { unauthorized } from './errors';

export type AppEnv = {
  Variables: {
    userId: string | null;
  };
};

export async function issueToken(userId: string, secret: string, ttlSeconds: number, now: number): Promise<string> {
  const iat = Math.floor(now / 1000);
  return sign({ sub: userId, iat, exp: iat + ttlSeconds }, secret, 'HS256');
}

/** Reads `Authorization: Bearer <jwt>`, or `?token=` (EventSource cannot set headers). */
function readToken(c: Context): string | null {
  const header = c.req.header('authorization');
  if (header?.toLowerCase().startsWith('bearer ')) return header.slice(7).trim();
  return c.req.query('token') ?? null;
}

async function userIdFrom(c: Context, secret: string): Promise<string | null> {
  const token = readToken(c);
  if (!token) return null;
  try {
    const payload = await verify(token, secret, 'HS256');
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Sets c.var.userId when a valid token is present; never rejects. */
export function optionalAuth(secret: string): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    c.set('userId', await userIdFrom(c, secret));
    await next();
  };
}

/** Rejects with 401 unless a valid token is present. */
export function requireAuth(secret: string): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const userId = await userIdFrom(c, secret);
    if (!userId) throw unauthorized();
    c.set('userId', userId);
    await next();
  };
}

/** The signed-in user id inside a requireAuth route. */
export function currentUser(c: Context<AppEnv>): string {
  const id = c.get('userId');
  if (!id) throw unauthorized();
  return id;
}
