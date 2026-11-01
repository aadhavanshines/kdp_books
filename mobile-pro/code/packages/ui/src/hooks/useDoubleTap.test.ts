import { createTapDetector } from './useDoubleTap';

describe('createTapDetector', () => {
  it('reports a double tap only within the delay', () => {
    const d = createTapDetector(300);
    expect(d.tap(1000)).toBe(false);
    expect(d.tap(1250)).toBe(true);
    // A third quick tap starts a new pair instead of liking again.
    expect(d.tap(1400)).toBe(false);
    expect(d.tap(2000)).toBe(false);
    expect(d.tap(2301)).toBe(false);
    expect(d.tap(2500)).toBe(true);
  });
});
