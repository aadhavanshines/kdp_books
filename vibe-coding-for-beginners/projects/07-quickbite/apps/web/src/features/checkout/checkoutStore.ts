import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CheckoutState {
  addressId: string | null;
  setAddressId: (id: string | null) => void;
}

/** Remembers the chosen delivery address on this device. */
export const useCheckoutStore = create<CheckoutState>()(
  persist((set) => ({ addressId: null, setAddressId: (addressId) => set({ addressId }) }), {
    name: 'quickbite.checkout',
    version: 1,
  }),
);
