/**
 * Where an offer banner goes. Seed data links categories as
 * "/category/fruits" and coupon offers as "/offers" (the cart's coupon
 * sheet). Anything else is ignored rather than routed to a 404.
 */
export function bannerHref(link: string | null | undefined): string | null {
  if (!link) return null;
  const category = /^\/category\/([a-z0-9-]+)$/.exec(link);
  if (category) return `/category/${category[1]}`;
  if (link === '/offers') return '/cart?coupons=1';
  if (link === '/search') return '/search';
  return null;
}
