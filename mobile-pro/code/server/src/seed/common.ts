import type { ArtName, ArtTone, CommerceApp, CouponKind, MapPoint } from '@pro/api/types';

/** The demo customer every app signs in as with phone 9876543210 and OTP 123456. */
export const DEMO_USER = {
  id: 'u_riya',
  phone: '9876543210',
  name: 'Riya Kapoor',
  email: 'riya.kapoor@northbay.example',
  handle: 'riya.kapoor',
};

export interface SeedAddress {
  id: string;
  label: string;
  recipient: string;
  line1: string;
  line2: string;
  landmark: string | null;
  locality: string;
  pincode: string;
  location: MapPoint;
  isDefault: boolean;
}

export const demoAddresses: SeedAddress[] = [
  {
    id: 'addr_home',
    label: 'Home',
    recipient: 'Riya Kapoor',
    line1: 'Flat 3B, Seabreeze Apartments',
    line2: '12 Lake View Road',
    landmark: 'Opposite the boat club',
    locality: 'Lake View',
    pincode: '560101',
    location: { x: 400, y: 500 },
    isDefault: true,
  },
  {
    id: 'addr_work',
    label: 'Work',
    recipient: 'Riya Kapoor',
    line1: 'Floor 4, Tidewater Tech Park',
    line2: '88 Harbour Road',
    landmark: 'Next to the ferry terminal',
    locality: 'Bayfront',
    pincode: '560107',
    location: { x: 600, y: 200 },
    isDefault: false,
  },
  {
    id: 'addr_parents',
    label: "Mum's place",
    recipient: 'Anita Kapoor',
    line1: '7 Hillcrest Lane',
    line2: 'Hillcrest',
    landmark: 'Behind the water tower',
    locality: 'Hillcrest',
    pincode: '560108',
    location: { x: 800, y: 800 },
    isDefault: false,
  },
];

export interface SeedBanner {
  id: string;
  app: 'platter' | 'cartly' | 'minutely';
  title: string;
  subtitle: string;
  cta: string;
  art: ArtName;
  tone: ArtTone;
  link: string | null;
}

export const banners: SeedBanner[] = [
  { id: 'b-plt-1', app: 'platter', title: '50% OFF your first order', subtitle: 'Up to ₹100 with WELCOME50', cta: 'Order now', art: 'curry-and-rice', tone: 'ember', link: '/offers' },
  { id: 'b-plt-2', app: 'platter', title: 'Biryani weekend', subtitle: 'Slow-cooked dum biryanis from ₹249', cta: 'Explore', art: 'pot-of-food', tone: 'sunset', link: '/cuisine/biryani' },
  { id: 'b-plt-3', app: 'platter', title: 'Free delivery all day', subtitle: 'On orders above ₹199 with FREEDEL', cta: 'Grab it', art: 'motor-scooter', tone: 'aurora', link: '/offers' },
  { id: 'b-plt-4', app: 'platter', title: 'Late-night cravings', subtitle: 'Kitchens open till 3 am near you', cta: 'See all', art: 'hamburger', tone: 'night', link: '/collection/late-night' },
  { id: 'b-crt-1', app: 'cartly', title: 'The Big Bay Sale', subtitle: 'Up to 70% off on fashion and home', cta: 'Shop now', art: 'shopping-bags', tone: 'candy', link: '/sale' },
  { id: 'b-crt-2', app: 'cartly', title: 'New phones, new deals', subtitle: 'Extra ₹2,000 off on exchange', cta: 'Explore', art: 'mobile-phone', tone: 'ocean', link: '/category/mobiles' },
  { id: 'b-crt-3', app: 'cartly', title: 'Sound that moves you', subtitle: 'Headphones and speakers from ₹999', cta: 'Listen in', art: 'headphone', tone: 'dusk', link: '/category/electronics' },
  { id: 'b-crt-4', app: 'cartly', title: 'Gifts they will love', subtitle: 'Hand-picked under ₹999', cta: 'Find a gift', art: 'wrapped-present', tone: 'ember', link: '/gifts' },
  { id: 'b-mnt-1', app: 'minutely', title: 'Fresh fruits, 15% off', subtitle: 'Picked this morning, here in minutes', cta: 'Shop fruits', art: 'mango', tone: 'meadow', link: '/category/fruits' },
  { id: 'b-mnt-2', app: 'minutely', title: 'Breakfast in 9 minutes', subtitle: 'Milk, bread, eggs and more', cta: 'Order now', art: 'croissant', tone: 'sunset', link: '/category/dairy' },
  { id: 'b-mnt-3', app: 'minutely', title: 'Movie night sorted', subtitle: 'Chips, popcorn and cold drinks', cta: 'Stock up', art: 'popcorn', tone: 'night', link: '/category/snacks' },
  { id: 'b-mnt-4', app: 'minutely', title: '₹50 off with FRESH50', subtitle: 'On orders above ₹299', cta: 'Apply now', art: 'shopping-trolley', tone: 'aurora', link: '/offers' },
];

