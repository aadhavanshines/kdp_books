import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { byIdWith, updateDeep } from './cache';
import { ApiError, type ApiClient } from './client';
import type {
  AddressInput,
  Cart,
  CommerceApp,
  CreatePostInput,
  GroceryQuery,
  MapPoint,
  Order,
  OrderStreamEvent,
  PlaceOrderInput,
  ProductQuery,
  ProfilePostsTab,
  RateOrderInput,
  RestaurantQuery,
  ReturnInput,
  SetCartItemInput,
  UpdateCartLineInput,
  UpdateMeInput,
} from './types';

// ---------------------------------------------------------------- provider

const ApiContext = createContext<ApiClient | null>(null);

/** Retry network hiccups, never 4xx answers. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: shouldRetry },
      mutations: { retry: false },
    },
  });
}

export interface ApiProviderProps {
  client: ApiClient;
  /** Defaults to createQueryClient(). */
  queryClient?: QueryClient;
  children: ReactNode;
}

/** Provides the API client and a React Query client to the app. */
export function ApiProvider({ client, queryClient, children }: ApiProviderProps) {
  const [qc] = useState(() => queryClient ?? createQueryClient());
  return (
    <ApiContext.Provider value={client}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </ApiContext.Provider>
  );
}

export function useApi(): ApiClient {
  const client = useContext(ApiContext);
  if (!client) throw new Error('useApi must be used inside <ApiProvider>');
  return client;
}

// ---------------------------------------------------------------- keys

/** Query keys. Everything for one app sits under that app's prefix. */
export const queryKeys = {
  me: ['me'] as const,
  addresses: ['me', 'addresses'] as const,
  notifications: (app?: CommerceApp) => ['notifications', app ?? 'all'] as const,
  coupons: (app: CommerceApp) => ['coupons', app] as const,
  platter: {
    all: ['platter'] as const,
    home: ['platter', 'home'] as const,
    cuisines: ['platter', 'cuisines'] as const,
    restaurants: (query: RestaurantQuery) => ['platter', 'restaurants', query] as const,
    restaurant: (id: string) => ['platter', 'restaurant', id] as const,
    search: (q: string) => ['platter', 'search', q] as const,
  },
  cartly: {
    all: ['cartly'] as const,
    home: ['cartly', 'home'] as const,
    categories: ['cartly', 'categories'] as const,
    deals: ['cartly', 'deals'] as const,
    products: (query: ProductQuery) => ['cartly', 'products', query] as const,
    product: (id: string) => ['cartly', 'product', id] as const,
    reviews: (id: string, sort: string) => ['cartly', 'reviews', id, sort] as const,
    suggestions: (q: string) => ['cartly', 'suggestions', q] as const,
    brands: (category?: string) => ['cartly', 'brands', category ?? 'all'] as const,
    delivery: (pincode: string, productId?: string) => ['cartly', 'delivery', pincode, productId ?? null] as const,
    wishlist: ['cartly', 'wishlist'] as const,
    recentlyViewed: ['cartly', 'recently-viewed'] as const,
  },
  lumo: {
    all: ['lumo'] as const,
    feed: ['lumo', 'feed'] as const,
    explore: ['lumo', 'explore'] as const,
    stories: ['lumo', 'stories'] as const,
    highlight: (id: string) => ['lumo', 'highlight', id] as const,
    post: (id: string) => ['lumo', 'post', id] as const,
    comments: (postId: string) => ['lumo', 'comments', postId] as const,
    profile: (handle: string) => ['lumo', 'profile', handle] as const,
    profilePosts: (handle: string, tab: ProfilePostsTab) => ['lumo', 'profile-posts', handle, tab] as const,
    searchUsers: (q: string) => ['lumo', 'search-users', q] as const,
    suggestions: ['lumo', 'suggestions'] as const,
    notifications: ['lumo', 'notifications'] as const,
    conversations: ['lumo', 'conversations'] as const,
    conversation: (id: string) => ['lumo', 'conversation', id] as const,
    messages: (id: string) => ['lumo', 'messages', id] as const,
  },
  minutely: {
    all: ['minutely'] as const,
    home: ['minutely', 'home'] as const,
    categories: ['minutely', 'categories'] as const,
    products: (query: GroceryQuery) => ['minutely', 'products', query] as const,
    product: (id: string) => ['minutely', 'product', id] as const,
  },
  cart: (app: CommerceApp) => ['cart', app] as const,
  orders: (app?: CommerceApp) => ['orders', 'list', app ?? 'all'] as const,
  order: (id: string) => ['orders', 'detail', id] as const,
};

