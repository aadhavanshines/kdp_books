/**
 * The one interface the UI talks to. Every backend (in-memory, Firebase,
 * Supabase) implements it, so pages never know which one is running.
 */
import type { Area, Bill, Coupon, Menu, Region, Restaurant, SearchResults } from '@quickbite/core';

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

export interface AddressApi {
  list(): Promise<Address[]>;
  save(address: NewAddress & { id?: string }): Promise<Address>;
  remove(id: string): Promise<void>;
}

export interface QuoteRequest {
  restaurantId: string;
  items: { itemId: string; qty: number }[];
  couponCode?: string;
  addressId: string;
}

export interface QuoteLine {
  itemId: string;
  name: string;
  isVeg: boolean;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export type QuoteError =
  | 'EMPTY_CART'
  | 'INVALID_QUANTITY'
  | 'NOT_DELIVERABLE'
  | 'RESTAURANT_NOT_FOUND'
  | 'RESTAURANT_CLOSED'
  | 'ADDRESS_NOT_FOUND';

export type Quote =
  | {
      ok: true;
      lines: QuoteLine[];
      bill: Bill;
      /** Items that were dropped because they are no longer available. */
      unavailableItemIds: string[];
      /** True when the coupon code doesn't exist at all. */
      couponNotFound: boolean;
      distanceKm: number;
    }
  | { ok: false; error: QuoteError };

export interface OrdersApi {
  /**
   * Prices a cart. The backend looks every price up itself; the request only
   * carries item ids and quantities.
   */
  quote(request: QuoteRequest): Promise<Quote>;
}

export interface Backend {
  name: BackendName;
  catalog: CatalogApi;
  addresses: AddressApi;
  orders: OrdersApi;
}
