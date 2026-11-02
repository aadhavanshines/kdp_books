import type {
  ArtName,
  ArtTone,
  Cart,
  CartLine,
  CommerceApp,
  Coupon,
  CouponKind,
  CouponOffer,
  CustomizationGroup,
  SelectedOption,
  SetCartItemInput,
  UpdateCartLineInput,
  VariantGroup,
} from '@pro/api/types';

import type { DB } from '../db';
import { badRequest, conflict, HttpError, notFound } from '../lib/errors';
import { distanceKm } from '../lib/geo';
import { newId } from '../lib/ids';
import { parseJson } from '../lib/json';
import { amountToFreeDelivery, computeBill, evaluateCoupon, round2 } from '../lib/pricing';
import { iso } from '../lib/time';
import { getProductRow, type ProductRow } from './cartly';
import { getGroceryRow } from './minutely';
import { DEFAULT_ORIGIN, getMenuItemRow, getRestaurantRow, toRestaurantSummary } from './platter';
import { defaultAddress, findAddress } from './users';

/** Everything the cart needs to know about a product, whatever the app. */
export interface ResolvedProduct {
  productId: string;
  name: string;
  art: ArtName;
  tone: ArtTone;
  basePrice: number;
  mrp: number | null;
  isVeg: boolean | null;
  unit: string | null;
  maxQuantity: number;
  inStock: boolean;
  restaurantId: string | null;
  /** Platter customizations or Cartly variant groups, to validate options. */
  customizations: CustomizationGroup[];
  variants: VariantGroup[];
}

export function resolveProduct(db: DB, app: CommerceApp, productId: string): ResolvedProduct {
  if (app === 'platter') {
    const m = getMenuItemRow(db, productId);
    const r = getRestaurantRow(db, m.restaurant_id);
    return {
      productId,
      name: m.name,
      art: m.art as ArtName,
      tone: r.tone as ArtTone,
      basePrice: m.price,
      mrp: null,
      isVeg: m.veg === 1,
      unit: null,
      maxQuantity: 20,
      inStock: m.available === 1,
      restaurantId: m.restaurant_id,
      customizations: parseJson<CustomizationGroup[]>(m.customizations_json, []),
      variants: [],
    };
  }
  if (app === 'minutely') {
    const g = getGroceryRow(db, productId);
    return {
      productId,
      name: g.name,
      art: g.art as ArtName,
      tone: g.tone as ArtTone,
      basePrice: g.price,
      mrp: g.mrp,
      isVeg: g.veg === 1,
      unit: g.unit,
      maxQuantity: g.max_per_order,
      inStock: g.in_stock === 1,
      restaurantId: null,
      customizations: [],
      variants: [],
    };
  }
  const p: ProductRow = getProductRow(db, productId);
  return {
    productId,
    name: p.title,
    art: p.art as ArtName,
    tone: p.tone as ArtTone,
    basePrice: p.price,
    mrp: p.mrp,
    isVeg: null,
    unit: null,
    maxQuantity: Math.max(1, Math.min(10, p.stock)),
    inStock: p.stock > 0,
    restaurantId: null,
    customizations: [],
    variants: parseJson<VariantGroup[]>(p.variants_json, []),
  };
}

/**
 * Validates the chosen options against the product and fills in defaults
 * (required single-choice groups use their default). Returns them in the
 * product's group order, so the same choice always makes the same key.
 */
