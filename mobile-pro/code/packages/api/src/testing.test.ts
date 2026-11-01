import { notifyManager, QueryObserver } from '@tanstack/react-query';

import { ApiError } from './client';
import { fakeClient, testQueryClient } from './testing';

describe('fakeClient', () => {
  it('answers from the route and records each call', async () => {
    const { client, calls } = fakeClient((method, path, body) =>
      method === 'POST' && path === '/cart/items' ? { status: 201, body: { echoed: body } } : undefined,
    );
    await expect(client.request('POST', '/cart/items', { productId: 'p1' })).resolves.toEqual({ echoed: { productId: 'p1' } });
    expect(calls).toEqual([{ method: 'POST', path: '/cart/items', body: { productId: 'p1' } }]);
  });

  it('returns a 404 for unknown routes', async () => {
    const { client } = fakeClient(() => undefined);
    await expect(client.request('GET', '/nowhere')).rejects.toBeInstanceOf(ApiError);
    await expect(client.request('GET', '/nowhere')).rejects.toMatchObject({ status: 404 });
  });

  it('starts signed in with a test token unless told otherwise', () => {
    expect(fakeClient(() => undefined).client.getToken()).toBe('test-token');
    expect(fakeClient(() => undefined, null).client.getToken()).toBeNull();
  });
});

describe('testQueryClient', () => {
  it('does not retry', () => {
    const qc = testQueryClient();
    expect(qc.getDefaultOptions().queries?.retry).toBe(false);
    expect(qc.getDefaultOptions().mutations?.retry).toBe(false);
  });

  it('delivers cache updates in a microtask, without waiting for a timer', async () => {
    const qc = testQueryClient();
    qc.setQueryData(['order'], 'packed');
    const observer = new QueryObserver<string>(qc, { queryKey: ['order'], enabled: false });
    const seen: (string | undefined)[] = [];
    // useQuery re-renders through notifyManager.batchCalls, exactly like this.
    const unsubscribe = observer.subscribe(notifyManager.batchCalls((r) => seen.push(r.data)));
    qc.setQueryData(['order'], 'shipped');
    // Only microtasks run here; with the default setTimeout scheduler nothing would arrive yet.
    await Promise.resolve();
    await Promise.resolve();
    expect(seen).toEqual(['shipped']);
    unsubscribe();
  });
});
