/**
 * Postgres rows ↔ QuickBite types. One copy of the mapping, used by the
 * browser adapter (rows from PostgREST), the server's PostgresOrderStore
 * (rows from postgres.js) and the seed loader.
 *
 * Columns are snake_case (see supabase/migrations). Timestamps arrive as ISO
 * strings from PostgREST and as Date objects from postgres.js; both become
 * ISO 8601 UTC strings with milliseconds, the format every backend uses.
 */
import {
  normalizeText,
  type Area,
  type Coupon,
  type MenuCategory,
  type MenuItem,
  type Order,
  type QuoteLine,
  type Region,
  type Restaurant,
} from '@quickbite/core';

export type Timestamp = string | Date;

export const iso = (value: Timestamp): string => new Date(value).toISOString();

export interface RegionRow {
  id: string;
  name: string;
  currency: string;
  locale: string;
  timezone: string;
  payment_provider: Region['paymentProvider'];
  platform_fee: number;
  food_tax_bps: number;
  fee_tax_bps: number;
  delivery_fee_bands: Region['deliveryFeeBands'];
}

export const regionFromRow = (r: RegionRow): Region => ({
  id: r.id,
  name: r.name,
  currency: r.currency,
  locale: r.locale,
  timezone: r.timezone,
  paymentProvider: r.payment_provider,
  platformFee: r.platform_fee,
  foodTaxBps: r.food_tax_bps,
  feeTaxBps: r.fee_tax_bps,
  deliveryFeeBands: r.delivery_fee_bands,
});

export const regionToRow = (r: Region): RegionRow => ({
  id: r.id,
  name: r.name,
  currency: r.currency,
  locale: r.locale,
  timezone: r.timezone,
  payment_provider: r.paymentProvider,
  platform_fee: r.platformFee,
  food_tax_bps: r.foodTaxBps,
  fee_tax_bps: r.feeTaxBps,
  delivery_fee_bands: r.deliveryFeeBands,
});

export interface AreaRow {
  id: string;
  name: string;
  city: string;
  region_id: string;
  lat: number;
  lng: number;
}

export const areaFromRow = (r: AreaRow): Area => ({
  id: r.id,
  name: r.name,
  city: r.city,
  regionId: r.region_id,
  lat: r.lat,
  lng: r.lng,
});

export const areaToRow = (a: Area): AreaRow => ({
  id: a.id,
  name: a.name,
  city: a.city,
  region_id: a.regionId,
  lat: a.lat,
  lng: a.lng,
});

export interface RestaurantRow {
  id: string;
  brand_id: string;
  slug: string;
  name: string;
  image_url: string;
  cuisines: string[];
  rating: number;
  rating_count: number;
  cost_for_two: number;
  delivery_time_min: number;
  delivery_time_max: number;
  is_pure_veg: boolean;
  is_open: boolean;
  area_ids: string[];
  region_id: string;
  locality: string;
  offer: Restaurant['offer'];
  is_promoted: boolean | null;
  lat: number;
  lng: number;
  sort_order: number;
}

export const restaurantFromRow = (r: RestaurantRow): Restaurant => ({
  id: r.id,
  brandId: r.brand_id,
  slug: r.slug,
  name: r.name,
  imageUrl: r.image_url,
  cuisines: r.cuisines,
  rating: r.rating,
  ratingCount: r.rating_count,
  costForTwo: r.cost_for_two,
  deliveryTimeMin: r.delivery_time_min,
  deliveryTimeMax: r.delivery_time_max,
  isPureVeg: r.is_pure_veg,
  isOpen: r.is_open,
  areaIds: r.area_ids,
  regionId: r.region_id,
  locality: r.locality,
  offer: r.offer,
  ...(r.is_promoted === null ? {} : { isPromoted: r.is_promoted }),
  lat: r.lat,
  lng: r.lng,
});

