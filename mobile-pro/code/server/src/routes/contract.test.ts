/**
 * Contract test: drives the real @pro/api client against the real app, so a
 * path, method or shape that drifts between the two fails here.
 */
import { createApiClient, type ApiClient } from '@pro/api/client';
import { beforeAll, describe, expect, it } from 'vitest';

import { createHarness, type Harness } from '../test/harness';

let h: Harness;
let api: ApiClient;

beforeAll(async () => {
  h = createHarness();
  api = createApiClient({
    baseUrl: 'http://api.test',
    fetch: (input, init) => Promise.resolve(h.app.request(String(input).replace('http://api.test', ''), init)),
  });
  await api.auth.requestOtp('9876543210');
  const auth = await api.auth.verifyOtp('9876543210', '123456');
  api.setToken(auth.token);
});

describe('@pro/api client against the server', () => {
  it('covers account routes', async () => {
    expect((await api.health()).ok).toBe(true);
    expect((await api.me.get()).handle).toBe('riya.kapoor');
    const address = await api.me.createAddress({ label: 'Studio', line1: '9 Dock Lane', locality: 'Bayfront', pincode: '560107' });
    expect((await api.me.addresses()).map((a) => a.id)).toContain(address.id);
    await api.me.updateAddress(address.id, { label: 'Studio 2', line1: '9 Dock Lane', locality: 'Bayfront', pincode: '560107' });
    await api.me.deleteAddress(address.id);
    expect((await api.notifications.list('platter')).length).toBeGreaterThan(0);
    await api.notifications.markRead({ app: 'platter' });
    expect((await api.coupons('cartly')).length).toBeGreaterThan(0);
  });

  it('covers Platter', async () => {
    const home = await api.platter.home();
    expect(home.restaurants.length).toBe(24);
    expect((await api.platter.cuisines()).length).toBe(home.cuisines.length);
    const veg = await api.platter.restaurants({ veg: true, minRating: 4, sort: 'rating' });
    expect(veg.every((r) => r.isPureVeg)).toBe(true);
    const r = await api.platter.restaurant(home.restaurants[0]!.id);
    expect(r.menu.length).toBeGreaterThan(3);
    expect((await api.platter.search('biryani')).dishes.length).toBeGreaterThan(0);
  });

  it('covers Cartly', async () => {
    const home = await api.cartly.home();
    expect(home.deals.length).toBeGreaterThan(0);
    expect((await api.cartly.categories()).length).toBe(home.categories.length);
    expect((await api.cartly.deals()).length).toBe(home.deals.length);
    const brand = (await api.cartly.brands())[0]!;
    const list = await api.cartly.products({ brand: [brand], sort: 'price_desc' });
    expect(list.items.every((p) => p.brand === brand)).toBe(true);
    const product = await api.cartly.product(list.items[0]!.id);
    expect((await api.cartly.reviews(product.id, { sort: 'recent', pageSize: 2 })).items.length).toBeLessThanOrEqual(2);
    expect((await api.cartly.suggestions('a')).length).toBeGreaterThan(0);
    expect((await api.cartly.deliveryEstimate('560101', product.id)).serviceable).toBe(true);
    await api.cartly.addToWishlist(product.id);
    expect((await api.cartly.wishlist()).some((p) => p.id === product.id)).toBe(true);
    await api.cartly.removeFromWishlist(product.id);
    expect((await api.cartly.recentlyViewed())[0]!.id).toBe(product.id);
  });

  it('covers Lumo', async () => {
    const feed = await api.lumo.feed({ limit: 3 });
    const next = await api.lumo.feed({ limit: 3, cursor: feed.nextCursor });
    expect(next.items[0]!.id).not.toBe(feed.items[0]!.id);
    const explore = await api.lumo.explore({ limit: 6 });
    const p = explore.items[0]!;
    expect((await api.lumo.post(p.id)).id).toBe(p.id);
    expect((await api.lumo.setLiked(p.id, true)).isLiked).toBe(true);
    expect((await api.lumo.setSaved(p.id, true)).isSaved).toBe(true);
    const comment = await api.lumo.addComment(p.id, 'So good');
    expect((await api.lumo.setCommentLiked(comment.id, true)).isLiked).toBe(true);
    expect((await api.lumo.comments(p.id)).at(-1)!.id).toBe(comment.id);
    const groups = await api.lumo.stories();
    await api.lumo.markStorySeen(groups[0]!.stories[0]!.id);
    const me = await api.lumo.profile('riya.kapoor');
    expect((await api.lumo.highlightStories(me.highlights[0]!.id)).length).toBeGreaterThan(0);
    expect((await api.lumo.profilePosts('riya.kapoor', 'saved')).some((x) => x.id === p.id)).toBe(true);
    const created = await api.lumo.createPost({ scene: { tone: 'ocean', layers: [{ art: 'water-wave', x: 0.5, y: 0.5, size: 0.7 }] }, filter: 'cool', caption: 'Swell' });
    await api.lumo.deletePost(created.id);
    const [user] = await api.lumo.suggestions();
    expect((await api.lumo.setFollowing(user!.id, true)).isFollowing).toBe(true);
    expect((await api.lumo.searchUsers(user!.handle)).some((u) => u.id === user!.id)).toBe(true);
    expect((await api.lumo.notifications()).length).toBeGreaterThan(0);
    await api.lumo.markNotificationsRead();
    const chat = await api.lumo.startConversation([user!.id]);
    expect((await api.lumo.conversation(chat.id)).id).toBe(chat.id);
    await api.lumo.sendMessage(chat.id, 'Hi!');
    expect((await api.lumo.messages(chat.id)).at(-1)!.text).toBe('Hi!');
    expect((await api.lumo.conversations()).length).toBeGreaterThan(0);
  });

  it('covers Minutely, cart and orders end to end', async () => {
    const home = await api.minutely.home();
    expect(home.rails.length).toBeGreaterThan(2);
    expect((await api.minutely.categories()).length).toBe(12);
    const items = await api.minutely.products({ category: 'dairy', sort: 'price_asc' });
    expect((await api.minutely.product(items[0]!.id)).similar.length).toBeGreaterThan(0);

    const inStock = (await api.minutely.products({ sort: 'discount' })).filter((g) => g.inStock);
    for (const g of inStock.slice(0, 4)) await api.cart.setItem('minutely', { productId: g.id, quantity: 2 });
    let cart = await api.cart.get('minutely');
    expect(cart.itemCount).toBe(8);
    cart = await api.cart.updateLine('minutely', cart.items[0]!.id, { quantity: 3 });
    cart = await api.cart.removeLine('minutely', cart.items[1]!.id);
    cart = await api.cart.setTip('minutely', 20);
    if (cart.bill.itemTotal >= 299) cart = await api.cart.applyCoupon('minutely', 'FRESH50');
    cart = await api.cart.removeCoupon('minutely');
    expect(cart.coupon).toBeNull();

    const order = await api.orders.place({ app: 'minutely', addressId: 'addr_home', payment: { kind: 'upi', upiId: 'riya@nbbank.example' } });
    expect(order.tracking?.origin.label).toMatch(/Minutely/);
    expect((await api.orders.list('minutely'))[0]!.id).toBe(order.id);
    expect(api.orders.eventsUrl(order.id)).toContain(`/orders/${order.id}/events?token=`);
    expect((await api.orders.cancel(order.id)).status).toBe('cancelled');
    expect((await api.orders.get(order.id)).canCancel).toBe(false);

    await api.cart.setItem('minutely', { productId: inStock[0]!.id, quantity: 1 });
    await api.cart.clear('minutely');
    expect((await api.cart.get('minutely')).items).toHaveLength(0);

    const rest = await api.platter.restaurant('r-06');
    await api.cart.setItem('platter', { productId: rest.menu[1]!.items[0]!.id, quantity: 2 });
    const placed = await api.orders.place({ app: 'platter', addressId: 'addr_work', payment: { kind: 'cash' } });
    h.advance(30 * 60_000);
    expect((await api.orders.rate(placed.id, { stars: 5, tags: ['On time'] })).rating?.stars).toBe(5);

    const product = (await api.cartly.products({ category: 'books' })).items[0]!;
    await api.cart.setItem('cartly', { productId: product.id, quantity: 1 });
    const parcel = await api.orders.place({ app: 'cartly', addressId: 'addr_home', payment: { kind: 'card' } });
    h.advance(30 * 60_000);
    const returned = await api.orders.requestReturn(parcel.id, { lineIds: ['l1'], reason: 'Damaged cover' });
    expect(returned.returns).toHaveLength(1);
  });
});
