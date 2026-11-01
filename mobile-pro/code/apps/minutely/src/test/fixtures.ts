import type { Address, Cart, CartLine, GroceryCategory, GroceryItem, MinutelyHome, Order } from '@pro/api';

export function grocery(overrides: Partial<GroceryItem> = {}): GroceryItem {
  return {
    id: 'g-001',
    name: 'Shimla Apple',
    brand: 'Little Orchard',
    categoryId: 'fruits',
    subcategory: 'Everyday',
    unit: '4 pcs (approx. 600 g)',
    price: 189,
    mrp: 220,
    discountPercent: 14,
    art: 'red-apple',
    tone: 'peach',
    tags: ['Bestseller'],
    inStock: true,
    maxPerOrder: 10,
    isVeg: true,
    ...overrides,
  };
}

export const apple = grocery();
export const banana = grocery({ id: 'g-002', name: 'Robusta Banana', unit: '6 pcs', price: 52, mrp: 60, discountPercent: 13, art: 'banana', subcategory: 'Everyday' });
export const mango = grocery({ id: 'g-003', name: 'Alphonso Mango', unit: '2 pcs', price: 249, mrp: 299, discountPercent: 17, art: 'mango', subcategory: 'Seasonal', inStock: false });

export const categories: GroceryCategory[] = [
  { id: 'fruits', name: 'Fresh fruits', art: 'red-apple', tone: 'peach', subcategories: ['Seasonal', 'Exotic', 'Everyday'] },
  { id: 'dairy', name: 'Dairy & bread', art: 'glass-of-milk', tone: 'sky', subcategories: ['Milk', 'Bread'] },
];

export const homeFeed: MinutelyHome = {
  etaMinutes: 7,
  store: { id: 'store-lakeview', name: 'Minutely Lake View', locality: 'Lake View' },
  banners: [{ id: 'b1', app: 'minutely', title: 'Fresh fruits, 15% off', subtitle: 'Picked this morning', cta: 'Shop fruits', art: 'mango', tone: 'meadow', link: '/category/fruits' }],
  categories,
  rails: [{ id: 'fresh-fruits', title: 'Fresh fruits', categoryId: 'fruits', items: [apple, banana] }],
};

export function line(item: GroceryItem, quantity: number, overrides: Partial<CartLine> = {}): CartLine {
  return {
    id: `l-${item.id}`,
    productId: item.id,
    name: item.name,
    art: item.art,
    tone: item.tone,
    unitPrice: item.price,
    mrp: item.mrp,
    quantity,
    lineTotal: item.price * quantity,
    options: [],
    optionsLabel: null,
    unit: item.unit,
    isVeg: true,
    maxQuantity: item.maxPerOrder,
    inStock: true,
    savedForLater: false,
    ...overrides,
  };
}

/** A cart with a bill worked out the way the server does for Minutely (₹199 for free delivery). */
export function cart(items: CartLine[] = [], overrides: Partial<Cart> = {}): Cart {
  const itemTotal = items.reduce((s, l) => s + l.lineTotal, 0);
  const mrpTotal = items.reduce((s, l) => s + (l.mrp ?? l.unitPrice) * l.quantity, 0);
  const empty = items.length === 0;
  const free = itemTotal >= 199;
  const deliveryFee = empty || free ? 0 : 30;
  const handlingFee = empty ? 0 : 4;
  return {
    app: 'minutely',
    items,
    savedForLater: [],
    itemCount: items.reduce((s, l) => s + l.quantity, 0),
    coupon: null,
    tip: 0,
    bill: {
      itemTotal,
      mrpTotal,
      deliveryFee,
      deliveryFeeWaived: free && !empty ? 30 : 0,
      platformFee: 0,
      handlingFee,
      smallCartFee: 0,
      taxes: 0,
      couponDiscount: 0,
      tip: 0,
      total: itemTotal + deliveryFee + handlingFee,
      savings: mrpTotal - itemTotal + (free && !empty ? 30 : 0),
    },
    restaurant: null,
    amountToFreeDelivery: empty || free ? null : 199 - itemTotal,
    ...overrides,
  };
}

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
  location: { x: 400, y: 500 },
  isDefault: true,
};

const STEPS = [
  ['confirmed', 'Order confirmed', 'Your store has your order'],
  ['packing', 'Packing your items', 'Freshly picked and packed'],
  ['on_the_way', 'On the way', 'Your delivery partner is riding over'],
  ['delivered', 'Delivered', 'Delivered to your door'],
] as const;

export function order(status: Order['status'], overrides: Partial<Order> = {}): Order {
  const reached = status === 'cancelled' ? 1 : STEPS.findIndex(([s]) => s === status) + 1;
  const c = cart([line(apple, 2)]);
  return {
    id: 'ord_1',
    number: 'MNT-445194',
    app: 'minutely',
    status,
    statusLabel: STEPS[Math.max(0, reached - 1)]![1],
    items: [{ id: 'ol1', productId: apple.id, name: apple.name, art: apple.art, quantity: 2, unitPrice: 189, lineTotal: 378, optionsLabel: null, isVeg: true }],
    bill: c.bill,
    coupon: null,
    address: home,
    payment: { kind: 'upi', label: 'UPI · riya@okaxis.example' },
    instructions: null,
    timeline: STEPS.map(([s, label, description], i) => ({ status: s, label, description, at: i < reached ? '2026-11-01T10:00:00.000Z' : null, done: i < reached })),
    tracking: {
      route: [
        { x: 300, y: 300 },
        { x: 300, y: 500 },
        { x: 400, y: 500 },
      ],
      origin: { label: 'Minutely Lake View', point: { x: 300, y: 300 }, art: 'shopping-trolley' },
      destination: { label: 'Home', point: { x: 400, y: 500 } },
      progress: status === 'on_the_way' ? 0.5 : status === 'delivered' ? 1 : null,
      riderPosition: status === 'on_the_way' ? { x: 300, y: 450 } : null,
    },
    rider: { name: 'Farhan Ali', phone: '+91 90000 00000', vehicle: 'Electric scooter', rating: 4.9, avatar: 'man' },
    restaurant: null,
    placedAt: '2026-11-01T10:00:00.000Z',
    etaAt: '2026-11-01T10:09:00.000Z',
    etaMinutes: 9,
    deliveredAt: status === 'delivered' ? '2026-11-01T10:07:40.000Z' : null,
    cancelledAt: null,
    rating: null,
    returns: [],
    canCancel: false,
    canRate: false,
    canReturn: false,
    ...overrides,
  };
}
