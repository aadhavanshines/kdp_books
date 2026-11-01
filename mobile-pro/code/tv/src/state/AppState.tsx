import { createContext, useCallback, useContext, useMemo, useReducer, useState, type ReactNode } from 'react';

import { INITIAL_PROGRESS, PROFILES, type Profile, type Progress } from '../data/catalog';
import { initialNav, navReducer, topRoute, type NavAction, type NavState, type Route } from '../nav/stack';

export interface AppStateValue {
  profile: Profile | null;
  setProfile(p: Profile | null): void;
  progress: Progress[];
  saveProgress(p: Progress): void;
  myList: string[];
  toggleMyList(titleId: string): void;
  autoplayNext: boolean;
  setAutoplayNext(v: boolean): void;
  nav: NavState;
  top: Route;
  navigate(action: NavAction): void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function useApp(): AppStateValue {
  const v = useContext(AppStateContext);
  if (!v) throw new Error('useApp outside AppStateProvider');
  return v;
}

/** Progress list after saving one entry: newest first, one entry per title. Pure, for tests. */
export function upsertProgress(list: readonly Progress[], entry: Progress): Progress[] {
  return [entry, ...list.filter((p) => p.titleId !== entry.titleId)];
}

export function toggleIn(list: readonly string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];
}

export function AppStateProvider({ children, initialProfile = null }: { children: ReactNode; initialProfile?: Profile | null }) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [progress, setProgress] = useState<Progress[]>(() => [...INITIAL_PROGRESS]);
  const [myList, setMyList] = useState<string[]>(['ember-crown', 'quiet-detective', 'deep-reef', 'jetstream', 'blossom']);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [nav, dispatch] = useReducer(navReducer, initialNav);

  const saveProgress = useCallback((p: Progress) => setProgress((list) => upsertProgress(list, p)), []);
  const toggleMyList = useCallback((id: string) => setMyList((list) => toggleIn(list, id)), []);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      progress,
      saveProgress,
      myList,
      toggleMyList,
      autoplayNext,
      setAutoplayNext,
      nav,
      top: topRoute(nav),
      navigate: dispatch,
    }),
    [profile, progress, saveProgress, myList, toggleMyList, autoplayNext, nav],
  );
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const DEFAULT_PROFILE = PROFILES[0]!;