/** Applies `update` to a matching entity in every cached query under `prefix`. */
function patchEverywhere(
  qc: QueryClient,
  prefix: QueryKey,
  match: (v: Record<string, unknown>) => boolean,
  update: (v: Record<string, unknown>) => Record<string, unknown>,
) {
  for (const [key, data] of qc.getQueriesData({ queryKey: prefix })) {
    if (data === undefined) continue;
    const next = updateDeep(data, match, update);
    if (next !== data) qc.setQueryData(key, next);
  }
}

// ---------------------------------------------------------------- auth & account

export function useRequestOtp() {
  const api = useApi();
  return useMutation({ mutationFn: (phone: string) => api.auth.requestOtp(phone) });
}

/** Verifies the OTP, stores the token on the client and refetches everything. */
export function useVerifyOtp() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) => api.auth.verifyOtp(phone, code),
    onSuccess: (res) => {
      api.setToken(res.token);
      qc.setQueryData(queryKeys.me, res.user);
      void qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
    },
  });
}

/** Clears the token and every cached query. */
export function useSignOut() {
  const api = useApi();
  const qc = useQueryClient();
  return () => {
    api.setToken(null);
    qc.clear();
  };
}

export function useMe(options: { enabled?: boolean } = {}) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.me, queryFn: () => api.me.get(), enabled: options.enabled ?? !!api.getToken() });
}

export function useUpdateMe() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({ mutationFn: (input: UpdateMeInput) => api.me.update(input), onSuccess: (user) => qc.setQueryData(queryKeys.me, user) });
}

export function useAddresses() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.addresses, queryFn: () => api.me.addresses() });
}

export function useSaveAddress() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: AddressInput }) => (id ? api.me.updateAddress(id, input) : api.me.createAddress(input)),
    // Distances, ETAs and fees depend on the default address.
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useDeleteAddress() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.me.deleteAddress(id), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }) });
}

export function useNotifications(app?: CommerceApp) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.notifications(app), queryFn: () => api.notifications.list(app) });
}

export function useMarkNotificationsRead() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { app?: CommerceApp; ids?: string[] }) => api.notifications.markRead(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useCoupons(app: CommerceApp) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.coupons(app), queryFn: () => api.coupons(app) });
}

// ---------------------------------------------------------------- Platter

export function usePlatterHome() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.platter.home, queryFn: () => api.platter.home() });
}

export function useCuisines() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.platter.cuisines, queryFn: () => api.platter.cuisines(), staleTime: Infinity });
}

export function useRestaurants(query: RestaurantQuery = {}) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.platter.restaurants(query), queryFn: () => api.platter.restaurants(query) });
}

export function useRestaurant(id: string | undefined) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.platter.restaurant(id ?? ''), queryFn: () => api.platter.restaurant(id!), enabled: !!id });
}

export function usePlatterSearch(q: string) {
  const api = useApi();
  const term = q.trim();
  return useQuery({ queryKey: queryKeys.platter.search(term), queryFn: () => api.platter.search(term), enabled: term.length >= 2 });
}

// ---------------------------------------------------------------- Cartly

export function useCartlyHome() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.cartly.home, queryFn: () => api.cartly.home() });
}

export function useProductCategories() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.cartly.categories, queryFn: () => api.cartly.categories(), staleTime: Infinity });
}

export function useDeals() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.cartly.deals, queryFn: () => api.cartly.deals() });
}

/** Product listing with infinite scroll. */
export function useProducts(query: Omit<ProductQuery, 'page'> = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.cartly.products(query),
    queryFn: ({ pageParam }) => api.cartly.products({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });
}

export function useProduct(id: string | undefined) {
  const api = useApi();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.cartly.product(id ?? ''),
    queryFn: async () => {
      const product = await api.cartly.product(id!);
      // Viewing a product updates "recently viewed".
      void qc.invalidateQueries({ queryKey: queryKeys.cartly.recentlyViewed });
      return product;
    },
    enabled: !!id,
  });
}

