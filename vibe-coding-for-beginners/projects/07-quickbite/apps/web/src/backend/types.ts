/**
 * The one interface the UI talks to. Every backend (in-memory, Firebase,
 * Supabase) implements it, so pages never know which one is running.
 */
import type {
  Area,
  Coupon,
  Menu,
  Order,
  PlaceOrderRequest,
  PlaceOrderResult,
  Quote,
  PaymentStart,
  QuoteRequest,
  RazorpayCheckoutResponse,
  Region,
  Restaurant,
  SearchResults,
} from '@quickbite/core';

export type {
  Order,
  PaymentStart,
  PlaceOrderError,
  PlaceOrderRequest,
  PlaceOrderResult,
  Quote,
  QuoteError,
  QuoteLine,
  QuoteRequest,
  RazorpayCheckoutResponse,
} from '@quickbite/core';

export type BackendName = 'memory' | 'firebase' | 'supabase';

export interface CatalogApi {
  listRegions(): Promise<Region[]>;
  listAreas(): Promise<Area[]>;
  /** All restaurants delivering to an area. Filtering and sorting happen in the browser. */
  listRestaurants(areaId: string): Promise<Restaurant[]>;
  getRestaurantBySlug(slug: string): Promise<Restaurant | null>;
  getMenu(restaurantId: string): Promise<Menu>;
  search(areaId: string, query: string): Promise<SearchResults>;
  /** Coupons a customer can see for a restaurant chain (platform-wide ones included). */
  listCoupons(brandId: string): Promise<Coupon[]>;
}

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  areaId: string;
  pincode: string;
  lat: number;
  lng: number;
}

export type NewAddress = Omit<Address, 'id' | 'lat' | 'lng'>;

export interface User {
  uid: string;
  email: string | null;
}

export interface AuthApi {
  /** The signed-in user, or null. Only meaningful after the first `onChange` call. */
  currentUser(): User | null;
  /** Calls `listener` once the session is known, then on every sign-in and sign-out. */
  onChange(listener: (user: User | null) => void): () => void;
  /**
   * Emails a one-time sign-in link that opens `continueUrl`. On local
   * emulators (and the in-memory backend) no email is sent, so the link is
   * returned as `devLink` instead.
   */
  sendSignInLink(email: string, continueUrl: string): Promise<{ devLink?: string }>;
  isSignInLink(url: string): boolean;
  completeSignIn(email: string, url: string): Promise<User>;
  /**
   * Signs in with the one-time code from the sign-in email, typed by hand.
   * Only backends whose emails carry a code have it (Supabase).
   */
  verifyCode?(email: string, code: string): Promise<User>;
  signOut(): Promise<void>;
}

export interface Profile {
  name: string;
  phone: string;
}

/** The signed-in customer's own profile. Every method rejects when signed out. */
export interface ProfileApi {
  get(): Promise<Profile | null>;
  save(profile: Profile): Promise<Profile>;
}

/** The signed-in customer's saved addresses. Every method rejects when signed out. */
export interface AddressApi {
  list(): Promise<Address[]>;
  save(address: NewAddress & { id?: string }): Promise<Address>;
  remove(id: string): Promise<void>;
}

/** The signed-in customer's orders. Every method rejects when signed out. */
export interface OrdersApi {
  /**
   * Prices a cart. The backend looks every price up itself; the request only
   * carries item ids and quantities.
   */
  quote(request: QuoteRequest): Promise<Quote>;
  /**
   * Creates an order waiting for payment, priced on the server. Sending the
   * same idempotency key again returns the same order.
   */
  place(request: PlaceOrderRequest): Promise<PlaceOrderResult>;
  /**
   * Test mode only (PAYMENTS_MODE=fake): asks the fake provider to pay or
   * decline. The order changes only when the provider's signed webhook arrives.
   */
  payFake(orderId: string, outcome: 'success' | 'failure'): Promise<void>;
  /**
   * The provider payment details for one of the customer's orders that still
   * needs paying (a retry from the order page). Rejects for other orders.
   */
  startPayment(orderId: string): Promise<PaymentStart>;
  /**
   * Sends Razorpay Checkout's success handler output to the server, which
   * checks the signature and asks Razorpay before placing the order.
   * "pending" means Razorpay hasn't captured it yet (its webhook finishes the job).
   */
  confirmRazorpay(
    orderId: string,
    response: RazorpayCheckoutResponse,
  ): Promise<{ outcome: string }>;
  /** One of the customer's own orders, or null (also for other people's orders). */
  get(orderId: string): Promise<Order | null>;
  /** Live updates for one order. Returns a function that stops listening. */
  watch(
    orderId: string,
    onChange: (order: Order | null) => void,
    onError?: (error: Error) => void,
  ): () => void;
  /** The customer's orders, newest first. */
  list(): Promise<Order[]>;
}

export interface Backend {
  name: BackendName;
  auth: AuthApi;
  profile: ProfileApi;
  catalog: CatalogApi;
  addresses: AddressApi;
  orders: OrdersApi;
}
