/**
 * Builds the full seed catalog: regions, areas, restaurants (one branch of a
 * brand per area), menus and coupons. Deterministic: same output every run.
 */
import type { Area, Coupon, MenuCategory, MenuItem, Region, Restaurant } from '@quickbite/core';
import { BRANDS, type SeedBrand } from './brands.ts';
import { coverImageUrl, dishImageUrl } from './images.ts';

export const REGIONS: Region[] = [
  {
    id: 'IN',
    name: 'India',
    currency: 'INR',
    locale: 'en-IN',
    timezone: 'Asia/Kolkata',
    paymentProvider: 'razorpay',
    platformFee: 500,
    foodTaxBps: 500,
    feeTaxBps: 1800,
    deliveryFeeBands: [
      { upToKm: 3, fee: 2500 },
      { upToKm: 6, fee: 4000 },
      { upToKm: 8, fee: 5500 },
    ],
  },
];

export const AREAS: Area[] = [
  {
    id: 'blr-koramangala',
    name: 'Koramangala',
    city: 'Bengaluru',
    regionId: 'IN',
    lat: 12.9352,
    lng: 77.6245,
  },
  {
    id: 'blr-indiranagar',
    name: 'Indiranagar',
    city: 'Bengaluru',
    regionId: 'IN',
    lat: 12.9719,
    lng: 77.6412,
  },
  {
    id: 'blr-hsr-layout',
    name: 'HSR Layout',
    city: 'Bengaluru',
    regionId: 'IN',
    lat: 12.9116,
    lng: 77.6474,
  },
  {
    id: 'blr-whitefield',
    name: 'Whitefield',
    city: 'Bengaluru',
    regionId: 'IN',
    lat: 12.9698,
    lng: 77.75,
  },
  {
    id: 'blr-jayanagar',
    name: 'Jayanagar',
    city: 'Bengaluru',
    regionId: 'IN',
    lat: 12.9308,
    lng: 77.5838,
  },
  {
    id: 'mum-bandra-west',
    name: 'Bandra West',
    city: 'Mumbai',
    regionId: 'IN',
    lat: 19.0596,
    lng: 72.8295,
  },
  {
    id: 'mum-andheri-west',
    name: 'Andheri West',
    city: 'Mumbai',
    regionId: 'IN',
    lat: 19.1363,
    lng: 72.8277,
  },
  { id: 'mum-powai', name: 'Powai', city: 'Mumbai', regionId: 'IN', lat: 19.1176, lng: 72.906 },
  {
    id: 'mum-lower-parel',
    name: 'Lower Parel',
    city: 'Mumbai',
    regionId: 'IN',
    lat: 18.9953,
    lng: 72.8302,
  },
  {
    id: 'del-connaught-place',
    name: 'Connaught Place',
    city: 'New Delhi',
    regionId: 'IN',
    lat: 28.6315,
    lng: 77.2167,
  },
  {
    id: 'del-hauz-khas',
    name: 'Hauz Khas',
    city: 'New Delhi',
    regionId: 'IN',
    lat: 28.5494,
    lng: 77.2001,
  },
  { id: 'del-saket', name: 'Saket', city: 'New Delhi', regionId: 'IN', lat: 28.5245, lng: 77.2066 },
  {
    id: 'ggn-cyber-city',
    name: 'Cyber City',
    city: 'Gurugram',
    regionId: 'IN',
    lat: 28.495,
    lng: 77.0895,
  },
];

const rupees = (r: number) => Math.round(r * 100);

/** Small deterministic hash → [0, 1). Keeps the seed stable between runs. */
function unit(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10_000) / 10_000;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function brandOffer(brand: SeedBrand): Restaurant['offer'] {
  const c = brand.coupon;
  if (!c) return null;
  if (c.type === 'percent') {
    return {
      headline: `${c.value}% OFF`,
      subline: c.maxDiscount ? `UPTO ₹${c.maxDiscount}` : `ABOVE ₹${c.minOrder}`,
      couponCode: c.code,
    };
  }
  return { headline: `₹${c.value} OFF`, subline: `ABOVE ₹${c.minOrder}`, couponCode: c.code };
}

