import { chooseCandidate, directionForKey, findNext, isInBeam, isInDirection, type Candidate, type Rect } from './spatial';

const r = (x: number, y: number, width = 100, height = 60): Rect => ({ x, y, width, height });

describe('spatial navigation', () => {
  // A row of three cards and a row below it, offset to the right.
  const row = [r(0, 0), r(120, 0), r(240, 0)];
  const below = [r(60, 200), r(180, 200), r(300, 200)];

  it('maps arrow keys to directions', () => {
    expect(directionForKey('ArrowLeft')).toBe('left');
    expect(directionForKey('ArrowDown')).toBe('down');
    expect(directionForKey('Enter')).toBeNull();
  });

  it('only considers candidates in the direction of travel', () => {
    expect(isInDirection(row[1]!, row[2]!, 'right')).toBe(true);
    expect(isInDirection(row[1]!, row[0]!, 'right')).toBe(false);
    expect(isInDirection(row[1]!, below[0]!, 'down')).toBe(true);
    expect(isInDirection(row[1]!, below[0]!, 'up')).toBe(false);
  });

  it('moves along a row to the nearest card', () => {
    expect(findNext(row[0]!, [row[1]!, row[2]!], 'right')).toBe(0);
    expect(findNext(row[2]!, [row[0]!, row[1]!], 'left')).toBe(1);
  });

  it('stays put at the end of a row', () => {
    expect(findNext(row[2]!, [row[0]!, row[1]!], 'right')).toBe(-1);
  });

  it('prefers candidates in the beam when moving between rows', () => {
    // From the middle card, Down should pick the card overlapping it horizontally.
    expect(isInBeam(row[1]!, below[0]!, 'down')).toBe(true);
    expect(findNext(row[1]!, below, 'down')).toBe(0);
  });

  it('prefers an in-beam candidate even when an out-of-beam one is closer on the main axis', () => {
    const from = r(0, 0, 100, 100);
    const farInBeam = r(400, 10, 100, 80);
    const nearOffBeam = r(150, 300, 100, 80);
    expect(findNext(from, [nearOffBeam, farInBeam], 'right')).toBe(1);
  });

  it('ignores hidden (zero-size) elements', () => {
    expect(findNext(row[0]!, [r(120, 0, 0, 0), row[2]!], 'right')).toBe(1);
  });

  it('tolerates a scaled (focused) card overlapping its neighbours', () => {
    const scaled = r(-4, -3, 108, 66);
    expect(findNext(scaled, [row[1]!], 'right')).toBe(0);
  });
});

describe('focus groups', () => {
  const rail: Candidate[] = [
    { rect: r(0, 0, 80, 60), group: 'rail' },
    { rect: r(0, 80, 80, 60), group: 'rail', isGroupDefault: true },
    { rect: r(0, 160, 80, 60), group: 'rail' },
  ];
  const rowA: Candidate[] = [0, 1, 2, 3].map((i) => ({ rect: r(200 + i * 120, 300), group: 'rowA' }));
  const rowB: Candidate[] = [0, 1, 2, 3].map((i) => ({ rect: r(200 + i * 120, 400), group: 'rowB' }));

  it('enters the rail at its active item, wherever focus comes from', () => {
    const candidates = [...rail, ...rowA];
    // Focus is level with the third rail item, but Left lands on the default (index 1).
    expect(chooseCandidate(r(200, 160), 'rowA', candidates, 'left')).toBe(1);
  });

  it('returns to the card last focused in a row', () => {
    const candidates = [...rowA, ...rowB];
    // From rowA's first card, geometry says rowB[0], memory says rowB[3] (index 7).
    expect(chooseCandidate(rowA[0]!.rect, 'rowA', candidates, 'down', { rowB: 7 })).toBe(7);
  });

  it('uses geometry inside a group, ignoring memory', () => {
    const candidates = [...rowA.slice(1)];
    expect(chooseCandidate(rowA[0]!.rect, 'rowA', candidates, 'right', { rowA: 2 })).toBe(0);
  });

  it('ignores stale memory that points outside the group', () => {
    const candidates = [...rowA, ...rowB];
    expect(chooseCandidate(rowA[0]!.rect, 'rowA', candidates, 'down', { rowB: 1 })).toBe(4);
  });

  it('keeps focus inside a group for trapped directions (the seek bar scrubs instead)', () => {
    const seek: Candidate = { rect: r(0, 0, 1000, 40), group: 'seek' };
    const nextButton: Candidate = { rect: r(900, 100, 200, 60), group: 'controls' };
    expect(chooseCandidate(seek.rect, 'seek', [nextButton], 'right')).toBe(0);
    expect(chooseCandidate(seek.rect, 'seek', [nextButton], 'right', {}, ['left', 'right'])).toBe(-1);
    // Down is not trapped.
    expect(chooseCandidate(seek.rect, 'seek', [nextButton], 'down', {}, ['left', 'right'])).toBe(0);
  });
});
