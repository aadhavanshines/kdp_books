import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CheckoutAttempt {
  /** What was being bought: restaurant, items, coupon and address. */
  fingerprint: string;
  /** Sent with "place order", so retries return the same order instead of a duplicate. */
  idempotencyKey: string;
}

interface CheckoutState {
  addressId: string | null;
  setAddressId: (id: string | null) => void;
  attempt: CheckoutAttempt | null;
  /** The idempotency key for this cart, reused until the cart changes or the order is paid. */
  keyFor: (fingerprint: string) => string;
  finishAttempt: () => void;
}

const newKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

/** Remembers the chosen delivery address and the current checkout attempt on this device. */
export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      addressId: null,
      setAddressId: (addressId) => set({ addressId }),
      attempt: null,
      keyFor: (fingerprint) => {
        const current = get().attempt;
        if (current?.fingerprint === fingerprint) return current.idempotencyKey;
        const attempt = { fingerprint, idempotencyKey: newKey() };
        set({ attempt });
        return attempt.idempotencyKey;
      },
      finishAttempt: () => set({ attempt: null }),
    }),
    {
      name: 'quickbite.checkout',
      version: 2,
      partialize: ({ addressId, attempt }) => ({ addressId, attempt }),
      migrate: (persisted) => ({ attempt: null, ...(persisted as object) }) as CheckoutState,
    },
  ),
);