export interface SeedCoupon {
  code: string;
  app: CommerceApp;
  title: string;
  description: string;
  kind: CouponKind;
  value: number;
  maxDiscount: number | null;
  minOrder: number;
  restaurantId: string | null;
  /** Days from seeding until expiry. */
  validDays: number;
}

export const coupons: SeedCoupon[] = [
  { code: 'WELCOME50', app: 'platter', title: '50% OFF up to ₹100', description: 'On orders above ₹149. New-user favourite.', kind: 'percent', value: 50, maxDiscount: 100, minOrder: 149, restaurantId: null, validDays: 30 },
  { code: 'PLATTER125', app: 'platter', title: 'Flat ₹125 OFF', description: 'On orders above ₹499 from any restaurant.', kind: 'flat', value: 125, maxDiscount: null, minOrder: 499, restaurantId: null, validDays: 21 },
  { code: 'FREEDEL', app: 'platter', title: 'Free delivery', description: 'No delivery fee on orders above ₹199.', kind: 'free_delivery', value: 0, maxDiscount: null, minOrder: 199, restaurantId: null, validDays: 14 },
  { code: 'TRYNEW', app: 'platter', title: '20% OFF up to ₹80', description: 'Try something new: orders above ₹249.', kind: 'percent', value: 20, maxDiscount: 80, minOrder: 249, restaurantId: null, validDays: 10 },
  { code: 'FEAST60', app: 'platter', title: 'Flat ₹60 OFF at Saffron Courtyard', description: 'Partner offer on orders above ₹349.', kind: 'flat', value: 60, maxDiscount: null, minOrder: 349, restaurantId: 'r-01', validDays: 30 },
  { code: 'CARTLY10', app: 'cartly', title: '10% OFF up to ₹500', description: 'On orders above ₹999.', kind: 'percent', value: 10, maxDiscount: 500, minOrder: 999, restaurantId: null, validDays: 30 },
  { code: 'FIRSTBUY', app: 'cartly', title: 'Flat ₹200 OFF', description: 'On your first order above ₹1,499.', kind: 'flat', value: 200, maxDiscount: null, minOrder: 1499, restaurantId: null, validDays: 45 },
  { code: 'STYLE25', app: 'cartly', title: '25% OFF up to ₹400', description: 'Fashion and footwear above ₹1,199.', kind: 'percent', value: 25, maxDiscount: 400, minOrder: 1199, restaurantId: null, validDays: 14 },
  { code: 'SHIPFREE', app: 'cartly', title: 'Free delivery', description: 'Free delivery on any order above ₹199.', kind: 'free_delivery', value: 0, maxDiscount: null, minOrder: 199, restaurantId: null, validDays: 30 },
  { code: 'FRESH50', app: 'minutely', title: 'Flat ₹50 OFF', description: 'On orders above ₹299.', kind: 'flat', value: 50, maxDiscount: null, minOrder: 299, restaurantId: null, validDays: 30 },
  { code: 'MINUTE20', app: 'minutely', title: '20% OFF up to ₹75', description: 'On orders above ₹199.', kind: 'percent', value: 20, maxDiscount: 75, minOrder: 199, restaurantId: null, validDays: 14 },
  { code: 'FREEDROP', app: 'minutely', title: 'Free delivery', description: 'Skip the delivery fee on orders above ₹99.', kind: 'free_delivery', value: 0, maxDiscount: null, minOrder: 99, restaurantId: null, validDays: 30 },
];

