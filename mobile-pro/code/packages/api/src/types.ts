/**
 * Shared types for the Pro Apps API. The server (server/) builds its
 * responses with these types and the client returns them, so a change here
 * is checked on both sides by `npm run typecheck`.
 *
 * Money is in Indian rupees (numbers, up to two decimals). Times are ISO
 * 8601 strings. Map coordinates are Northbay map units (0 to 1000).
 */
import type { ArtName } from './art';

export type { ArtName } from './art';
export { ART_NAMES } from './art';

/** Gradient tones the API can name; @pro/ui defines a gradient for each. */
export const ART_TONES = [
  'peach',
  'mint',
  'sky',
  'lilac',
  'butter',
  'rose',
  'sand',
  'aqua',
  'sunset',
  'ocean',
  'dusk',
  'meadow',
  'night',
  'candy',
  'ember',
  'aurora',
] as const;
export type ArtTone = (typeof ART_TONES)[number];

export const APP_NAMES = ['platter', 'cartly', 'lumo', 'minutely'] as const;
export type AppName = (typeof APP_NAMES)[number];
/** Apps with a cart and orders. */
export const COMMERCE_APPS = ['platter', 'cartly', 'minutely'] as const;
export type CommerceApp = (typeof COMMERCE_APPS)[number];

// ---------------------------------------------------------------- common

