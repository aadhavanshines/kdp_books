/** Marketing banners for platform-wide coupons (codes match the seed coupons). */
export const OFFER_BANNERS = [
  {
    code: 'WELCOME50',
    eyebrow: 'New here?',
    headline: '50% OFF',
    detail: 'up to ₹100 on your first order',
    image: '/images/seed/dishes/biryani-chicken',
    className: 'from-[#ff6a3d] to-[#d63a16]',
  },
  {
    code: 'FREEDEL',
    eyebrow: 'Every day',
    headline: 'Free delivery',
    detail: 'on orders above ₹299',
    image: '/images/seed/dishes/pizza-pepperoni',
    className: 'from-[#4f46e5] to-[#2d2a9e]',
  },
  {
    code: 'FLAT75',
    eyebrow: 'Flat deal',
    headline: '₹75 OFF',
    detail: 'on orders above ₹399',
    image: '/images/seed/dishes/momos-steamed',
    className: 'from-[#0f9f6e] to-[#086b4a]',
  },
  {
    code: 'PARTY20',
    eyebrow: 'Party time',
    headline: '20% OFF',
    detail: 'up to ₹200 above ₹999',
    image: '/images/seed/dishes/sundae',
    className: 'from-[#db2777] to-[#9d174d]',
  },
] as const;