export function useReviews(productId: string | undefined, sort: 'helpful' | 'recent' | 'rating_high' | 'rating_low' = 'helpful') {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.cartly.reviews(productId ?? '', sort),
    queryFn: ({ pageParam }) => api.cartly.reviews(productId!, { page: pageParam, sort }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: !!productId,
  });
}

export function useSearchSuggestions(q: string) {
  const api = useApi();
  const term = q.trim();
  return useQuery({
    queryKey: queryKeys.cartly.suggestions(term),
    queryFn: () => api.cartly.suggestions(term),
    enabled: term.length >= 1,
    staleTime: 5 * 60_000,
    placeholderData: (previous) => previous,
  });
}

export function useBrands(category?: string) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.cartly.brands(category), queryFn: () => api.cartly.brands(category) });
}

export function useDeliveryEstimate(pincode: string, productId?: string) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.cartly.delivery(pincode, productId),
    queryFn: () => api.cartly.deliveryEstimate(pincode, productId),
    enabled: /^\d{6}$/.test(pincode),
  });
}

export function useWishlist() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.cartly.wishlist, queryFn: () => api.cartly.wishlist() });
}

/** Optimistically flips the heart on every cached copy of the product. */
export function useToggleWishlist() {
  const api = useApi();
  const qc = useQueryClient();
  const flip = (productId: string, wished: boolean) =>
    patchEverywhere(qc, queryKeys.cartly.all, byIdWith(productId, 'isWishlisted'), (p) => ({ ...p, isWishlisted: wished }));
  return useMutation({
    mutationFn: ({ productId, wished }: { productId: string; wished: boolean }) =>
      wished ? api.cartly.addToWishlist(productId) : api.cartly.removeFromWishlist(productId),
    onMutate: ({ productId, wished }) => flip(productId, wished),
    onError: (_e, { productId, wished }) => flip(productId, !wished),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.cartly.wishlist }),
  });
}

export function useRecentlyViewed() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.cartly.recentlyViewed, queryFn: () => api.cartly.recentlyViewed() });
}

// ---------------------------------------------------------------- Lumo

export function useFeed(limit = 10) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.lumo.feed,
    queryFn: ({ pageParam }) => api.lumo.feed({ cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });
}

export function useExplore(limit = 18) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.lumo.explore,
    queryFn: ({ pageParam }) => api.lumo.explore({ cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });
}

export function useStories() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.lumo.stories, queryFn: () => api.lumo.stories() });
}

/** Marks a story seen, and the group seen once all its stories are. */
export function useMarkStorySeen() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) => api.lumo.markStorySeen(storyId),
    onMutate: (storyId) => {
      patchEverywhere(qc, queryKeys.lumo.stories, byIdWith(storyId, 'isSeen'), (s) => ({ ...s, isSeen: true }));
      patchEverywhere(
        qc,
        queryKeys.lumo.stories,
        (v) => Array.isArray(v.stories) && 'hasUnseen' in v,
        (g) => ({ ...g, hasUnseen: (g.stories as { isSeen: boolean }[]).some((s) => !s.isSeen) }),
      );
    },
  });
}

export function useHighlightStories(highlightId: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.lumo.highlight(highlightId ?? ''),
    queryFn: () => api.lumo.highlightStories(highlightId!),
    enabled: !!highlightId,
  });
}

export function useCreatePost() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => api.lumo.createPost(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.lumo.all }),
  });
}

export function usePost(id: string | undefined) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.lumo.post(id ?? ''), queryFn: () => api.lumo.post(id!), enabled: !!id });
}

export function useDeletePost() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.lumo.deletePost(id), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.lumo.all }) });
}

const postMatch = (id: string) => byIdWith(id, 'likeCount');

/** Like or unlike, updating the post everywhere at once (double-tap friendly). */
export function useToggleLike() {
  const api = useApi();
  const qc = useQueryClient();
  const apply = (postId: string, liked: boolean) =>
    patchEverywhere(qc, queryKeys.lumo.all, postMatch(postId), (p) =>
      p.isLiked === liked ? p : { ...p, isLiked: liked, likeCount: (p.likeCount as number) + (liked ? 1 : -1) },
    );
  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) => api.lumo.setLiked(postId, liked),
    onMutate: ({ postId, liked }) => apply(postId, liked),
    onError: (_e, { postId, liked }) => apply(postId, !liked),
    onSuccess: (post) => patchEverywhere(qc, queryKeys.lumo.all, postMatch(post.id), (p) => ({ ...p, isLiked: post.isLiked, likeCount: post.likeCount })),
  });
}

