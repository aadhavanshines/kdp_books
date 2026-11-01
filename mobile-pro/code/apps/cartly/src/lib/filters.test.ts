import {
  activeFilterCount,
  appliedFilters,
  fromParams,
  listingTitle,
  NO_FILTERS,
  priceLabel,
  samePrice,
  toggleBrand,
  toProductQuery,
  type FilterState,
} from './filters';

const full: FilterState = { brands: ['Voltix', 'Aster'], price: { min: 1000, max: 4999 }, minRating: 4, minDiscount: 30, sort: 'price_asc' };

describe('listing filters', () => {
  it('builds the API query from the base and filters', () => {
    expect(toProductQuery({ q: 'phone' }, NO_FILTERS)).toEqual({ q: 'phone' });
    expect(toProductQuery({ category: 'mobiles' }, full)).toEqual({
      category: 'mobiles',
      brand: ['Aster', 'Voltix'],
      minPrice: 1000,
      maxPrice: 4999,
      minRating: 4,
      minDiscount: 30,
      sort: 'price_asc',
    });
  });

  it('counts filter groups, not sort', () => {
    expect(activeFilterCount(NO_FILTERS)).toBe(0);
    expect(activeFilterCount({ ...NO_FILTERS, sort: 'rating' })).toBe(0);
    expect(activeFilterCount(full)).toBe(4);
  });

  it('labels price ranges', () => {
    expect(priceLabel({ max: 499 })).toBe('Under ₹500');
    expect(priceLabel({ min: 20000 })).toBe('Over ₹20,000');
    expect(priceLabel({ min: 1000, max: 4999 })).toBe('₹1,000 to ₹4,999');
    expect(samePrice({ min: 1000, max: 4999 }, { min: 1000, max: 4999 })).toBe(true);
    expect(samePrice({ max: 499 }, null)).toBe(false);
  });

  it('toggles brands and lists removable chips', () => {
    expect(toggleBrand(NO_FILTERS, 'Voltix').brands).toEqual(['Voltix']);
    expect(toggleBrand(full, 'Voltix').brands).toEqual(['Aster']);
    const chips = appliedFilters(full);
    expect(chips.map((c) => c.label)).toEqual(['₹1,000 to ₹4,999', '4★ & above', '30% off or more', 'Voltix', 'Aster']);
    expect(chips[3]!.remove(full).brands).toEqual(['Aster']);
    expect(chips[0]!.remove(full).price).toBeNull();
  });

  it('reads route params from banners and search', () => {
    expect(fromParams({ title: 'The Big Bay Sale', minDiscount: '30', sort: 'discount' })).toEqual({
      base: { q: undefined, category: undefined },
      filters: { ...NO_FILTERS, minDiscount: 30, sort: 'discount' },
    });
    expect(fromParams({ q: ' buds ', brand: 'Halcyon Audio,Voltix', maxPrice: '999', sort: 'bogus' })).toEqual({
      base: { q: 'buds', category: undefined },
      filters: { ...NO_FILTERS, brands: ['Halcyon Audio', 'Voltix'], price: { min: undefined, max: 999 } },
    });
  });

  it('titles the listing', () => {
    expect(listingTitle({ title: 'Gifts under ₹999' }, undefined)).toBe('Gifts under ₹999');
    expect(listingTitle({ q: 'earbuds' }, undefined)).toBe('“earbuds”');
    expect(listingTitle({ category: 'mobiles' }, 'Mobiles')).toBe('Mobiles');
    expect(listingTitle({ brand: 'Voltix' }, undefined)).toBe('Voltix');
    expect(listingTitle({}, undefined)).toBe('All products');
  });
});
