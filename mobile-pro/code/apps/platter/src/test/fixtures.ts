import type { Address, Cart, CartLine, MenuItem, Order, RestaurantSummary } from '@pro/api';

export const restaurant: RestaurantSummary = {
  id: 'r-01',
  name: 'Saffron Courtyard',
  art: 'curry-and-rice',
  tone: 'peach',
  cuisines: ['North Indian', 'Mughlai'],
  rating: 4.5,
  ratingCount: 12840,
  deliveryTime: { min: 22, max: 29 },
  costForTwo: 800,
  distanceKm: 2.4,
  locality: 'Old Market',
  isPureVeg: false,
  offer: '50% OFF up to ₹100',
  isPromoted: true,
  isOpen: true,
  tags: [],
};

export const butterChicken: MenuItem = {
  id: 'i-butter',
  restaurantId: 'r-01',
  categoryId: 'c-main',
  name: 'Butter chicken',
  description: 'Tandoor-roasted chicken in a velvety tomato gravy.',
  price: 480,
  isVeg: false,
  isBestseller: true,
  spiceLevel: 1,
  rating: 4.4,
  ratingCount: 1817,
  art: 'curry-and-rice',
  isAvailable: true,
  customizations: [
    {
      id: 'portion',
      name: 'Portion',
      kind: 'single',
      required: true,
      max: null,
      options: [
        { id: 'half', name: 'Half', price: 0, isVeg: true, isDefault: true },
        { id: 'full', name: 'Full', price: 290, isVeg: true, isDefault: false },
      ],
    },
    {
      id: 'addons',
      name: 'Add-ons',
      kind: 'multiple',
      required: false,
      max: 2,
      options: [
        { id: 'naan', name: 'Butter naan', price: 60, isVeg: true, isDefault: false },
        { id: 'rice', name: 'Jeera rice', price: 90, isVeg: true, isDefault: false },
        { id: 'raita', name: 'Raita', price: 40, isVeg: true, isDefault: false },
      ],
    },
  ],
};

export const dalMakhani: MenuItem = {
  ...butterChicken,
  id: 'i-dal',
  name: 'Dal makhani',
  description: 'Black lentils slow-cooked overnight.',
  price: 320,
  isVeg: true,
  isBestseller: false,
  art: 'shallow-pan-of-food',
  customizations: [],
};

export function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    id: 'l1',
    productId: dalMakhani.id,
    name: dalMakhani.name,
    art: dalMakhani.art,
    tone: 'peach',
    unitPrice: 320,
    mrp: null,
    quantity: 1,
    lineTotal: 320,
    options: [],
    optionsLabel: null,
    unit: null,
    isVeg: true,
    maxQuantity: 20,
    inStock: true,
    savedForLater: false,
    ...overrides,
  };
}

export function cart(items: CartLine[] = [], overrides: Partial<Cart> = {}): Cart {
  const itemTotal = items.reduce((s, l) => s + l.lineTotal, 0);
  const empty = itemTotal === 0;
  return {
    app: 'platter',
    items,
    savedForLater: [],
    itemCount: items.reduce((s, l) => s + l.quantity, 0),
    coupon: null,
    tip: 0,
    bill: {
      itemTotal,
      mrpTotal: itemTotal,
      deliveryFee: empty ? 0 : 33,
      deliveryFeeWaived: 0,
      platformFee: empty ? 0 : 6,
      handlingFee: 0,
      smallCartFee: 0,
      taxes: Math.round(itemTotal * 0.05 * 100) / 100,
      couponDiscount: 0,
      tip: 0,
      total: empty ? 0 : itemTotal + 39 + Math.round(itemTotal * 0.05 * 100) / 100,
      savings: 0,
    },
    restaurant: empty ? null : restaurant,
    amountToFreeDelivery: null,
    ...overrides,
  };
}

export const home: Address = {
  id: 'addr_home',
  label: 'Home',
  recipient: 'Riya Kapoor',
  line1: 'Flat 3B, Seabreeze Apartments',
  line2: '12 Lake View Road',
  landmark: 'Opposite the boat club',
  locality: 'Lake View',
  city: 'Northbay',
  pincode: '560101',
  location: { x: 400, y: 500 },
  isDefault: true,
};

export const work: Address = { ...home, id: 'addr_work', label: 'Work', line1: 'Floor 4, Tidewater Tech Park', line2: '88 Harbour Road', isDefault: false };

const STEPS = [
  ['confirmed', 'Order confirmed', 'The restaurant has accepted your order'],
  ['preparing', 'Preparing your food', 'The kitchen is cooking it fresh'],
  ['picked_up', 'Picked up', 'Your rider has collected the order'],
  ['on_the_way', 'On the way', 'Your rider is heading to you'],
  ['delivered', 'Delivered', 'Enjoy your meal!'],
] as const;

export function order(status: Order['status'], overrides: Partial<Order> = {}): Order {
  const reached = status === 'cancelled' ? 1 : STEPS.findIndex(([s]) => s === status) + 1;
  return {
    id: 'ord_1',
    number: 'PLT-123456',
    app: 'platter',
    status,
    statusLabel: status,
    items: [
      { id: 'ol1', productId: dalMakhani.id, name: 'Dal makhani', art: 'shallow-pan-of-food', quantity: 2, unitPrice: 320, lineTotal: 640, optionsLabel: null, isVeg: true },
    ],
    bill: cart([line({ quantity: 2, lineTotal: 640 })]).bill,
    coupon: null,
    address: home,
    payment: { kind: 'upi', label: 'UPI · riya@okaxis.example' },
    instructions: null,
    timeline: STEPS.map(([s, label, description], i) => ({
      status: s,
      label,
      description,
      at: i < reached ? '2026-11-01T14:00:00.000Z' : null,
      done: i < reached,
    })),
    tracking: {
      route: [
        { x: 200, y: 300 },
        { x: 400, y: 300 },
        { x: 400, y: 500 },
      ],
      origin: { label: 'Saffron Courtyard', point: { x: 200, y: 300 }, art: 'curry-and-rice' },
      destination: { label: 'Home', point: { x: 400, y: 500 } },
      progress: status === 'on_the_way' ? 0.4 : status === 'delivered' ? 1 : null,
      riderPosition: status === 'on_the_way' ? { x: 360, y: 300 } : null,
    },
    rider: { name: 'Arjun Mehta', phone: '+91 90000 00000', vehicle: 'Scooter · NB 04 2211', rating: 4.8, avatar: 'man' },
    restaurant,
    placedAt: '2026-11-01T14:00:00.000Z',
    etaAt: '2026-11-01T14:30:00.000Z',
    etaMinutes: 12,
    deliveredAt: status === 'delivered' ? '2026-11-01T14:28:00.000Z' : null,
    cancelledAt: null,
    rating: null,
    returns: [],
    canCancel: status === 'confirmed',
    canRate: status === 'delivered',
    canReturn: false,
    ...overrides,
  };
}