export function resolveOptions(product: ResolvedProduct, input: Pick<SetCartItemInput, 'options' | 'variant'>): SelectedOption[] {
  const selected: SelectedOption[] = [];
  if (product.customizations.length) {
    const picks = input.options ?? [];
    for (const p of picks) {
      if (!product.customizations.some((g) => g.id === p.groupId)) throw badRequest(`Unknown option group "${p.groupId}"`);
    }
    for (const group of product.customizations) {
      const chosen = picks.filter((p) => p.groupId === group.id);
      const options = chosen.map((c) => {
        const o = group.options.find((x) => x.id === c.optionId);
        if (!o) throw badRequest(`Unknown option "${c.optionId}" in ${group.name}`);
        return o;
      });
      if (group.kind === 'single') {
        if (options.length > 1) throw badRequest(`Pick one ${group.name.toLowerCase()}`);
        const pick = options[0] ?? (group.required ? (group.options.find((o) => o.isDefault) ?? group.options[0]) : undefined);
        if (pick) selected.push({ groupId: group.id, groupName: group.name, optionId: pick.id, name: pick.name, price: pick.price });
      } else {
        if (group.max != null && options.length > group.max) throw badRequest(`Pick up to ${group.max} in ${group.name}`);
        for (const o of [...new Set(options)]) {
          selected.push({ groupId: group.id, groupName: group.name, optionId: o.id, name: o.name, price: o.price });
        }
      }
    }
  }
  if (product.variants.length) {
    for (const group of product.variants) {
      const wanted = input.variant?.[group.kind];
      const o = wanted
        ? group.options.find((x) => x.id === wanted || x.label === wanted)
        : (group.options.find((x) => x.available) ?? group.options[0]);
      if (!o) throw badRequest(`Unknown ${group.name.toLowerCase()} "${wanted}"`);
      if (!o.available) throw badRequest(`${o.label} is out of stock`);
      selected.push({ groupId: group.kind, groupName: group.name, optionId: o.id, name: o.label, price: o.priceDelta });
    }
  }
  return selected;
}

const optionsKey = (options: SelectedOption[]) => options.map((o) => `${o.groupId}=${o.optionId}`).join('&');

interface LineRow {
  id: string;
  product_id: string;
  quantity: number;
  options_json: string;
  options_key: string;
  saved_for_later: number;
}

interface CartRow {
  coupon_code: string | null;
  tip: number;
  restaurant_id: string | null;
  address_id: string | null;
}

function ensureCart(db: DB, userId: string, app: CommerceApp, now: number): CartRow {
  db.prepare('INSERT OR IGNORE INTO carts (user_id, app, coupon_code, tip, restaurant_id, updated_at) VALUES (?, ?, NULL, 0, NULL, ?)').run(
    userId,
    app,
    now,
  );
  return db.prepare('SELECT coupon_code, tip, restaurant_id, address_id FROM carts WHERE user_id = ? AND app = ?').get(userId, app) as CartRow;
}

interface CouponRow {
  code: string;
  app: string;
  title: string;
  description: string;
  kind: string;
  value: number;
  max_discount: number | null;
  min_order: number;
  restaurant_id: string | null;
  expires_at: number;
  first_order_only: number;
}

export const toCoupon = (c: CouponRow): Coupon => ({
  code: c.code,
  app: c.app as CommerceApp,
  title: c.title,
  description: c.description,
  kind: c.kind as CouponKind,
  value: c.value,
  maxDiscount: c.max_discount,
  minOrder: c.min_order,
  restaurantId: c.restaurant_id,
  expiresAt: iso(c.expires_at),
  firstOrderOnly: c.first_order_only === 1,
});

export function findCoupon(db: DB, code: string): Coupon | null {
  const row = db.prepare('SELECT * FROM coupons WHERE code = ? COLLATE NOCASE').get(code.trim()) as CouponRow | undefined;
  return row ? toCoupon(row) : null;
}

/** Whether the user has placed an order in this app that wasn't cancelled. */
export function hasOrdered(db: DB, userId: string, app: CommerceApp): boolean {
  return !!db.prepare("SELECT 1 FROM orders WHERE user_id = ? AND app = ? AND status != 'cancelled' LIMIT 1").get(userId, app);
}

/**
 * The cart with its bill. The bill is priced for the address the order will
 * go to: `addressId` if given (placing an order), else the address chosen for
 * the cart, else the user's default address.
 */
