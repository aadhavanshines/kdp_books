import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '../../test/render';
import { RestaurantCard } from './RestaurantCard';
import type { Restaurant } from '@quickbite/core';

const base: Restaurant = {
  id: 'r1',
  brandId: 'b1',
  slug: 'test-kitchen',
  name: 'Test Kitchen',
  imageUrl: '/images/seed/restaurants/test',
  cuisines: ['North Indian', 'Mughlai'],
  rating: 4.3,
  ratingCount: 1200,
  costForTwo: 45000,
  deliveryTimeMin: 25,
  deliveryTimeMax: 30,
  isPureVeg: true,
  isOpen: true,
  areaIds: ['a1'],
  regionId: 'IN',
  locality: 'Koramangala',
  offer: { headline: '50% OFF', subline: 'UPTO ₹100', couponCode: 'X' },
  lat: 0,
  lng: 0,
};

describe('RestaurantCard', () => {
  it('shows the details customers scan for', () => {
    renderRoute(<RestaurantCard restaurant={base} />);
    const link = screen.getByRole('link', { name: /Test Kitchen, rated 4.3, 25-30 mins/ });
    expect(link).toHaveAttribute('href', '/restaurant/test-kitchen');
    expect(screen.getByText('50% OFF')).toBeInTheDocument();
    expect(screen.getByText(/₹450 for two/)).toBeInTheDocument();
    expect(screen.getByText(/Pure veg/i)).toBeInTheDocument();
  });

  it('marks closed restaurants', () => {
    renderRoute(<RestaurantCard restaurant={{ ...base, isOpen: false }} />);
    expect(screen.getByText('Currently closed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /currently closed/ })).toBeInTheDocument();
  });
});
