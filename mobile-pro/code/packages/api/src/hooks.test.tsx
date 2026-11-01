import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ApiError, createApiClient } from './client';
import {
  ApiProvider,
  queryKeys,
  quantityInCart,
  shouldRetry,
  useOrderStream,
  useRestaurants,
  useSetCartItem,
  useToggleLike,
  useVerifyOtp,
} from './hooks';
import { testQueryClient } from './testing';
import type { Cart, CursorPage, Order, OrderStreamEvent, Post } from './types';

type Route = (url: string, init: RequestInit) => { status?: number; body: unknown };

function setup(route: Route, token: string | null = 'tok') {
  const fetch = jest.fn(async (url: string, init: RequestInit) => {
    const { status = 200, body } = route(url, init);
    return { ok: status < 400, status, text: async () => JSON.stringify(body) };
  }) as unknown as jest.Mock & typeof globalThis.fetch;
  const client = createApiClient({ baseUrl: 'http://api.test', token, fetch });
  // Without mutation gcTime: Infinity, every mutation leaves a 5-minute timer that keeps Jest alive after the run.
  const queryClient = testQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApiProvider client={client} queryClient={queryClient}>
      {children}
    </ApiProvider>
  );
  return { client, queryClient, fetch, wrapper };
}

const post = (over: Partial<Post> = {}): Post => ({
  id: 'p1',
  author: { id: 'u2', handle: 'aarav', name: 'Aarav', avatar: null, isVerified: false, isFollowing: true },
  scene: { tone: 'sunset', layers: [] },
  filter: 'normal',
  caption: '',
  location: null,
  likeCount: 10,
  commentCount: 0,
  isLiked: false,
  isSaved: false,
  likedBy: null,
  taggedUsers: [],
  previewComments: [],
  createdAt: '2026-10-31T08:00:00.000Z',
  ...over,
});

describe('shouldRetry', () => {
  it('retries network errors but not client errors', () => {
    expect(shouldRetry(0, new ApiError(0, 'NETWORK', ''))).toBe(true);
    expect(shouldRetry(2, new ApiError(0, 'NETWORK', ''))).toBe(false);
    expect(shouldRetry(0, new ApiError(404, 'NOT_FOUND', ''))).toBe(false);
    expect(shouldRetry(0, new ApiError(503, 'HTTP_ERROR', ''))).toBe(true);
  });
});

describe('query hooks', () => {
  it('fetches restaurants with the query as part of the key', async () => {
    const { wrapper, fetch } = setup(() => ({ body: [{ id: 'r-01', name: 'Saffron Courtyard' }] }));
    const { result } = await renderHook(() => useRestaurants({ veg: true }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]?.name).toBe('Saffron Courtyard');
    expect(fetch.mock.calls[0]![0]).toBe('http://api.test/platter/restaurants?veg=true');
  });

  it('stores the token after OTP verification', async () => {
    const { wrapper, client } = setup(() => ({ body: { token: 'jwt-1', user: { id: 'u_riya' }, isNewUser: false } }), null);
    const { result } = await renderHook(() => useVerifyOtp(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ phone: '9876543210', code: '123456' });
    });
    expect(client.getToken()).toBe('jwt-1');
  });
});

describe('useToggleLike', () => {
  it('updates every cached copy of the post at once and keeps the server count', async () => {
    const { wrapper, queryClient } = setup(() => ({ body: post({ isLiked: true, likeCount: 12 }) }));
    const feed = { pages: [{ items: [post()], nextCursor: null } satisfies CursorPage<Post>], pageParams: [null] };
    queryClient.setQueryData(queryKeys.lumo.feed, feed);
    queryClient.setQueryData(queryKeys.lumo.post('p1'), post());

    const { result } = await renderHook(() => useToggleLike(), { wrapper });
    await act(async () => {
      result.current.mutate({ postId: 'p1', liked: true });
    });
    // Optimistic or final, the two copies agree.
    await waitFor(() => expect(queryClient.getQueryData<Post>(queryKeys.lumo.post('p1'))?.likeCount).toBe(12));
    const cachedFeed = queryClient.getQueryData<typeof feed>(queryKeys.lumo.feed)!;
    expect(cachedFeed.pages[0]!.items[0]).toMatchObject({ isLiked: true, likeCount: 12 });
  });

  it('rolls back when the server fails', async () => {
    const { wrapper, queryClient } = setup(() => ({ status: 500, body: { error: { code: 'INTERNAL', message: 'x' } } }));
    queryClient.setQueryData(queryKeys.lumo.post('p1'), post());
    const { result } = await renderHook(() => useToggleLike(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ postId: 'p1', liked: true }).catch(() => undefined);
    });
    expect(queryClient.getQueryData<Post>(queryKeys.lumo.post('p1'))).toMatchObject({ isLiked: false, likeCount: 10 });
  });
});

describe('cart hooks', () => {
  const cart = (quantity: number): Cart =>
    ({
      app: 'minutely',
      items: [{ id: 'l1', productId: 'g-001', quantity, unitPrice: 50, lineTotal: 50 * quantity }],
      savedForLater: [],
      itemCount: quantity,
    }) as unknown as Cart;

  it('counts quantity across lines', () => {
    expect(quantityInCart(cart(3), 'g-001')).toBe(3);
    expect(quantityInCart(undefined, 'g-001')).toBe(0);
  });

  it('updates the stepper optimistically, then takes the server cart', async () => {
    const { wrapper, queryClient } = setup(() => ({ body: { ...cart(2), bill: { total: 134 } } }));
    queryClient.setQueryData(queryKeys.cart('minutely'), cart(1));
    const { result } = await renderHook(() => useSetCartItem('minutely'), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ productId: 'g-001', quantity: 2 });
    });
    const after = queryClient.getQueryData<Cart & { bill: { total: number } }>(queryKeys.cart('minutely'))!;
    expect(after.itemCount).toBe(2);
    expect(after.bill.total).toBe(134);
  });
});

describe('useOrderStream', () => {
  it('feeds SSE events into the order cache and exposes the rider', async () => {
    let onEvent: (e: OrderStreamEvent) => void = () => undefined;
    const close = jest.fn();
    const order = { id: 'o1', status: 'on_the_way', tracking: { route: [], progress: 0.1, riderPosition: { x: 0, y: 0 } } } as unknown as Order;
    const { wrapper, client, queryClient } = setup(() => ({ body: order }));
    jest.spyOn(client.orders, 'subscribe').mockImplementation((_id, handlers) => {
      onEvent = handlers.onEvent;
      handlers.onOpen?.();
      return { close, closed: false };
    });
    const { result, unmount } = await renderHook(() => useOrderStream('o1'), { wrapper });
    await waitFor(() => expect(result.current.connected).toBe(true));

    await act(async () => onEvent({ type: 'location', orderId: 'o1', progress: 0.5, position: { x: 300, y: 400 }, etaMinutes: 3 }));
    expect(result.current.rider).toEqual({ position: { x: 300, y: 400 }, progress: 0.5, etaMinutes: 3 });
    expect(queryClient.getQueryData<Order>(queryKeys.order('o1'))!.tracking!.progress).toBe(0.5);

    await act(async () => onEvent({ type: 'status', order: { ...order, status: 'delivered' } }));
    expect(result.current.order?.status).toBe('delivered');
    await unmount();
    expect(close).toHaveBeenCalled();
  });
});
