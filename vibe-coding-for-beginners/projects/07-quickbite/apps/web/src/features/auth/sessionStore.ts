import { create } from 'zustand';
import type { User } from '../../backend';

interface SessionState {
  /** False until the backend has told us whether someone is signed in. */
  ready: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
}

/** The signed-in customer, mirrored from the backend's auth state by <AuthSync />. */
export const useSession = create<SessionState>()((set) => ({
  ready: false,
  user: null,
  setUser: (user) => set({ user, ready: true }),
}));

/** The signed-in user's id, or null. Query keys include it so data never leaks between accounts. */
export const useUid = () => useSession((s) => s.user?.uid ?? null);
