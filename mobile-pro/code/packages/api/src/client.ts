import { openEventStream, type EventStream } from './sse';
import type {
  Address,
  AddressInput,
  ApiErrorBody,
  AppNotification,
  AuthResponse,
  Cart,
  CartlyHome,
  Comment,
  CommerceApp,
  Conversation,
  CouponOffer,
  CreatePostInput,
  Cuisine,
  CursorPage,
  Deal,
  DeliveryEstimate,
  GroceryCategory,
  GroceryItem,
  GroceryItemDetail,
  GroceryQuery,
  HealthResponse,
  LumoNotification,
  LumoProfile,
  LumoUser,
  Message,
  MinutelyHome,
  Order,
  OrderStreamEvent,
  OrderSummary,
  OtpRequestResponse,
  PlaceOrderInput,
  PlatterHome,
  PlatterSearchResult,
  Post,
  Product,
  ProductCategory,
  ProductListResponse,
  ProductQuery,
  ProductSummary,
  ProfilePostsTab,
  RateOrderInput,
  Restaurant,
  RestaurantQuery,
  RestaurantSummary,
  ReturnInput,
  ReviewPage,
  SearchSuggestion,
  SetCartItemInput,
  Story,
  StoryGroup,
  UpdateCartLineInput,
  UpdateMeInput,
  User,
} from './types';

/**
 * The API base URL. Expo inlines EXPO_PUBLIC_* variables at build time, so
 * this must be a direct `process.env.EXPO_PUBLIC_API_URL` access. On an
 * Android emulator use http://10.0.2.2:4000; on a phone, your computer's
 * LAN address.
 */
export const DEFAULT_API_URL: string = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

