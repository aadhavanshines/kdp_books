import { linkToHref } from './links';

describe('linkToHref', () => {
  it('maps server links to app routes', () => {
    expect(linkToHref('/sale')).toEqual({ pathname: '/products', params: { title: 'The Big Bay Sale', minDiscount: '30', sort: 'discount' } });
    expect(linkToHref('/gifts')).toMatchObject({ pathname: '/products', params: { maxPrice: '999' } });
    expect(linkToHref('/category/mobiles')).toEqual({ pathname: '/products', params: { category: 'mobiles' } });
    expect(linkToHref('/category')).toBe('/categories');
    expect(linkToHref('/orders/ord_hist_9')).toBe('/order/ord_hist_9');
    expect(linkToHref('/product/p-01')).toBe('/product/p-01');
    expect(linkToHref('/products?q=shoes')).toEqual({ pathname: '/products', params: { q: 'shoes' } });
    expect(linkToHref('/wishlist')).toBe('/wishlist');
  });

  it('returns null for missing or unknown links', () => {
    expect(linkToHref(null)).toBeNull();
    expect(linkToHref('/somewhere-else')).toBeNull();
  });
});
