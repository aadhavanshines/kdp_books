/**
 * Firestore security rules, tested against the emulator as three people:
 * a signed-out visitor, customer Asha and customer Ravi.
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const ASHA = 'asha-uid';
const RAVI = 'ravi-uid';
let env: RulesTestEnvironment;

const anon = (): Firestore => env.unauthenticatedContext().firestore() as unknown as Firestore;
const asha = (): Firestore =>
  env.authenticatedContext(ASHA, { email: 'asha@example.com' }).firestore() as unknown as Firestore;
const ravi = (): Firestore =>
  env.authenticatedContext(RAVI, { email: 'ravi@example.com' }).firestore() as unknown as Firestore;

const address = (overrides: Record<string, unknown> = {}) => ({
  label: 'Home',
  name: 'Asha Rao',
  phone: '9876543210',
  line1: 'Flat 4B, Palm Residency',
  line2: '5th Block',
  landmark: '',
  areaId: 'blr-koramangala',
  pincode: '560095',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

const order = (userId: string) => ({
  userId,
  restaurantId: 'r1',
  status: 'pending_payment',
  paymentStatus: 'pending',
  bill: { grandTotal: 50000, currency: 'INR' },
  createdAt: '2026-10-06T10:00:00.000Z',
});

beforeAll(async () => {
  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':');
  env = await initializeTestEnvironment({
    projectId: 'demo-quickbite-rules',
    firestore: {
      rules: readFileSync('firebase/firestore.rules', 'utf8'),
      host,
      port: Number(port),
    },
  });
});

afterAll(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'regions/IN'), { id: 'IN', currency: 'INR' });
    await setDoc(doc(db, 'areas/blr-koramangala'), { id: 'blr-koramangala', name: 'Koramangala' });
    await setDoc(doc(db, 'restaurants/r1'), {
      id: 'r1',
      name: 'Tandoor Tales',
      areaIds: ['blr-koramangala'],
    });
    await setDoc(doc(db, 'restaurants/r1/categories/c1'), { id: 'c1', name: 'Mains' });
    await setDoc(doc(db, 'restaurants/r1/menuItems/i1'), {
      id: 'i1',
      name: 'Butter Chicken',
      price: 32000,
      searchTokens: ['bu', 'butter'],
    });
    await setDoc(doc(db, 'coupons/WELCOME50'), { code: 'WELCOME50', value: 5000, perUserLimit: 1 });
    await setDoc(doc(db, 'publicCoupons/WELCOME50'), { code: 'WELCOME50', value: 5000 });
    await setDoc(doc(db, 'orders/asha-order'), order(ASHA));
    await setDoc(doc(db, 'orders/ravi-order'), order(RAVI));
    await setDoc(doc(db, 'payments/p1'), { orderId: 'asha-order', amount: 50000 });
    await setDoc(doc(db, 'webhookEvents/fake_evt1'), { provider: 'fake' });
    await setDoc(doc(db, 'couponRedemptions/x'), { userId: ASHA, couponCode: 'WELCOME50' });
    await setDoc(doc(db, `users/${ASHA}`), { name: 'Asha', phone: '', updatedAt: Timestamp.now() });
    await setDoc(doc(db, `users/${ASHA}/addresses/home`), {
      ...address(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });
});

describe('public catalog', () => {
  it('can be read by anyone, including signed-out visitors', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'regions/IN')));
    await assertSucceeds(getDoc(doc(anon(), 'areas/blr-koramangala')));
    await assertSucceeds(
      getDocs(
        query(
          collection(anon(), 'restaurants'),
          where('areaIds', 'array-contains', 'blr-koramangala'),
        ),
      ),
    );
    await assertSucceeds(getDocs(collection(anon(), 'restaurants/r1/categories')));
    await assertSucceeds(getDocs(collection(anon(), 'restaurants/r1/menuItems')));
    await assertSucceeds(
      getDocs(
        query(collectionGroup(anon(), 'menuItems'), where('searchTokens', 'array-contains', 'bu')),
      ),
    );
    await assertSucceeds(getDoc(doc(anon(), 'publicCoupons/WELCOME50')));
  });

  it('cannot be changed by anyone from a browser (no price edits)', async () => {
    await assertFails(updateDoc(doc(asha(), 'restaurants/r1/menuItems/i1'), { price: 1 }));
    await assertFails(setDoc(doc(asha(), 'restaurants/r1/menuItems/new'), { price: 1 }));
    await assertFails(updateDoc(doc(anon(), 'restaurants/r1'), { name: 'Hacked' }));
    await assertFails(deleteDoc(doc(asha(), 'restaurants/r1')));
    await assertFails(setDoc(doc(asha(), 'areas/new'), { name: 'Nowhere' }));
    await assertFails(updateDoc(doc(asha(), 'regions/IN'), { platformFee: 0 }));
    await assertFails(updateDoc(doc(asha(), 'publicCoupons/WELCOME50'), { value: 10000 }));
  });
});

describe('server-only collections', () => {
  it('private coupons, payments, webhook events and redemptions are invisible', async () => {
    for (const db of [anon(), asha()]) {
      await assertFails(getDoc(doc(db, 'coupons/WELCOME50')));
      await assertFails(getDocs(collection(db, 'coupons')));
      await assertFails(getDoc(doc(db, 'payments/p1')));
      await assertFails(getDoc(doc(db, 'webhookEvents/fake_evt1')));
      await assertFails(getDoc(doc(db, 'couponRedemptions/x')));
      await assertFails(getDoc(doc(db, 'idempotencyKeys/anything')));
    }
  });

  it('cannot be written', async () => {
    await assertFails(setDoc(doc(asha(), 'coupons/FREE100'), { value: 10000 }));
    await assertFails(setDoc(doc(asha(), 'payments/p2'), { orderId: 'asha-order', amount: 1 }));
    await assertFails(setDoc(doc(anon(), 'webhookEvents/fake_evt2'), { provider: 'fake' }));
    await assertFails(deleteDoc(doc(asha(), 'couponRedemptions/x')));
  });
});

describe('orders', () => {
  it('a customer reads only their own orders', async () => {
    await assertSucceeds(getDoc(doc(asha(), 'orders/asha-order')));
    await assertFails(getDoc(doc(asha(), 'orders/ravi-order')));
    await assertFails(getDoc(doc(anon(), 'orders/asha-order')));
    await assertSucceeds(getDocs(query(collection(asha(), 'orders'), where('userId', '==', ASHA))));
    await assertFails(getDocs(collection(asha(), 'orders')));
    await assertFails(getDocs(query(collection(asha(), 'orders'), where('userId', '==', RAVI))));
  });

  it('nobody can write an order from the browser console', async () => {
    await assertFails(setDoc(doc(asha(), 'orders/forged'), order(ASHA)));
    await assertFails(
      setDoc(doc(asha(), 'orders/forged-paid'), {
        ...order(ASHA),
        status: 'placed',
        paymentStatus: 'paid',
      }),
    );
    await assertFails(updateDoc(doc(asha(), 'orders/asha-order'), { status: 'placed' }));
    await assertFails(updateDoc(doc(asha(), 'orders/asha-order'), { 'bill.grandTotal': 100 }));
    await assertFails(deleteDoc(doc(asha(), 'orders/asha-order')));
  });
});

describe('profiles', () => {
  it('owner reads and writes their own profile with valid fields', async () => {
    await assertSucceeds(getDoc(doc(asha(), `users/${ASHA}`)));
    await assertSucceeds(
      setDoc(doc(asha(), `users/${ASHA}`), {
        name: 'Asha Rao',
        phone: '9876543210',
        updatedAt: serverTimestamp(),
      }),
    );
    await assertSucceeds(
      setDoc(doc(asha(), `users/${ASHA}`), {
        name: 'Asha',
        phone: '',
        email: 'asha@example.com',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('rejects extra fields, wrong types and someone else’s email', async () => {
    const base = { name: 'Asha', phone: '', updatedAt: serverTimestamp() };
    await assertFails(setDoc(doc(asha(), `users/${ASHA}`), { ...base, isAdmin: true }));
    await assertFails(setDoc(doc(asha(), `users/${ASHA}`), { ...base, name: 42 }));
    await assertFails(setDoc(doc(asha(), `users/${ASHA}`), { ...base, name: 'x'.repeat(61) }));
    await assertFails(setDoc(doc(asha(), `users/${ASHA}`), { ...base, email: 'ravi@example.com' }));
    await assertFails(
      setDoc(doc(asha(), `users/${ASHA}`), { ...base, updatedAt: Timestamp.fromMillis(0) }),
    );
  });

  it('other people cannot read or write it', async () => {
    await assertFails(getDoc(doc(ravi(), `users/${ASHA}`)));
    await assertFails(getDoc(doc(anon(), `users/${ASHA}`)));
    await assertFails(
      setDoc(doc(ravi(), `users/${ASHA}`), {
        name: 'Ravi',
        phone: '',
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(deleteDoc(doc(asha(), `users/${ASHA}`)));
  });
});

describe('addresses', () => {
  const addressesOf = (db: Firestore, uid: string) => collection(db, `users/${uid}/addresses`);

  it('owner lists, creates, updates and deletes their addresses', async () => {
    await assertSucceeds(getDocs(addressesOf(asha(), ASHA)));
    await assertSucceeds(
      setDoc(doc(asha(), `users/${ASHA}/addresses/work`), address({ label: 'Work' })),
    );
    const home = await getDoc(doc(asha(), `users/${ASHA}/addresses/home`));
    await assertSucceeds(
      setDoc(doc(asha(), `users/${ASHA}/addresses/home`), {
        ...address({ line1: 'Flat 5C' }),
        createdAt: home.data()!.createdAt,
      }),
    );
    await assertSucceeds(deleteDoc(doc(asha(), `users/${ASHA}/addresses/home`)));
  });

  it('rejects invalid addresses', async () => {
    const at = (id: string) => doc(asha(), `users/${ASHA}/addresses/${id}`);
    await assertFails(setDoc(at('a'), address({ lat: 12.9, lng: 77.6 })));
    await assertFails(setDoc(at('b'), address({ areaId: 'no-such-area' })));
    await assertFails(setDoc(at('c'), address({ pincode: '012345' })));
    await assertFails(setDoc(at('d'), address({ label: 'Secret lair' })));
    await assertFails(setDoc(at('e'), address({ phone: '12' })));
    const { landmark: _landmark, ...missing } = address();
    await assertFails(setDoc(at('f'), missing));
    await assertFails(
      updateDoc(doc(asha(), `users/${ASHA}/addresses/home`), {
        createdAt: Timestamp.fromMillis(0),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('other people cannot see or touch them', async () => {
    await assertFails(getDocs(addressesOf(ravi(), ASHA)));
    await assertFails(getDoc(doc(ravi(), `users/${ASHA}/addresses/home`)));
    await assertFails(getDocs(addressesOf(anon(), ASHA)));
    await assertFails(setDoc(doc(ravi(), `users/${ASHA}/addresses/x`), address()));
    await assertFails(deleteDoc(doc(ravi(), `users/${ASHA}/addresses/home`)));
  });
});
