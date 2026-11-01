import { beforeAll, describe, expect, it } from 'vitest';
import type {
  CartlyHome,
  DeliveryEstimate,
  GroceryItem,
  GroceryItemDetail,
  MinutelyHome,
  PlatterHome,
  PlatterSearchResult,
  Product,
  ProductListResponse,
  ProductSummary,
  Restaurant,
  RestaurantSummary,
  ReviewPage,
  SearchSuggestion,
} from '@pro/api/types';

import { createHarness, type Harness } from '../test/harness';

let h: Harness;
let token: string;
beforeAll(async () => {
  h = createHarness();
  token = await h.login();
});

describe('Platter', () => {
  it('serves the home screen', async () => {
    const home = await h.json<PlatterHome>('GET', '/platter/home');
    expect(home.banners.length).toBeGreaterThan(0);
    expect(home.cuisines.length).toBeGreaterThanOrEqual(12);
    expect(home.restaurants).toHaveLength(24);
  });

  it('filters by rating, pure veg, offers and cuisine', async () => {
    const top = await h.json<RestaurantSummary[]>('GET', '/platter/restaurants?minRating=4.5');
    expect(top.length).toBeGreaterThan(0);
    expect(top.every((r) => r.rating >= 4.5)).toBe(true);
    const veg = await h.json<RestaurantSummary[]>('GET', '/platter/restaurants?veg=true&offers=1');
    expect(veg.every((r) => r.isPureVeg && r.offer)).toBe(true);
    const biryani = await h.json<RestaurantSummary[]>('GET', '/platter/restaurants?cuisine=biryani');
    expect(biryani.length).toBeGreaterThanOrEqual(2);
    const fast = await h.json<RestaurantSummary[]>('GET', '/platter/restaurants?fast=true&sort=delivery_time');
    expect(fast.every((r) => r.deliveryTime.max <= 30)).toBe(true);
    expect(fast.map((r) => r.deliveryTime.min)).toEqual([...fast.map((r) => r.deliveryTime.min)].sort((a, b) => a - b));
  });

  it('serves a restaurant with a Recommended section and customizations', async () => {
    const r = await h.json<Restaurant>('GET', '/platter/restaurants/r-01');
    expect(r.menu[0]!.name).toBe('Recommended');
    expect(r.menu.flatMap((c) => c.items).some((i) => i.customizations.length > 0)).toBe(true);
    expect(r.offers.length).toBeGreaterThan(0);
  });

  it('measures distance from the signed-in user default address', async () => {
    const anon = await h.json<Restaurant>('GET', '/platter/restaurants/r-05');
    const mine = await h.json<Restaurant>('GET', '/platter/restaurants/r-05', { token });
    expect(mine.distanceKm).toBe(anon.distanceKm); // Riya's home is the default origin.
  });

  it('searches restaurants and dishes', async () => {
    const res = await h.json<PlatterSearchResult>('GET', '/platter/search?q=paneer');
    expect(res.dishes.length).toBeGreaterThan(0);
    expect(res.dishes[0]!.restaurantName).toBeTruthy();
  });

  it('404s an unknown restaurant', async () => {
    await h.json('GET', '/platter/restaurants/r-99', { status: 404 });
  });
});

