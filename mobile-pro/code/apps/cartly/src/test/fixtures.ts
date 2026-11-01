import type {
  Address,
  AppNotification,
  Bill,
  Cart,
  CartLine,
  CartlyHome,
  CouponOffer,
  Order,
  OrderSummary,
  Product,
  ProductListResponse,
  ProductSummary,
} from '@pro/api';

export function summary(overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    id: 'p-01',
    title: 'Voltix Nova 5G (Midnight Blue, 8 GB RAM, 128 GB)',
    brand: 'Voltix',
    categoryId: 'mobiles',
    art: 'mobile-phone',
    tone: 'sky',
    price: 18999,
    mrp: 24999,
    discountPercent: 24,
    rating: 4.3,
    ratingCount: 41872,
    badge: 'Bestseller',
    fastDelivery: true,
    isWishlisted: false,
    ...overrides,
  };
}

export const buds = summary({
  id: 'p-07',
  title: 'Halcyon Audio Drift Buds True Wireless Earbuds',
  brand: 'Halcyon Audio',
  categoryId: 'electronics',
  art: 'headphone',
  tone: 'mint',
  price: 2499,
  mrp: 6999,
  discountPercent: 64,
  rating: 4.2,
  ratingCount: 57210,
});

export function product(overrides: Partial<Product> = {}): Product {
  return {
    ...summary(),
    gallery: [
      { art: 'mobile-phone', tone: 'sky' },
      { art: 'camera', tone: 'rose' },
    ],
    description: 'A smooth 120 Hz AMOLED screen and a 50 MP camera.',
    highlights: ['6.7-inch 120 Hz AMOLED display', '5000 mAh battery'],
    specs: [
      { label: 'Display', value: '6.7 in, 120 Hz' },
      { label: 'Battery', value: '5000 mAh' },
    ],
    variants: [
      {
        kind: 'color',
        name: 'Colour',
        options: [
          { id: 'midnight-blue', label: 'Midnight Blue', hex: '#1F2A44', available: true, priceDelta: 0 },
          { id: 'fern-green', label: 'Fern Green', hex: '#4E7D5B', available: true, priceDelta: 0 },
        ],
      },
      {
        kind: 'storage',
        name: 'Storage',
        options: [
          { id: '128-gb', label: '128 GB', hex: null, available: true, priceDelta: 0 },
          { id: '256-gb', label: '256 GB', hex: null, available: true, priceDelta: 2000 },
        ],
      },
    ],
    offers: [{ code: 'CARTLY10', title: 'Coupon', description: 'Extra 10% off up to ₹500' }],
    ratingSummary: {
      average: 4.3,
      count: 41872,
      breakdown: [
        { stars: 5, count: 20094 },
        { stars: 4, count: 15310 },
        { stars: 3, count: 5476 },
        { stars: 2, count: 920 },
        { stars: 1, count: 72 },
      ],
    },
    topReviews: [
      {
        id: 'rv1',
        productId: 'p-01',
        author: 'Tarun C.',
        avatar: null,
        rating: 4,
        title: 'Good for the price',
        body: 'Network reception is good.',
        variantLabel: 'Colour: Glacier White',
        verifiedPurchase: true,
        helpfulCount: 282,
        createdAt: '2026-09-03T13:22:08.694Z',
      },
    ],
    seller: 'Harbour Electronics',
    returnDays: 7,
    warranty: '1 year manufacturer warranty',
    stock: 184,
    ...overrides,
  };
}

export function listing(items: ProductSummary[], overrides: Partial<ProductListResponse> = {}): ProductListResponse {
  return {
    items,
    page: 1,
    pageSize: 20,
    total: items.length,
    hasMore: false,
    facets: { brands: [{ name: 'Voltix', count: 3 }, { name: 'Halcyon Audio', count: 1 }], price: { min: 2499, max: 34999 } },
    ...overrides,
  };
}

export const homeData: CartlyHome = {
  banners: [{ id: 'b1', app: 'cartly', title: 'The Big Bay Sale', subtitle: 'Up to 70% off', cta: 'Shop now', art: 'shopping-bags', tone: 'candy', link: '/sale' }],
  categories: [{ id: 'mobiles', name: 'Mobiles', art: 'mobile-phone', tone: 'sky' }],
  deals: [{ product: buds, endsAt: '2099-01-01T00:00:00.000Z', claimedPercent: 87 }],
  dealsEndAt: '2099-01-01T00:00:00.000Z',
  topPicks: [summary()],
  recentlyViewed: [],
};

export const home: Address = {
  id: 'addr_home',
  label: 'Home',
  recipient: 'Riya Kapoor',
  line1: 'Flat 3B, Seabreeze Apartments',
  line2: '12 Lake View Road',
  landmark: null,
  locality: 'Lake View',
  city: 'Northbay',
  pincode: '560101',
  location: { x: 500, y: 500 },
  isDefault: true,
};
export const work: Address = { ...home, id: 'addr_work', label: 'Work', line1: 'Floor 4, Tidewater Tech Park', pincode: '560105', isDefault: false };

