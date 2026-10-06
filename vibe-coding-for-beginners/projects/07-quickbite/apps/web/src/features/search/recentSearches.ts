import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentSearchState {
  terms: string[];
  add: (term: string) => void;
  clear: () => void;
}

export const useRecentSearches = create<RecentSearchState>()(
  persist(
    (set) => ({
      terms: [],
      add: (term) =>
        set((s) => {
          const t = term.trim();
          if (t.length < 2) return s;
          return {
            terms: [t, ...s.terms.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6),
          };
        }),
      clear: () => set({ terms: [] }),
    }),
    { name: 'quickbite.recent-searches', version: 1 },
  ),
);
