/** A star breakdown whose mean matches `average` (a discretised normal around a fitted center). */
export function ratingBreakdown(average: number, total: number): { stars: 1 | 2 | 3 | 4 | 5; count: number }[] {
  const weightsFor = (mu: number) => {
    const w = [1, 2, 3, 4, 5].map((k) => Math.exp(-((k - mu) ** 2) / (2 * 1.15 ** 2)));
    const sum = w.reduce((a, b) => a + b, 0);
    return w.map((x) => x / sum);
  };
  const meanOf = (w: number[]) => w.reduce((s, x, i) => s + x * (i + 1), 0);
  let lo = 0;
  let hi = 9;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (meanOf(weightsFor(mid)) < average) lo = mid;
    else hi = mid;
  }
  const weights = weightsFor((lo + hi) / 2);
  const counts = weights.map((w) => Math.round(w * total));
  counts[4]! += total - counts.reduce((a, b) => a + b, 0);
  return ([5, 4, 3, 2, 1] as const).map((stars) => ({ stars, count: Math.max(0, counts[stars - 1]!) }));
}
