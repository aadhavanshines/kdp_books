export type Clock = () => number;

export const systemClock: Clock = () => Date.now();

export const iso = (ms: number) => new Date(ms).toISOString();
export const isoOrNull = (ms: number | null | undefined) => (ms == null ? null : iso(ms));

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** "Tue, 4 Nov" in Indian English. */
export function shortDate(ms: number): string {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }).format(
    new Date(ms),
  );
}

/** Next midnight in India (deals of the day end then). */
export function nextMidnightIST(now: number): number {
  const offset = 330 * MINUTE;
  const local = now + offset;
  return Math.floor(local / DAY) * DAY + DAY - offset;
}
