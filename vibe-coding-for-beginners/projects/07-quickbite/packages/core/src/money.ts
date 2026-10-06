import type { CurrencyCode } from './types';

const fractionDigitsCache = new Map<CurrencyCode, number>();

/** How many decimal places a currency uses (INR → 2, JPY → 0). */
export function currencyExponent(currency: CurrencyCode): number {
  let digits = fractionDigitsCache.get(currency);
  if (digits === undefined) {
    digits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
      .maximumFractionDigits as number;
    fractionDigitsCache.set(currency, digits);
  }
  return digits;
}

/** Converts a human amount (249.5) to minor units (24950). */
export function toMinor(major: number, currency: CurrencyCode): number {
  return Math.round(major * 10 ** currencyExponent(currency));
}

/** Converts minor units (24950) to a human amount (249.5). */
export function toMajor(minor: number, currency: CurrencyCode): number {
  return minor / 10 ** currencyExponent(currency);
}

/**
 * Applies a rate in basis points (500 = 5%) to an integer amount,
 * rounding half away from zero so the result is always whole minor units.
 */
export function applyBps(amount: number, bps: number): number {
  const exact = (amount * bps) / 10_000;
  return Math.sign(exact) * Math.round(Math.abs(exact));
}

export interface FormatMoneyOptions {
  /** Hide ".00" when the amount is whole (₹249 instead of ₹249.00). Default true. */
  trimWholeDecimals?: boolean;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function formatter(locale: string, currency: CurrencyCode, fractionDigits: number) {
  const key = `${locale}|${currency}|${fractionDigits}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    formatterCache.set(key, fmt);
  }
  return fmt;
}

/** Formats minor units for display, e.g. formatMoney(24900, 'INR', 'en-IN') → "₹249". */
export function formatMoney(
  minor: number,
  currency: CurrencyCode,
  locale: string,
  { trimWholeDecimals = true }: FormatMoneyOptions = {},
): string {
  const exponent = currencyExponent(currency);
  const isWhole = minor % 10 ** exponent === 0;
  const digits = trimWholeDecimals && isWhole ? 0 : exponent;
  return formatter(locale, currency, digits).format(toMajor(minor, currency));
}
