import {
  addEntry,
  dayKey,
  DEFAULT_GOAL_ML,
  Entry,
  formatMl,
  hasEntryToday,
  lastDays,
  msUntilNextMidnight,
  parseGoal,
  percentOfGoal,
  progressFraction,
  pruneOld,
  sanitizeEntries,
  sanitizeGoal,
  totalForDay,
  undoLast,
} from '../lib/water';

const at = (y: number, m: number, d: number, h = 12, min = 0) =>
  new Date(y, m - 1, d, h, min).getTime();
const entry = (ts: number, amount: number, id = `${ts}-${amount}`): Entry => ({
  id,
  timestamp: ts,
  amount,
});

describe('dayKey', () => {
  it('uses local calendar date, zero padded', () => {
    expect(dayKey(at(2026, 3, 5))).toBe('2026-03-05');
  });
  it('rolls over exactly at local midnight', () => {
    expect(dayKey(new Date(2026, 0, 1, 23, 59, 59, 999))).toBe('2026-01-01');
    expect(dayKey(new Date(2026, 0, 2, 0, 0, 0, 0))).toBe('2026-01-02');
  });
});

describe('msUntilNextMidnight', () => {
  it('counts to the next local midnight', () => {
    expect(msUntilNextMidnight(new Date(2026, 5, 10, 23, 0, 0))).toBe(3600_000);
  });
  it('is a full day just after midnight', () => {
    expect(msUntilNextMidnight(new Date(2026, 5, 10, 0, 0, 0))).toBe(86_400_000);
  });
  it('is always positive', () => {
    expect(msUntilNextMidnight(new Date(2026, 5, 10, 23, 59, 59, 999))).toBe(1);
  });
});

describe('totals', () => {
  const entries = [
    entry(at(2026, 6, 10, 8), 250),
    entry(at(2026, 6, 10, 13), 500),
    entry(at(2026, 6, 9, 20), 500),
  ];
  it('sums a single day', () => {
    expect(totalForDay(entries, '2026-06-10')).toBe(750);
    expect(totalForDay(entries, '2026-06-09')).toBe(500);
    expect(totalForDay(entries, '2026-06-08')).toBe(0);
  });
  it('lastDays returns 7 days, today first, zero-filled', () => {
    const days = lastDays(entries, at(2026, 6, 10, 15));
    expect(days).toHaveLength(7);
    expect(days.map((d) => d.key)).toEqual([
      '2026-06-10',
      '2026-06-09',
      '2026-06-08',
      '2026-06-07',
      '2026-06-06',
      '2026-06-05',
      '2026-06-04',
    ]);
    expect(days.map((d) => d.total)).toEqual([750, 500, 0, 0, 0, 0, 0]);
  });
  it('lastDays crosses month and year boundaries', () => {
    const days = lastDays([], at(2026, 1, 2));
    expect(days[2].key).toBe('2025-12-31');
    expect(days[6].key).toBe('2025-12-27');
  });
  it('excludes entries older than the window', () => {
    const old = [entry(at(2026, 6, 1), 999)];
    expect(lastDays(old, at(2026, 6, 10)).every((d) => d.total === 0)).toBe(true);
  });
  it('lastDays is stable across a DST change (US 2026-03-08)', () => {
    const days = lastDays([], at(2026, 3, 9, 1));
    expect(new Set(days.map((d) => d.key)).size).toBe(7);
    expect(days[1].key).toBe('2026-03-08');
  });
});

describe('progress', () => {
  it('computes percent, uncapped', () => {
    expect(percentOfGoal(500, 2000)).toBe(25);
    expect(percentOfGoal(1000, 3000)).toBe(33);
    expect(percentOfGoal(3000, 2000)).toBe(150);
  });
  it('handles invalid goals', () => {
    expect(percentOfGoal(500, 0)).toBe(0);
    expect(progressFraction(500, 0)).toBe(0);
  });
  it('clamps the bar fraction', () => {
    expect(progressFraction(3000, 2000)).toBe(1);
    expect(progressFraction(-5, 2000)).toBe(0);
    expect(progressFraction(500, 2000)).toBe(0.25);
  });
});

describe('addEntry / undoLast', () => {
  const now = at(2026, 6, 10, 15);
  it('adds without mutating', () => {
    const base: Entry[] = [];
    const next = addEntry(base, 250, now);
    expect(base).toHaveLength(0);
    expect(next).toEqual([expect.objectContaining({ amount: 250, timestamp: now })]);
  });
  it('gives unique ids to same-millisecond entries', () => {
    const a = addEntry(addEntry([], 250, now), 250, now);
    expect(a[0].id).not.toBe(a[1].id);
  });
  it('removes the latest entry from today', () => {
    const list = [entry(at(2026, 6, 10, 8), 250), entry(at(2026, 6, 10, 9), 500)];
    const out = undoLast(list, now);
    expect(out).toHaveLength(1);
    expect(out[0].amount).toBe(250);
  });
  it('picks the latest by time even if the array is out of order', () => {
    const list = [entry(at(2026, 6, 10, 9), 500), entry(at(2026, 6, 10, 8), 250)];
    expect(undoLast(list, now)[0].amount).toBe(250);
  });
  it('never removes entries from a previous day', () => {
    const list = [entry(at(2026, 6, 9, 22), 500)];
    expect(undoLast(list, now)).toEqual(list);
    expect(hasEntryToday(list, now)).toBe(false);
  });
  it('is a no-op on empty', () => {
    expect(undoLast([], now)).toEqual([]);
  });
});

describe('pruneOld', () => {
  it('keeps entries inside the window and drops older ones', () => {
    const now = at(2026, 6, 30);
    const list = [entry(at(2026, 5, 30, 0, 0), 1), entry(at(2026, 5, 29, 23, 59), 2)];
    expect(pruneOld(list, now, 31).map((e) => e.amount)).toEqual([1]);
  });
});

describe('parseGoal', () => {
  it('accepts valid integers', () => {
    expect(parseGoal('2000')).toBe(2000);
    expect(parseGoal(' 2500 ')).toBe(2500);
  });
  it.each(['', 'abc', '12.5', '-100', '100', '10001', '2,000', '1e3'])(
    'rejects %p',
    (v) => expect(parseGoal(v)).toBeNull(),
  );
});

describe('formatMl', () => {
  it('adds thousands separators', () => {
    expect(formatMl(0)).toBe('0 ml');
    expect(formatMl(250)).toBe('250 ml');
    expect(formatMl(1250)).toBe('1,250 ml');
    expect(formatMl(10000)).toBe('10,000 ml');
  });
});

describe('sanitizing stored data', () => {
  it('drops malformed entries and non-arrays', () => {
    expect(sanitizeEntries(null)).toEqual([]);
    expect(sanitizeEntries('x')).toEqual([]);
    const good = entry(1, 250);
    expect(
      sanitizeEntries([good, null, { id: 1 }, { id: 'a', timestamp: 1, amount: -5 }]),
    ).toEqual([good]);
  });
  it('falls back to the default goal', () => {
    expect(sanitizeGoal(undefined)).toBe(DEFAULT_GOAL_ML);
    expect(sanitizeGoal(5)).toBe(DEFAULT_GOAL_ML);
    expect(sanitizeGoal(3000)).toBe(3000);
  });
});
