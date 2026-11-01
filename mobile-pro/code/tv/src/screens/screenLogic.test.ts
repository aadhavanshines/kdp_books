import { CHANNELS, GUIDE_HOURS, GUIDE_START, programmesInWindow } from '../data/catalog';
import { cellFrame, timeX, type GuideGeometry } from './guideLayout';
import { applyKey, LETTER_ROWS, MAX_QUERY } from './keyboard';
import { controlsShouldHide, seekBy } from './playerLogic';

describe('on-screen keyboard', () => {
  it('has 36 keys, six to a row', () => {
    expect(LETTER_ROWS.flat()).toHaveLength(36);
    LETTER_ROWS.forEach((row) => expect(row).toHaveLength(6));
  });

  it('types, spaces, deletes and clears', () => {
    let q = '';
    q = applyKey(q, { type: 'space' });
    expect(q).toBe('');
    q = applyKey(q, { type: 'char', char: 's' });
    q = applyKey(q, { type: 'space' });
    q = applyKey(q, { type: 'space' });
    expect(q).toBe('s ');
    q = applyKey(q, { type: 'delete' });
    expect(q).toBe('s');
    expect(applyKey(q, { type: 'clear' })).toBe('');
    expect(applyKey('', { type: 'delete' })).toBe('');
  });

  it('caps the query length', () => {
    const full = 'x'.repeat(MAX_QUERY);
    expect(applyKey(full, { type: 'char', char: 'y' })).toBe(full);
  });
});

describe('player rules', () => {
  it('seeks in 10 second steps within the programme', () => {
    expect(seekBy(100, 10, 600)).toBe(110);
    expect(seekBy(5, -10, 600)).toBe(0);
    expect(seekBy(595, 10, 600)).toBe(600);
  });

  it('hides controls only while playing, with no menu, after the idle time', () => {
    const base = { playing: true, menuOpen: false, idleMs: 6000, hideAfterMs: 5000 };
    expect(controlsShouldHide(base)).toBe(true);
    expect(controlsShouldHide({ ...base, playing: false })).toBe(false);
    expect(controlsShouldHide({ ...base, menuOpen: true })).toBe(false);
    expect(controlsShouldHide({ ...base, idleMs: 1000 })).toBe(false);
  });
});

describe('guide layout', () => {
  const g: GuideGeometry = { start: GUIDE_START, span: GUIDE_HOURS * 60, width: 1800, gap: 8 };

  it('places programmes on the timeline, clipped to the window', () => {
    // 8:00 PM to 8:30 PM is the first 30 of 180 minutes.
    expect(cellFrame(g, GUIDE_START, GUIDE_START + 30)).toEqual({ x: 0, width: 300 - 8 });
    // Started at 7:30 PM: clipped to 8:00 PM.
    expect(cellFrame(g, GUIDE_START - 30, GUIDE_START + 60)).toEqual({ x: 0, width: 600 - 8 });
    // Entirely before the window.
    expect(cellFrame(g, GUIDE_START - 90, GUIDE_START - 30).width).toBe(0);
  });

  it('places the now line', () => {
    expect(timeX(g, GUIDE_START + 90)).toBe(900);
  });

  it('fills every channel row across the whole window', () => {
    CHANNELS.forEach((c) => {
      const cells = programmesInWindow(c, g.start, g.start + g.span);
      expect(cells[0]!.visibleStart).toBe(g.start);
      expect(cells[cells.length - 1]!.visibleEnd).toBe(g.start + g.span);
    });
  });
});
