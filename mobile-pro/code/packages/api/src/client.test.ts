import { ApiError, createApiClient, toQueryString } from './client';

function mockFetch(status: number, body: unknown) {
  return jest.fn(async (_url: string, _init?: RequestInit) => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  })) as unknown as jest.Mock & typeof fetch;
}

describe('toQueryString', () => {
  it('skips empty values, repeats arrays and encodes', () => {
    expect(toQueryString({ q: 'paneer tikka', veg: true, minRating: 4, x: undefined, y: null, z: '', brand: ['A & B', 'C'] })).toBe(
      '?q=paneer%20tikka&veg=true&minRating=4&brand=A%20%26%20B&brand=C',
    );
    expect(toQueryString({})).toBe('');
    expect(toQueryString(undefined)).toBe('');
  });
});

describe('createApiClient', () => {
  it('builds URLs from the base URL and sends the bearer token', async () => {
    const fetch = mockFetch(200, []);
    const api = createApiClient({ baseUrl: 'http://api.test/', token: 'tok', fetch });
    await api.platter.restaurants({ veg: true, sort: 'rating' });
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe('http://api.test/platter/restaurants?veg=true&sort=rating');
    expect(init.method).toBe('GET');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer tok', Accept: 'application/json' });
  });

  it('sends JSON bodies with the right method', async () => {
    const fetch = mockFetch(200, { items: [] });
    const api = createApiClient({ baseUrl: 'http://api.test', fetch });
    await api.cart.setItem('platter', { productId: 'm1', quantity: 2 });
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe('http://api.test/cart/platter/items');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({ productId: 'm1', quantity: 2 });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('encodes path segments', async () => {
    const fetch = mockFetch(200, {});
    const api = createApiClient({ baseUrl: 'http://api.test', fetch });
    await api.lumo.profile('riya.kapoor/../x');
    expect(fetch.mock.calls[0]![0]).toBe('http://api.test/lumo/users/riya.kapoor%2F..%2Fx');
  });

  it('turns error bodies into ApiError', async () => {
    const api = createApiClient({
      baseUrl: 'http://api.test',
      fetch: mockFetch(409, { error: { code: 'CART_CONFLICT', message: 'Replace?', details: { restaurantId: 'r-01' } } }),
    });
    const err = await api.cart.setItem('platter', { productId: 'x', quantity: 1 }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409, code: 'CART_CONFLICT', message: 'Replace?', details: { restaurantId: 'r-01' } });
  });

  it('calls onUnauthorized on 401', async () => {
    const onUnauthorized = jest.fn();
    const api = createApiClient({ baseUrl: 'http://api.test', fetch: mockFetch(401, { error: { code: 'UNAUTHORIZED', message: 'Sign in' } }), onUnauthorized });
    await expect(api.me.get()).rejects.toMatchObject({ isUnauthorized: true });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('reports network failures as status 0', async () => {
    const api = createApiClient({ baseUrl: 'http://api.test', fetch: jest.fn().mockRejectedValue(new TypeError('Network request failed')) });
    await expect(api.health()).rejects.toMatchObject({ status: 0, code: 'NETWORK', isNetworkError: true });
  });

  it('handles empty 204 responses', async () => {
    const api = createApiClient({ baseUrl: 'http://api.test', fetch: mockFetch(204, undefined) });
    await expect(api.me.deleteAddress('a1')).resolves.toBeNull();
  });

  it('tracks the token and reports changes', async () => {
    const onTokenChange = jest.fn();
    const fetch = mockFetch(200, {});
    const api = createApiClient({ baseUrl: 'http://api.test', fetch, onTokenChange });
    api.setToken('new-token');
    expect(onTokenChange).toHaveBeenCalledWith('new-token');
    expect(api.orders.eventsUrl('ord_1')).toBe('http://api.test/orders/ord_1/events?token=new-token');
    await api.me.get();
    expect(fetch.mock.calls[0]![1].headers).toMatchObject({ Authorization: 'Bearer new-token' });
  });

  it('defaults to localhost:4000 when EXPO_PUBLIC_API_URL is unset', () => {
    expect(createApiClient().baseUrl).toBe(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000');
  });
});
