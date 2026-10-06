/**
 * Every Backend method must behave the same on every backend. Expected values
 * come from the seed catalog, which is what every backend is loaded with.
 */
import { buildCatalog } from '@quickbite/seed';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Backend, NewAddress, Order } from '../../apps/web/src/backend/types';
import { selectedBackends, signIn, uniqueEmail } from './backends';

const seed = buildCatalog();
const AREA = 'blr-koramangala';
const SLUG = 'tandoor-tales-koramangala';
const restaurantSeed = seed.restaurants.find((r) => r.slug === SLUG)!;
const butterChicken = seed.items.find(
  (i) => i.restaurantId === restaurantSeed.id && i.name === 'Butter Chicken',
)!;

const homeAddress: NewAddress = {
  label: 'Home',
  name: 'Asha Rao',
  phone: '9876543210',
  line1: 'Flat 4B, Palm Residency',
  line2: '5th Block, 80 Feet Road',
  landmark: 'Near the park',
  areaId: AREA,
  pincode: '560095',
};

const ids = (list: { id: string }[]) => list.map((x) => x.id).sort();

let keyCounter = 0;
const newKey = () => `contract-${Date.now().toString(36)}-${++keyCounter}`;

/** Resolves with the first order update that satisfies `done`. */
function waitForOrder(
  backend: Backend,
  orderId: string,
  done: (order: Order | null) => boolean,
  timeoutMs = 15_000,
): Promise<Order | null> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      stop();
      reject(new Error(`Timed out waiting for order ${orderId}`));
    }, timeoutMs);
    const stop = backend.orders.watch(
      orderId,
      (order) => {
        if (!done(order)) return;
        clearTimeout(timer);
        queueMicrotask(stop);
        resolve(order);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

describe.each(selectedBackends())('$name backend', (factory) => {
  const clients: Backend[] = [];
  const client = () => {
    const b = factory.create();
    clients.push(b);
    return b;
  };

  afterAll(async () => {
    for (const c of clients) await c.auth.signOut().catch(() => undefined);
  });

  describe('catalog (public, no sign-in)', () => {
    let backend: Backend;
    beforeAll(() => {
      backend = client();
    });

    it('lists regions and areas', async () => {
      expect(await backend.catalog.listRegions()).toEqual(seed.regions);
      expect(ids(await backend.catalog.listAreas())).toEqual(ids(seed.areas));
    });

    it('lists the restaurants delivering to an area', async () => {
      const list = await backend.catalog.listRestaurants(AREA);
      expect(ids(list)).toEqual(ids(seed.restaurants.filter((r) => r.areaIds.includes(AREA))));
      expect(list.find((r) => r.id === restaurantSeed.id)).toEqual(restaurantSeed);
    });

    it('finds a restaurant by slug and returns null for unknown slugs', async () => {
      expect(await backend.catalog.getRestaurantBySlug(SLUG)).toEqual(restaurantSeed);
      expect(await backend.catalog.getRestaurantBySlug('no-such-place')).toBeNull();
    });

    it('returns the menu in its original order', async () => {
      const menu = await backend.catalog.getMenu(restaurantSeed.id);
      expect(menu.categories).toEqual(
        seed.categories.filter((c) => c.restaurantId === restaurantSeed.id),
      );
      expect(menu.items).toEqual(seed.items.filter((i) => i.restaurantId === restaurantSeed.id));
    });

    it('searches dishes and restaurants within the area only', async () => {
      const results = await backend.catalog.search(AREA, 'butter chicken');
      expect(results.dishes.length).toBeGreaterThan(0);
      expect(results.dishes[0]!.item.name).toBe('Butter Chicken');
      expect(results.dishes.every((d) => d.restaurant.areaIds.includes(AREA))).toBe(true);
      const byName = await backend.catalog.search(AREA, 'tandoor');
      expect(byName.restaurants.map((h) => h.restaurant.id)).toContain(restaurantSeed.id);
    });

    it('lists coupons for a brand, including platform-wide ones', async () => {
      const coupons = await backend.catalog.listCoupons(restaurantSeed.brandId);
      const codes = coupons.map((c) => c.code).sort();
      expect(codes).toEqual(
        seed.coupons
          .filter((c) => c.active && (c.brandId === null || c.brandId === restaurantSeed.brandId))
          .map((c) => c.code)
          .sort(),
      );
    });
  });

  describe('auth, profile and addresses', () => {
    it('refuses private data while signed out', async () => {
      const backend = client();
      await new Promise<void>((resolve) => {
        const stop = backend.auth.onChange(() => {
          stop();
          resolve();
        });
      });
      expect(backend.auth.currentUser()).toBeNull();
      await expect(backend.profile.get()).rejects.toThrow(/sign in/i);
      await expect(backend.addresses.list()).rejects.toThrow(/sign in/i);
    });

    it('signs in with an email link and signs out', async () => {
      const backend = client();
      const email = uniqueEmail('asha');
      const seen: (string | null)[] = [];
      const stop = backend.auth.onChange((u) => seen.push(u?.email ?? null));
      const user = await signIn(backend, email);
      expect(user.email).toBe(email);
      expect(backend.auth.currentUser()?.uid).toBe(user.uid);
      await backend.auth.signOut();
      expect(backend.auth.currentUser()).toBeNull();
      stop();
      expect(seen).toContain(email);
      expect(seen.at(-1)).toBeNull();
    });

    it('rejects a link sent to a different email', async () => {
      const backend = client();
      const { devLink } = await backend.auth.sendSignInLink(
        uniqueEmail('owner'),
        'http://localhost:5173/login/finish',
      );
      await expect(
        backend.auth.completeSignIn(uniqueEmail('intruder'), devLink!),
      ).rejects.toThrow();
    });

    it('saves and reads the profile', async () => {
      const backend = client();
      await signIn(backend, uniqueEmail('profile'));
      expect(await backend.profile.get()).toBeNull();
      expect(await backend.profile.save({ name: ' Asha Rao ', phone: '9876543210' })).toEqual({
        name: 'Asha Rao',
        phone: '9876543210',
      });
      expect(await backend.profile.get()).toEqual({ name: 'Asha Rao', phone: '9876543210' });
    });

    it('keeps addresses private to each customer', async () => {
      const asha = client();
      const ravi = client();
      await signIn(asha, uniqueEmail('asha'));
      await signIn(ravi, uniqueEmail('ravi'));

      const saved = await asha.addresses.save(homeAddress);
      expect(saved).toMatchObject(homeAddress);
      const area = seed.areas.find((a) => a.id === AREA)!;
      expect(saved.lat).toBeCloseTo(area.lat + 0.002, 6);
      expect(saved.lng).toBeCloseTo(area.lng + 0.002, 6);

      const updated = await asha.addresses.save({ ...homeAddress, id: saved.id, line1: 'Flat 5C' });
      expect(updated.id).toBe(saved.id);
      expect((await asha.addresses.list()).map((a) => a.line1)).toEqual(['Flat 5C']);
      expect(await ravi.addresses.list()).toEqual([]);

      await asha.addresses.remove(saved.id);
      expect(await asha.addresses.list()).toEqual([]);
    });

    it('rejects an address in an unknown area', async () => {
      const backend = client();
      await signIn(backend, uniqueEmail('area'));
      await expect(
        backend.addresses.save({ ...homeAddress, areaId: 'atlantis' }),
      ).rejects.toThrow();
    });
  });

  describe('quotes', () => {
    let backend: Backend;
    let addressId: string;
    beforeAll(async () => {
      backend = client();
      await signIn(backend, uniqueEmail('quote'));
      addressId = (await backend.addresses.save(homeAddress)).id;
    });

    it('prices from the backend’s own data and ignores prices in the request', async () => {
      const quote = await backend.orders.quote({
        restaurantId: restaurantSeed.id,
        items: [{ itemId: butterChicken.id, qty: 2, price: 1 } as never],
        addressId,
      });
      if (!quote.ok) throw new Error(quote.error);
      expect(quote.lines).toEqual([
        {
          itemId: butterChicken.id,
          name: 'Butter Chicken',
          isVeg: false,
          unitPrice: butterChicken.price,
          qty: 2,
          lineTotal: butterChicken.price * 2,
        },
      ]);
      expect(quote.bill.itemTotal).toBe(butterChicken.price * 2);
    });

    it('treats a missing coupon sent as undefined or null as no coupon', async () => {
      const base = {
        restaurantId: restaurantSeed.id,
        items: [{ itemId: butterChicken.id, qty: 1 }],
        addressId,
      };
      for (const couponCode of [undefined, null]) {
        const quote = await backend.orders.quote({ ...base, couponCode } as never);
        expect(quote.ok && quote.bill.appliedCouponCode).toBeNull();
      }
    });

    it('applies coupons and reports unknown ones and unreachable addresses', async () => {
      const base = {
        restaurantId: restaurantSeed.id,
        items: [{ itemId: butterChicken.id, qty: 2 }],
        addressId,
      };
      const welcome = await backend.orders.quote({ ...base, couponCode: 'welcome50' });
      expect(welcome.ok && welcome.bill.appliedCouponCode).toBe('WELCOME50');
      const unknown = await backend.orders.quote({ ...base, couponCode: 'NOPE123' });
      expect(unknown.ok && unknown.couponNotFound).toBe(true);
      const far = await backend.addresses.save({
        ...homeAddress,
        areaId: 'mum-bandra-west',
        pincode: '400050',
      });
      expect(await backend.orders.quote({ ...base, addressId: far.id })).toEqual({
        ok: false,
        error: 'NOT_DELIVERABLE',
      });
      expect(await backend.orders.quote({ ...base, addressId: 'missing' })).toEqual({
        ok: false,
        error: 'ADDRESS_NOT_FOUND',
      });
    });
  });

  describe('orders and fake payments', () => {
    let asha: Backend;
    let ravi: Backend;
    let addressId: string;
    const cart = () => ({
      restaurantId: restaurantSeed.id,
      items: [{ itemId: butterChicken.id, qty: 2 }],
      addressId,
      idempotencyKey: newKey(),
    });

    beforeAll(async () => {
      asha = client();
      ravi = client();
      await signIn(asha, uniqueEmail('orders'));
      await signIn(ravi, uniqueEmail('other'));
      addressId = (await asha.addresses.save(homeAddress)).id;
    });

    it('refuses to place orders while signed out', async () => {
      const visitor = client();
      await expect(visitor.orders.place(cart())).rejects.toThrow(/sign in/i);
    });

    it('places a server-priced order waiting for payment', async () => {
      const request = cart();
      const quote = await asha.orders.quote(request);
      const result = await asha.orders.place({ ...request, couponCode: 'WELCOME50' });
      if (!quote.ok || !result.ok) throw new Error('expected success');
      const order = (await asha.orders.get(result.orderId))!;
      expect(order).toMatchObject({
        id: result.orderId,
        userId: asha.auth.currentUser()!.uid,
        status: 'pending_payment',
        paymentStatus: 'pending',
        paymentProvider: 'fake',
        couponCode: 'WELCOME50',
        restaurant: { slug: SLUG },
        address: { line1: homeAddress.line1, areaName: 'Koramangala' },
      });
      expect(order.items).toEqual(quote.lines);
      expect(order.bill.itemTotal).toBe(butterChicken.price * 2);
      expect(order.bill.discount).toBeGreaterThan(0);
      expect(result.payment).toMatchObject({
        provider: 'fake',
        amount: order.bill.grandTotal,
        currency: 'INR',
      });
    });

    it('returns the same order for a repeated idempotency key', async () => {
      const request = cart();
      const first = await asha.orders.place(request);
      const second = await asha.orders.place(request);
      expect(first.ok && second.ok && first.orderId === second.orderId).toBe(true);
    });

    it('reports cart problems instead of creating an order', async () => {
      expect(await asha.orders.place({ ...cart(), couponCode: 'PARTY20' })).toEqual({
        ok: false,
        error: 'COUPON_NOT_APPLICABLE',
      });
      expect(await asha.orders.place({ ...cart(), addressId: 'nope' })).toEqual({
        ok: false,
        error: 'ADDRESS_NOT_FOUND',
      });
    });

    it('becomes placed only through the payment webhook, seen live by the watcher', async () => {
      const result = await asha.orders.place(cart());
      if (!result.ok) throw new Error(result.error);
      const updates: string[] = [];
      const placed = waitForOrder(asha, result.orderId, (o) => {
        if (o) updates.push(o.status);
        return o?.status === 'placed';
      });
      await asha.orders.payFake(result.orderId, 'success');
      const order = (await placed)!;
      expect(order.paymentStatus).toBe('paid');
      expect(order.statusHistory.map((s) => s.status)).toEqual(['pending_payment', 'placed']);
      expect(updates[0]).toBe('pending_payment');
      // Paying again is refused: the order is no longer waiting for payment.
      await expect(asha.orders.payFake(result.orderId, 'success')).rejects.toThrow();
    });

    it('lets the customer retry after a declined payment', async () => {
      const result = await asha.orders.place(cart());
      if (!result.ok) throw new Error(result.error);
      await asha.orders.payFake(result.orderId, 'failure');
      expect((await asha.orders.get(result.orderId))!.status).toBe('payment_failed');
      await asha.orders.payFake(result.orderId, 'success');
      expect((await asha.orders.get(result.orderId))!.status).toBe('placed');
    });

    it('gives the payment details again for an unpaid order, and only for it', async () => {
      const result = await asha.orders.place(cart());
      if (!result.ok) throw new Error(result.error);
      expect(await asha.orders.startPayment(result.orderId)).toEqual(result.payment);
      await expect(ravi.orders.startPayment(result.orderId)).rejects.toThrow();
      await asha.orders.payFake(result.orderId, 'success');
      await expect(asha.orders.startPayment(result.orderId)).rejects.toThrow();
    });

    it('refuses Razorpay confirmations for orders not paid with Razorpay', async () => {
      const result = await asha.orders.place(cart());
      if (!result.ok) throw new Error(result.error);
      await expect(
        asha.orders.confirmRazorpay(result.orderId, {
          razorpay_order_id: 'order_Abc123',
          razorpay_payment_id: 'pay_Abc123',
          razorpay_signature: 'a'.repeat(64),
        }),
      ).rejects.toThrow();
      expect((await asha.orders.get(result.orderId))!.status).toBe('pending_payment');
    });

    it('keeps orders private', async () => {
      const result = await asha.orders.place(cart());
      if (!result.ok) throw new Error(result.error);
      expect(await ravi.orders.get(result.orderId)).toBeNull();
      expect((await ravi.orders.list()).map((o) => o.id)).not.toContain(result.orderId);
      await expect(ravi.orders.payFake(result.orderId, 'success')).rejects.toThrow();
      expect(await waitForOrder(ravi, result.orderId, () => true)).toBeNull();
      expect((await asha.orders.get(result.orderId))!.status).toBe('pending_payment');
    });

    it('lists the customer’s orders, newest first', async () => {
      const list = await asha.orders.list();
      expect(list.length).toBeGreaterThanOrEqual(4);
      const times = list.map((o) => o.createdAt);
      expect([...times].sort().reverse()).toEqual(times);
      expect(list.every((o) => o.userId === asha.auth.currentUser()!.uid)).toBe(true);
    });
  });
});