export function useToggleSave() {
  const api = useApi();
  const qc = useQueryClient();
  const apply = (postId: string, saved: boolean) => patchEverywhere(qc, queryKeys.lumo.all, postMatch(postId), (p) => ({ ...p, isSaved: saved }));
  return useMutation({
    mutationFn: ({ postId, saved }: { postId: string; saved: boolean }) => api.lumo.setSaved(postId, saved),
    onMutate: ({ postId, saved }) => apply(postId, saved),
    onError: (_e, { postId, saved }) => apply(postId, !saved),
    // The Saved tab changes membership, not just a flag: refetch it next time it shows.
    onSettled: () => qc.invalidateQueries({ queryKey: ['lumo', 'profile-posts'], refetchType: 'none' }),
  });
}

export function useComments(postId: string | undefined) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.lumo.comments(postId ?? ''), queryFn: () => api.lumo.comments(postId!), enabled: !!postId });
}

export function useAddComment(postId: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => api.lumo.addComment(postId, text),
    onSuccess: (comment) => {
      qc.setQueryData(queryKeys.lumo.comments(postId), (old: unknown) => (Array.isArray(old) ? [...old, comment] : [comment]));
      patchEverywhere(qc, queryKeys.lumo.all, postMatch(postId), (p) => ({ ...p, commentCount: (p.commentCount as number) + 1 }));
    },
  });
}

export function useToggleCommentLike(postId: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, liked }: { commentId: string; liked: boolean }) => api.lumo.setCommentLiked(commentId, liked),
    onMutate: ({ commentId, liked }) =>
      patchEverywhere(qc, queryKeys.lumo.comments(postId), byIdWith(commentId, 'isLiked'), (c) =>
        c.isLiked === liked ? c : { ...c, isLiked: liked, likeCount: (c.likeCount as number) + (liked ? 1 : -1) },
      ),
  });
}

export function useProfile(handle: string | undefined) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.lumo.profile(handle ?? ''), queryFn: () => api.lumo.profile(handle!), enabled: !!handle });
}

export function useProfilePosts(handle: string | undefined, tab: ProfilePostsTab = 'grid') {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.lumo.profilePosts(handle ?? '', tab),
    queryFn: () => api.lumo.profilePosts(handle!, tab),
    enabled: !!handle,
  });
}

export function useToggleFollow() {
  const api = useApi();
  const qc = useQueryClient();
  const apply = (userId: string, follow: boolean) =>
    patchEverywhere(qc, queryKeys.lumo.all, byIdWith(userId, 'isFollowing'), (u) => ({ ...u, isFollowing: follow }));
  return useMutation({
    mutationFn: ({ userId, follow }: { userId: string; follow: boolean }) => api.lumo.setFollowing(userId, follow),
    onMutate: ({ userId, follow }) => apply(userId, follow),
    onError: (_e, { userId, follow }) => apply(userId, !follow),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lumo.feed });
      void qc.invalidateQueries({ queryKey: queryKeys.lumo.stories });
      void qc.invalidateQueries({ queryKey: ['lumo', 'profile'] });
    },
  });
}

export function useSearchUsers(q: string) {
  const api = useApi();
  const term = q.trim();
  return useQuery({
    queryKey: queryKeys.lumo.searchUsers(term),
    queryFn: () => api.lumo.searchUsers(term),
    enabled: term.length >= 1,
    placeholderData: (previous) => previous,
  });
}

export function useSuggestedUsers() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.lumo.suggestions, queryFn: () => api.lumo.suggestions() });
}

export function useLumoNotifications() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.lumo.notifications, queryFn: () => api.lumo.notifications() });
}

export function useMarkLumoNotificationsRead() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.lumo.markNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.lumo.notifications }),
  });
}

export function useConversations() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.lumo.conversations, queryFn: () => api.lumo.conversations() });
}

export function useStartConversation() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => api.lumo.startConversation(userIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.lumo.conversations }),
  });
}

export function useConversation(id: string | undefined) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.lumo.conversation(id ?? ''), queryFn: () => api.lumo.conversation(id!), enabled: !!id });
}

