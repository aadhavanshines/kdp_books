import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { createApiClient, type ApiClient } from './client';
import { ApiProvider } from './hooks';

/** The subset of AsyncStorage (or localStorage) the session needs. */
export interface TokenStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export interface Session {
  /** The stored token has been read. */
  ready: boolean;
  signedIn: boolean;
}

const SessionContext = createContext<Session>({ ready: false, signedIn: false });

export function useSession(): Session {
  return useContext(SessionContext);
}

/** Clears cached data whenever the user signs out (or the token is rejected). */
function ClearOnSignOut({ signedIn }: { signedIn: boolean }) {
  const qc = useQueryClient();
  const was = useRef(signedIn);
  useEffect(() => {
    if (was.current && !signedIn) qc.clear();
    was.current = signedIn;
  }, [signedIn, qc]);
  return null;
}

export interface SessionProviderProps {
  children: ReactNode;
  /** Where the token is kept, e.g. "cartly.token". */
  storageKey: string;
  /** AsyncStorage in the apps. Without it the token lives only in memory. */
  storage?: TokenStorage;
  /** Tests pass a client with a fake fetch. */
  client?: ApiClient;
  /** Tests pass a query client without retries or garbage-collection timers. */
  queryClient?: QueryClient;
}

/**
 * Owns the API client and the login token: restores it from storage on
 * launch, saves it on login, and drops it on a 401.
 */
export function SessionProvider({ children, storageKey, storage, client: injected, queryClient }: SessionProviderProps) {
  const [token, setToken] = useState<string | null>(injected?.getToken() ?? null);
  const [ready, setReady] = useState(!!injected || !storage);
  const [client] = useState<ApiClient>(() => {
    if (injected) return injected;
    const created = createApiClient({
      onTokenChange: (next) => {
        setToken(next);
        if (storage) void (next ? storage.setItem(storageKey, next) : storage.removeItem(storageKey)).catch(() => undefined);
      },
      onUnauthorized: () => created.setToken(null),
    });
    return created;
  });

  useEffect(() => {
    if (injected || !storage) return;
    let alive = true;
    storage
      .getItem(storageKey)
      .then((stored) => {
        if (alive && stored) client.setToken(stored);
      })
      .catch(() => undefined)
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [client, injected, storage, storageKey]);

  return (
    <SessionContext.Provider value={{ ready, signedIn: !!token }}>
      <ApiProvider client={client} queryClient={queryClient}>
        <ClearOnSignOut signedIn={!!token} />
        {children}
      </ApiProvider>
    </SessionContext.Provider>
  );
}
