const POSITIVE = ['Tasty food', 'Generous portions', 'Good packaging', 'On-time delivery', 'Polite rider', 'Value for money'];
const NEGATIVE = ['Cold food', 'Late delivery', 'Missing items', 'Poor packaging', 'Too spicy', 'Small portions'];

/** Quick tags to offer for a star rating: praise for 4 or 5, complaints below. */
export function ratingTags(stars: number): string[] {
  if (stars <= 0) return [];
  return stars >= 4 ? POSITIVE : NEGATIVE;
}