/** Messages in a chat, polled every few seconds while the screen is open. */
export function useMessages(conversationId: string | undefined, pollMs = 5000) {
  const api = useApi();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.lumo.messages(conversationId ?? ''),
    queryFn: async () => {
      const messages = await api.lumo.messages(conversationId!);
      void qc.invalidateQueries({ queryKey: queryKeys.lumo.conversations });
      return messages;
    },
    enabled: !!conversationId,
    refetchInterval: pollMs,
  });
}

export function useSendMessage(conversationId: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => api.lumo.sendMessage(conversationId, text),
    onSuccess: (message) => {
      qc.setQueryData(queryKeys.lumo.messages(conversationId), (old: unknown) => (Array.isArray(old) ? [...old, message] : [message]));
      void qc.invalidateQueries({ queryKey: queryKeys.lumo.conversations });
    },
  });
}

// ---------------------------------------------------------------- Minutely

export function useMinutelyHome() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.minutely.home, queryFn: () => api.minutely.home() });
}

export function useGroceryCategories() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.minutely.categories, queryFn: () => api.minutely.categories(), staleTime: Infinity });
}

export function useGroceries(query: GroceryQuery = {}) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.minutely.products(query), queryFn: () => api.minutely.products(query) });
}

export function useGrocery(id: string | undefined) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.minutely.product(id ?? ''), queryFn: () => api.minutely.product(id!), enabled: !!id });
}

// ---------------------------------------------------------------- cart

export function useCart(app: CommerceApp, options: { enabled?: boolean } = {}) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.cart(app), queryFn: () => api.cart.get(app), enabled: options.enabled ?? !!api.getToken() });
}

/** The quantity of a product in the cart across all its lines (for ADD steppers). */
export function quantityInCart(cart: Cart | undefined, productId: string): number {
  return cart?.items.filter((l) => l.productId === productId).reduce((s, l) => s + l.quantity, 0) ?? 0;
}

function useCartMutation<V>(
  app: CommerceApp,
  fn: (vars: V) => Promise<Cart>,
  optimistic?: (cart: Cart, vars: V) => Cart,
  after?: () => void,
) {
  const qc = useQueryClient();
  const key = queryKeys.cart(app);
  return useMutation({
    mutationFn: fn,
    onMutate: async (vars: V) => {
      if (!optimistic) return { previous: undefined };
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Cart>(key);
      if (previous) qc.setQueryData(key, optimistic(previous, vars));
      return { previous };
    },
    onError: (_e, _v, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
    },
    // The server's cart (with a fresh bill) always wins.
    onSuccess: (cart) => {
      qc.setQueryData(key, cart);
      after?.();
    },
  });
}

/**
 * Sets a product's quantity. The stepper updates at once; the bill follows
 * when the server answers. A Platter conflict rejects with ApiError code
 * CART_CONFLICT: ask, then retry with `replaceCart: true`.
 */
export function useSetCartItem(app: CommerceApp) {
  const api = useApi();
  return useCartMutation(
    app,
    (input: SetCartItemInput) => api.cart.setItem(app, input),
    (cart, input) => {
      // Only plain items can be predicted; customized lines wait for the server.
      if (input.options?.length || input.variant || input.replaceCart) return cart;
      const lines = cart.items.filter((l) => l.productId === input.productId);
      if (lines.length !== 1) return cart;
      const line = lines[0]!;
      const items =
        input.quantity <= 0
          ? cart.items.filter((l) => l.id !== line.id)
          : cart.items.map((l) => (l.id === line.id ? { ...l, quantity: input.quantity, lineTotal: l.unitPrice * input.quantity } : l));
      return { ...cart, items, itemCount: items.reduce((s, l) => s + l.quantity, 0) };
    },
  );
}

export function useUpdateCartLine(app: CommerceApp) {
  const api = useApi();
  return useCartMutation(app, ({ lineId, input }: { lineId: string; input: UpdateCartLineInput }) => api.cart.updateLine(app, lineId, input));
}

export function useRemoveCartLine(app: CommerceApp) {
  const api = useApi();
  return useCartMutation(
    app,
    (lineId: string) => api.cart.removeLine(app, lineId),
    (cart, lineId) => ({ ...cart, items: cart.items.filter((l) => l.id !== lineId), savedForLater: cart.savedForLater.filter((l) => l.id !== lineId) }),
  );
}

