export type ExploreRow<T> =
  | { kind: 'feature'; key: string; big: T; small: T[]; side: 'left' | 'right' }
  | { kind: 'row'; key: string; items: T[] };

/**
 * Lays posts out as the Explore grid: blocks of six, each a 2x2 feature
 * tile beside two small tiles, then a row of three. The feature tile
 * alternates sides from block to block. Leftovers fill plain rows.
 */
export function exploreRows<T extends { id: string }>(posts: readonly T[]): ExploreRow<T>[] {
  const rows: ExploreRow<T>[] = [];
  let i = 0;
  let block = 0;
  while (posts.length - i >= 6) {
    const [big, a, b, c, d, e] = posts.slice(i, i + 6) as [T, T, T, T, T, T];
    rows.push({ kind: 'feature', key: big.id, big, small: [a, b], side: block % 2 === 0 ? 'left' : 'right' });
    rows.push({ kind: 'row', key: c.id, items: [c, d, e] });
    i += 6;
    block += 1;
  }
  for (; i < posts.length; i += 3) rows.push({ kind: 'row', key: posts[i]!.id, items: posts.slice(i, i + 3) });
  return rows;
}
