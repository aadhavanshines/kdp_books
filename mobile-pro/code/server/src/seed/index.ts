import type { Address, ArtName, Bill, CommerceApp, OrderLine, OrderStatus, PaymentMethod } from '@pro/api/types';

import { getMeta, setMeta, type DB } from '../db';
import { TIME_COLUMNS } from '../db/schema';
import { distanceKm, streetRoute } from '../lib/geo';
import { computeBill, discountPercent } from '../lib/pricing';
import { createRng, type Rng } from '../lib/rng';
import { DAY, HOUR, MINUTE } from '../lib/time';
import { scheduleFor } from '../sim/schedule';
import {
  banners,
  coupons,
  DEMO_USER,
  demoAddresses,
  productOffers,
  reviewers,
  riders,
  stores,
} from './common';
import { buildCustomizations } from './customizations';
import { productCategories, products, reviewPools } from './data/cartly';
import { commentPool, conversations, demoFollows, highlights, lumoUsers, posts, stories } from './data/lumo';
import { groceries, groceryCategories } from './data/minutely';
import { cuisineTiles, menus, restaurants } from './data/platter';
import type { SeedProduct } from './data/types';
import { composeScene } from './scenes';

export { ratingBreakdown } from './breakdown';

export interface SeedOptions {
  now: number;
  /** PRNG seed; the same seed gives the same data. */
  seed?: number;
}

export interface SeedSummary {
  users: number;
  restaurants: number;
  menuItems: number;
  products: number;
  reviews: number;
  posts: number;
  stories: number;
  comments: number;
  groceries: number;
  groceryCategories: number;
  coupons: number;
  orders: number;
}

const userIdFor = (handle: string) => (handle === DEMO_USER.handle ? DEMO_USER.id : `u_${handle.replace(/[^a-z0-9]/g, '_')}`);

/** Wipes every table and fills the database with the Northbay demo data. */
export function seedDatabase(db: DB, { now, seed = 20261031 }: SeedOptions): SeedSummary {
  const rng = createRng(seed);
  const run = db.transaction(() => {
    clearAll(db);
    seedCommon(db, now);
    const menuItems = seedPlatter(db, rng);
    const reviewCount = seedCartly(db, rng, now);
    const lumo = seedLumo(db, rng, now);
    seedMinutely(db);
    const orders = seedHistory(db, rng, now);
    setMeta(db, 'seeded_at', String(now));
    setMeta(db, 'time_anchor', String(now));
    return {
      users: count(db, 'users'),
      restaurants: restaurants.length,
      menuItems,
      products: products.length,
      reviews: reviewCount,
      posts: lumo.posts,
      stories: lumo.stories,
      comments: lumo.comments,
      groceries: groceries.length,
      groceryCategories: groceryCategories.length,
      coupons: coupons.length,
      orders,
    };
  });
  return run();
}

