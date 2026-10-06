/**
 * Domain types shared by the web app and (later) the server.
 *
 * Every money value is an integer in the currency's minor unit
 * (paise for INR), so ₹249.00 is stored as 24900.
 */

export type CurrencyCode = string;

export interface DeliveryFeeBand {
  /** Upper bound of this band in kilometres (inclusive). */
  upToKm: number;
  fee: number;
}

export interface Region {
  id: string;
  name: string;
  currency: CurrencyCode;
  locale: string;
  timezone: string;
  paymentProvider: 'razorpay' | 'stripe';
  platformFee: number;
  /** GST on food, in basis points (500 = 5%). */
  foodTaxBps: number;
  /** GST on delivery + platform fees, in basis points. */
  feeTaxBps: number;
  deliveryFeeBands: DeliveryFeeBand[];
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Area extends GeoPoint {
  id: string;
  name: string;
  city: string;
  regionId: string;
}

export interface RestaurantOffer {
  /** Big line on the card, e.g. "50% OFF". */
  headline: string;
  /** Small line, e.g. "UPTO ₹100". */
  subline: string;
  couponCode?: string;
}

export interface Restaurant extends GeoPoint {
  id: string;
  /** Restaurants of the same chain share a brand (and its menu and coupons). */
  brandId: string;
  slug: string;
  name: string;
  imageUrl: string;
  cuisines: string[];
  rating: number;
  ratingCount: number;
  costForTwo: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  isPureVeg: boolean;
  isOpen: boolean;
  areaIds: string[];
  regionId: string;
  locality: string;
  offer: RestaurantOffer | null;
  isPromoted?: boolean;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  imageUrl: string | null;
  isAvailable: boolean;
  isBestseller: boolean;
  /** Optional "spicy", "chef's special"… tags. */
  tags?: string[];
}

export type CouponType = 'percent' | 'flat' | 'free_delivery';

export interface Coupon {
  code: string;
  title: string;
  description: string;
  type: CouponType;
  /** Percent in basis points for `percent`, minor units for `flat`, ignored for `free_delivery`. */
  value: number;
  maxDiscount: number | null;
  minOrder: number;
  /** Only valid at this restaurant chain; null means valid everywhere. */
  brandId: string | null;
  regionId: string;
  validFrom: string;
  validTo: string;
  perUserLimit: number | null;
  active: boolean;
}

export interface Menu {
  categories: MenuCategory[];
  items: MenuItem[];
}
