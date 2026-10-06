import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getBackend } from '../../backend';
import { useSession } from './sessionStore';

/** Keeps the session store in sync with the backend and drops private data on sign-out. */
export function AuthSync() {
  const client = useQueryClient();
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void getBackend().then((backend) => {
      if (cancelled) return;
      unsubscribe = backend.auth.onChange((user) => {
        const previous = useSession.getState().user;
        useSession.getState().setUser(user);
        if (previous && previous.uid !== user?.uid) {
          // Catalog data stays cached; anything that belongs to a person goes.
          client.removeQueries({
            predicate: (q) =>
              !['areas', 'restaurants', 'restaurant', 'menu', 'search', 'coupons'].includes(
                String(q.queryKey[0]),
              ),
          });
        }
      });
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [client]);
  return null;
}