export function useClearCart(app: CommerceApp) {
  const api = useApi();
  return useCartMutation(app, () => api.cart.clear(app));
}

export function useApplyCoupon(app: CommerceApp) {
  const api = useApi();
  const qc = useQueryClient();
  // Savings estimates on the coupon list depend on the cart.
  return useCartMutation(app, (code: string) => api.cart.applyCoupon(app, code), undefined, () => {
    void qc.invalidateQueries({ queryKey: queryKeys.coupons(app) });
  });
}

export function useRemoveCoupon(app: CommerceApp) {
  const api = useApi();
  return useCartMutation(app, () => api.cart.removeCoupon(app));
}

export function useSetTip(app: CommerceApp) {
  const api = useApi();
  return useCartMutation(app, (amount: number) => api.cart.setTip(app, amount));
}

/** Choose the address the cart is priced for (Platter's delivery fee depends on distance). */
export function useSetCartAddress(app: CommerceApp) {
  const api = useApi();
  return useCartMutation(app, (addressId: string) => api.cart.setAddress(app, addressId));
}

// ---------------------------------------------------------------- orders

export function usePlaceOrder() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlaceOrderInput) => api.orders.place(input),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.order(order.id), order);
      void qc.invalidateQueries({ queryKey: queryKeys.cart(order.app) });
      void qc.invalidateQueries({ queryKey: ['orders', 'list'] });
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useOrders(app?: CommerceApp) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.orders(app), queryFn: () => api.orders.list(app) });
}

export function useOrder(id: string | undefined) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.order(id ?? ''), queryFn: () => api.orders.get(id!), enabled: !!id });
}

function useOrderMutation<V>(fn: (vars: V) => Promise<Order>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.order(order.id), order);
      void qc.invalidateQueries({ queryKey: ['orders', 'list'] });
    },
  });
}

export function useCancelOrder() {
  const api = useApi();
  return useOrderMutation((id: string) => api.orders.cancel(id));
}

export function useRateOrder() {
  const api = useApi();
  return useOrderMutation(({ id, input }: { id: string; input: RateOrderInput }) => api.orders.rate(id, input));
}

export function useRequestReturn() {
  const api = useApi();
  return useOrderMutation(({ id, input }: { id: string; input: ReturnInput }) => api.orders.requestReturn(id, input));
}

export interface OrderStreamState {
  /** The latest order, from the stream or the cache. */
  order: Order | undefined;
  /** Rider position and progress from the latest location event. */
  rider: { position: MapPoint; progress: number; etaMinutes: number } | null;
  connected: boolean;
  error: Error | null;
}

/**
 * Live order tracking over SSE: keeps `useOrder(id)` in the cache up to date
 * and exposes the moving rider. Closes when the order finishes or the
 * component unmounts.
 */
export function useOrderStream(orderId: string | undefined): OrderStreamState {
  const api = useApi();
  const qc = useQueryClient();
  const order = useOrder(orderId).data;
  const [rider, setRider] = useState<OrderStreamState['rider']>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const finished = order?.status === 'delivered' || order?.status === 'cancelled';

  useEffect(() => {
    if (!orderId || finished) return;
    const stream = api.orders.subscribe(orderId, {
      onOpen: () => {
        setConnected(true);
        setError(null);
      },
      onError: (e) => {
        setConnected(false);
        setError(e);
      },
      onEvent: (event: OrderStreamEvent) => {
        if (event.type === 'location') {
          setRider({ position: event.position, progress: event.progress, etaMinutes: event.etaMinutes });
          qc.setQueryData<Order>(queryKeys.order(event.orderId), (old) =>
            old?.tracking
              ? { ...old, etaMinutes: event.etaMinutes, tracking: { ...old.tracking, progress: event.progress, riderPosition: event.position } }
              : old,
          );
          return;
        }
        qc.setQueryData(queryKeys.order(event.order.id), event.order);
        if (event.type === 'status') void qc.invalidateQueries({ queryKey: ['orders', 'list'] });
        if (event.order.status === 'delivered' || event.order.status === 'cancelled') setConnected(false);
      },
    });
    return () => stream.close();
  }, [api, qc, orderId, finished]);

  return { order, rider, connected, error };
}