export function bill(itemTotal: number, mrpTotal: number, overrides: Partial<Bill> = {}): Bill {
  const free = itemTotal >= 499;
  return {
    itemTotal,
    mrpTotal,
    deliveryFee: free ? 0 : 40,
    deliveryFeeWaived: free ? 40 : 0,
    platformFee: 0,
    handlingFee: 0,
    smallCartFee: 0,
    taxes: 0,
    couponDiscount: 0,
    tip: 0,
    total: itemTotal + (free ? 0 : 40),
    savings: mrpTotal - itemTotal + (free ? 40 : 0),
    ...overrides,
  };
}

export function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    id: 'l1',
    productId: 'p-01',
    name: 'Voltix Nova 5G',
    art: 'mobile-phone',
    tone: 'sky',
    unitPrice: 18999,
    mrp: 24999,
    quantity: 1,
    lineTotal: 18999,
    options: [
      { groupId: 'color', groupName: 'Colour', optionId: 'midnight-blue', name: 'Midnight Blue', price: 0 },
      { groupId: 'storage', groupName: 'Storage', optionId: '128-gb', name: '128 GB', price: 0 },
    ],
    optionsLabel: 'Midnight Blue, 128 GB',
    unit: null,
    isVeg: null,
    maxQuantity: 5,
    inStock: true,
    savedForLater: false,
    ...overrides,
  };
}

export function cart(items: CartLine[] = [line()], saved: CartLine[] = []): Cart {
  const itemTotal = items.reduce((s, l) => s + l.lineTotal, 0);
  const mrpTotal = items.reduce((s, l) => s + (l.mrp ?? l.unitPrice) * l.quantity, 0);
  return {
    app: 'cartly',
    items,
    savedForLater: saved,
    itemCount: items.reduce((s, l) => s + l.quantity, 0),
    coupon: null,
    tip: 0,
    bill: bill(itemTotal, mrpTotal),
    restaurant: null,
    amountToFreeDelivery: itemTotal >= 499 || itemTotal === 0 ? null : 499 - itemTotal,
  };
}

export const coupon: CouponOffer = {
  code: 'CARTLY10',
  app: 'cartly',
  title: '10% OFF up to ₹500',
  description: 'On orders above ₹999.',
  kind: 'percent',
  value: 10,
  maxDiscount: 500,
  minOrder: 999,
  restaurantId: null,
  expiresAt: '2099-01-01T00:00:00.000Z',
  applicable: true,
  reason: null,
  estimatedSavings: 500,
};

const STEPS = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'] as const;
const LABELS = ['Order placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];

export function order(status: Order['status'], overrides: Partial<Order> = {}): Order {
  const reached = STEPS.indexOf(status as (typeof STEPS)[number]);
  return {
    id: 'ord_1',
    number: 'CRT-482913',
    app: 'cartly',
    status,
    statusLabel: LABELS[reached] ?? 'Cancelled',
    items: [
      { id: 'l1', productId: 'p-01', name: 'Voltix Nova 5G', art: 'mobile-phone', quantity: 1, unitPrice: 18999, lineTotal: 18999, optionsLabel: 'Midnight Blue, 128 GB', isVeg: null },
      { id: 'l2', productId: 'p-07', name: 'Drift Buds', art: 'headphone', quantity: 1, unitPrice: 2499, lineTotal: 2499, optionsLabel: null, isVeg: null },
    ],
    bill: bill(21498, 31998),
    coupon: null,
    address: home,
    payment: { kind: 'upi', label: 'UPI · riya@okaxis.example' },
    instructions: null,
    timeline: STEPS.map((s, i) => ({ status: s, label: LABELS[i]!, description: '', at: i <= reached ? '2026-11-01T07:21:00.000Z' : null, done: i <= reached })),
    tracking: null,
    rider: null,
    restaurant: null,
    placedAt: '2026-11-01T07:21:00.000Z',
    etaAt: '2026-11-03T07:21:00.000Z',
    etaMinutes: 10,
    deliveredAt: status === 'delivered' ? '2026-10-27T07:21:00.000Z' : null,
    cancelledAt: null,
    rating: null,
    returns: [],
    canCancel: status === 'confirmed' || status === 'packed',
    canRate: false,
    canReturn: status === 'delivered',
    ...overrides,
  };
}

export function orderSummary(overrides: Partial<OrderSummary> = {}): OrderSummary {
  return {
    id: 'ord_1',
    number: 'CRT-482913',
    app: 'cartly',
    status: 'delivered',
    statusLabel: 'Delivered',
    title: 'Voltix Nova 5G',
    art: 'mobile-phone',
    itemsPreview: '1 x Voltix Nova 5G',
    itemCount: 1,
    total: 18999,
    placedAt: '2026-10-20T07:21:00.000Z',
    deliveredAt: '2026-10-22T07:21:00.000Z',
    rating: null,
    ...overrides,
  };
}

export function notification(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: 'n1',
    app: 'cartly',
    kind: 'price_drop',
    title: 'Price drop on your wishlist',
    body: 'An item you saved is now cheaper.',
    art: 'label',
    link: '/wishlist',
    createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    isRead: false,
    ...overrides,
  };
}
