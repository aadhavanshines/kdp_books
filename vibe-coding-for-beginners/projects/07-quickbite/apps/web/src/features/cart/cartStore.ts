import type { MenuItem, Restaurant } from '@quickbite/core';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addItem,
  emptyCart,
  replaceWith,
  setQty,
  syncWithQuote,
  type CartState,
} from './cartLogic';

interface PendingReplace {
  restaurant: Restaurant;
  item: MenuItem;
}

interface CartStore extends CartState {
  /** Set when the customer tries to add from a second restaurant; drives the "Replace cart?" dialog. */
  pendingReplace: PendingReplace | null;
  /** True after a server quote changed prices or removed items (shown once at checkout). */
  pricesChanged: boolean;
  dismissPricesChanged: () => void;
  add: (restaurant: Restaurant, item: MenuItem) => void;
  confirmReplace: () => void;
  cancelReplace: () => void;
  setQty: (itemId: string, qty: number) => void;
  setCoupon: (code: string | null) => void;
  setNote: (note: string) => void;
  sync: (
    lines: { itemId: string; unitPrice: number; name: string }[],
    unavailable: string[],
  ) => boolean;
  clear: () => void;
}

const pick = ({ restaurant, lines, couponCode, note }: CartState): CartState => ({
  restaurant,
  lines,
  couponCode,
  note,
});

/** The cart follows the customer around the app and survives reloads (saved on this device). */
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      ...emptyCart,
      pendingReplace: null,
      pricesChanged: false,
      dismissPricesChanged: () => set({ pricesChanged: false }),
      add: (restaurant, item) => {
        const result = addItem(pick(get()), restaurant, item);
        if (result.status === 'conflict') set({ pendingReplace: { restaurant, item } });
        else set(result.state);
      },
      confirmReplace: () => {
        const pending = get().pendingReplace;
        if (pending)
          set({ ...replaceWith(pending.restaurant, pending.item), pendingReplace: null });
      },
      cancelReplace: () => set({ pendingReplace: null }),
      setQty: (itemId, qty) => set(setQty(pick(get()), itemId, qty)),
      setCoupon: (couponCode) => set({ couponCode }),
      setNote: (note) => set({ note: note.slice(0, 200) }),
      sync: (lines, unavailable) => {
        const result = syncWithQuote(pick(get()), lines, unavailable);
        if (result.changed) set({ ...result.state, pricesChanged: true });
        return result.changed;
      },
      clear: () => set({ ...emptyCart }),
    }),
    {
      name: 'quickbite.cart',
      version: 1,
      partialize: (s) => pick(s),
    },
  ),
);

/** True when the cart has items (the mobile cart bar is showing). */
export const useCartHasItems = () => useCart((s) => s.lines.length > 0);
