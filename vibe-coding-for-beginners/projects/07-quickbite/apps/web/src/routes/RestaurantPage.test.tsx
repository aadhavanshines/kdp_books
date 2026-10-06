import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '../test/render';
import { RestaurantPage } from './RestaurantPage';

const open = () =>
  renderRoute(<RestaurantPage />, {
    path: '/restaurant/:slug',
    initialEntry: '/restaurant/tandoor-tales-koramangala',
  });

describe('RestaurantPage', () => {
  it('shows the restaurant and its menu grouped by category', async () => {
    open();
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Tandoor Tales' }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /Recommended \(\d+\)/ })).toBeInTheDocument();
    expect(screen.getAllByRole('article', { name: 'Butter Chicken' }).length).toBeGreaterThan(0);
  });

  it('hides non-veg dishes when "Veg" is on', async () => {
    open();
    await screen.findByRole('heading', { level: 1 });
    await screen.findAllByRole('article');
    await userEvent.click(screen.getByRole('button', { name: /^Veg/ }));
    for (const article of screen.getAllByRole('article')) {
      expect(within(article).getByRole('img', { name: 'Vegetarian' })).toBeInTheDocument();
    }
    expect(screen.queryByRole('article', { name: 'Butter Chicken' })).not.toBeInTheDocument();
  });

  it('searches within the menu', async () => {
    open();
    await screen.findAllByRole('article');
    await userEvent.type(screen.getByPlaceholderText('Search for dishes'), 'naan');
    const names = screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'));
    expect(names).toEqual(expect.arrayContaining(['Butter Naan', 'Garlic Naan']));
    expect(names.every((n) => /naan/i.test(n!))).toBe(true);
  });

  it('shows a friendly message for unknown restaurants', async () => {
    renderRoute(<RestaurantPage />, {
      path: '/restaurant/:slug',
      initialEntry: '/restaurant/nope',
    });
    expect(await screen.findByText('Restaurant not found')).toBeInTheDocument();
  });
});
