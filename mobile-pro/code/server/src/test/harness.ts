import type { AuthResponse } from '@pro/api/types';

import { createApp } from '../app';
import { testConfig } from '../config';
import { openDb } from '../db';
import { createBus, type Deps } from '../deps';
import { seedDatabase } from '../seed';
import { OrderSimulator } from '../sim/simulator';

/** 31 Oct 2026, 1:30 pm IST. */
export const T0 = Date.parse('2026-10-31T08:00:00.000Z');

interface RequestOptions {
  body?: unknown;
  token?: string | null;
}

export interface Harness {
  deps: Deps;
  app: ReturnType<typeof createApp>;
  sim: OrderSimulator;
  /** Move the fake clock forward. */
  advance(ms: number): void;
  now(): number;
  /** Supertest-style request over Hono's app.request(). */
  request(method: string, path: string, opts?: RequestOptions): Promise<Response>;
  /** Request and parse JSON, failing unless the status matches (200, or 201 for creates). */
  json<T>(method: string, path: string, opts?: RequestOptions & { status?: number }): Promise<T>;
  login(phone?: string): Promise<string>;
}

export function createHarness(): Harness {
  let now = T0;
  const db = openDb(':memory:');
  seedDatabase(db, { now });
  const deps: Deps = { db, config: testConfig, clock: () => now, bus: createBus() };
  const app = createApp(deps);
  const request = async (method: string, path: string, opts: RequestOptions = {}) => {
    const headers: Record<string, string> = {};
    if (opts.body !== undefined) headers['content-type'] = 'application/json';
    if (opts.token) headers.authorization = `Bearer ${opts.token}`;
    return app.request(path, { method, headers, body: opts.body === undefined ? undefined : JSON.stringify(opts.body) });
  };
  const h: Harness = {
    deps,
    app,
    sim: new OrderSimulator(deps),
    advance: (ms) => {
      now += ms;
    },
    now: () => now,
    request,
    async json<T>(method: string, path: string, opts: RequestOptions & { status?: number } = {}) {
      const res = await request(method, path, opts);
      const text = await res.text();
      const ok = opts.status != null ? res.status === opts.status : res.status === 200 || res.status === 201;
      if (!ok) throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
      return (text ? JSON.parse(text) : null) as T;
    },
    async login(phone = '9876543210') {
      const res = await h.json<AuthResponse>('POST', '/auth/otp/verify', { body: { phone, code: '123456' } });
      return res.token;
    },
  };
  return h;
}
