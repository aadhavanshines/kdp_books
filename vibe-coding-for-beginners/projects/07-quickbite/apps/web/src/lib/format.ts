import { formatMoney } from '@quickbite/core';

/** v1 runs in India only; when more regions launch this comes from the selected area's region. */
export const DEFAULT_LOCALE = 'en-IN';
export const DEFAULT_CURRENCY = 'INR';

export function formatPrice(minor: number, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
  return formatMoney(minor, currency, locale);
}

/** 18234 → "18K+", 950 → "950+" (how food apps show rating counts). */
export function formatCount(n: number): string {
  if (n >= 100_000) return `${Math.floor(n / 100_000)}L+`;
  if (n >= 1000) return `${(Math.floor(n / 100) / 10).toString().replace(/\.0$/, '')}K+`;
  return `${n}+`;
}

export function formatEta(min: number, max: number) {
  return `${min}-${max} mins`;
}
