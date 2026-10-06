import { describe, expect, it } from 'vitest';
import { applyBps, currencyExponent, formatMoney, toMajor, toMinor } from './money';

describe('money', () => {
  it('knows currency exponents', () => {
    expect(currencyExponent('INR')).toBe(2);
    expect(currencyExponent('JPY')).toBe(0);
  });

  it('converts between major and minor units without float errors', () => {
    expect(toMinor(0.1 + 0.2, 'INR')).toBe(30);
    expect(toMinor(249.99, 'INR')).toBe(24999);
    expect(toMajor(24999, 'INR')).toBe(249.99);
  });

  it('applies basis points with half-up rounding', () => {
    expect(applyBps(10000, 500)).toBe(500);
    expect(applyBps(10010, 500)).toBe(501); // 500.5 → 501
    expect(applyBps(10009, 500)).toBe(500); // 500.45 → 500
    expect(applyBps(0, 1800)).toBe(0);
  });

  it('formats rupees the Indian way and trims .00', () => {
    expect(formatMoney(24900, 'INR', 'en-IN')).toBe('₹249');
    expect(formatMoney(24950, 'INR', 'en-IN')).toBe('₹249.50');
    expect(formatMoney(12345600, 'INR', 'en-IN')).toBe('₹1,23,456');
    expect(formatMoney(24900, 'INR', 'en-IN', { trimWholeDecimals: false })).toBe('₹249.00');
  });

  it('formats other currencies', () => {
    expect(formatMoney(1299, 'GBP', 'en-GB')).toBe('£12.99');
    expect(formatMoney(500, 'JPY', 'ja-JP')).toBe('￥500');
  });
});