export interface ApiErrorBody {
  error: {
    /** Stable machine code: NOT_FOUND, VALIDATION, UNAUTHORIZED, CART_CONFLICT... */
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface MapPoint {
  x: number;
  y: number;
}

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface CursorPage<T> {
  items: T[];
  /** Pass back as `cursor` for the next page; null at the end. */
  nextCursor: string | null;
}

export interface Banner {
  id: string;
  app: AppName;
  title: string;
  subtitle: string;
  /** Button text ("Order now"). */
  cta: string;
  art: ArtName;
  tone: ArtTone;
  /** In-app route the banner opens, e.g. "/restaurant/r-01" or "/category/fruits". */
  link: string | null;
}

export type CouponKind = 'flat' | 'percent' | 'free_delivery';

export interface Coupon {
  code: string;
  app: CommerceApp;
  title: string;
  description: string;
  kind: CouponKind;
  /** Rupees for flat, percent for percent, unused for free_delivery. */
  value: number;
  maxDiscount: number | null;
  minOrder: number;
  /** Platter only: limit to one restaurant. */
  restaurantId: string | null;
  expiresAt: string;
}

/** A coupon as listed for a cart, with whether it can be applied right now. */
export interface CouponOffer extends Coupon {
  applicable: boolean;
  /** Why not, e.g. "Add ₹120 more to apply". */
  reason: string | null;
  /** What it would save on the current cart. */
  estimatedSavings: number;
}

// ---------------------------------------------------------------- auth & user

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  /** Lumo handle, without "@". */
  handle: string;
  avatar: ArtName | null;
  createdAt: string;
}

export interface OtpRequestInput {
  /** 10-digit Indian mobile number. */
  phone: string;
}

export interface OtpRequestResponse {
  phone: string;
  expiresInSeconds: number;
  /** Demo only: the code is always 123456 and is logged by the server. */
  devHint: string;
}

export interface OtpVerifyInput {
  phone: string;
  code: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  isNewUser: boolean;
}

export interface UpdateMeInput {
  name?: string;
  email?: string;
  avatar?: ArtName | null;
}

export interface Address {
  id: string;
  /** "Home", "Work", "Other" or a custom name. */
  label: string;
  recipient: string;
  line1: string;
  line2: string;
  landmark: string | null;
  locality: string;
  city: string;
  pincode: string;
  location: MapPoint;
  isDefault: boolean;
}

export interface AddressInput {
  label: string;
  recipient?: string;
  line1: string;
  line2?: string;
  landmark?: string | null;
  locality: string;
  pincode: string;
  isDefault?: boolean;
}

export type NotificationKind = 'order' | 'offer' | 'price_drop' | 'system';

export interface AppNotification {
  id: string;
  app: CommerceApp;
  kind: NotificationKind;
  title: string;
  body: string;
  art: ArtName;
  link: string | null;
  createdAt: string;
  isRead: boolean;
}

// ---------------------------------------------------------------- Platter

export interface Cuisine {
  id: string;
  name: string;
  art: ArtName;
}

export interface Offer {
  code: string | null;
  title: string;
  description: string;
}

export interface RestaurantSummary {
  id: string;
  name: string;
  art: ArtName;
  tone: ArtTone;
  cuisines: string[];
  rating: number;
  ratingCount: number;
  /** Estimated delivery time window in minutes. */
  deliveryTime: { min: number; max: number };
  costForTwo: number;
  distanceKm: number;
  locality: string;
  isPureVeg: boolean;
  /** Headline offer ("50% OFF up to ₹100"). */
  offer: string | null;
  isPromoted: boolean;
  isOpen: boolean;
  tags: string[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  /** Extra price over the base item. */
  price: number;
  isVeg: boolean;
  isDefault: boolean;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  kind: 'single' | 'multiple';
  required: boolean;
  /** For 'multiple': the most options that can be picked. */
  max: number | null;
  options: CustomizationOption[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  isBestseller: boolean;
  /** 0 to 3 chillies. */
  spiceLevel: number;
  rating: number | null;
  ratingCount: number;
  art: ArtName;
  isAvailable: boolean;
  customizations: CustomizationGroup[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Restaurant extends RestaurantSummary {
  address: string;
  location: MapPoint;
  offers: Offer[];
  /** Opening hours, e.g. "11:00 am to 11:30 pm". */
  hours: string;
  menu: MenuCategory[];
}

export type RestaurantSort = 'relevance' | 'rating' | 'delivery_time' | 'cost_low' | 'cost_high';

export interface RestaurantQuery {
  q?: string;
  cuisine?: string;
  /** Minimum rating, e.g. 4 for "Rating 4.0+". */
  minRating?: number;
  /** Delivery in 30 minutes or less. */
  fast?: boolean;
  veg?: boolean;
  offers?: boolean;
  sort?: RestaurantSort;
}

export interface DishResult extends MenuItem {
  restaurantName: string;
}

export interface PlatterSearchResult {
  restaurants: RestaurantSummary[];
  dishes: DishResult[];
}

export interface PlatterHome {
  banners: Banner[];
  cuisines: Cuisine[];
  /** Restaurants ranked for the home list. */
  restaurants: RestaurantSummary[];
}

// ---------------------------------------------------------------- Cartly

export interface ProductCategory {
  id: string;
  name: string;
  art: ArtName;
  tone: ArtTone;
}

export interface ProductSummary {
  id: string;
  title: string;
  brand: string;
  categoryId: string;
  art: ArtName;
  tone: ArtTone;
  price: number;
  mrp: number;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  /** "Bestseller", "New", "Deal of the day"... */
  badge: string | null;
  /** Delivered by tomorrow. */
  fastDelivery: boolean;
  isWishlisted: boolean;
}

export interface VariantOption {
  id: string;
  label: string;
  /** Product color swatch (data, not UI theme). */
  hex: string | null;
  available: boolean;
  /** Added to the base price when picked. */
  priceDelta: number;
}

export interface VariantGroup {
  kind: 'color' | 'size' | 'storage';
  name: string;
  options: VariantOption[];
}

export interface RatingSummary {
  average: number;
  count: number;
  /** Count per star value, 5 down to 1. */
  breakdown: { stars: 1 | 2 | 3 | 4 | 5; count: number }[];
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  avatar: ArtName | null;
  rating: number;
  title: string;
  body: string;
  /** Chosen variant, e.g. "Colour: Midnight". */
  variantLabel: string | null;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface Product extends ProductSummary {
  gallery: { art: ArtName; tone: ArtTone }[];
  description: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  variants: VariantGroup[];
  offers: Offer[];
  ratingSummary: RatingSummary;
  topReviews: Review[];
  seller: string;
  returnDays: number;
  warranty: string | null;
  stock: number;
}

export type ProductSort = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'discount' | 'newest';

export interface ProductQuery {
  q?: string;
  category?: string;
  /** One or more brands. */
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minDiscount?: number;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export interface ProductFacets {
  brands: { name: string; count: number }[];
  price: { min: number; max: number };
}

export interface ProductListResponse extends Paged<ProductSummary> {
  facets: ProductFacets;
}

export interface Deal {
  product: ProductSummary;
  endsAt: string;
  /** Percent of deal stock already claimed. */
  claimedPercent: number;
}

export interface CartlyHome {
  banners: Banner[];
  categories: ProductCategory[];
  deals: Deal[];
  dealsEndAt: string;
  topPicks: ProductSummary[];
  recentlyViewed: ProductSummary[];
}

export interface SearchSuggestion {
  text: string;
  kind: 'product' | 'brand' | 'category' | 'query';
  /** Product or category id. */
  id: string | null;
}

export interface ReviewPage extends Paged<Review> {
  summary: RatingSummary;
}

export interface DeliveryEstimate {
  pincode: string;
  serviceable: boolean;
  /** ISO date of delivery. */
  date: string | null;
  /** "Delivery by Tue, 4 Nov". */
  label: string;
  fee: number;
  cashOnDelivery: boolean;
}

// ---------------------------------------------------------------- Lumo

export interface SceneLayer {
  art: ArtName;
  /** Center, 0 to 1 of the width. */
  x: number;
  /** Center, 0 to 1 of the height. */
  y: number;
  /** Size, 0 to 1 of the width. */
  size: number;
  rotate?: number;
  flip?: boolean;
  opacity?: number;
}

/** An illustrated "photo": a gradient with layered 3D art. */
export interface Scene {
  tone: ArtTone;
  layers: SceneLayer[];
}

export const PHOTO_FILTERS = ['normal', 'warm', 'cool', 'mono', 'fade', 'vivid', 'dusk'] as const;
export type PhotoFilter = (typeof PHOTO_FILTERS)[number];

export interface LumoUser {
  id: string;
  handle: string;
  name: string;
  avatar: ArtName | null;
  isVerified: boolean;
  isFollowing: boolean;
}

export interface Highlight {
  id: string;
  title: string;
  cover: Scene;
  storyIds: string[];
}

export interface LumoProfile extends LumoUser {
  bio: string;
  website: string | null;
  stats: { posts: number; followers: number; following: number };
  highlights: Highlight[];
  isMe: boolean;
  followsYou: boolean;
  /** Up to three followers you also follow ("Followed by aarav and 4 others"). */
  mutuals: LumoUser[];
}

export interface Comment {
  id: string;
  postId: string;
  author: LumoUser;
  text: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  author: LumoUser;
  scene: Scene;
  filter: PhotoFilter;
  caption: string;
  location: string | null;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
  /** Someone you follow who liked it, for "Liked by ...". */
  likedBy: LumoUser | null;
  taggedUsers: LumoUser[];
  /** First two comments, for the feed. */
  previewComments: Comment[];
  createdAt: string;
}

export interface Story {
  id: string;
  scene: Scene;
  caption: string | null;
  isSeen: boolean;
  createdAt: string;
}

export interface StoryGroup {
  user: LumoUser;
  stories: Story[];
  hasUnseen: boolean;
  isMe: boolean;
}

export interface CreatePostInput {
  scene: Scene;
  filter: PhotoFilter;
  caption: string;
  location?: string | null;
  taggedUserIds?: string[];
}

export interface LumoNotification {
  id: string;
  kind: 'like' | 'comment' | 'follow' | 'mention';
  actor: LumoUser;
  post: { id: string; scene: Scene } | null;
  /** "liked your photo.", "started following you." */
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  isMine: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  /** The other people in the chat. */
  participants: LumoUser[];
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export type ProfilePostsTab = 'grid' | 'tagged' | 'saved';

// ---------------------------------------------------------------- Minutely

export interface GroceryCategory {
  id: string;
  name: string;
  art: ArtName;
  tone: ArtTone;
  subcategories: string[];
}

export interface GroceryItem {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  subcategory: string;
  /** Pack size: "500 g", "1 L", "6 pcs". */
  unit: string;
  price: number;
  mrp: number;
  discountPercent: number;
  art: ArtName;
  tone: ArtTone;
  tags: string[];
  inStock: boolean;
  maxPerOrder: number;
  isVeg: boolean;
}

export interface GroceryItemDetail extends GroceryItem {
  description: string;
  highlights: { label: string; value: string }[];
  similar: GroceryItem[];
}

export interface Rail {
  id: string;
  title: string;
  categoryId: string | null;
  items: GroceryItem[];
}

export interface MinutelyHome {
  /** "Delivery in 9 minutes". */
  etaMinutes: number;
  store: { id: string; name: string; locality: string };
  banners: Banner[];
  categories: GroceryCategory[];
  rails: Rail[];
}

export type GrocerySort = 'relevance' | 'price_asc' | 'price_desc' | 'discount';

export interface GroceryQuery {
  category?: string;
  subcategory?: string;
  q?: string;
  sort?: GrocerySort;
}

// ---------------------------------------------------------------- cart

export interface SelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  name: string;
  price: number;
}

export interface CartLine {
  /** Line id (a product with different options is a separate line). */
  id: string;
  productId: string;
  name: string;
  art: ArtName;
  tone: ArtTone;
  unitPrice: number;
  mrp: number | null;
  quantity: number;
  lineTotal: number;
  /** Customizations (Platter) or variants (Cartly). */
  options: SelectedOption[];
  /** "Large, Extra cheese" or "Midnight, 128 GB". */
  optionsLabel: string | null;
  /** Grocery pack size. */
  unit: string | null;
  /** Platter and Minutely food items. */
  isVeg: boolean | null;
  maxQuantity: number;
  inStock: boolean;
  savedForLater: boolean;
}

export interface Bill {
  /** Sum of selling prices. */
  itemTotal: number;
  /** Sum of MRPs (equals itemTotal when there is no MRP). */
  mrpTotal: number;
  deliveryFee: number;
  /** The delivery fee that would apply, when waived (for a strike-through). */
  deliveryFeeWaived: number;
  platformFee: number;
  handlingFee: number;
  smallCartFee: number;
  /** GST and restaurant charges (Platter). */
  taxes: number;
  couponDiscount: number;
  tip: number;
  total: number;
  /** MRP discount + coupon + waived delivery. */
  savings: number;
}

export interface Cart {
  app: CommerceApp;
  items: CartLine[];
  savedForLater: CartLine[];
  /** Sum of quantities of active lines. */
  itemCount: number;
  coupon: Coupon | null;
  tip: number;
  bill: Bill;
  /** Platter: the restaurant the cart belongs to. */
  restaurant: RestaurantSummary | null;
  /** Spend this much more for free delivery; null when already free or not applicable. */
  amountToFreeDelivery: number | null;
}

export interface SetCartItemInput {
  productId: string;
  /** New quantity for the matching line; 0 removes it. */
  quantity: number;
  /** Platter customizations. */
  options?: { groupId: string; optionId: string }[];
  /** Cartly variants by group kind. */
  variant?: { color?: string; size?: string; storage?: string };
  /** Platter: clear a cart from another restaurant first. */
  replaceCart?: boolean;
}

export interface UpdateCartLineInput {
  quantity?: number;
  savedForLater?: boolean;
}

// ---------------------------------------------------------------- orders

export const ORDER_STATUSES = [
  'confirmed',
  'preparing',
  'packing',
  'packed',
  'picked_up',
  'shipped',
  'on_the_way',
  'out_for_delivery',
  'delivered',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PaymentKind = 'upi' | 'card' | 'cash' | 'wallet';

export interface PaymentInput {
  kind: PaymentKind;
  /** e.g. "riya@okaxis.example" */
  upiId?: string;
  cardLast4?: string;
}

export interface PaymentMethod {
  kind: PaymentKind;
  /** "UPI · riya@okaxis.example", "Card •••• 4242", "Cash on delivery". */
  label: string;
}

export interface PlaceOrderInput {
  app: CommerceApp;
  addressId: string;
  payment: PaymentInput;
  instructions?: string;
}

export interface OrderStep {
  status: OrderStatus;
  label: string;
  description: string;
  /** When the step happened; null if it has not. */
  at: string | null;
  done: boolean;
}

export interface Rider {
  name: string;
  /** Fictional, .example style number. */
  phone: string;
  vehicle: string;
  rating: number;
  avatar: ArtName;
}

export interface Tracking {
  route: MapPoint[];
  origin: { label: string; point: MapPoint; art: ArtName };
  destination: { label: string; point: MapPoint };
  /** 0 to 1 while the rider is moving, 1 when delivered, null before pickup. */
  progress: number | null;
  riderPosition: MapPoint | null;
}

export interface OrderLine {
  id: string;
  productId: string;
  name: string;
  art: ArtName;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  optionsLabel: string | null;
  isVeg: boolean | null;
}

export interface OrderRating {
  stars: number;
  comment: string | null;
  tags: string[];
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  lineIds: string[];
  reason: string;
  comment: string | null;
  status: 'requested' | 'pickup_scheduled' | 'refunded';
  refundAmount: number;
  pickupDate: string;
  createdAt: string;
}

export interface Order {
  id: string;
  /** Human order number: "PLT-482913". */
  number: string;
  app: CommerceApp;
  status: OrderStatus;
  statusLabel: string;
  items: OrderLine[];
  bill: Bill;
  coupon: string | null;
  address: Address;
  payment: PaymentMethod;
  instructions: string | null;
  timeline: OrderStep[];
  tracking: Tracking | null;
  rider: Rider | null;
  restaurant: RestaurantSummary | null;
  placedAt: string;
  /** Promised delivery time. */
  etaAt: string;
  /** Minutes until etaAt, rounded up; 0 once delivered. */
  etaMinutes: number;
  deliveredAt: string | null;
  cancelledAt: string | null;
  rating: OrderRating | null;
  returns: ReturnRequest[];
  canCancel: boolean;
  canRate: boolean;
  canReturn: boolean;
}

export interface OrderSummary {
  id: string;
  number: string;
  app: CommerceApp;
  status: OrderStatus;
  statusLabel: string;
  /** Restaurant name, or the first item. */
  title: string;
  art: ArtName;
  /** "2 x Paneer tikka, 1 x Garlic naan". */
  itemsPreview: string;
  itemCount: number;
  total: number;
  placedAt: string;
  deliveredAt: string | null;
  rating: number | null;
}

export interface RateOrderInput {
  stars: number;
  comment?: string;
  tags?: string[];
}

export interface ReturnInput {
  lineIds: string[];
  reason: string;
  comment?: string;
}

/** Events on GET /orders/:id/events (Server-Sent Events, `event:` = `type`). */
export type OrderStreamEvent =
  | { type: 'snapshot'; order: Order }
  | { type: 'status'; order: Order }
  | {
      type: 'location';
      orderId: string;
      progress: number;
      position: MapPoint;
      etaMinutes: number;
    };

// ---------------------------------------------------------------- misc

export interface HealthResponse {
  ok: true;
  name: string;
  version: string;
  time: string;
}
