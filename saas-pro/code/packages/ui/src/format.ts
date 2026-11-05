const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

/** Format integer paise as rupees with Indian digit grouping: 1234567 -> ₹12,345.67 */
export function formatINR(paise: number): string {
  if (!Number.isInteger(paise)) throw new Error("Money must be integer paise");
  return inr.format(paise / 100);
}

/** "5 Nov 2026" in the given time zone (default Asia/Kolkata). */
export function formatDate(date: Date | string, timeZone = "Asia/Kolkata"): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone }).format(new Date(date));
}

/** "5 Nov 2026, 3:30 pm" in the given time zone. */
export function formatDateTime(date: Date | string, timeZone = "Asia/Kolkata"): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone }).format(new Date(date));
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