export const restaurantToRow = (r: Restaurant, sortOrder: number): RestaurantRow => ({
  id: r.id,
  brand_id: r.brandId,
  slug: r.slug,
  name: r.name,
  image_url: r.imageUrl,
  cuisines: r.cuisines,
  rating: r.rating,
  rating_count: r.ratingCount,
  cost_for_two: r.costForTwo,
  delivery_time_min: r.deliveryTimeMin,
  delivery_time_max: r.deliveryTimeMax,
  is_pure_veg: r.isPureVeg,
  is_open: r.isOpen,
  area_ids: r.areaIds,
  region_id: r.regionId,
  locality: r.locality,
  offer: r.offer,
  is_promoted: r.isPromoted ?? null,
  lat: r.lat,
  lng: r.lng,
  sort_order: sortOrder,
});

export interface MenuCategoryRow {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
}

export const categoryFromRow = (r: MenuCategoryRow): MenuCategory => ({
  id: r.id,
  restaurantId: r.restaurant_id,
  name: r.name,
  sortOrder: r.sort_order,
});

export const categoryToRow = (c: MenuCategory): MenuCategoryRow => ({
  id: c.id,
  restaurant_id: c.restaurantId,
  name: c.name,
  sort_order: c.sortOrder,
});

export interface MenuItemRow {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  image_url: string | null;
  is_available: boolean;
  is_bestseller: boolean;
  tags: string[] | null;
  position: number;
  search_text: string;
}

/** The menu_items columns a client reads (search_text is only for the search function). */
export const MENU_ITEM_COLUMNS =
  'id, restaurant_id, category_id, name, description, price, is_veg, image_url, is_available, is_bestseller, tags';

export const menuItemFromRow = (r: Omit<MenuItemRow, 'position' | 'search_text'>): MenuItem => ({
  id: r.id,
  restaurantId: r.restaurant_id,
  categoryId: r.category_id,
  name: r.name,
  description: r.description,
  price: r.price,
  isVeg: r.is_veg,
  imageUrl: r.image_url,
  isAvailable: r.is_available,
  isBestseller: r.is_bestseller,
  ...(r.tags === null ? {} : { tags: r.tags }),
});

export const menuItemToRow = (i: MenuItem, position: number): MenuItemRow => ({
  id: i.id,
  restaurant_id: i.restaurantId,
  category_id: i.categoryId,
  name: i.name,
  description: i.description,
  price: i.price,
  is_veg: i.isVeg,
  image_url: i.imageUrl,
  is_available: i.isAvailable,
  is_bestseller: i.isBestseller,
  tags: i.tags ?? null,
  position,
  search_text: `${normalizeText(i.name)} ${normalizeText(i.description)}`.trim(),
});

export interface CouponRow {
  code: string;
  title: string;
  description: string;
  type: Coupon['type'];
  value: number;
  max_discount: number | null;
  min_order: number;
  brand_id: string | null;
  region_id: string;
  valid_from: Timestamp;
  valid_to: Timestamp;
  per_user_limit: number | null;
  active: boolean;
}

export const couponFromRow = (r: CouponRow): Coupon => ({
  code: r.code,
  title: r.title,
  description: r.description,
  type: r.type,
  value: r.value,
  maxDiscount: r.max_discount,
  minOrder: r.min_order,
  brandId: r.brand_id,
  regionId: r.region_id,
  validFrom: iso(r.valid_from),
  validTo: iso(r.valid_to),
  perUserLimit: r.per_user_limit,
  active: r.active,
});

export const couponToRow = (c: Coupon): CouponRow => ({
  code: c.code,
  title: c.title,
  description: c.description,
  type: c.type,
  value: c.value,
  max_discount: c.maxDiscount,
  min_order: c.minOrder,
  brand_id: c.brandId,
  region_id: c.regionId,
  valid_from: c.validFrom,
  valid_to: c.validTo,
  per_user_limit: c.perUserLimit,
  active: c.active,
});