export const PLATFORM_COUPONS: Coupon[] = [
  {
    code: 'WELCOME50',
    title: '50% off on your first order',
    description: 'Get 50% off up to ₹100 on orders above ₹199. Valid once per customer.',
    type: 'percent',
    value: 5000,
    maxDiscount: rupees(100),
    minOrder: rupees(199),
    brandId: null,
    regionId: 'IN',
    validFrom: '2025-01-01T00:00:00Z',
    validTo: '2030-12-31T23:59:59Z',
    perUserLimit: 1,
    active: true,
  },
  {
    code: 'FREEDEL',
    title: 'Free delivery',
    description: 'Free delivery on orders above ₹299.',
    type: 'free_delivery',
    value: 0,
    maxDiscount: null,
    minOrder: rupees(299),
    brandId: null,
    regionId: 'IN',
    validFrom: '2025-01-01T00:00:00Z',
    validTo: '2030-12-31T23:59:59Z',
    perUserLimit: null,
    active: true,
  },
  {
    code: 'FLAT75',
    title: 'Flat ₹75 off',
    description: 'Flat ₹75 off on orders above ₹399.',
    type: 'flat',
    value: rupees(75),
    maxDiscount: null,
    minOrder: rupees(399),
    brandId: null,
    regionId: 'IN',
    validFrom: '2025-01-01T00:00:00Z',
    validTo: '2030-12-31T23:59:59Z',
    perUserLimit: null,
    active: true,
  },
  {
    code: 'PARTY20',
    title: '20% off on party orders',
    description: '20% off up to ₹200 on orders above ₹999.',
    type: 'percent',
    value: 2000,
    maxDiscount: rupees(200),
    minOrder: rupees(999),
    brandId: null,
    regionId: 'IN',
    validFrom: '2025-01-01T00:00:00Z',
    validTo: '2030-12-31T23:59:59Z',
    perUserLimit: null,
    active: true,
  },
];

export interface Catalog {
  regions: Region[];
  areas: Area[];
  restaurants: Restaurant[];
  categories: MenuCategory[];
  items: MenuItem[];
  coupons: Coupon[];
}

