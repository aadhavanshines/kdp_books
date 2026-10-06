import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useLocationStore } from '../features/location/locationStore';
import { renderRoute } from '../test/render';
import { SearchPage } from './SearchPage';

describe('SearchPage', () => {
  it('finds dishes and restaurants as you type', async () => {
    useLocationStore.setState({ areaId: 'blr-koramangala' });
    renderRoute(<SearchPage />, { path: '/search' });
    await userEvent.type(screen.getByRole('searchbox'), 'biryani');
    expect(await screen.findByRole('tab', { name: /Dishes \(\d+\)/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect((await screen.findAllByRole('article', { name: /Biryani/ })).length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('tab', { name: /Restaurants/ }));
    expect(await screen.findByRole('link', { name: /Saffron Handi/ })).toBeInTheDocument();
  });
});
