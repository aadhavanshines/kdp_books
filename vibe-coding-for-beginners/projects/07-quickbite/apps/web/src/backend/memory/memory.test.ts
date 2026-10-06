import { describe, expect, it } from 'vitest';
import { createMemoryBackend } from '.';

describe('memory backend', () => {
  const backend = createMemoryBackend({ latencyMs: 0 });

  it('lists restaurants for an area', async () => {
    const restaurants = await backend.catalog.listRestaurants('blr-koramangala');
    expect(restaurants.length).toBeGreaterThan(10);
    expect(restaurants.every((r) => r.areaIds.includes('blr-koramangala'))).toBe(true);
  });

  it('returns a restaurant and its menu', async () => {
    const [first] = await backend.catalog.listRestaurants('blr-koramangala');
    const restaurant = await backend.catalog.getRestaurantBySlug(first!.slug);
    expect(restaurant?.id).toBe(first!.id);
    const menu = await backend.catalog.getMenu(first!.id);
    expect(menu.categories.length).toBeGreaterThan(0);
    expect(menu.items.every((i) => i.restaurantId === first!.id)).toBe(true);
  });

  it('searches dishes only within the area', async () => {
    const results = await backend.catalog.search('blr-indiranagar', 'biryani');
    expect(results.dishes.length).toBeGreaterThan(0);
    expect(results.dishes.every((d) => d.restaurant.areaIds.includes('blr-indiranagar'))).toBe(
      true,
    );
  });

  it('returns copies so callers cannot mutate the catalog', async () => {
    const [r] = await backend.catalog.listRestaurants('blr-koramangala');
    r!.name = 'Hacked';
    const [again] = await backend.catalog.listRestaurants('blr-koramangala');
    expect(again!.name).not.toBe('Hacked');
  });
});

describe('memory backend: auth and private data', () => {
  it('signs in with an email link and keeps data per account', async () => {
    const backend = createMemoryBackend({ latencyMs: 0, storage: null });
    await expect(backend.addresses.list()).rejects.toThrow(/sign in/i);
    await expect(backend.profile.get()).rejects.toThrow(/sign in/i);

    const { devLink } = await backend.auth.sendSignInLink(
      'Asha@Example.com',
      'http://localhost/login/finish?next=%2Fcheckout',
    );
    expect(devLink && backend.auth.isSignInLink(devLink)).toBe(true);
    await expect(backend.auth.completeSignIn('someone@else.com', devLink!)).rejects.toThrow();
    const user = await backend.auth.completeSignIn('asha@example.com', devLink!);
    expect(backend.auth.currentUser()).toEqual(user);

    await backend.profile.save({ name: 'Asha Rao', phone: '9876543210' });
    expect(await backend.profile.get()).toEqual({ name: 'Asha Rao', phone: '9876543210' });

    await backend.auth.signOut();
    expect(backend.auth.currentUser()).toBeNull();
    const other = await backend.auth.sendSignInLink('ravi@example.com', 'http://localhost/x');
    await backend.auth.completeSignIn('ravi@example.com', other.devLink!);
    expect(await backend.profile.get()).toBeNull();
  });

  it('tells listeners about the session', async () => {
    const backend = createMemoryBackend({ latencyMs: 0, storage: null, user: null });
    const seen: (string | null)[] = [];
    const stop = backend.auth.onChange((u) => seen.push(u?.email ?? null));
    await Promise.resolve();
    const { devLink } = await backend.auth.sendSignInLink('a@b.co', 'http://localhost/x');
    await backend.auth.completeSignIn('a@b.co', devLink!);
    stop();
    await backend.auth.signOut();
    expect(seen).toEqual([null, 'a@b.co']);
  });
});

describe('memory backend: quotes behave like the server will', () => {
  const storage = new Map<string, string>();
  const backend = createMemoryBackend({
    latencyMs: 0,
    storage: {
      getItem: (k) => storage.get(k) ?? null,
      setItem: (k, v) => void storage.set(k, v),
      removeItem: (k) => void storage.delete(k),
    },
    user: { uid: 'u1', email: 'asha@example.com' },
  });

  async function setup() {
    const restaurant = (await backend.catalog.listRestaurants('blr-koramangala')).find(
      (r) => r.slug === 'tandoor-tales-koramangala',
    )!;
    const menu = await backend.catalog.getMenu(restaurant.id);
    const butterChicken = menu.items.find((i) => i.name === 'Butter Chicken')!;
    const address = await backend.addresses.save({
      label: 'Home',
      name: 'Asha',
      phone: '9876543210',
      line1: 'Flat 1',
      line2: '5th Block',
      landmark: '',
      areaId: 'blr-koramangala',
      pincode: '560095',
    });
    return { restaurant, butterChicken, address };
  }

  it('prices from its own data and ignores anything else in the request', async () => {
    const { restaurant, butterChicken, address } = await setup();
    const request = {
      restaurantId: restaurant.id,
      items: [{ itemId: butterChicken.id, qty: 2, price: 1 }],
      addressId: address.id,
    };
    const quote = await backend.orders.quote(request);
    if (!quote.ok) throw new Error(quote.error);
    expect(quote.lines[0]!.unitPrice).toBe(butterChicken.price);
    expect(quote.bill.itemTotal).toBe(butterChicken.price * 2);
    expect(quote.bill.grandTotal).toBeGreaterThan(quote.bill.itemTotal);
  });

  it('applies valid coupons and explains invalid ones', async () => {
    const { restaurant, butterChicken, address } = await setup();
    const base = {
      restaurantId: restaurant.id,
      items: [{ itemId: butterChicken.id, qty: 1 }],
      addressId: address.id,
    };
    const ok = await backend.orders.quote({ ...base, couponCode: 'welcome50' });
    expect(ok.ok && ok.bill.discount).toBe(10000);
    const tooSmall = await backend.orders.quote({ ...base, couponCode: 'PARTY20' });
    expect(tooSmall.ok && tooSmall.bill.couponRejection?.reason).toBe('MIN_ORDER');
    const unknown = await backend.orders.quote({ ...base, couponCode: 'FREEFOOD' });
    expect(unknown.ok && unknown.couponNotFound).toBe(true);
  });

  it('refuses addresses the restaurant cannot reach', async () => {
    const { restaurant, butterChicken } = await setup();
    const far = await backend.addresses.save({
      label: 'Work',
      name: 'Asha',
      phone: '9876543210',
      line1: 'Office',
      line2: 'BKC',
      landmark: '',
      areaId: 'mum-bandra-west',
      pincode: '400050',
    });
    const quote = await backend.orders.quote({
      restaurantId: restaurant.id,
      items: [{ itemId: butterChicken.id, qty: 1 }],
      addressId: far.id,
    });
    expect(quote).toEqual({ ok: false, error: 'NOT_DELIVERABLE' });
  });

  it('drops items that belong to another restaurant', async () => {
    const { restaurant, butterChicken, address } = await setup();
    const quote = await backend.orders.quote({
      restaurantId: restaurant.id,
      items: [
        { itemId: butterChicken.id, qty: 1 },
        { itemId: 'saffron-handi--blr-koramangala:butter-chicken', qty: 3 },
      ],
      addressId: address.id,
    });
    expect(quote.ok && quote.unavailableItemIds).toEqual([
      'saffron-handi--blr-koramangala:butter-chicken',
    ]);
  });
});
