/**
 * The Firestore adapter for @quickbite/server's OrderStore. It only maps
 * reads and writes to documents; the order and payment logic lives in
 * packages/server.
 *
 * Server-only collections (unreadable from browsers, see firestore.rules):
 *   coupons/{code}, payments/{id}, webhookEvents/{provider}_{eventId},
 *   couponRedemptions/{orderId}, idempotencyKeys/{uid}_{key}
 */
import type {
  Area,
  Coupon,
  MenuItem,
  Order,
  OrderStatus,
  PaymentProvider,
  Region,
  Restaurant,
} from '@quickbite/core';
import type { OrderStore, StoredAddress, StoreTx } from '@quickbite/server';
import type { DocumentData, Firestore, Transaction } from 'firebase-admin/firestore';

const menuItem = (raw: DocumentData): MenuItem => {
  const { searchTokens: _tokens, position: _position, ...item } = raw;
  return item as MenuItem;
};

export class FirestoreOrderStore implements OrderStore {
  constructor(private readonly db: Firestore) {}

  private orders() {
    return this.db.collection('orders');
  }
  private idempotencyDoc(userId: string, key: string) {
    // Both parts are validated to [A-Za-z0-9_-], so the id is always safe.
    return this.db.doc(`idempotencyKeys/${userId}_${key}`);
  }
  private webhookEventDoc(provider: PaymentProvider, eventId: string) {
    return this.db.doc(`webhookEvents/${provider}_${eventId}`);
  }
  private redemptionsOf(userId: string, code: string) {
    return this.db
      .collection('couponRedemptions')
      .where('userId', '==', userId)
      .where('couponCode', '==', code);
  }

  private async read<T>(path: string): Promise<T | null> {
    const snap = await this.db.doc(path).get();
    return snap.exists ? (snap.data() as T) : null;
  }

  // ---- CatalogReader --------------------------------------------------------
  getRestaurant(id: string) {
    return this.read<Restaurant>(`restaurants/${id}`);
  }
  async getMenuItems(restaurantId: string, itemIds: string[]) {
    if (itemIds.length === 0) return [];
    const refs = itemIds.map((id) => this.db.doc(`restaurants/${restaurantId}/menuItems/${id}`));
    const snaps = await this.db.getAll(...refs);
    return snaps.filter((s) => s.exists).map((s) => menuItem(s.data()!));
  }
  getRegion(id: string) {
    return this.read<Region>(`regions/${id}`);
  }
  getArea(id: string) {
    return this.read<Area>(`areas/${id}`);
  }
  getCoupon(code: string) {
    return this.read<Coupon>(`coupons/${code}`);
  }

  // ---- OrderStore -----------------------------------------------------------
  async getAddress(userId: string, addressId: string): Promise<StoredAddress | null> {
    const raw = await this.read<DocumentData>(`users/${userId}/addresses/${addressId}`);
    if (!raw) return null;
    return {
      id: addressId,
      label: raw.label,
      name: raw.name,
      phone: raw.phone,
      line1: raw.line1,
      line2: raw.line2,
      landmark: raw.landmark,
      areaId: raw.areaId,
      pincode: raw.pincode,
    };
  }
  async countCouponRedemptions(userId: string, code: string) {
    return (await this.redemptionsOf(userId, code).count().get()).data().count;
  }
  getOrder(id: string) {
    return this.read<Order>(`orders/${id}`);
  }
  async findOrderIdByProviderOrderId(provider: PaymentProvider, providerOrderId: string) {
    const snap = await this.orders()
      .where('paymentProvider', '==', provider)
      .where('providerOrderId', '==', providerOrderId)
      .limit(1)
      .get();
    return snap.empty ? null : snap.docs[0]!.id;
  }
  async listOrdersByStatus(statuses: readonly OrderStatus[], changedBefore: string, limit: number) {
    const snap = await this.orders()
      .where('status', 'in', [...statuses])
      .where('statusUpdatedAt', '<=', changedBefore)
      .orderBy('statusUpdatedAt')
      .limit(limit)
      .get();
    return snap.docs.map((d) => d.data() as Order);
  }
  newOrderId() {
    return this.orders().doc().id;
  }

  transaction<T>(work: (tx: StoreTx) => Promise<T>): Promise<T> {
    return this.db.runTransaction((t) => work(this.wrap(t)));
  }

  private wrap(t: Transaction): StoreTx {
    return {
      getOrder: async (id) => {
        const snap = await t.get(this.orders().doc(id));
        return snap.exists ? (snap.data() as Order) : null;
      },
      findOrderIdByIdempotencyKey: async (userId, key) => {
        const snap = await t.get(this.idempotencyDoc(userId, key));
        return snap.exists ? (snap.data()!.orderId as string) : null;
      },
      countOrdersSince: async (userId, since) =>
        (await t.get(this.orders().where('userId', '==', userId).where('createdAt', '>=', since)))
          .size,
      hasWebhookEvent: async (provider, eventId) =>
        (await t.get(this.webhookEventDoc(provider, eventId))).exists,
      countCouponRedemptions: async (userId, code) =>
        (await t.get(this.redemptionsOf(userId, code))).size,

      // `create` fails if the document exists: these are the unique constraints.
      createOrder: (order) => {
        t.create(this.orders().doc(order.id), order);
        t.create(this.idempotencyDoc(order.userId, order.idempotencyKey), {
          orderId: order.id,
          userId: order.userId,
          createdAt: order.createdAt,
        });
      },
      updateOrder: (id, patch) => void t.update(this.orders().doc(id), patch),
      createPayment: (payment) => void t.create(this.db.doc(`payments/${payment.id}`), payment),
      recordWebhookEvent: (event) =>
        void t.create(this.webhookEventDoc(event.provider, event.eventId), event),
      createCouponRedemption: (redemption) =>
        void t.create(this.db.doc(`couponRedemptions/${redemption.orderId}`), redemption),
    };
  }
}