/** An error response from the API, or a network failure (status 0). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

export type QueryValue = string | number | boolean | null | undefined | readonly (string | number)[];

/** `{ a: 1, b: ['x', 'y'], c: undefined }` -> "?a=1&b=x&b=y". */
export function toQueryString(params: Record<string, QueryValue> | object | undefined): string {
  if (!params) return '';
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params as Record<string, QueryValue>)) {
    if (value === undefined || value === null || value === '') continue;
    const values = Array.isArray(value) ? value : [value];
    for (const v of values) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

export interface ApiClientOptions {
  baseUrl?: string;
  /** Initial token (e.g. restored from secure storage). */
  token?: string | null;
  /** Called on any 401, e.g. to sign the user out. */
  onUnauthorized?: () => void;
  /** Called whenever the token changes, e.g. to persist it. */
  onTokenChange?: (token: string | null) => void;
  /** Request timeout in milliseconds. */
  timeoutMs?: number;
  fetch?: typeof fetch;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiClient = ReturnType<typeof createApiClient>;

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = (options.baseUrl ?? DEFAULT_API_URL).replace(/\/+$/, '');
  const timeoutMs = options.timeoutMs ?? 15_000;
  const doFetch = options.fetch ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  let token = options.token ?? null;

  async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    let res: Response;
    try {
      res = await doFetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller?.signal,
      });
    } catch (err) {
      const aborted = err instanceof Error && err.name === 'AbortError';
      throw new ApiError(0, aborted ? 'TIMEOUT' : 'NETWORK', aborted ? 'The server took too long to answer' : 'Could not reach the server. Check your connection.');
    } finally {
      if (timer) clearTimeout(timer);
    }
    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
    if (!res.ok) {
      const error = (data as ApiErrorBody | null)?.error;
      if (res.status === 401) options.onUnauthorized?.();
      throw new ApiError(res.status, error?.code ?? 'HTTP_ERROR', error?.message ?? `Request failed (${res.status})`, error?.details);
    }
    return data as T;
  }

  const get = <T>(path: string, query?: object) => request<T>('GET', `${path}${toQueryString(query)}`);
  const id = encodeURIComponent;

  return {
    baseUrl,
    getToken: () => token,
    setToken(next: string | null) {
      token = next;
      options.onTokenChange?.(next);
    },
    request,

    health: () => get<HealthResponse>('/health'),

    auth: {
      requestOtp: (phone: string) => request<OtpRequestResponse>('POST', '/auth/otp/request', { phone }),
      verifyOtp: (phone: string, code: string) => request<AuthResponse>('POST', '/auth/otp/verify', { phone, code }),
    },

    me: {
      get: () => get<User>('/me'),
      update: (input: UpdateMeInput) => request<User>('PATCH', '/me', input),
      addresses: () => get<Address[]>('/me/addresses'),
      createAddress: (input: AddressInput) => request<Address>('POST', '/me/addresses', input),
      updateAddress: (addressId: string, input: AddressInput) => request<Address>('PUT', `/me/addresses/${id(addressId)}`, input),
      deleteAddress: (addressId: string) => request<null>('DELETE', `/me/addresses/${id(addressId)}`),
    },

    notifications: {
      list: (app?: CommerceApp) => get<AppNotification[]>('/notifications', { app }),
      markRead: (input: { app?: CommerceApp; ids?: string[] } = {}) => request<null>('POST', '/notifications/read', input),
    },

    coupons: (app: CommerceApp) => get<CouponOffer[]>('/coupons', { app }),

    platter: {
      home: () => get<PlatterHome>('/platter/home'),
      cuisines: () => get<Cuisine[]>('/platter/cuisines'),
      restaurants: (query: RestaurantQuery = {}) => get<RestaurantSummary[]>('/platter/restaurants', query),
      restaurant: (restaurantId: string) => get<Restaurant>(`/platter/restaurants/${id(restaurantId)}`),
      search: (q: string) => get<PlatterSearchResult>('/platter/search', { q }),
    },

    cartly: {
      home: () => get<CartlyHome>('/cartly/home'),
      categories: () => get<ProductCategory[]>('/cartly/categories'),
      deals: () => get<Deal[]>('/cartly/deals'),
      products: (query: ProductQuery = {}) => get<ProductListResponse>('/cartly/products', query),
      product: (productId: string) => get<Product>(`/cartly/products/${id(productId)}`),
      reviews: (productId: string, query: { page?: number; pageSize?: number; sort?: 'helpful' | 'recent' | 'rating_high' | 'rating_low' } = {}) =>
        get<ReviewPage>(`/cartly/products/${id(productId)}/reviews`, query),
      suggestions: (q: string) => get<SearchSuggestion[]>('/cartly/search/suggestions', { q }),
      brands: (category?: string) => get<string[]>('/cartly/brands', { category }),
      deliveryEstimate: (pincode: string, productId?: string) => get<DeliveryEstimate>('/cartly/delivery-estimate', { pincode, productId }),
      wishlist: () => get<ProductSummary[]>('/cartly/wishlist'),
      addToWishlist: (productId: string) => request<ProductSummary>('PUT', `/cartly/wishlist/${id(productId)}`),
      removeFromWishlist: (productId: string) => request<ProductSummary>('DELETE', `/cartly/wishlist/${id(productId)}`),
      recentlyViewed: () => get<ProductSummary[]>('/cartly/recently-viewed'),
    },

    lumo: {
      feed: (page: { cursor?: string | null; limit?: number } = {}) => get<CursorPage<Post>>('/lumo/feed', page),
      explore: (page: { cursor?: string | null; limit?: number } = {}) => get<CursorPage<Post>>('/lumo/explore', page),
      stories: () => get<StoryGroup[]>('/lumo/stories'),
      markStorySeen: (storyId: string) => request<null>('POST', `/lumo/stories/${id(storyId)}/seen`),
      highlightStories: (highlightId: string) => get<Story[]>(`/lumo/highlights/${id(highlightId)}/stories`),
      createPost: (input: CreatePostInput) => request<Post>('POST', '/lumo/posts', input),
      post: (postId: string) => get<Post>(`/lumo/posts/${id(postId)}`),
      deletePost: (postId: string) => request<null>('DELETE', `/lumo/posts/${id(postId)}`),
      setLiked: (postId: string, liked: boolean) => request<Post>(liked ? 'PUT' : 'DELETE', `/lumo/posts/${id(postId)}/like`),
      setSaved: (postId: string, saved: boolean) => request<Post>(saved ? 'PUT' : 'DELETE', `/lumo/posts/${id(postId)}/save`),
      comments: (postId: string) => get<Comment[]>(`/lumo/posts/${id(postId)}/comments`),
      addComment: (postId: string, text: string) => request<Comment>('POST', `/lumo/posts/${id(postId)}/comments`, { text }),
      setCommentLiked: (commentId: string, liked: boolean) =>
        request<Comment>(liked ? 'PUT' : 'DELETE', `/lumo/comments/${id(commentId)}/like`),
      profile: (handle: string) => get<LumoProfile>(`/lumo/users/${id(handle)}`),
      profilePosts: (handle: string, tab: ProfilePostsTab = 'grid') => get<Post[]>(`/lumo/users/${id(handle)}/posts`, { tab }),
      setFollowing: (userId: string, follow: boolean) => request<LumoUser>(follow ? 'PUT' : 'DELETE', `/lumo/users/${id(userId)}/follow`),
      searchUsers: (q: string) => get<LumoUser[]>('/lumo/search/users', { q }),
      suggestions: () => get<LumoUser[]>('/lumo/suggestions'),
      notifications: () => get<LumoNotification[]>('/lumo/notifications'),
      markNotificationsRead: () => request<null>('POST', '/lumo/notifications/read'),
      conversations: () => get<Conversation[]>('/lumo/conversations'),
      startConversation: (userIds: string[]) => request<Conversation>('POST', '/lumo/conversations', { userIds }),
      conversation: (conversationId: string) => get<Conversation>(`/lumo/conversations/${id(conversationId)}`),
      messages: (conversationId: string) => get<Message[]>(`/lumo/conversations/${id(conversationId)}/messages`),
      sendMessage: (conversationId: string, text: string) =>
        request<Message>('POST', `/lumo/conversations/${id(conversationId)}/messages`, { text }),
    },

    minutely: {
      home: () => get<MinutelyHome>('/minutely/home'),
      categories: () => get<GroceryCategory[]>('/minutely/categories'),
      products: (query: GroceryQuery = {}) => get<GroceryItem[]>('/minutely/products', query),
      product: (productId: string) => get<GroceryItemDetail>(`/minutely/products/${id(productId)}`),
    },

    cart: {
      get: (app: CommerceApp) => get<Cart>(`/cart/${app}`),
      setItem: (app: CommerceApp, input: SetCartItemInput) => request<Cart>('PUT', `/cart/${app}/items`, input),
      updateLine: (app: CommerceApp, lineId: string, input: UpdateCartLineInput) =>
        request<Cart>('PATCH', `/cart/${app}/lines/${id(lineId)}`, input),
      removeLine: (app: CommerceApp, lineId: string) => request<Cart>('DELETE', `/cart/${app}/lines/${id(lineId)}`),
      clear: (app: CommerceApp) => request<Cart>('DELETE', `/cart/${app}`),
      applyCoupon: (app: CommerceApp, code: string) => request<Cart>('POST', `/cart/${app}/coupon`, { code }),
      removeCoupon: (app: CommerceApp) => request<Cart>('DELETE', `/cart/${app}/coupon`),
      setTip: (app: CommerceApp, amount: number) => request<Cart>('PUT', `/cart/${app}/tip`, { amount }),
      setAddress: (app: CommerceApp, addressId: string) => request<Cart>('PUT', `/cart/${app}/address`, { addressId }),
    },

    orders: {
      place: (input: PlaceOrderInput) => request<Order>('POST', '/orders', input),
      list: (app?: CommerceApp) => get<OrderSummary[]>('/orders', { app }),
      get: (orderId: string) => get<Order>(`/orders/${id(orderId)}`),
      cancel: (orderId: string) => request<Order>('POST', `/orders/${id(orderId)}/cancel`),
      rate: (orderId: string, input: RateOrderInput) => request<Order>('POST', `/orders/${id(orderId)}/rating`, input),
      requestReturn: (orderId: string, input: ReturnInput) => request<Order>('POST', `/orders/${id(orderId)}/returns`, input),
      /** The SSE URL; the token goes in the query because EventSource cannot set headers. */
      eventsUrl: (orderId: string) => `${baseUrl}/orders/${id(orderId)}/events${toQueryString({ token })}`,
      /**
       * Live order updates. Closes itself after the order is delivered or
       * cancelled; call `close()` when the screen goes away.
       */
      subscribe(
        orderId: string,
        handlers: { onEvent: (event: OrderStreamEvent) => void; onOpen?: () => void; onError?: (error: Error) => void },
      ): EventStream {
        const stream: EventStream = openEventStream(`${baseUrl}/orders/${id(orderId)}/events${toQueryString({ token })}`, {
          events: ['snapshot', 'status', 'location'],
          onOpen: handlers.onOpen,
          onError: handlers.onError,
          onMessage: (message) => {
            let event: OrderStreamEvent;
            try {
              event = JSON.parse(message.data) as OrderStreamEvent;
            } catch {
              return;
            }
            handlers.onEvent(event);
            if (event.type !== 'location' && (event.order.status === 'delivered' || event.order.status === 'cancelled')) {
              stream.close();
            }
          },
        });
        return stream;
      },
    },
  };
}
