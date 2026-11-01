/** An Expo Router destination. */
export type AppHref = string | { pathname: string; params: Record<string, string> };

/**
 * Banner and notification links from the server ("/sale", "/category/mobiles",
 * "/orders/ord_1") to Cartly routes. Unknown links return null.
 */
export function linkToHref(link: string | null | undefined): AppHref | null {
  if (!link) return null;
  const [path = '', search = ''] = link.split('?');
  const parts = path.split('/').filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(search));
  switch (parts[0]) {
    case 'sale':
      return { pathname: '/products', params: { title: 'The Big Bay Sale', minDiscount: '30', sort: 'discount', ...query } };
    case 'gifts':
      return { pathname: '/products', params: { title: 'Gifts under ₹999', maxPrice: '999', sort: 'rating', ...query } };
    case 'category':
      return parts[1] ? { pathname: '/products', params: { category: parts[1], ...query } } : '/categories';
    case 'product':
    case 'products':
      if (parts[1]) return `/product/${parts[1]}`;
      return { pathname: '/products', params: query };
    case 'orders':
    case 'order':
      return parts[1] ? `/order/${parts[1]}` : '/orders';
    case 'wishlist':
      return '/wishlist';
    case 'cart':
      return '/cart';
    case 'deals':
      return { pathname: '/products', params: { title: 'Deals of the day', minDiscount: '40', sort: 'discount' } };
    default:
      return null;
  }
}
