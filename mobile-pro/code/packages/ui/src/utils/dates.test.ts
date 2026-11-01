import { dateTime, formatClock, shortDate, timeAgo } from './dates';

describe('dates', () => {
  it('formats a clock time in lower case, and nothing for bad input', () => {
    expect(formatClock(new Date(2026, 10, 1, 20, 42))).toBe('8:42 pm');
    expect(formatClock(new Date(2026, 10, 1, 9, 5).toISOString())).toBe('9:05 am');
    expect(formatClock(null)).toBe('');
    expect(formatClock('')).toBe('');
    expect(formatClock('nope')).toBe('');
  });

  it('formats short dates and date-times', () => {
    expect(shortDate(new Date(2026, 10, 4, 12))).toMatch(/^Wed,? 4 Nov$/);
    expect(dateTime(new Date(2026, 10, 4, 18, 42))).toBe('4 Nov 2026, 6:42 pm');
  });

  it('formats relative times', () => {
    const now = Date.parse('2026-11-01T12:00:00.000Z');
    expect(timeAgo('2026-11-01T11:59:40.000Z', now)).toBe('Just now');
    expect(timeAgo('2026-11-01T11:48:00.000Z', now)).toBe('12m ago');
    expect(timeAgo('2026-11-01T09:00:00.000Z', now)).toBe('3h ago');
    expect(timeAgo('2026-10-30T12:00:00.000Z', now)).toBe('2d ago');
    expect(timeAgo('2026-10-01T12:00:00.000Z', now)).toMatch(/^1 Oct$/);
    expect(timeAgo('2026-11-01T12:05:00.000Z', now)).toBe('Just now');
  });
});
