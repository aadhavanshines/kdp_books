import { bannerRoute, hasFilters, NO_FILTERS, toggleFilter, toRestaurantQuery } from './filters';

describe('home filters', () => {
  it('maps chips and sort to the restaurant query', () => {
    let state = toggleFilter(NO_FILTERS, 'rating');
    state = toggleFilter(state, 'veg');
    expect(toRestaurantQuery({ ...state, sort: 'delivery_time' })).toEqual({ minRating: 4, veg: true, sort: 'delivery_time' });
    expect(toRestaurantQuery(toggleFilter(NO_FILTERS, 'fast'), { cuisine: 'Pizza' })).toEqual({ cuisine: 'Pizza', fast: true });
  });

  it('toggles a chip off again', () => {
    const on = toggleFilter(NO_FILTERS, 'offers');
    expect(hasFilters(on)).toBe(true);
    expect(hasFilters(toggleFilter(on, 'offers'))).toBe(false);
    expect(toRestaurantQuery(NO_FILTERS)).toEqual({});
  });
});

describe('bannerRoute', () => {
  it('opens restaurants, cuisines, offers and collections', () => {
    expect(bannerRoute('/restaurant/r-01')).toEqual({ pathname: '/restaurant/r-01' });
    expect(bannerRoute('/cuisine/north-indian')).toEqual({ pathname: '/search', params: { cuisine: 'North Indian' } });
    expect(bannerRoute('/offers')).toEqual({ pathname: '/search', params: { offers: '1' } });
    expect(bannerRoute('/collection/late-night')).toEqual({ pathname: '/search', params: { q: 'late night' } });
  });

  it('falls back to search', () => {
    expect(bannerRoute(null)).toEqual({ pathname: '/search' });
    expect(bannerRoute('/somewhere')).toEqual({ pathname: '/search' });
  });
});
