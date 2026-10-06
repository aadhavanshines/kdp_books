import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useLocationStore } from '../features/location/locationStore';
import { renderRoute } from '../test/render';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('asks for a location first, then shows restaurants in that area', async () => {
    useLocationStore.setState({ areaId: null });
    renderRoute(<HomePage />);
    await userEvent.click(await screen.findByRole('button', { name: /HSR Layout/ }));
    expect(
      await screen.findByRole('heading', { name: /delivery in HSR Layout/ }),
    ).toBeInTheDocument();
  });

  it('filters to pure veg restaurants with one tap', async () => {
    useLocationStore.setState({ areaId: 'blr-koramangala' });
    renderRoute(<HomePage />);
    const section = await screen.findByRole('region', { name: /online food delivery/ });
    const before = (await within(section).findAllByRole('link')).length;

    await userEvent.click(within(section).getByRole('button', { name: /^Pure Veg/ }));

    const links = within(section).getAllByRole('link');
    expect(links.length).toBeLessThan(before);
    for (const link of links) expect(within(link).getByText(/Pure veg/i)).toBeInTheDocument();
  });
});
