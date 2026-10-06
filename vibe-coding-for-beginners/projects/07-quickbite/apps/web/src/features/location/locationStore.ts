import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  areaId: string | null;
  setArea: (areaId: string) => void;
  clear: () => void;
}

/** The delivery area the customer picked. Remembered on this device. */
export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      areaId: null,
      setArea: (areaId) => set({ areaId }),
      clear: () => set({ areaId: null }),
    }),
    { name: 'quickbite.location', version: 1 },
  ),
);
