/**
 * Test helpers for the apps' screen tests: an API client answered by a route
 * function instead of the network, and a query client without retries.
 * Import from `@pro/api/testing`; not part of the main entry point.
 */
import { notifyManager, QueryClient } from '@tanstack/react-query';

import { createApiClient, type ApiClient } from './client';

/** Answers one request; return undefined for a 404. `path` includes the query string. */
export type Route = (method: string, path: string, body: unknown) => { status?: number; body: unknown } | undefined;

export interface FakeCall {
  method: string;
  path: string;
  body: unknown;
}

const BASE_URL = 'http://api.test';

/** An API client whose requests are answered by `route`, recording every call. */
export function fakeClient(route: Route, token: string | null = 'test-token'): { client: ApiClient; calls: FakeCall[] } {
  const calls: FakeCall[] = [];
  const fetch = async (url: string, init: RequestInit = {}) => {
    const path = url.replace(BASE_URL, '');
    const method = init.method ?? 'GET';
    const body: unknown = init.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ method, path, body });
    const res = route(method, path, body) ?? { status: 404, body: { error: { code: 'NOT_FOUND', message: `No route for ${method} ${path}` } } };
    const status = res.status ?? 200;
    return { ok: status < 400, status, text: async () => JSON.stringify(res.body) };
  };
  // The client only reads ok, status and text(), so a partial Response is enough here.
  const client = createApiClient({ baseUrl: BASE_URL, token, fetch: fetch as unknown as typeof globalThis.fetch });
  return { client, calls };
}

/**
 * A query client for tests: no retries, and no garbage-collection timers left running.
 *
 * It also makes React Query deliver cache updates to components in a
 * microtask instead of its default `setTimeout(0)`. With the default, an
 * update written inside `act()` (say, an SSE event put into the cache) only
 * reaches the screen if that timer happens to fire before `act()` finishes
 * flushing, which stops being true when a busy machine delays timers, so
 * assertions made right after `act()` saw stale screens now and then. A
 * microtask always runs inside `act()`.
 */
export function testQueryClient(): QueryClient {
  notifyManager.setScheduler(queueMicrotask);
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
}