export function buildCatalog(): Catalog {
  const restaurants: Restaurant[] = [];
  const categories: MenuCategory[] = [];
  const items: MenuItem[] = [];

  for (const area of AREAS) {
    for (const brand of BRANDS) {
      const seed = `${brand.id}@${area.id}`;
      // About 80% of brands have a branch in each area.
      if (unit(`${seed}:present`) > 0.8) continue;

      const id = `${brand.id}--${area.id}`;
      const angle = unit(`${seed}:angle`) * Math.PI * 2;
      const km = 0.4 + unit(`${seed}:dist`) * 2.4;
      const lat = area.lat + (Math.sin(angle) * km) / 111;
      const lng = area.lng + (Math.cos(angle) * km) / (111 * Math.cos((area.lat * Math.PI) / 180));
      const travel = Math.round(km * 4);
      const deliveryTimeMin = Math.max(15, Math.round((brand.prepMinutes + travel) / 5) * 5);
      const rating = Math.min(
        4.9,
        Math.max(3.5, Math.round((brand.rating + (unit(`${seed}:rating`) - 0.5) * 0.4) * 10) / 10),
      );

      restaurants.push({
        id,
        brandId: brand.id,
        slug: `${brand.id}-${slugify(area.name)}`,
        name: brand.name,
        imageUrl: coverImageUrl(brand.id),
        cuisines: brand.cuisines,
        rating,
        ratingCount: Math.round(brand.ratingCount * (0.15 + unit(`${seed}:count`) * 0.35)),
        costForTwo: rupees(brand.costForTwo),
        deliveryTimeMin,
        deliveryTimeMax: deliveryTimeMin + 5,
        isPureVeg: brand.pureVeg,
        // A few branches are closed so the "closed" state is visible in demos.
        isOpen: unit(`${seed}:open`) > 0.06,
        areaIds: [area.id],
        regionId: area.regionId,
        locality: area.name,
        offer: brandOffer(brand),
        isPromoted: brand.promoted ?? false,
        lat,
        lng,
      });

      brand.menu.forEach((category, ci) => {
        const categoryId = `${id}:${slugify(category.name)}`;
        categories.push({ id: categoryId, restaurantId: id, name: category.name, sortOrder: ci });
        for (const item of category.items) {
          const itemId = `${id}:${slugify(item.name)}`;
          items.push({
            id: itemId,
            restaurantId: id,
            categoryId,
            name: item.name,
            description: item.description,
            price: rupees(item.price),
            isVeg: item.veg,
            imageUrl: item.image ? dishImageUrl(item.image) : null,
            isAvailable: unit(`${itemId}:available`) > 0.04,
            isBestseller: item.bestseller ?? false,
            tags: item.tags,
          });
        }
      });
    }
  }

  const brandCoupons: Coupon[] = BRANDS.filter((b) => b.coupon).map((b) => {
    const c = b.coupon!;
    return {
      code: c.code,
      title:
        c.type === 'percent' ? `${c.value}% off at ${b.name}` : `Flat ₹${c.value} off at ${b.name}`,
      description:
        c.type === 'percent'
          ? `${c.value}% off${c.maxDiscount ? ` up to ₹${c.maxDiscount}` : ''} on orders above ₹${c.minOrder}.`
          : `Flat ₹${c.value} off on orders above ₹${c.minOrder}.`,
      type: c.type,
      value: c.type === 'percent' ? c.value * 100 : rupees(c.value),
      maxDiscount: c.maxDiscount === null ? null : rupees(c.maxDiscount),
      minOrder: rupees(c.minOrder),
      brandId: b.id,
      regionId: 'IN',
      validFrom: '2025-01-01T00:00:00Z',
      validTo: '2030-12-31T23:59:59Z',
      perUserLimit: null,
      active: true,
    };
  });

  return {
    regions: REGIONS,
    areas: AREAS,
    restaurants,
    categories,
    items,
    coupons: [...PLATFORM_COUPONS, ...brandCoupons],
  };
}

/** Cuisine shortcuts for the home page "What's on your mind?" row. */
export const CUISINE_SHORTCUTS: {
  label: string;
  cuisine: string;
  image: Parameters<typeof dishImageUrl>[0];
}[] = [
  { label: 'Biryani', cuisine: 'Biryani', image: 'biryani-chicken' },
  { label: 'Pizzas', cuisine: 'Pizzas', image: 'pizza-margherita' },
  { label: 'South Indian', cuisine: 'South Indian', image: 'masala-dosa' },
  { label: 'Burgers', cuisine: 'Burgers', image: 'burger-classic' },
  { label: 'North Indian', cuisine: 'North Indian', image: 'butter-chicken' },
  { label: 'Chinese', cuisine: 'Chinese', image: 'hakka-noodles' },
  { label: 'Momos', cuisine: 'Momos', image: 'momos-steamed' },
  { label: 'Rolls', cuisine: 'Rolls', image: 'roll-chicken' },
  { label: 'Chaat', cuisine: 'Chaat', image: 'pani-puri' },
  { label: 'Desserts', cuisine: 'Desserts', image: 'sundae' },
  { label: 'Healthy', cuisine: 'Healthy Food', image: 'salad-chicken' },
  { label: 'Kebabs', cuisine: 'Kebabs', image: 'seekh-kebab' },
  { label: 'Thali', cuisine: 'Thali', image: 'thali' },
  { label: 'Cafe', cuisine: 'Cafe', image: 'latte' },
  { label: 'Seafood', cuisine: 'Seafood', image: 'fish-curry' },
];
