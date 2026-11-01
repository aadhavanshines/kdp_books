const DAY_MS = 24 * 60 * 60 * 1000;

const clock = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
const weekdayDate = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const dayMonth = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });
const dayMonthYear = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

type DateInput = string | number | Date;

/** "8:42 pm"; empty for a missing or invalid date. */
export function formatClock(value: DateInput | null | undefined): string {
  if (value == null || value === '') return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : clock.format(d).replace(/\s?(AM|PM)$/i, (m) => ` ${m.trim().toLowerCase()}`);
}

/** "Tue, 4 Nov". */
export function shortDate(value: DateInput): string {
  return weekdayDate.format(new Date(value));
}

/** "4 Nov 2026, 6:42 pm". */
export function dateTime(value: DateInput): string {
  return `${dayMonthYear.format(new Date(value))}, ${formatClock(value)}`;
}

/** "Just now", "12m ago", "3h ago", "2d ago", then "1 Oct". */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const ms = Math.max(0, now - Date.parse(iso));
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(ms / DAY_MS);
  if (d < 7) return `${d}d ago`;
  return dayMonth.format(new Date(iso));
}
