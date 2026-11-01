import {
  discountPercent,
  formatCompact,
  formatDuration,
  formatINR,
  formatNumber,
  humanize,
  initials,
  secondsUntil,
  spokenDuration,
} from './format';

describe('formatINR', () => {
  it.each([
    [0, '₹0'],
    [99, '₹99'],
    [1249, '₹1,249'],
    [124999, '₹1,24,999'],
    [12345678, '₹1,23,45,678'],
    [49.5, '₹49.50'],
    [10.004, '₹10'],
  ])('%p -> %s', (amount, expected) => {
    expect(formatINR(amount)).toBe(expected);
  });
});

describe('number helpers', () => {
  it('groups digits the Indian way', () => {
    expect(formatNumber(1234567)).toBe('12,34,567');
  });

  it('compacts counts', () => {
    expect(formatCompact(950)).toBe('950');
    expect(formatCompact(1249)).toBe('1.2K');
    expect(formatCompact(34_900)).toBe('34K');
    expect(formatCompact(1_560_000)).toBe('1.5M');
  });

  it('computes whole-percent discounts', () => {
    expect(discountPercent(249, 299)).toBe(17);
    expect(discountPercent(299, 299)).toBe(0);
    expect(discountPercent(300, 299)).toBe(0);
    expect(discountPercent(100, null)).toBe(0);
    expect(discountPercent(0, 100)).toBe(100);
  });
});

describe('durations', () => {
  it('counts whole seconds until a time and never goes negative', () => {
    expect(secondsUntil(10_500, 10_000)).toBe(1);
    expect(secondsUntil(10_000, 12_000)).toBe(0);
    expect(secondsUntil(new Date(70_000), 10_000)).toBe(60);
    expect(secondsUntil('not a date', 0)).toBe(0);
  });

  it('formats mm:ss and hh:mm:ss', () => {
    expect(formatDuration(65)).toBe('01:05');
    expect(formatDuration(3723)).toBe('01:02:03');
    expect(formatDuration(65, 'hms')).toBe('00:01:05');
    expect(formatDuration(3723, 'ms')).toBe('62:03');
  });

  it('speaks durations', () => {
    expect(spokenDuration(3723)).toBe('1 hour 2 minutes 3 seconds');
    expect(spokenDuration(60)).toBe('1 minute');
    expect(spokenDuration(0)).toBe('0 seconds');
  });
});

describe('text helpers', () => {
  it('humanizes art names', () => {
    expect(humanize('red-apple')).toBe('Red apple');
  });

  it('builds initials', () => {
    expect(initials('Riya Kapoor')).toBe('RK');
    expect(initials('  meera ')).toBe('M');
    expect(initials('Arjun Dev Rao')).toBe('AR');
  });
});
