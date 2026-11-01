const inrWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const inrPaise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const plainNumber = new Intl.NumberFormat('en-IN');

/**
 * Formats rupees the Indian way: ₹1,23,456. Paise are shown only when the
 * amount is not a whole number (₹49.50).
 */
export function formatINR(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? inrWhole.format(rounded) : inrPaise.format(rounded);
}

/** 1234567 -> "12,34,567". */
export function formatNumber(value: number): string {
  return plainNumber.format(value);
}

/** Compact counts for likes and ratings: 950, 1.2K, 34K, 1.5M. */
export function formatCompact(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const k = value / 1000;
    return `${k < 10 ? Math.floor(k * 10) / 10 : Math.floor(k)}K`;
  }
  const m = value / 1_000_000;
  return `${m < 10 ? Math.floor(m * 10) / 10 : Math.floor(m)}M`;
}

/** Whole-percent discount from MRP to price; 0 when there is no discount. */
export function discountPercent(price: number, mrp: number | undefined | null): number {
  if (!mrp || mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Seconds left until `endsAt`, never negative. */
export function secondsUntil(endsAt: number | string | Date, now: number = Date.now()): number {
  const end = endsAt instanceof Date ? endsAt.getTime() : typeof endsAt === 'string' ? Date.parse(endsAt) : endsAt;
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - now) / 1000));
}

export interface DurationParts {
  hours: number;
  minutes: number;
  seconds: number;
}

export function splitDuration(totalSeconds: number): DurationParts {
  const s = Math.max(0, Math.floor(totalSeconds));
  return { hours: Math.floor(s / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "01:02:03" when an hour or more is left, otherwise "02:03". */
export function formatDuration(totalSeconds: number, format: 'auto' | 'hms' | 'ms' = 'auto'): string {
  const { hours, minutes, seconds } = splitDuration(totalSeconds);
  if (format === 'hms' || (format === 'auto' && hours > 0)) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours * 60 + minutes)}:${pad(seconds)}`;
}

/** A screen-reader friendly duration: "1 hour 2 minutes 3 seconds". */
export function spokenDuration(totalSeconds: number): string {
  const { hours, minutes, seconds } = splitDuration(totalSeconds);
  const part = (n: number, unit: string) => (n > 0 ? `${n} ${unit}${n === 1 ? '' : 's'}` : '');
  const text = [part(hours, 'hour'), part(minutes, 'minute'), part(seconds, 'second')].filter(Boolean).join(' ');
  return text || '0 seconds';
}

/** "red-apple" -> "Red apple". Used as the default accessibility label for art. */
export function humanize(slug: string): string {
  const words = slug.replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Up to two initials from a name: "Riya Kapoor" -> "RK". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}