describe('Cartly', () => {
  it('serves home with deals, countdown and recently viewed', async () => {
    const home = await h.json<CartlyHome>('GET', '/cartly/home', { token });
    expect(home.deals.length).toBe(8);
    expect(Date.parse(home.dealsEndAt)).toBeGreaterThan(h.now());
    expect(home.topPicks.length).toBeGreaterThan(0);
    expect(home.recentlyViewed.length).toBeGreaterThan(0);
  });

  it('lists, filters, sorts and pages products with facets', async () => {
    const all = await h.json<ProductListResponse>('GET', '/cartly/products?pageSize=50');
    expect(all.total).toBe(60);
    expect(all.hasMore).toBe(true);
    const brand = all.facets.brands[0]!.name;
    const byBrand = await h.json<ProductListResponse>('GET', `/cartly/products?brand=${encodeURIComponent(brand)}&sort=price_asc`);
    expect(byBrand.items.every((p) => p.brand === brand)).toBe(true);
    expect(byBrand.items.map((p) => p.price)).toEqual([...byBrand.items.map((p) => p.price)].sort((a, b) => a - b));
    const cheap = await h.json<ProductListResponse>('GET', '/cartly/products?maxPrice=1000&minRating=4&minDiscount=20');
    expect(cheap.items.every((p) => p.price <= 1000 && p.rating >= 4 && p.discountPercent >= 20)).toBe(true);
    const page2 = await h.json<ProductListResponse>('GET', '/cartly/products?page=2&pageSize=20');
    expect(page2.items).toHaveLength(20);
  });

  it('serves product detail and records it as recently viewed', async () => {
    const p = await h.json<Product>('GET', '/cartly/products/p-01', { token });
    expect(p.gallery.length).toBeGreaterThan(0);
    expect(p.ratingSummary.breakdown.reduce((s, b) => s + b.count, 0)).toBe(p.ratingCount);
    expect(p.topReviews.length).toBeGreaterThan(0);
    const recent = await h.json<ProductSummary[]>('GET', '/cartly/recently-viewed', { token });
    expect(recent[0]!.id).toBe('p-01');
  });

  it('pages reviews', async () => {
    const page = await h.json<ReviewPage>('GET', '/cartly/products/p-02/reviews?pageSize=3&sort=recent');
    expect(page.items.length).toBeLessThanOrEqual(3);
    expect(page.total).toBeGreaterThanOrEqual(5);
  });

  it('suggests searches', async () => {
    const s = await h.json<SearchSuggestion[]>('GET', '/cartly/search/suggestions?q=sh');
    expect(s[0]).toEqual({ text: 'sh', kind: 'query', id: null });
    expect(s.length).toBeGreaterThan(1);
  });

  it('estimates delivery by pincode', async () => {
    const local = await h.json<DeliveryEstimate>('GET', '/cartly/delivery-estimate?pincode=560101&productId=p-01');
    expect(local.serviceable).toBe(true);
    expect(local.label).toMatch(/^Delivery by/);
    const bad = await h.json<DeliveryEstimate>('GET', '/cartly/delivery-estimate?pincode=12');
    expect(bad.serviceable).toBe(false);
  });

  it('adds and removes wishlist items', async () => {
    const added = await h.json<ProductSummary>('PUT', '/cartly/wishlist/p-10', { token });
    expect(added.isWishlisted).toBe(true);
    const list = await h.json<ProductSummary[]>('GET', '/cartly/wishlist', { token });
    expect(list.map((p) => p.id)).toContain('p-10');
    const removed = await h.json<ProductSummary>('DELETE', '/cartly/wishlist/p-10', { token });
    expect(removed.isWishlisted).toBe(false);
    expect((await h.request('PUT', '/cartly/wishlist/p-10')).status).toBe(401);
  });
});

describe('Minutely', () => {
  it('serves home with ETA, categories and rails', async () => {
    const home = await h.json<MinutelyHome>('GET', '/minutely/home', { token });
    expect(home.etaMinutes).toBeGreaterThanOrEqual(6);
    expect(home.etaMinutes).toBeLessThanOrEqual(15);
    expect(home.categories).toHaveLength(12);
    expect(home.rails.map((r) => r.id)).toEqual(expect.arrayContaining(['fresh-fruits', 'dairy', 'snacks']));
    expect(home.rails.every((r) => r.items.length > 0)).toBe(true);
  });

  it('lists a category and sorts by price', async () => {
    const items = await h.json<GroceryItem[]>('GET', '/minutely/products?category=fruits&sort=price_asc');
    expect(items).toHaveLength(10);
    expect(items.map((i) => i.price)).toEqual([...items.map((i) => i.price)].sort((a, b) => a - b));
  });

  it('serves item detail with similar items', async () => {
    const item = await h.json<GroceryItemDetail>('GET', '/minutely/products/g-001');
    expect(item.highlights.length).toBeGreaterThan(0);
    expect(item.similar.every((s) => s.categoryId === item.categoryId)).toBe(true);
  });
});