export interface SeedRider {
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  avatar: ArtName;
}

/** Delivery partners. Phone numbers are fictional and not dialable (+91 00000 ...). */
export const riders: SeedRider[] = [
  { name: 'Suresh Kumar', phone: '+91 00000 41021', vehicle: 'Electric scooter · NB 04 EV 2231', rating: 4.8, avatar: 'man' },
  { name: 'Farhan Ali', phone: '+91 00000 41022', vehicle: 'Electric scooter · NB 02 EV 9014', rating: 4.9, avatar: 'man-curly-hair' },
  { name: 'Lakshmi Devi', phone: '+91 00000 41023', vehicle: 'Electric scooter · NB 07 EV 5520', rating: 4.9, avatar: 'woman' },
  { name: 'Joseph Mathew', phone: '+91 00000 41024', vehicle: 'Bicycle · Northbay Green Fleet', rating: 4.7, avatar: 'man' },
  { name: 'Priya Shetty', phone: '+91 00000 41025', vehicle: 'Electric scooter · NB 05 EV 3307', rating: 4.8, avatar: 'woman-curly-hair' },
  { name: 'Imran Sheikh', phone: '+91 00000 41026', vehicle: 'Motorbike · NB 01 AK 7781', rating: 4.6, avatar: 'man-curly-hair' },
];

/** Minutely dark stores. */
export const stores = [
  { id: 'store-lakeview', name: 'Minutely Lake View', locality: 'Lake View', location: { x: 300, y: 400 } },
  { id: 'store-cedar', name: 'Minutely Cedar Park', locality: 'Cedar Park', location: { x: 700, y: 400 } },
  { id: 'store-station', name: 'Minutely Station Square', locality: 'Station Square', location: { x: 400, y: 800 } },
];

/** Cartly reviewers (fictional). */
export const reviewers: { name: string; avatar: ArtName | null }[] = [
  { name: 'Aditya S.', avatar: 'man' },
  { name: 'Pooja R.', avatar: 'woman' },
  { name: 'Karthik N.', avatar: 'man-curly-hair' },
  { name: 'Sneha M.', avatar: 'woman-curly-hair' },
  { name: 'Rahul V.', avatar: null },
  { name: 'Divya K.', avatar: 'woman-red-hair' },
  { name: 'Mohammed A.', avatar: 'man' },
  { name: 'Lavanya P.', avatar: 'girl' },
  { name: 'Sandeep T.', avatar: null },
  { name: 'Nandini G.', avatar: 'woman' },
  { name: 'Harish B.', avatar: 'man-white-hair' },
  { name: 'Fatima Z.', avatar: 'woman-curly-hair' },
  { name: 'Ashwin R.', avatar: 'technologist' },
  { name: 'Geeta L.', avatar: null },
  { name: 'Vivek J.', avatar: 'boy' },
  { name: 'Rekha D.', avatar: 'woman' },
  { name: 'Siddharth P.', avatar: 'man' },
  { name: 'Aisha F.', avatar: 'girl' },
  { name: 'Manoj K.', avatar: null },
  { name: 'Shruti A.', avatar: 'woman-red-hair' },
  { name: 'Gopal I.', avatar: 'man-white-hair' },
  { name: 'Neha W.', avatar: 'woman-curly-hair' },
  { name: 'Tarun C.', avatar: 'man-curly-hair' },
  { name: 'Bhavna O.', avatar: null },
];

/** Bank and coupon lines shown under a product's price. */
export const productOffers = [
  { code: null, title: 'Bank offer', description: '10% instant discount on Northbay Bank credit cards, up to ₹1,500' },
  { code: 'CARTLY10', title: 'Coupon', description: 'Extra 10% off up to ₹500 on orders above ₹999' },
  { code: null, title: 'No-cost EMI', description: 'From ₹1,042 a month on orders above ₹3,000' },
  { code: null, title: 'Partner offer', description: 'Get ₹50 cashback on your first UPI payment' },
];