export function getCart(db: DB, userId: string, app: CommerceApp, now: number, addressId?: string): Cart {
  const cart = ensureCart(db, userId, app, now);
  const rows = db.prepare('SELECT * FROM cart_lines WHERE user_id = ? AND app = ? ORDER BY added_at, id').all(userId, app) as LineRow[];
  const lines: CartLine[] = [];
  for (const row of rows) {
    let product: ResolvedProduct;
    try {
      product = resolveProduct(db, app, row.product_id);
    } catch {
      // The product is gone (e.g. after a reseed): drop the line.
      db.prepare('DELETE FROM cart_lines WHERE id = ?').run(row.id);
      continue;
    }
    const options = parseJson<SelectedOption[]>(row.options_json, []);
    const unitPrice = round2(product.basePrice + options.reduce((s, o) => s + o.price, 0));
    const mrp = product.mrp != null ? round2(product.mrp + options.reduce((s, o) => s + o.price, 0)) : null;
    lines.push({
      id: row.id,
      productId: row.product_id,
      name: product.name,
      art: product.art,
      tone: product.tone,
      unitPrice,
      mrp,
      quantity: row.quantity,
      lineTotal: round2(unitPrice * row.quantity),
      options,
      optionsLabel: options.length ? options.map((o) => o.name).join(', ') : null,
      unit: product.unit,
      isVeg: product.isVeg,
      maxQuantity: product.maxQuantity,
      inStock: product.inStock,
      savedForLater: row.saved_for_later === 1,
    });
  }
  const items = lines.filter((l) => !l.savedForLater && l.inStock);
  const address =
    (addressId ? findAddress(db, userId, addressId) : null) ??
    (cart.address_id ? findAddress(db, userId, cart.address_id) : null) ??
    defaultAddress(db, userId);
  const from = address?.location ?? DEFAULT_ORIGIN;
  const restaurantRow = app === 'platter' && cart.restaurant_id && items.length ? getRestaurantRow(db, cart.restaurant_id) : null;
  const coupon = cart.coupon_code ? findCoupon(db, cart.coupon_code) : null;
  const bill = computeBill(
    {
      app,
      lines: items,
      coupon,
      tip: cart.tip,
      distanceKm: restaurantRow ? distanceKm({ x: restaurantRow.x, y: restaurantRow.y }, from) : undefined,
      hasOrdered: hasOrdered(db, userId, app),
    },
    now,
    cart.restaurant_id,
  );
  return {
    app,
    items: lines.filter((l) => !l.savedForLater),
    savedForLater: lines.filter((l) => l.savedForLater),
    itemCount: items.reduce((s, l) => s + l.quantity, 0),
    coupon,
    tip: items.length ? cart.tip : 0,
    bill,
    restaurant: restaurantRow ? toRestaurantSummary(restaurantRow, from) : null,
    amountToFreeDelivery: amountToFreeDelivery(app, bill.itemTotal),
  };
}

function touch(db: DB, userId: string, app: CommerceApp, now: number) {
  db.prepare('UPDATE carts SET updated_at = ? WHERE user_id = ? AND app = ?').run(now, userId, app);
  // Forget the restaurant once the Platter cart is empty.
  const left = db.prepare('SELECT COUNT(*) AS n FROM cart_lines WHERE user_id = ? AND app = ? AND saved_for_later = 0').get(userId, app) as {
    n: number;
  };
  if (left.n === 0) db.prepare('UPDATE carts SET restaurant_id = NULL, coupon_code = NULL, tip = 0 WHERE user_id = ? AND app = ?').run(userId, app);
}

