import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { addRecent } from './search';

const KEY = 'cartly.recentSearches';

/** Recent searches, kept on the device. */
export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (alive && Array.isArray(parsed)) setRecent(parsed.filter((x): x is string => typeof x === 'string'));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  const save = (next: string[]) => {
    setRecent(next);
    void AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
  };
  const add = useCallback((term: string) => setRecent((list) => {
    const next = addRecent(list, term);
    void AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
    return next;
  }), []);
  return { recent, add, clear: () => save([]) };
}
