import { clippedRow, revealOffset, rowContentWidth, rowOffsetForIndex, sectionOffset, type RowMetrics } from './scroll';

const row: RowMetrics = { itemWidth: 400, gap: 28, count: 8, viewportWidth: 1920, inset: 176 };

describe('row scrolling', () => {
  it('measures content with insets on both ends', () => {
    expect(rowContentWidth(row)).toBe(176 * 2 + 8 * 400 + 7 * 28);
  });

  it('keeps the first card where it is', () => {
    expect(rowOffsetForIndex(row, 0)).toBe(0);
  });

  it('brings the focused card to the focus line', () => {
    expect(rowOffsetForIndex(row, 2)).toBe(2 * 428);
  });

  it('does not scroll past the end of the row', () => {
    const max = rowContentWidth(row) - row.viewportWidth;
    expect(rowOffsetForIndex(row, 7)).toBe(max);
    expect(rowOffsetForIndex(row, 99)).toBe(max);
  });

  it('never scrolls a row that fits on screen', () => {
    const short = { ...row, count: 3 };
    expect(rowOffsetForIndex(short, 2)).toBe(0);
  });

  it('handles an empty row', () => {
    expect(rowOffsetForIndex({ ...row, count: 0 }, 3)).toBe(0);
  });
});

describe('page and grid scrolling', () => {
  it('brings a section to the top, clamped to the content', () => {
    const tops = [0, 300, 700, 1100];
    expect(sectionOffset(tops, 1, 1500, 540)).toBe(300);
    expect(sectionOffset(tops, 3, 1500, 540)).toBe(960);
    expect(sectionOffset([], 2, 1500, 540)).toBe(0);
  });

  it('reveals a grid row with the least movement', () => {
    // Already visible: no change.
    expect(revealOffset(0, 100, 200, 800)).toBe(0);
    // Below the viewport: scroll just enough (plus margin).
    expect(revealOffset(0, 900, 200, 800, 20)).toBe(320);
    // Above the viewport: scroll up to it (minus margin).
    expect(revealOffset(500, 300, 200, 800, 20)).toBe(280);
  });
});

describe('rows clipped at the rail', () => {
  it('starts the viewport at the rail edge and keeps cards on the focus line', () => {
    const { left, paddingStart } = clippedRow(176, 112);
    expect(left).toBe(112);
    // First card still sits at the focus line on screen.
    expect(left + paddingStart).toBe(176);
  });

  it('never clips past the focus line', () => {
    expect(clippedRow(100, 112)).toEqual({ left: 100, paddingStart: 0 });
  });

  it('does not clip on screens without a rail', () => {
    expect(clippedRow(136, 0)).toEqual({ left: 0, paddingStart: 136 });
  });
});
