import type { Post } from '@pro/api';
import { formatNumber } from '@pro/ui';

/** The likes line under a post: "Liked by kabir.trails and 5,406 others", "1 like", or null for none. */
export function likesLine(post: Pick<Post, 'likeCount' | 'likedBy' | 'isLiked'>): { by: string | null; rest: string } | null {
  const { likeCount, likedBy } = post;
  if (likeCount <= 0) return null;
  if (likedBy && likeCount > 1) {
    const others = likeCount - 1;
    return { by: likedBy.handle, rest: `${formatNumber(others)} ${others === 1 ? 'other' : 'others'}` };
  }
  return { by: null, rest: `${formatNumber(likeCount)} ${likeCount === 1 ? 'like' : 'likes'}` };
}

/** Compact counts for profile stats: 980, 12.4K, 1.2M. */
export function statCount(n: number): string {
  if (n < 10_000) return formatNumber(n);
  if (n < 1_000_000) return `${(Math.floor(n / 100) / 10).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(Math.floor(n / 100_000) / 10).toFixed(1).replace(/\.0$/, '')}M`;
}