/** Sets the quantity of the line for this product and options (0 removes it). */
export function setItem(db: DB, userId: string, app: CommerceApp, input: SetCartItemInput, now: number): Cart {
  const product = resolveProduct(db, app, input.productId);
  if (input.quantity > 0 && !product.inStock) throw conflict('OUT_OF_STOCK', `${product.name} is out of stock`);
  if (input.quantity > product.maxQuantity) {
    throw conflict('MAX_QUANTITY', `You can add up to ${product.maxQuantity} of ${product.name}`, { max: product.maxQuantity });
  }
  const options = resolveOptions(product, input);
  const key = optionsKey(options);

  db.transaction(() => {
    const cart = ensureCart(db, userId, app, now);
    if (app === 'platter' && input.quantity > 0) {
      const hasItems = (db.prepare('SELECT COUNT(*) AS n FROM cart_lines WHERE user_id = ? AND app = ?').get(userId, app) as { n: number }).n > 0;
      if (hasItems && cart.restaurant_id && cart.restaurant_id !== product.restaurantId) {
        if (!input.replaceCart) {
          const current = getRestaurantRow(db, cart.restaurant_id);
          throw conflict('CART_CONFLICT', `Your cart has items from ${current.name}. Replace them with this item?`, {
            restaurantId: current.id,
            restaurantName: current.name,
          });
        }
        db.prepare('DELETE FROM cart_lines WHERE user_id = ? AND app = ?').run(userId, app);
        db.prepare('UPDATE carts SET coupon_code = NULL WHERE user_id = ? AND app = ?').run(userId, app);
      }
      db.prepare('UPDATE carts SET restaurant_id = ? WHERE user_id = ? AND app = ?').run(product.restaurantId, userId, app);
    }
    const existing = db
      .prepare('SELECT id FROM cart_lines WHERE user_id = ? AND app = ? AND product_id = ? AND options_key = ? AND saved_for_later = 0')
      .get(userId, app, input.productId, key) as { id: string } | undefined;
    if (input.quantity <= 0) {
      if (existing) db.prepare('DELETE FROM cart_lines WHERE id = ?').run(existing.id);
    } else if (existing) {
      db.prepare('UPDATE cart_lines SET quantity = ? WHERE id = ?').run(input.quantity, existing.id);
    } else {
      db.prepare(
        `INSERT INTO cart_lines (id, user_id, app, product_id, quantity, options_json, options_key, saved_for_later, added_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      ).run(newId('line'), userId, app, input.productId, input.quantity, JSON.stringify(options), key, now);
    }
    touch(db, userId, app, now);
  })();
  return getCart(db, userId, app, now);
}

export function updateLine(db: DB, userId: string, app: CommerceApp, lineId: string, input: UpdateCartLineInput, now: number): Cart {
  const row = db.prepare('SELECT * FROM cart_lines WHERE id = ? AND user_id = ? AND app = ?').get(lineId, userId, app) as LineRow | undefined;
  if (!row) throw notFound('Cart item');
  const product = resolveProduct(db, app, row.product_id);
  db.transaction(() => {
    if (input.savedForLater != null) {
      if (app !== 'cartly' && input.savedForLater) throw badRequest('Save for later is only available on Cartly');
      // Moving back to the cart: if the same product and options are already
      // there, add to that line instead of making a second identical one.
      const twin = input.savedForLater
        ? undefined
        : (db
            .prepare(
              'SELECT id, quantity FROM cart_lines WHERE user_id = ? AND app = ? AND product_id = ? AND options_key = ? AND saved_for_later = 0 AND id != ?',
            )
            .get(userId, app, row.product_id, row.options_key, lineId) as { id: string; quantity: number } | undefined);
      if (twin) {
        const merged = Math.min(product.maxQuantity, twin.quantity + row.quantity);
        db.prepare('UPDATE cart_lines SET quantity = ? WHERE id = ?').run(merged, twin.id);
        db.prepare('DELETE FROM cart_lines WHERE id = ?').run(lineId);
        touch(db, userId, app, now);
        return;
      }
      db.prepare('UPDATE cart_lines SET saved_for_later = ? WHERE id = ?').run(input.savedForLater ? 1 : 0, lineId);
    }
    if (input.quantity != null) {
      if (input.quantity <= 0) db.prepare('DELETE FROM cart_lines WHERE id = ?').run(lineId);
      else {
        if (input.quantity > product.maxQuantity) {
          throw conflict('MAX_QUANTITY', `You can add up to ${product.maxQuantity} of ${product.name}`, { max: product.maxQuantity });
        }
        db.prepare('UPDATE cart_lines SET quantity = ? WHERE id = ?').run(input.quantity, lineId);
      }
    }
    touch(db, userId, app, now);
  })();
  return getCart(db, userId, app, now);
}

export function removeLine(db: DB, userId: string, app: CommerceApp, lineId: string, now: number): Cart {
  const res = db.prepare('DELETE FROM cart_lines WHERE id = ? AND user_id = ? AND app = ?').run(lineId, userId, app);
  if (res.changes === 0) throw notFound('Cart item');
  touch(db, userId, app, now);
  return getCart(db, userId, app, now);
}

export function clearCart(db: DB, userId: string, app: CommerceApp, now: number): Cart {
  db.prepare('DELETE FROM cart_lines WHERE user_id = ? AND app = ? AND saved_for_later = 0').run(userId, app);
  touch(db, userId, app, now);
  return getCart(db, userId, app, now);
}

export function applyCoupon(db: DB, userId: string, app: CommerceApp, code: string, now: number): Cart {
  const coupon = findCoupon(db, code);
  if (!coupon || coupon.app !== app) throw badRequest(`"${code.toUpperCase()}" is not a valid coupon`);
  const cart = getCart(db, userId, app, now);
  const check = evaluateCoupon(coupon, cart.bill.itemTotal, {
    app,
    restaurantId: cart.restaurant?.id ?? null,
    now,
    hasOrdered: hasOrdered(db, userId, app),
  });
  if (!check.ok) throw new HttpError(400, 'COUPON_NOT_APPLICABLE', check.reason ?? 'This coupon cannot be applied');
  db.prepare('UPDATE carts SET coupon_code = ? WHERE user_id = ? AND app = ?').run(coupon.code, userId, app);
  return getCart(db, userId, app, now);
}

export function removeCoupon(db: DB, userId: string, app: CommerceApp, now: number): Cart {
  ensureCart(db, userId, app, now);
  db.prepare('UPDATE carts SET coupon_code = NULL WHERE user_id = ? AND app = ?').run(userId, app);
  return getCart(db, userId, app, now);
}

export function setTip(db: DB, userId: string, app: CommerceApp, amount: number, now: number): Cart {
  if (app === 'cartly' && amount > 0) throw badRequest('Tips are not available on Cartly');
  ensureCart(db, userId, app, now);
  db.prepare('UPDATE carts SET tip = ? WHERE user_id = ? AND app = ?').run(round2(amount), userId, app);
  return getCart(db, userId, app, now);
}

/** Choose the delivery address the cart is priced for (Platter's fee depends on distance). */
export function setCartAddress(db: DB, userId: string, app: CommerceApp, addressId: string, now: number): Cart {
  if (!findAddress(db, userId, addressId)) throw notFound('Address');
  ensureCart(db, userId, app, now);
  db.prepare('UPDATE carts SET address_id = ? WHERE user_id = ? AND app = ?').run(addressId, userId, app);
  return getCart(db, userId, app, now);
}

/** Coupons for an app, with whether each applies to the current cart. */
export function couponOffers(db: DB, userId: string | null, app: CommerceApp, now: number): CouponOffer[] {
  const rows = db.prepare('SELECT * FROM coupons WHERE app = ? AND expires_at > ? ORDER BY min_order').all(app, now) as CouponRow[];
  const cart = userId ? getCart(db, userId, app, now) : null;
  return rows.map((r) => {
    const coupon = toCoupon(r);
    const check = evaluateCoupon(coupon, cart?.bill.itemTotal ?? 0, {
      app,
      restaurantId: cart?.restaurant?.id ?? null,
      now,
      hasOrdered: userId ? hasOrdered(db, userId, app) : false,
    });
    const deliverySaving = coupon.kind === 'free_delivery' ? (cart?.bill.deliveryFee ?? 0) : 0;
    return { ...coupon, applicable: check.ok, reason: check.reason, estimatedSavings: check.ok ? check.discount + deliverySaving : 0 };
  });
}
