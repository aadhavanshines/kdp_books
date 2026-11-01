/**
 * The app's screen stack, as a pure reducer. TV apps have a shallow,
 * predictable history: the profile picker at the bottom, Home above it, at
 * most one other top-level section (picked from the rail) above Home, then
 * whatever was opened from there (details, player). Back pops one level, so
 * from any section it lands on Home, and from Home on the profile picker.
 */
import type { Section } from '../data/types';

export type TopLevel = Section | 'search' | 'guide' | 'settings';

export type Route =
  | { name: 'profiles' }
  | { name: 'browse'; section: Section }
  | { name: 'search'; query?: string }
  | { name: 'guide' }
  | { name: 'settings' }
  | { name: 'details'; titleId: string }
  | { name: 'player'; titleId: string; episodeId?: string; startSec?: number; trailer?: boolean }
  | { name: 'live'; channelId: string };

export interface NavState {
  stack: Route[];
}

export type NavAction =
  | { type: 'push'; route: Route }
  /** Switch top-level section from the rail: everything above Home is replaced. */
  | { type: 'section'; section: TopLevel }
  /** Swap the top route (next episode replaces the current player). */
  | { type: 'replace'; route: Route }
  | { type: 'back' }
  /** Pick a profile: start a fresh Home above the picker. */
  | { type: 'enter' }
  | { type: 'profiles' };

export const initialNav: NavState = { stack: [{ name: 'profiles' }] };

export function routeForSection(section: TopLevel): Route {
  switch (section) {
    case 'search':
    case 'guide':
    case 'settings':
      return { name: section };
    default:
      return { name: 'browse', section };
  }
}

/** Which rail item a route belongs to, or null for routes without the rail. */
export function sectionOf(route: Route): TopLevel | null {
  switch (route.name) {
    case 'browse':
      return route.section;
    case 'search':
    case 'guide':
    case 'settings':
      return route.name;
    default:
      return null;
  }
}

export function topRoute(state: NavState): Route {
  return state.stack[state.stack.length - 1]!;
}

/** Whether Back on this state should leave the app (only from the profile picker). */
export function canGoBack(state: NavState): boolean {
  return state.stack.length > 1;
}

const HOME: Route = { name: 'browse', section: 'home' };

export function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'push':
      return { stack: [...state.stack, action.route] };
    case 'replace':
      return { stack: [...state.stack.slice(0, -1), action.route] };
    case 'back':
      return canGoBack(state) ? { stack: state.stack.slice(0, -1) } : state;
    case 'enter':
      return { stack: [{ name: 'profiles' }, HOME] };
    case 'profiles':
      return initialNav;
    case 'section': {
      const base: Route[] = [{ name: 'profiles' }, HOME];
      if (action.section === 'home') return { stack: base };
      return { stack: [...base, routeForSection(action.section)] };
    }
  }
}
