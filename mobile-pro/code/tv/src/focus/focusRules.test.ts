import { remoteKeyFor, remoteKeyForKeyboard } from './remoteKeys';
import { requestFocus } from './requestFocus';
import { shouldTakeFocus } from './ScreenFocus';

describe('initial and restored focus', () => {
  const initial = { key: null, nonce: 0 };

  it('gives a fresh screen to its autoFocus element only', () => {
    expect(shouldTakeFocus(true, initial, 'hero:play', true)).toBe(true);
    expect(shouldTakeFocus(true, initial, 'hero:info', false)).toBe(false);
  });

  it('never takes focus on a hidden screen', () => {
    expect(shouldTakeFocus(false, initial, 'hero:play', true)).toBe(false);
  });

  it('restores the element focused before leaving, not the autoFocus one', () => {
    const restore = { key: 'row:originals:ghost-lane', nonce: 2 };
    expect(shouldTakeFocus(true, restore, 'row:originals:ghost-lane', false)).toBe(true);
    expect(shouldTakeFocus(true, restore, 'hero:play', true)).toBe(false);
  });
});

describe('requestFocus', () => {
  it('uses requestTVFocus on TV host views', () => {
    const host = { requestTVFocus: jest.fn(), focus: jest.fn() };
    expect(requestFocus(host)).toBe(true);
    expect(host.requestTVFocus).toHaveBeenCalled();
    expect(host.focus).not.toHaveBeenCalled();
  });

  it('focuses DOM nodes without letting the browser scroll', () => {
    const node = { focus: jest.fn() };
    requestFocus(node);
    expect(node.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('is a no-op without a host', () => {
    expect(requestFocus(null)).toBe(false);
  });
});

describe('remote keys', () => {
  it('maps react-native-tvos events', () => {
    expect(remoteKeyFor('right')).toBe('right');
    expect(remoteKeyFor('playPause')).toBe('playPause');
    expect(remoteKeyFor('focus')).toBeNull();
  });

  it('maps keyboard keys on web', () => {
    expect(remoteKeyForKeyboard('ArrowUp')).toBe('up');
    expect(remoteKeyForKeyboard('Enter')).toBe('select');
    expect(remoteKeyForKeyboard(' ')).toBe('playPause');
    expect(remoteKeyForKeyboard('a')).toBeNull();
  });
});
