/**
 * Pure date and totals logic for Sip. No React, no storage, no clock access:
 * every function that needs "now" takes it as an argument so it can be tested.
 */

export type Entry = {
  id: string;
  /** Epoch milliseconds when the drink was logged. */
  timestamp: number;
  /** Millilitres. */
  amount: number;
};

export type DayTotal = {
  /** Local calendar day, YYYY-MM-DD. */
  key: string;
  /** Local midnight at the start of that day. */
  date: Date;
  total: number;
};

export const DEFAULT_GOAL_ML = 2000;
export const MIN_GOAL_ML = 250;
export const MAX_GOAL_ML = 10000;
/** Entries older than this many days are dropped when saving. */
export const RETENTION_DAYS = 30;

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day key (YYYY-MM-DD) for a timestamp or Date. */
export function dayKey(when: number | Date): string {
  const d = typeof when === 'number' ? new Date(when) : when;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local midnight at the start of the day containing `when`. */
export function startOfDay(when: number | Date): Date {
  const d = typeof when === 'number' ? new Date(when) : when;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Milliseconds until the next local midnight (DST-safe). Always > 0. */
export function msUntilNextMidnight(now: number | Date): number {
  const d = typeof now === 'number' ? new Date(now) : now;
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return next.getTime() - d.getTime();
}

export function totalForDay(entries: readonly Entry[], day: string): number {
  let sum = 0;
  for (const e of entries) {
    if (dayKey(e.timestamp) === day) sum += e.amount;
  }
  return sum;
}

/** Totals for the last `days` days, today first, including empty days. */
export function lastDays(
  entries: readonly Entry[],
  now: number | Date,
  days = 7,
): DayTotal[] {
  const today = startOfDay(now);
  const totals = new Map<string, number>();
  for (const e of entries) {
    const k = dayKey(e.timestamp);
    totals.set(k, (totals.get(k) ?? 0) + e.amount);
  }
  const result: DayTotal[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = dayKey(date);
    result.push({ key, date, total: totals.get(key) ?? 0 });
  }
  return result;
}

/** Whole-number percentage of the goal; not capped, 0 when the goal is invalid. */
export function percentOfGoal(total: number, goal: number): number {
  if (!(goal > 0)) return 0;
  return Math.round((total / goal) * 100);
}

/** Bar fill fraction clamped to 0..1. */
export function progressFraction(total: number, goal: number): number {
  if (!(goal > 0)) return 0;
  return Math.min(1, Math.max(0, total / goal));
}

export function addEntry(
  entries: readonly Entry[],
  amount: number,
  now: number,
): Entry[] {
  const entry: Entry = { id: `${now}-${entries.length}-${amount}`, timestamp: now, amount };
  return [...entries, entry];
}

/**
 * Removes the most recently logged entry from today. Entries from earlier
 * days are never touched, so undo cannot rewrite history after midnight.
 */
export function undoLast(entries: readonly Entry[], now: number | Date): Entry[] {
  const today = dayKey(now);
  let idx = -1;
  for (let i = 0; i < entries.length; i++) {
    if (dayKey(entries[i].timestamp) !== today) continue;
    if (idx === -1 || entries[i].timestamp >= entries[idx].timestamp) idx = i;
  }
  if (idx === -1) return [...entries];
  return entries.filter((_, i) => i !== idx);
}

export function hasEntryToday(entries: readonly Entry[], now: number | Date): boolean {
  const today = dayKey(now);
  return entries.some((e) => dayKey(e.timestamp) === today);
}

/** Drops entries older than the retention window. */
export function pruneOld(
  entries: readonly Entry[],
  now: number | Date,
  retentionDays = RETENTION_DAYS,
): Entry[] {
  const t = startOfDay(now);
  const cutoff = new Date(t.getFullYear(), t.getMonth(), t.getDate() - retentionDays).getTime();
  return entries.filter((e) => e.timestamp >= cutoff);
}

/** Parses user input for the goal. Returns null when it is not a valid goal. */
export function parseGoal(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d{1,6}$/.test(trimmed)) return null;
  const n = Number(trimmed);
  if (n < MIN_GOAL_ML || n > MAX_GOAL_ML) return null;
  return n;
}

/** Formats millilitres with thousands separators, e.g. 1250 -> "1,250 ml". */
export function formatMl(ml: number): string {
  return `${Math.round(ml).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ml`;
}

/** Defensive parse of stored JSON; drops malformed entries. */
export function sanitizeEntries(raw: unknown): Entry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (e): e is Entry =>
      !!e &&
      typeof e.id === 'string' &&
      Number.isFinite(e.timestamp) &&
      Number.isFinite(e.amount) &&
      e.amount > 0,
  );
}

export function sanitizeGoal(raw: unknown): number {
  return typeof raw === 'number' && raw >= MIN_GOAL_ML && raw <= MAX_GOAL_ML
    ? Math.round(raw)
    : DEFAULT_GOAL_ML;
}
