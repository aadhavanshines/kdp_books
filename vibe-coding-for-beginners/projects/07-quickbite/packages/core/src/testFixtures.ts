import type { Coupon, Region, Restaurant } from './types';

export const india: Region = {
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
};

export function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    code: 'WELCOME50',
    title: '50% off',
    description: '50% off up to ₹100',
    type: 'percent',
    value: 5000,
    maxDiscount: 10000,
    minOrder: 19900,
    brandId: null,
    regionId: 'IN',
    validFrom: '2020-01-01T00:00:00Z',
    validTo: '2099-01-01T00:00:00Z',
    perUserLimit: 1,
    active: true,
    ...overrides,
  };
}

export function restaurant(overrides: Partial<Restaurant> = {}): Restaurant {
  return {
    id: 'r1',
    brandId: 'b1',
    slug: 'r1',
    name: 'Test Kitchen',
    imageUrl: '/x.webp',
    cuisines: ['North Indian'],
    rating: 4.2,
    ratingCount: 1000,
    costForTwo: 40000,
    deliveryTimeMin: 25,
    deliveryTimeMax: 30,
    isPureVeg: false,
    isOpen: true,
    areaIds: ['a1'],
    regionId: 'IN',
    locality: 'Koramangala',
    offer: null,
    lat: 12.93,
    lng: 77.62,
    ...overrides,
  };
}
