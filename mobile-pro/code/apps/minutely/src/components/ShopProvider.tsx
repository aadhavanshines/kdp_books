import { quantityInCart, useCart, useMinutelyHome, useSetCartItem, type Cart, type GroceryItem } from '@pro/api';
import { useToast } from '@pro/ui';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import { pendingSummary, type PendingChange } from '../lib/pending';
import { ProductSheet } from './ProductSheet';

interface Shop {
  cart: Cart | undefined;
  /** The quantity to show: the tapped one while the server catches up. */
  quantityOf: (productId: string) => number;
  change: (item: Stockable, quantity: number) => void;
  /** Cart bar numbers, including taps the server has not answered yet. */
  summary: { itemCount: number; total: number; mrpTotal: number };
  openProduct: (productId: string) => void;
  /** Minutes from the nearest store, from the home feed (9 until it loads). */
  etaMinutes: number;
}

/** What a stepper needs to know about a product (a GroceryItem or a cart line). */
export type Stockable = Pick<GroceryItem, 'id' | 'price' | 'mrp' | 'maxPerOrder'>;

const ShopContext = createContext<Shop | null>(null);

export function useShop(): Shop {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error('useShop must be used inside <ShopProvider>');
  return shop;
}

/**
 * One cart for every screen: ADD steppers move the moment they are tapped
 * (on Home, in a category and in the product sheet at once), and the
 * product sheet slides over whatever screen asked for it.
 */
export function ShopProvider({ children }: { children: ReactNode }) {
  const { data: cart } = useCart('minutely');
  const setItem = useSetCartItem('minutely');
  const toast = useToast();
  const etaMinutes = useMinutelyHome().data?.etaMinutes ?? 9;
  const [pending, setPending] = useState<Record<string, PendingChange>>({});
  const [productId, setProductId] = useState<string | null>(null);
  // Only the latest tap on a product may clear its pending quantity.
  const seq = useRef<Record<string, number>>({});

  const quantityOf = useCallback((id: string) => pending[id]?.quantity ?? quantityInCart(cart, id), [pending, cart]);

  const change = useCallback(
    (item: Stockable, quantity: number) => {
      const next = Math.max(0, Math.min(quantity, item.maxPerOrder));
      const mine = (seq.current[item.id] ?? 0) + 1;
      seq.current[item.id] = mine;
      setPending((p) => ({ ...p, [item.id]: { quantity: next, price: item.price, mrp: item.mrp } }));
      setItem.mutate(
        { productId: item.id, quantity: next },
        {
          onError: (e) => toast.show({ message: e.message, tone: 'danger' }),
          onSettled: () => {
            if (seq.current[item.id] !== mine) return;
            setPending(({ [item.id]: _done, ...rest }) => rest);
          },
        },
      );
    },
    [setItem, toast],
  );

  const summary = useMemo(() => pendingSummary(cart, pending), [cart, pending]);
  const value = useMemo<Shop>(
    () => ({ cart, quantityOf, change, summary, openProduct: setProductId, etaMinutes }),
    [cart, quantityOf, change, summary, etaMinutes],
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
      <ProductSheet productId={productId} onClose={() => setProductId(null)} />
    </ShopContext.Provider>
  );
}
