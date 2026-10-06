import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import {
  addEntry,
  DEFAULT_GOAL_ML,
  dayKey,
  DayTotal,
  Entry,
  hasEntryToday,
  lastDays,
  msUntilNextMidnight,
  pruneOld,
  sanitizeEntries,
  sanitizeGoal,
  totalForDay,
  undoLast,
} from './water';

const STORAGE_KEY = 'sip:v1';

type SipState = {
  loaded: boolean;
  goal: number;
  todayTotal: number;
  canUndo: boolean;
  history: DayTotal[];
  log: (amount: number) => void;
  undo: () => void;
  setGoal: (goal: number) => void;
};

const SipContext = createContext<SipState | null>(null);

export function SipProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goal, setGoalState] = useState(DEFAULT_GOAL_ML);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  // Mirror of entries so rapid taps never read a stale list.
  const entriesRef = useRef<Entry[]>(entries);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw);
          const loadedEntries = sanitizeEntries(parsed?.entries);
          entriesRef.current = loadedEntries;
          setEntries(loadedEntries);
          setGoalState(sanitizeGoal(parsed?.goal));
        }
      } catch {
        // Corrupt or unavailable storage: start fresh.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ entries: pruneOld(entries, Date.now()), goal }),
    ).catch(() => {});
  }, [entries, goal, loaded]);

  // Start a new day at local midnight, and re-check when the app returns to
  // the foreground (timers do not run while the app is suspended).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      clearTimeout(timer);
      // +1s slack so we land safely after midnight.
      timer = setTimeout(() => {
        setNow(Date.now());
        schedule();
      }, msUntilNextMidnight(Date.now()) + 1000);
    };
    schedule();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        setNow(Date.now());
        schedule();
      }
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);

  const log = useCallback((amount: number) => {
    const t = Date.now();
    entriesRef.current = addEntry(entriesRef.current, amount, t);
    setEntries(entriesRef.current);
    setNow(t);
  }, []);

  const undo = useCallback(() => {
    const t = Date.now();
    entriesRef.current = undoLast(entriesRef.current, t);
    setEntries(entriesRef.current);
    setNow(t);
  }, []);

  const value = useMemo<SipState>(
    () => ({
      loaded,
      goal,
      todayTotal: totalForDay(entries, dayKey(now)),
      canUndo: hasEntryToday(entries, now),
      history: lastDays(entries, now, 7),
      log,
      undo,
      setGoal: (g) => setGoalState(sanitizeGoal(g)),
    }),
    [loaded, goal, entries, now, log, undo],
  );

  return <SipContext.Provider value={value}>{children}</SipContext.Provider>;
}

export function useSip(): SipState {
  const ctx = useContext(SipContext);
  if (!ctx) throw new Error('useSip must be used inside <SipProvider>');
  return ctx;
}
