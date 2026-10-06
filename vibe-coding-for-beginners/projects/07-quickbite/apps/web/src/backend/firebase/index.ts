/**
 * Firebase backend: Auth (email link), Firestore reads and realtime, and
 * Cloud Functions for anything that involves money.
 *
 * The browser only reads the public catalog and its own data, and writes only
 * its own profile and addresses (see firebase/firestore.rules).
 */
import {
  addressPoint,
  primarySearchToken,
  searchCatalog,
  type Area,
  type Coupon,
  type MenuCategory,
  type MenuItem,
  type Order,
  type PaymentStart,
  type PlaceOrderRequest,
  type PlaceOrderResult,
  type Quote,
  type QuoteRequest,
  type RazorpayCheckoutResponse,
  type Region,
  type Restaurant,
} from '@quickbite/core';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  type Auth,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  collectionGroup,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Firestore,
  type FirestoreError,
} from 'firebase/firestore';
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
  type FunctionsError,
} from 'firebase/functions';
import { SignInRequiredError } from '../errors';
import type { Address, Backend, Profile, User } from '../types';
import { DEFAULT_EMULATOR_PORTS, type FirebaseBackendOptions } from './config';

export type { FirebaseBackendOptions } from './config';

export interface FirebaseBackend extends Backend {
  app: FirebaseApp;
  auth: Backend['auth'] & { readonly instance: Auth };
  firestore: Firestore;
}