export interface AddressRow {
  id: string;
  user_id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  area_id: string;
  pincode: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface OrderItemRow {
  order_id: string;
  line_no: number;
  menu_item_id: string;
  name: string;
  unit_price: number;
  qty: number;
  is_veg: boolean;
  line_total: number;
}

export interface OrderRow {
  id: string;
  user_id: string;
  restaurant_id: string;
  restaurant: Order['restaurant'];
  status: Order['status'];
  status_history: Order['statusHistory'];
  address: Order['address'];
  bill: Order['bill'];
  distance_km: number;
  currency: string;
  coupon_code: string | null;
  note: string;
  payment_provider: Order['paymentProvider'];
  payment_status: Order['paymentStatus'];
  provider_order_id: string | null;
  provider_payment_id: string | null;
  idempotency_key: string;
  needs_review: boolean;
  eta_minutes: Order['etaMinutes'];
  created_at: Timestamp;
  updated_at: Timestamp;
  status_updated_at: Timestamp;
}

export const orderItemFromRow = (r: OrderItemRow): QuoteLine => ({
  itemId: r.menu_item_id,
  name: r.name,
  isVeg: r.is_veg,
  unitPrice: r.unit_price,
  qty: r.qty,
  lineTotal: r.line_total,
});

export const orderItemsToRows = (order: Pick<Order, 'id' | 'items'>): OrderItemRow[] =>
  order.items.map((line, lineNo) => ({
    order_id: order.id,
    line_no: lineNo,
    menu_item_id: line.itemId,
    name: line.name,
    unit_price: line.unitPrice,
    qty: line.qty,
    is_veg: line.isVeg,
    line_total: line.lineTotal,
  }));

/** `items` are the order's item rows, in any order. */
export function orderFromRow(r: OrderRow, items: readonly OrderItemRow[]): Order {
  return {
    id: r.id,
    userId: r.user_id,
    restaurantId: r.restaurant_id,
    restaurant: r.restaurant,
    status: r.status,
    statusHistory: r.status_history,
    items: [...items].sort((a, b) => a.line_no - b.line_no).map(orderItemFromRow),
    address: r.address,
    bill: r.bill,
    distanceKm: r.distance_km,
    currency: r.currency,
    couponCode: r.coupon_code,
    note: r.note,
    paymentProvider: r.payment_provider,
    paymentStatus: r.payment_status,
    providerOrderId: r.provider_order_id,
    providerPaymentId: r.provider_payment_id,
    idempotencyKey: r.idempotency_key,
    needsReview: r.needs_review,
    etaMinutes: r.eta_minutes,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    statusUpdatedAt: iso(r.status_updated_at),
  };
}

/** Order field → orders column. `items` live in order_items and never change. */
export const ORDER_COLUMNS = {
  id: 'id',
  userId: 'user_id',
  restaurantId: 'restaurant_id',
  restaurant: 'restaurant',
  status: 'status',
  statusHistory: 'status_history',
  address: 'address',
  bill: 'bill',
  distanceKm: 'distance_km',
  currency: 'currency',
  couponCode: 'coupon_code',
  note: 'note',
  paymentProvider: 'payment_provider',
  paymentStatus: 'payment_status',
  providerOrderId: 'provider_order_id',
  providerPaymentId: 'provider_payment_id',
  idempotencyKey: 'idempotency_key',
  needsReview: 'needs_review',
  etaMinutes: 'eta_minutes',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  statusUpdatedAt: 'status_updated_at',
} as const satisfies Record<Exclude<keyof Order, 'items'>, keyof OrderRow>;

export function orderToRow(order: Order): OrderRow {
  const row = {} as Record<string, unknown>;
  for (const [field, column] of Object.entries(ORDER_COLUMNS)) {
    row[column] = order[field as keyof typeof ORDER_COLUMNS];
  }
  return row as unknown as OrderRow;
}
