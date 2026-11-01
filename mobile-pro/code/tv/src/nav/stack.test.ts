import { createBackRegistry } from './back';
import { canGoBack, initialNav, navReducer, sectionOf, topRoute, type NavState } from './stack';

const names = (s: NavState) => s.stack.map((r) => (r.name === 'browse' ? `browse:${r.section}` : r.name));

describe('navigation stack', () => {
  const home = navReducer(initialNav, { type: 'enter' });

  it('starts on the profile picker and enters Home above it', () => {
    expect(names(initialNav)).toEqual(['profiles']);
    expect(names(home)).toEqual(['profiles', 'browse:home']);
  });

  it('Back from the profile picker is left to the system (exit)', () => {
    expect(canGoBack(initialNav)).toBe(false);
    expect(navReducer(initialNav, { type: 'back' })).toBe(initialNav);
  });

  it('switching sections from the rail replaces everything above Home', () => {
    const search = navReducer(home, { type: 'section', section: 'search' });
    const details = navReducer(search, { type: 'push', route: { name: 'details', titleId: 'starfall' } });
    const guide = navReducer(details, { type: 'section', section: 'guide' });
    expect(names(guide)).toEqual(['profiles', 'browse:home', 'guide']);
    // So Back from any section lands on Home, and from Home on the picker.
    const back = navReducer(guide, { type: 'back' });
    expect(names(back)).toEqual(['profiles', 'browse:home']);
    expect(names(navReducer(back, { type: 'back' }))).toEqual(['profiles']);
  });

  it('choosing Home from the rail pops back to Home', () => {
    const movies = navReducer(home, { type: 'section', section: 'movies' });
    expect(names(navReducer(movies, { type: 'section', section: 'home' }))).toEqual(['profiles', 'browse:home']);
  });

  it('Back pops details and the player one level at a time', () => {
    const d = navReducer(home, { type: 'push', route: { name: 'details', titleId: 'ghost-lane' } });
    const p = navReducer(d, { type: 'push', route: { name: 'player', titleId: 'ghost-lane', episodeId: 'ghost-lane-s2e6' } });
    expect(names(navReducer(p, { type: 'back' }))).toEqual(['profiles', 'browse:home', 'details']);
  });

  it('the next episode replaces the current player, so Back still returns to details', () => {
    const d = navReducer(home, { type: 'push', route: { name: 'details', titleId: 'ghost-lane' } });
    const p = navReducer(d, { type: 'push', route: { name: 'player', titleId: 'ghost-lane', episodeId: 'ghost-lane-s2e6' } });
    const next = navReducer(p, { type: 'replace', route: { name: 'player', titleId: 'ghost-lane', episodeId: 'ghost-lane-s2e7' } });
    expect(topRoute(next)).toEqual({ name: 'player', titleId: 'ghost-lane', episodeId: 'ghost-lane-s2e7' });
    expect(names(navReducer(next, { type: 'back' }))).toEqual(['profiles', 'browse:home', 'details']);
  });

  it('switching profile resets to the picker', () => {
    const deep = navReducer(home, { type: 'push', route: { name: 'details', titleId: 'x' } });
    expect(names(navReducer(deep, { type: 'profiles' }))).toEqual(['profiles']);
  });

  it('knows which rail item a route belongs to', () => {
    expect(sectionOf({ name: 'browse', section: 'sports' })).toBe('sports');
    expect(sectionOf({ name: 'guide' })).toBe('guide');
    expect(sectionOf({ name: 'details', titleId: 'x' })).toBeNull();
  });
});

describe('back registry', () => {
  it('runs the newest handler first and stops at the first that handles Back', () => {
    const reg = createBackRegistry();
    const calls: string[] = [];
    reg.add(() => {
      calls.push('root');
      return true;
    });
    const removeMenu = reg.add(() => {
      calls.push('menu');
      return true;
    });
    expect(reg.dispatch()).toBe(true);
    expect(calls).toEqual(['menu']);
    removeMenu();
    reg.dispatch();
    expect(calls).toEqual(['menu', 'root']);
  });

  it('falls through handlers that decline', () => {
    const reg = createBackRegistry();
    reg.add(() => false);
    expect(reg.dispatch()).toBe(false);
    const remove = reg.add(() => false);
    remove();
    expect(reg.size()).toBe(1);
  });
});