export function createFirebaseBackend(options: FirebaseBackendOptions): FirebaseBackend {
  const app = initializeApp(options.firebase, options.appName);
  // Email-link sign-in only. getAuth() would also set up popup and redirect sign-in, which loads
  // Google's apis.google.com script and an iframe: more than we use, and more for the CSP to allow.
  const auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
  });
  // Long polling works everywhere (proxies, emulators); the app reads little data.
  const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  const ports = { ...DEFAULT_EMULATOR_PORTS, ...options.ports };
  const emulatorHost = options.emulatorHost;
  if (emulatorHost) {
    connectAuthEmulator(auth, `http://${emulatorHost}:${ports.auth}`, { disableWarnings: true });
    connectFirestoreEmulator(db, emulatorHost, ports.firestore);
  }
  // A URL instead of a region makes the SDK call `<url>/<function name>`.
  const functions = getFunctions(
    app,
    options.functionsViaHosting ? `${window.location.origin}/api` : options.functionsRegion,
  );
  if (emulatorHost && !options.functionsViaHosting) {
    connectFunctionsEmulator(functions, emulatorHost, ports.functions);
  }

  // ---- Session -------------------------------------------------------------
  const toUser = (u: { uid: string; email: string | null } | null): User | null =>
    u ? { uid: u.uid, email: u.email } : null;
  const requireUid = (): string => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new SignInRequiredError();
    return uid;
  };
  const withUid = async <T>(fn: (uid: string) => Promise<T>): Promise<T> => {
    await auth.authStateReady();
    return fn(requireUid());
  };

  /** On the Auth emulator no email is sent; it keeps the link, which we hand back for dev and tests. */
  async function emulatorSignInLink(
    email: string,
    continueUrl: string,
  ): Promise<string | undefined> {
    if (!emulatorHost) return undefined;
    const res = await fetch(
      `http://${emulatorHost}:${ports.auth}/emulator/v1/projects/${options.firebase.projectId}/oobCodes`,
    );
    if (!res.ok) return undefined;
    const { oobCodes = [] } = (await res.json()) as {
      oobCodes?: { email: string; oobCode: string; requestType: string }[];
    };
    const latest = oobCodes
      .filter((c) => c.requestType === 'EMAIL_SIGNIN' && c.email === email)
      .at(-1);
    if (!latest) return undefined;
    const url = new URL(continueUrl);
    url.searchParams.set('mode', 'signIn');
    url.searchParams.set('oobCode', latest.oobCode);
    url.searchParams.set('apiKey', options.firebase.apiKey ?? '');
    return url.toString();
  }

  // ---- Catalog helpers -----------------------------------------------------
  const data = <T>(snap: { data(): DocumentData | undefined }): T => snap.data() as T;
  const menuItem = (raw: DocumentData): MenuItem => {
    const { searchTokens: _tokens, position: _position, ...item } = raw;
    return item as MenuItem;
  };

  let areasPromise: Promise<Area[]> | null = null;
  const listAreas = () => {
    areasPromise ??= getDocs(collection(db, 'areas')).then((s) => s.docs.map((d) => data<Area>(d)));
    areasPromise.catch(() => (areasPromise = null));
    return areasPromise;
  };
  const listRestaurants = async (areaId: string) => {
    const snap = await getDocs(
      query(collection(db, 'restaurants'), where('areaIds', 'array-contains', areaId)),
    );
    return snap.docs.map((d) => data<Restaurant>(d));
  };
  const addressesOf = (uid: string) => collection(db, 'users', uid, 'addresses');

  /** Calls a Cloud Function as the signed-in customer. */
  const call =
    <Req, Res>(name: string) =>
    (request: Req): Promise<Res> =>
      withUid(async () => {
        try {
          return (await httpsCallable<Req, Res>(functions, name)(request)).data;
        } catch (error) {
          if ((error as FunctionsError).code === 'functions/unauthenticated') {
            throw new SignInRequiredError();
          }
          throw error;
        }
      });
  const quoteOrder = call<QuoteRequest, Quote>('quoteOrder');
  const createOrder = call<PlaceOrderRequest, PlaceOrderResult>('createOrder');
  const fakePay = call<{ orderId: string; outcome: 'success' | 'failure' }, unknown>('fakePay');
  const startPayment = call<{ orderId: string }, PaymentStart>('startPayment');
  const verifyRazorpayPayment = call<
    { orderId: string } & RazorpayCheckoutResponse,
    { outcome: string }
  >('verifyRazorpayPayment');
  /** Rules hide other people's orders and missing ones alike: both read as "no order". */
  const isDenied = (error: unknown) => (error as FirestoreError).code === 'permission-denied';
  const toAddress = (id: string, raw: DocumentData, areas: Area[]): Address => {
    const area = areas.find((a) => a.id === raw.areaId);
    const point = area ? addressPoint(area) : { lat: 0, lng: 0 };
    return {
      id,
      label: raw.label,
      name: raw.name,
      phone: raw.phone,
      line1: raw.line1,
      line2: raw.line2,
      landmark: raw.landmark,
      areaId: raw.areaId,
      pincode: raw.pincode,
      ...point,
    };
  };

  return {
    name: 'firebase',
    app,
    firestore: db,

    auth: {
      instance: auth,
      currentUser: () => toUser(auth.currentUser),
      onChange: (listener) => onAuthStateChanged(auth, (u) => listener(toUser(u))),
      sendSignInLink: async (email, continueUrl) => {
        await sendSignInLinkToEmail(auth, email, { url: continueUrl, handleCodeInApp: true });
        return { devLink: await emulatorSignInLink(email, continueUrl) };
      },
      isSignInLink: (link) => isSignInWithEmailLink(auth, link),
      completeSignIn: async (email, link) => {
        const { user } = await signInWithEmailLink(auth, email, link);
        return toUser(user)!;
      },
      signOut: () => signOut(auth),
    },

    profile: {
      get: () =>
        withUid(async (uid) => {
          const snap = await getDoc(doc(db, 'users', uid));
          if (!snap.exists()) return null;
          const raw = snap.data();
          return { name: raw.name ?? '', phone: raw.phone ?? '' } satisfies Profile;
        }),
      save: (profile) =>
        withUid(async (uid) => {
          const saved: Profile = { name: profile.name.trim(), phone: profile.phone.trim() };
          await setDoc(doc(db, 'users', uid), { ...saved, updatedAt: serverTimestamp() });
          return saved;
        }),
    },

    catalog: {
      listRegions: async () =>
        (await getDocs(collection(db, 'regions'))).docs.map((d) => data<Region>(d)),
      listAreas,
      listRestaurants,
      getRestaurantBySlug: async (slug) => {
        const snap = await getDocs(
          query(collection(db, 'restaurants'), where('slug', '==', slug), limit(1)),
        );
        return snap.empty ? null : data<Restaurant>(snap.docs[0]!);
      },
      getMenu: async (restaurantId) => {
        const [categories, items] = await Promise.all([
          getDocs(
            query(collection(db, 'restaurants', restaurantId, 'categories'), orderBy('sortOrder')),
          ),
          getDocs(
            query(collection(db, 'restaurants', restaurantId, 'menuItems'), orderBy('position')),
          ),
        ]);
        return {
          categories: categories.docs.map((d) => data<MenuCategory>(d)),
          items: items.docs.map((d) => menuItem(d.data())),
        };
      },
      search: async (areaId, text) => {
        const token = primarySearchToken(text);
        const [restaurants, itemSnap] = await Promise.all([
          listRestaurants(areaId),
          token
            ? getDocs(
                query(
                  collectionGroup(db, 'menuItems'),
                  where('searchTokens', 'array-contains', token),
                ),
              )
            : null,
        ]);
        const inArea = new Set(restaurants.map((r) => r.id));
        const items = (itemSnap?.docs ?? [])
          .map((d) => menuItem(d.data()))
          .filter((i) => inArea.has(i.restaurantId));
        return searchCatalog(text, restaurants, items);
      },
      listCoupons: async (brandId) => {
        const now = new Date();
        const snap = await getDocs(collection(db, 'publicCoupons'));
        return snap.docs
          .map((d) => data<Coupon>(d))
          .filter(
            (c) =>
              c.active &&
              (c.brandId === null || c.brandId === brandId) &&
              new Date(c.validTo) > now,
          );
      },
    },

    addresses: {
      list: () =>
        withUid(async (uid) => {
          const [snap, areas] = await Promise.all([
            getDocs(query(addressesOf(uid), orderBy('createdAt', 'desc'))),
            listAreas(),
          ]);
          return snap.docs.map((d) => toAddress(d.id, d.data(), areas));
        }),
      save: (input) =>
        withUid(async (uid) => {
          const areas = await listAreas();
          if (!areas.some((a) => a.id === input.areaId)) throw new Error('Unknown area');
          // Only these fields are stored; the rules reject anything else.
          const fields = {
            label: input.label,
            name: input.name,
            phone: input.phone,
            line1: input.line1,
            line2: input.line2,
            landmark: input.landmark,
            areaId: input.areaId,
            pincode: input.pincode,
            updatedAt: serverTimestamp(),
          };
          let id = input.id;
          if (id) await updateDoc(doc(addressesOf(uid), id), fields);
          else
            id = (await addDoc(addressesOf(uid), { ...fields, createdAt: serverTimestamp() })).id;
          return toAddress(id, fields, areas);
        }),
      remove: (id) => withUid((uid) => deleteDoc(doc(addressesOf(uid), id))),
    },

    orders: {
      quote: (request) => quoteOrder(request),
      place: (request) => createOrder(request),
      payFake: async (orderId, outcome) => {
        await fakePay({ orderId, outcome });
      },
      startPayment: (orderId) => startPayment({ orderId }),
      confirmRazorpay: (orderId, response) => verifyRazorpayPayment({ orderId, ...response }),
      get: (orderId) =>
        withUid(async () => {
          try {
            const snap = await getDoc(doc(db, 'orders', orderId));
            return snap.exists() ? data<Order>(snap) : null;
          } catch (error) {
            if (isDenied(error)) return null;
            throw error;
          }
        }),
      watch: (orderId, onChange, onError) => {
        let stop = () => {};
        let stopped = false;
        void auth.authStateReady().then(() => {
          if (stopped) return;
          if (!auth.currentUser) {
            onError?.(new SignInRequiredError());
            return;
          }
          stop = onSnapshot(
            doc(db, 'orders', orderId),
            (snap) => onChange(snap.exists() ? data<Order>(snap) : null),
            (error) => (isDenied(error) ? onChange(null) : onError?.(error)),
          );
        });
        return () => {
          stopped = true;
          stop();
        };
      },
      list: () =>
        withUid(async (uid) => {
          const snap = await getDocs(
            query(
              collection(db, 'orders'),
              where('userId', '==', uid),
              orderBy('createdAt', 'desc'),
              limit(50),
            ),
          );
          return snap.docs.map((d) => data<Order>(d));
        }),
    },
  };
}