const count = (db: DB, table: string) => (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;

function clearAll(db: DB) {
  db.pragma('foreign_keys = OFF');
  for (const table of [...Object.keys(TIME_COLUMNS), 'banners', 'cuisines', 'restaurants', 'menu_categories', 'menu_items',
    'product_categories', 'deals', 'post_tags', 'comment_likes', 'story_views', 'highlights', 'grocery_categories',
    'groceries', 'stores']) {
    db.prepare(`DELETE FROM ${table}`).run();
  }
  db.prepare("DELETE FROM meta WHERE key IN ('seeded_at', 'time_anchor')").run();
  db.pragma('foreign_keys = ON');
}

// ---------------------------------------------------------------- common

function seedCommon(db: DB, now: number) {
  const insertUser = db.prepare(
    `INSERT INTO users (id, phone, name, email, handle, avatar, bio, website, verified, created_at)
     VALUES (@id, @phone, @name, @email, @handle, @avatar, @bio, @website, @verified, @createdAt)`,
  );
  lumoUsers.forEach((u, i) => {
    const isDemo = u.handle === DEMO_USER.handle;
    insertUser.run({
      id: userIdFor(u.handle),
      phone: isDemo ? DEMO_USER.phone : `90000${String(10000 + i).slice(-5)}`,
      name: u.name,
      email: isDemo ? DEMO_USER.email : `${u.handle.replace(/[^a-z0-9]/g, '.')}@northbay.example`,
      handle: u.handle,
      avatar: u.avatar,
      bio: u.bio,
      website: u.website,
      verified: u.verified ? 1 : 0,
      createdAt: now - (400 - i * 7) * DAY,
    });
  });

  const insertAddress = db.prepare(
    `INSERT INTO addresses (id, user_id, label, recipient, line1, line2, landmark, locality, city, pincode, x, y, is_default, created_at)
     VALUES (@id, @userId, @label, @recipient, @line1, @line2, @landmark, @locality, 'Northbay', @pincode, @x, @y, @isDefault, @createdAt)`,
  );
  demoAddresses.forEach((a, i) =>
    insertAddress.run({
      ...a,
      userId: DEMO_USER.id,
      x: a.location.x,
      y: a.location.y,
      isDefault: a.isDefault ? 1 : 0,
      createdAt: now - (200 - i) * DAY,
    }),
  );

  const insertBanner = db.prepare(
    `INSERT INTO banners (id, app, title, subtitle, cta, art, tone, link, sort)
     VALUES (@id, @app, @title, @subtitle, @cta, @art, @tone, @link, @sort)`,
  );
  banners.forEach((b, i) => insertBanner.run({ ...b, sort: i }));

  const insertCoupon = db.prepare(
    `INSERT INTO coupons (code, app, title, description, kind, value, max_discount, min_order, restaurant_id, expires_at, first_order_only)
     VALUES (@code, @app, @title, @description, @kind, @value, @maxDiscount, @minOrder, @restaurantId, @expiresAt, @firstOrderOnly)`,
  );
  for (const c of coupons) {
    const { validDays, firstOrderOnly, ...rest } = c;
    insertCoupon.run({ ...rest, expiresAt: now + validDays * DAY, firstOrderOnly: firstOrderOnly ? 1 : 0 });
  }

  const insertStore = db.prepare('INSERT INTO stores (id, name, locality, x, y) VALUES (?, ?, ?, ?, ?)');
  for (const s of stores) insertStore.run(s.id, s.name, s.locality, s.location.x, s.location.y);
}

// ---------------------------------------------------------------- Platter

function seedPlatter(db: DB, rng: Rng): number {
  const insertCuisine = db.prepare('INSERT INTO cuisines (id, name, art, sort) VALUES (?, ?, ?, ?)');
  cuisineTiles.forEach((t, i) => insertCuisine.run(t.id, t.name, t.art, i));

  const insertRestaurant = db.prepare(
    `INSERT INTO restaurants (id, name, art, tone, cuisines_json, tiles_json, rating, rating_count, cost_for_two, pure_veg,
       offer, offers_json, locality, address, x, y, hours, promoted, tags_json, sort)
     VALUES (@id, @name, @art, @tone, @cuisines, @tiles, @rating, @ratingCount, @costForTwo, @pureVeg,
       @offer, @offers, @locality, @address, @x, @y, @hours, @promoted, @tags, @sort)`,
  );
  const insertCategory = db.prepare('INSERT INTO menu_categories (id, restaurant_id, name, sort) VALUES (?, ?, ?, ?)');
  const insertItem = db.prepare(
    `INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, veg, bestseller, spice, rating,
       rating_count, art, available, customizations_json, sort)
     VALUES (@id, @restaurantId, @categoryId, @name, @description, @price, @veg, @bestseller, @spice, @rating,
       @ratingCount, @art, @available, @customizations, @sort)`,
  );
  const menuByKey = new Map(menus.map((m) => [m.key, m]));
  const platterCoupons = coupons.filter((c) => c.app === 'platter');
  let itemCount = 0;

  restaurants.forEach((r, ri) => {
    const offers = [
      ...(r.offer ? [{ code: null, title: r.offer, description: 'Applied automatically at checkout' }] : []),
      ...platterCoupons
        .filter((c) => c.restaurantId == null || c.restaurantId === r.id)
        .map((c) => ({ code: c.code, title: c.title, description: c.description })),
    ];
    insertRestaurant.run({
      id: r.id,
      name: r.name,
      art: r.art,
      tone: r.tone,
      cuisines: JSON.stringify(r.cuisines),
      tiles: JSON.stringify(r.cuisineTiles),
      rating: r.rating,
      ratingCount: r.ratingCount,
      costForTwo: r.costForTwo,
      pureVeg: r.pureVeg ? 1 : 0,
      offer: r.offer,
      offers: JSON.stringify(offers),
      locality: r.locality,
      address: r.address,
      x: r.location.x,
      y: r.location.y,
      hours: r.hours,
      promoted: r.promoted ? 1 : 0,
      tags: JSON.stringify(r.tags),
      sort: ri,
    });

    // Merge the restaurant's menus; categories with the same name combine.
    const categories = new Map<string, { name: string; dishes: (typeof menus)[number]['categories'][number]['dishes'] }>();
    for (const key of r.menus) {
      const menu = menuByKey.get(key);
      if (!menu) throw new Error(`Restaurant ${r.id} uses unknown menu "${key}"`);
      for (const cat of menu.categories) {
        const existing = categories.get(cat.name);
        const dishes = r.pureVeg ? cat.dishes.filter((d) => d.veg) : cat.dishes;
        if (existing) {
          const names = new Set(existing.dishes.map((d) => d.name));
          existing.dishes.push(...dishes.filter((d) => !names.has(d.name)));
        } else {
          categories.set(cat.name, { name: cat.name, dishes: [...dishes] });
        }
      }
    }
    // Pricier restaurants charge a little more for the same dish.
    const factor = Math.min(1.3, Math.max(0.85, r.costForTwo / 650));
    let ci = 0;
    for (const cat of categories.values()) {
      if (cat.dishes.length === 0) continue;
      const categoryId = `${r.id}-c${ci + 1}`;
      insertCategory.run(categoryId, r.id, cat.name, ci);
      cat.dishes.forEach((d, di) => {
        const price = Math.max(29, Math.round((d.price * factor) / 5) * 5);
        const rated = rng.chance(0.75);
        insertItem.run({
          id: `${categoryId}-i${di + 1}`,
          restaurantId: r.id,
          categoryId,
          name: d.name,
          description: d.description,
          price,
          veg: d.veg ? 1 : 0,
          bestseller: d.bestseller ? 1 : 0,
          spice: d.spice ?? 0,
          rating: rated ? Math.round((3.7 + rng.next() * 1.1) * 10) / 10 : null,
          ratingCount: rated ? rng.int(12, d.bestseller ? 2400 : 640) : 0,
          art: d.art,
          available: rng.chance(0.97) ? 1 : 0,
          customizations: JSON.stringify(buildCustomizations(d.custom, price, d.veg)),
          sort: di,
        });
        itemCount++;
      });
      ci++;
    }
  });
  return itemCount;
}

// ---------------------------------------------------------------- Cartly

function variantsJson(p: SeedProduct) {
  const groups = [];
  if (p.variants?.colors?.length) {
    groups.push({
      kind: 'color',
      name: 'Colour',
      options: p.variants.colors.map((c, i) => ({
        id: c.label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        label: c.label,
        hex: c.hex,
        available: i < 3 || p.stock > 20,
        priceDelta: 0,
      })),
    });
  }
  if (p.variants?.storage?.length) {
    groups.push({
      kind: 'storage',
      name: 'Storage',
      options: p.variants.storage.map((s) => ({
        id: s.label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        label: s.label,
        hex: null,
        available: true,
        priceDelta: s.priceDelta,
      })),
    });
  }
  if (p.variants?.sizes?.length) {
    const sizes = p.variants.sizes;
    groups.push({
      kind: 'size',
      name: 'Size',
      options: sizes.map((s, i) => ({
        id: s.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        label: s,
        hex: null,
        // The largest size sells out first.
        available: !(i === sizes.length - 1 && p.stock < 40),
        priceDelta: 0,
      })),
    });
  }
  return JSON.stringify(groups);
}

function seedCartly(db: DB, rng: Rng, now: number): number {
  const insertCategory = db.prepare('INSERT INTO product_categories (id, name, art, tone, sort) VALUES (?, ?, ?, ?, ?)');
  productCategories.forEach((c, i) => insertCategory.run(c.id, c.name, c.art, c.tone, i));

  const insertProduct = db.prepare(
    `INSERT INTO products (id, title, brand, category_id, art, tone, gallery_json, price, mrp, rating, rating_count, badge,
       fast_delivery, description, highlights_json, specs_json, variants_json, offers_json, seller, return_days, warranty,
       stock, added_at)
     VALUES (@id, @title, @brand, @category, @art, @tone, @gallery, @price, @mrp, @rating, @ratingCount, @badge,
       @fastDelivery, @description, @highlights, @specs, @variants, @offers, @seller, @returnDays, @warranty,
       @stock, @addedAt)`,
  );
  const insertReview = db.prepare(
    `INSERT INTO reviews (id, product_id, author, avatar, rating, title, body, variant_label, verified, helpful, created_at)
     VALUES (@id, @productId, @author, @avatar, @rating, @title, @body, @variantLabel, @verified, @helpful, @createdAt)`,
  );
  const tones = ['peach', 'mint', 'sky', 'lilac', 'butter', 'rose', 'sand', 'aqua'] as const;
  const poolByCategory = new Map(reviewPools.map((p) => [p.category, p.reviews]));
  let reviewCount = 0;

  for (const p of products) {
    const gallery = [p.art, ...p.gallery.filter((a) => a !== p.art)].map((art, i) => ({
      art,
      tone: i === 0 ? p.tone : tones[(tones.indexOf(p.tone as (typeof tones)[number]) + i * 3 + 8) % tones.length]!,
    }));
    insertProduct.run({
      id: p.id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      art: p.art,
      tone: p.tone,
      gallery: JSON.stringify(gallery),
      price: p.price,
      mrp: p.mrp,
      rating: p.rating,
      ratingCount: p.ratingCount,
      badge: p.badge,
      fastDelivery: p.fastDelivery ? 1 : 0,
      description: p.description,
      highlights: JSON.stringify(p.highlights),
      specs: JSON.stringify(p.specs.map(([label, value]) => ({ label, value }))),
      variants: variantsJson(p),
      offers: JSON.stringify(rng.sample(productOffers, rng.int(2, 4))),
      seller: p.seller,
      returnDays: p.returnDays,
      warranty: p.warranty,
      stock: p.stock,
      addedAt: now - p.addedDaysAgo * DAY,
    });

    const pool = poolByCategory.get(p.category) ?? [];
    // Pick reviews that roughly follow the product's rating.
    const wanted = rng.int(5, 9);
    const sorted = rng.shuffle(pool).sort((a, b) => Math.abs(a.rating - p.rating) - Math.abs(b.rating - p.rating));
    const picked = [...sorted.slice(0, Math.max(0, wanted - 1)), ...rng.sample(sorted.slice(wanted - 1), 1)];
    const people = rng.sample(reviewers, picked.length);
    picked.forEach((r, i) => {
      const color = p.variants?.colors?.length ? rng.pick(p.variants.colors).label : null;
      const size = p.variants?.sizes?.length ? rng.pick(p.variants.sizes) : null;
      insertReview.run({
        id: `${p.id}-rv${i + 1}`,
        productId: p.id,
        author: people[i]!.name,
        avatar: people[i]!.avatar,
        rating: r.rating,
        title: r.title,
        body: r.body,
        variantLabel: [color && `Colour: ${color}`, size && `Size: ${size}`].filter(Boolean).join(', ') || null,
        verified: rng.chance(0.85) ? 1 : 0,
        helpful: rng.int(0, Math.min(400, Math.round(p.ratingCount / 40) + 6)),
        createdAt: now - rng.int(1, 140) * DAY - rng.int(0, 23) * HOUR,
      });
      reviewCount++;
    });
  }

  // Deals of the day: the deepest discounts, one per category first.
  const byDiscount = [...products].sort((a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp));
  const deals: SeedProduct[] = [];
  const seenCategories = new Set<string>();
  for (const p of byDiscount) {
    if (deals.length >= 8) break;
    if (!seenCategories.has(p.category)) {
      deals.push(p);
      seenCategories.add(p.category);
    }
  }
  for (const p of byDiscount) {
    if (deals.length >= 8) break;
    if (!deals.includes(p)) deals.push(p);
  }
  const insertDeal = db.prepare('INSERT INTO deals (product_id, claimed_percent, sort) VALUES (?, ?, ?)');
  deals.forEach((p, i) => insertDeal.run(p.id, rng.int(34, 93), i));

  const insertWish = db.prepare('INSERT INTO wishlist (user_id, product_id, created_at) VALUES (?, ?, ?)');
  for (const p of rng.sample(products, 5)) insertWish.run(DEMO_USER.id, p.id, now - rng.int(1, 30) * DAY);
  const insertViewed = db.prepare('INSERT INTO recently_viewed (user_id, product_id, viewed_at) VALUES (?, ?, ?)');
  rng.sample(products, 6).forEach((p, i) => insertViewed.run(DEMO_USER.id, p.id, now - (i + 1) * 3 * HOUR));
  return reviewCount;
}

// ---------------------------------------------------------------- Lumo

function seedLumo(db: DB, rng: Rng, now: number) {
  const handles = lumoUsers.map((u) => u.handle);
  const ids = handles.map(userIdFor);
  const demo = DEMO_USER.id;
  const others = ids.filter((id) => id !== demo);

  const insertFollow = db.prepare('INSERT OR IGNORE INTO follows (follower_id, followee_id, created_at) VALUES (?, ?, ?)');
  const followAt = () => now - rng.int(2, 300) * DAY;
  for (const h of demoFollows) insertFollow.run(demo, userIdFor(h), followAt());
  for (const id of others) {
    // Most people the demo user follows follow back; a few others do too.
    const followsDemo = demoFollows.map(userIdFor).includes(id) ? rng.chance(0.8) : rng.chance(0.35);
    // Recent follows, so the activity tab has some.
    if (followsDemo) insertFollow.run(id, demo, now - rng.int(1, 40) * DAY - rng.int(0, 23) * HOUR);
    for (const target of rng.sample(others.filter((o) => o !== id), rng.int(5, 12))) insertFollow.run(id, target, followAt());
  }

  const insertPost = db.prepare(
    `INSERT INTO posts (id, user_id, scene_json, filter, caption, location, base_likes, created_at)
     VALUES (@id, @userId, @scene, @filter, @caption, @location, @baseLikes, @createdAt)`,
  );
  const insertTag = db.prepare('INSERT OR IGNORE INTO post_tags (post_id, user_id) VALUES (?, ?)');
  const insertLike = db.prepare('INSERT OR IGNORE INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)');
  const insertSave = db.prepare('INSERT OR IGNORE INTO saves (post_id, user_id, created_at) VALUES (?, ?, ?)');
  const insertComment = db.prepare(
    'INSERT INTO comments (id, post_id, user_id, text, base_likes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  );
  const insertNotification = db.prepare(
    `INSERT INTO lumo_notifications (id, user_id, actor_id, kind, post_id, text, created_at, read)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const followed = new Set(demoFollows.map(userIdFor));
  let commentCount = 0;
  let notificationCount = 0;
  const notify = (actor: string, kind: string, postId: string | null, text: string, at: number) => {
    notificationCount++;
    insertNotification.run(`ln_${notificationCount}`, demo, actor, kind, postId, text, at, at < now - 2 * DAY ? 1 : 0);
  };

  posts.forEach((p, i) => {
    const postId = `post_${String(i + 1).padStart(3, '0')}`;
    const authorId = userIdFor(p.user);
    // Spread posts through the day instead of all at the same minute.
    const createdAt = now - p.daysAgo * DAY - rng.int(20, 20 * 60) * MINUTE;
    insertPost.run({
      id: postId,
      userId: authorId,
      scene: JSON.stringify(composeScene(p.tone, p.arts, rng)),
      filter: p.filter ?? 'normal',
      caption: p.caption,
      location: p.location,
      baseLikes: p.baseLikes,
      createdAt,
    });
    for (const h of p.tagged ?? []) insertTag.run(postId, userIdFor(h));

    const likers = rng.sample(ids.filter((id) => id !== authorId), rng.int(3, 14));
    if (authorId !== demo && followed.has(authorId) && rng.chance(0.35) && !likers.includes(demo)) likers.push(demo);
    for (const liker of likers) {
      const at = Math.min(now - MINUTE, createdAt + rng.int(1, 600) * MINUTE);
      insertLike.run(postId, liker, at);
      if (authorId === demo && liker !== demo) notify(liker, 'like', postId, 'liked your photo.', at);
    }
    if (authorId !== demo && rng.chance(0.07)) insertSave.run(postId, demo, createdAt + HOUR);

    const commenters = rng.sample(ids.filter((id) => id !== authorId), rng.int(1, 6));
    const texts = rng.sample(commentPool, commenters.length);
    commenters.forEach((c, ci) => {
      const at = Math.min(now - MINUTE, createdAt + rng.int(2, 900) * MINUTE);
      commentCount++;
      insertComment.run(`cm_${commentCount}`, postId, c, texts[ci]!, rng.int(0, 48), at);
      if (authorId === demo && c !== demo) notify(c, 'comment', postId, `commented: ${texts[ci]}`, at);
    });
  });

  for (const row of db.prepare('SELECT follower_id, created_at FROM follows WHERE followee_id = ?').all(demo) as {
    follower_id: string;
    created_at: number;
  }[]) {
    notify(row.follower_id, 'follow', null, 'started following you.', row.created_at);
  }

  const insertStory = db.prepare('INSERT INTO stories (id, user_id, scene_json, caption, created_at) VALUES (?, ?, ?, ?, ?)');
  const insertView = db.prepare('INSERT OR IGNORE INTO story_views (story_id, user_id) VALUES (?, ?)');
  const seenUsers = new Set(rng.sample(others, Math.floor(others.length * 0.4)));
  stories.forEach((s, i) => {
    const id = `story_${String(i + 1).padStart(3, '0')}`;
    const userId = userIdFor(s.user);
    insertStory.run(id, userId, JSON.stringify(composeScene(s.tone, s.arts, rng)), s.caption, now - Math.round(s.hoursAgo * HOUR));
    if (seenUsers.has(userId) || userId === demo) insertView.run(id, demo);
  });

  // Highlights keep archived (older than a day) stories.
  const insertHighlight = db.prepare(
    'INSERT INTO highlights (id, user_id, title, cover_json, story_ids_json, sort) VALUES (?, ?, ?, ?, ?, ?)',
  );
  let archived = 0;
  highlights.forEach((h, i) => {
    const userId = userIdFor(h.user);
    const storyIds: string[] = [];
    const n = rng.int(2, 4);
    for (let k = 0; k < n; k++) {
      archived++;
      const id = `story_arch_${archived}`;
      const arts = rng.shuffle(h.arts);
      insertStory.run(id, userId, JSON.stringify(composeScene(h.tone, arts, rng)), k === 0 ? h.title : null, now - rng.int(10, 200) * DAY);
      storyIds.push(id);
    }
    insertHighlight.run(`hl_${i + 1}`, userId, h.title, JSON.stringify(composeScene(h.tone, h.arts.slice(0, 1), rng)), JSON.stringify(storyIds), i);
  });

  const insertConversation = db.prepare('INSERT INTO conversations (id, updated_at) VALUES (?, ?)');
  const insertMember = db.prepare('INSERT INTO conversation_members (conversation_id, user_id, last_read_at) VALUES (?, ?, ?)');
  const insertMessage = db.prepare('INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES (?, ?, ?, ?, ?)');
  let messageCount = 0;
  conversations.forEach((c, i) => {
    const id = `conv_${i + 1}`;
    const times = c.messages.map((m) => now - m.minutesAgo * MINUTE);
    const last = Math.max(...times);
    insertConversation.run(id, last);
    // The demo user has read up to their own last message.
    const myLast = c.messages.reduce((acc, m, mi) => (m.from === 'me' ? times[mi]! : acc), 0);
    insertMember.run(id, demo, myLast);
    for (const h of c.with) insertMember.run(id, userIdFor(h), last);
    c.messages.forEach((m, mi) => {
      messageCount++;
      insertMessage.run(`msg_${messageCount}`, id, m.from === 'me' ? demo : userIdFor(m.from), m.text, times[mi]!);
    });
  });

  return { posts: posts.length, stories: stories.length, comments: commentCount };
}

// ---------------------------------------------------------------- Minutely

function seedMinutely(db: DB) {
  const insertCategory = db.prepare(
    'INSERT INTO grocery_categories (id, name, art, tone, subcategories_json, sort) VALUES (?, ?, ?, ?, ?, ?)',
  );
  groceryCategories.forEach((c, i) => insertCategory.run(c.id, c.name, c.art, c.tone, JSON.stringify(c.subcategories), i));
  const toneOf = new Map(groceryCategories.map((c) => [c.id, c.tone]));
  const insertItem = db.prepare(
    `INSERT INTO groceries (id, name, brand, category_id, subcategory, unit, price, mrp, art, tone, tags_json, in_stock,
       max_per_order, veg, description, shelf_life, origin, sort)
     VALUES (@id, @name, @brand, @category, @subcategory, @unit, @price, @mrp, @art, @tone, @tags, @inStock,
       @maxPerOrder, @veg, @description, @shelfLife, @origin, @sort)`,
  );
  groceries.forEach((g, i) =>
    insertItem.run({
      ...g,
      tone: toneOf.get(g.category) ?? 'mint',
      tags: JSON.stringify(g.tags),
      inStock: g.inStock === false ? 0 : 1,
      maxPerOrder: g.maxPerOrder ?? 10,
      veg: g.veg ? 1 : 0,
      shelfLife: g.shelfLife ?? null,
      origin: g.origin ?? null,
      sort: i,
    }),
  );
}

// ---------------------------------------------------------------- order history

interface HistoryLine {
  productId: string;
  name: string;
  art: ArtName;
  price: number;
  mrp: number | null;
  isVeg: boolean | null;
}

function seedHistory(db: DB, rng: Rng, now: number): number {
  const homeRow = demoAddresses[0]!;
  const address: Address = {
    id: homeRow.id,
    label: homeRow.label,
    recipient: homeRow.recipient,
    line1: homeRow.line1,
    line2: homeRow.line2,
    landmark: homeRow.landmark,
    locality: homeRow.locality,
    city: 'Northbay',
    pincode: homeRow.pincode,
    location: homeRow.location,
    isDefault: true,
  };
  const insertOrder = db.prepare(
    `INSERT INTO orders (id, number, user_id, app, status, items_json, bill_json, coupon_code, address_json, payment_json,
       instructions, restaurant_id, origin_json, route_json, rider_json, schedule_json, placed_at, eta_at, delivered_at,
       cancelled_at, rating_json)
     VALUES (@id, @number, @userId, @app, @status, @items, @bill, NULL, @address, @payment, NULL, @restaurantId, @origin,
       @route, @rider, @schedule, @placedAt, @etaAt, @deliveredAt, NULL, @rating)`,
  );
  const insertEvent = db.prepare('INSERT INTO order_events (order_id, status, at) VALUES (?, ?, ?)');
  const insertNotification = db.prepare(
    `INSERT INTO notifications (id, user_id, app, kind, title, body, art, link, created_at, read)
     VALUES (@id, @userId, @app, @kind, @title, @body, @art, @link, @createdAt, @read)`,
  );
  const payments: PaymentMethod[] = [
    { kind: 'upi', label: 'UPI · riya@nbbank.example' },
    { kind: 'card', label: 'Card •••• 4242' },
    { kind: 'cash', label: 'Cash on delivery' },
  ];
  let n = 0;

  const place = (app: CommerceApp, lines: HistoryLine[], daysAgo: number, extra: { restaurantId?: string; origin?: { label: string; point: { x: number; y: number }; art: ArtName } }) => {
    n++;
    const items: OrderLine[] = lines.map((l, i) => {
      const quantity = rng.int(1, app === 'minutely' ? 3 : 2);
      return {
        id: `l${i + 1}`,
        productId: l.productId,
        name: l.name,
        art: l.art,
        quantity,
        unitPrice: l.price,
        lineTotal: l.price * quantity,
        optionsLabel: null,
        isVeg: l.isVeg,
      };
    });
    const bill: Bill = computeBill(
      {
        app,
        lines: items.map((it, i) => ({ unitPrice: it.unitPrice, mrp: lines[i]!.mrp, quantity: it.quantity })),
        coupon: null,
        tip: app === 'cartly' ? 0 : rng.pick([0, 0, 20, 30]),
        distanceKm: extra.origin ? distanceKm(extra.origin.point, address.location) : undefined,
      },
      now,
    );
    const placedAt = now - daysAgo * DAY - rng.int(1, 10) * HOUR;
    const schedule = scheduleFor(app, 1);
    const deliveredOffset = schedule.find((s) => s.status === 'delivered')!.offsetMs;
    const rider = riders[n % riders.length]!;
    const id = `ord_hist_${n}`;
    const rated = app !== 'cartly' && rng.chance(0.6);
    insertOrder.run({
      id,
      number: `${{ platter: 'PLT', cartly: 'CRT', minutely: 'MNT' }[app]}-${String(rng.int(100000, 999999))}`,
      userId: DEMO_USER.id,
      app,
      status: 'delivered' satisfies OrderStatus,
      items: JSON.stringify(items),
      bill: JSON.stringify(bill),
      address: JSON.stringify(address),
      payment: JSON.stringify(rng.pick(payments)),
      restaurantId: extra.restaurantId ?? null,
      origin: extra.origin ? JSON.stringify(extra.origin) : null,
      route: extra.origin ? JSON.stringify(streetRoute(extra.origin.point, address.location)) : null,
      rider: JSON.stringify(rider),
      schedule: JSON.stringify(schedule),
      placedAt,
      etaAt: placedAt + deliveredOffset,
      deliveredAt: placedAt + deliveredOffset,
      rating: rated
        ? JSON.stringify({ stars: rng.int(4, 5), comment: rng.pick(['Hot and on time!', 'Packed really well.', null]), tags: ['On time'], createdAt: new Date(placedAt + deliveredOffset + HOUR).toISOString() })
        : null,
    });
    for (const s of schedule) insertEvent.run(id, s.status, placedAt + s.offsetMs);
    insertNotification.run({
      id: `nt_${app}_${n}`,
      userId: DEMO_USER.id,
      app,
      kind: 'order',
      title: 'Order delivered',
      body: `Your order of ${items.length} item${items.length === 1 ? '' : 's'} was delivered. Enjoy!`,
      art: items[0]!.art,
      link: `/orders/${id}`,
      createdAt: placedAt + deliveredOffset,
      read: 1,
    });
  };

  // Platter: four past meals.
  const menuRows = db
    .prepare('SELECT id, restaurant_id, name, art, price, veg FROM menu_items WHERE available = 1')
    .all() as { id: string; restaurant_id: string; name: string; art: ArtName; price: number; veg: number }[];
  for (const [i, r] of rng.sample(restaurants, 4).entries()) {
    const dishes = rng.sample(menuRows.filter((m) => m.restaurant_id === r.id), rng.int(2, 3));
    place(
      'platter',
      dishes.map((d) => ({ productId: d.id, name: d.name, art: d.art, price: d.price, mrp: null, isVeg: d.veg === 1 })),
      [1, 4, 9, 17][i]!,
      { restaurantId: r.id, origin: { label: r.name, point: r.location, art: r.art } },
    );
  }
  // Minutely: three past baskets.
  for (const daysAgo of [2, 6, 12]) {
    const items = rng.sample(groceries.filter((g) => g.inStock !== false), rng.int(3, 5));
    place(
      'minutely',
      items.map((g) => ({ productId: g.id, name: `${g.name} (${g.unit})`, art: g.art, price: g.price, mrp: g.mrp, isVeg: g.veg })),
      daysAgo,
      { origin: { label: stores[0]!.name, point: stores[0]!.location, art: 'shopping-trolley' } },
    );
  }
  // Cartly: three past parcels.
  for (const daysAgo of [5, 21, 40]) {
    const p = rng.pick(products);
    place('cartly', [{ productId: p.id, name: p.title, art: p.art, price: p.price, mrp: p.mrp, isVeg: null }], daysAgo, {});
  }

  // Offer and price-drop notifications.
  const extraNotes = [
    { app: 'cartly', kind: 'price_drop', title: 'Price drop on your wishlist', body: 'An item you saved is now cheaper. Grab it before stock runs out.', art: 'label', link: '/wishlist', hoursAgo: 3 },
    { app: 'cartly', kind: 'offer', title: 'The Big Bay Sale is live', body: 'Up to 70% off on fashion and home. Ends Sunday midnight.', art: 'shopping-bags', link: '/sale', hoursAgo: 20 },
    { app: 'cartly', kind: 'system', title: 'Your account is secure', body: 'You signed in on a new device in Northbay.', art: 'electric-light-bulb', link: null, hoursAgo: 50 },
    { app: 'platter', kind: 'offer', title: 'Lunch is on us (almost)', body: 'Use WELCOME50 for 50% off up to ₹100 today.', art: 'curry-and-rice', link: '/offers', hoursAgo: 5 },
    { app: 'platter', kind: 'offer', title: 'Biryani weekend is here', body: 'Slow-cooked dum biryanis from ₹249 near you.', art: 'pot-of-food', link: '/cuisine/biryani', hoursAgo: 30 },
    { app: 'minutely', kind: 'offer', title: 'Mangoes are back', body: 'Sweet, ripe and 15% off this week.', art: 'mango', link: '/category/fruits', hoursAgo: 8 },
    { app: 'minutely', kind: 'offer', title: '₹50 off your next basket', body: 'Use FRESH50 on orders above ₹299.', art: 'shopping-trolley', link: '/offers', hoursAgo: 28 },
  ] as const;
  extraNotes.forEach((x, i) =>
    insertNotification.run({
      id: `nt_extra_${i + 1}`,
      userId: DEMO_USER.id,
      app: x.app,
      kind: x.kind,
      title: x.title,
      body: x.body,
      art: x.art,
      link: x.link,
      createdAt: now - x.hoursAgo * HOUR,
      read: x.hoursAgo > 24 ? 1 : 0,
    }),
  );
  return n;
}

export function seededAt(db: DB): number | null {
  const v = getMeta(db, 'seeded_at');
  return v == null ? null : Number(v);
}
