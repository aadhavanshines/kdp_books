import { screen, userEvent, waitFor, within } from '@testing-library/react-native';

import ProductsScreen from '../../app/products';
import { buds, cart, listing, summary } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { params, resetRouter } from '../router-mock';

jest.mock('expo-router', () => {
  const mock = jest.requireActual<typeof RouterMock>('../router-mock');
  return { ...mock, useLocalSearchParams: () => mock.params.current };
});

function setup(items = [summary(), buds]) {
  return fakeClient((_m, path) => {
    if (path.startsWith('/cartly/products')) return { body: listing(items) };
    if (path === '/cartly/categories') return { body: [{ id: 'mobiles', name: 'Mobiles', art: 'mobile-phone', tone: 'sky' }] };
    if (path === '/cart/cartly') return { body: cart([]) };
    return undefined;
  });
}

describe('Product listing', () => {
  beforeEach(() => {
    resetRouter();
    params.current = { category: 'mobiles' };
  });

  it('lists products with the result count and category title', async () => {
    const { client } = setup();
    await renderScreen(<ProductsScreen />, client);
    expect(await screen.findByText('2 results')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Mobiles' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Price ₹2,499, MRP ₹6,999, 64% off')).toBeOnTheScreen();
  });

  it('applies filters from the sheet and quick chips', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup();
    await renderScreen(<ProductsScreen />, client);
    await screen.findByText('2 results');

    await user.press(screen.getByTestId('open-filter'));
    const sheet = await screen.findByTestId('filter-sheet');
    await user.press(within(sheet).getByRole('button', { name: '4★ & above' }));
    await user.press(within(sheet).getByRole('checkbox', { name: /^Voltix/ }));
    await user.press(within(sheet).getByTestId('apply-filters'));
    await waitFor(() => expect(calls.some((c) => c.path.includes('minRating=4') && c.path.includes('brand=Voltix'))).toBe(true));
    expect(screen.getByRole('button', { name: 'Filter, 2 applied' })).toBeOnTheScreen();

    // The toolbar chip (the closing sheet may still hold its own copy).
    await user.press(screen.getAllByRole('button', { name: '30% off or more' })[0]!);
    await waitFor(() => expect(calls.some((c) => c.path.includes('minDiscount=30'))).toBe(true));
  });

  it('sorts from the sort sheet', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup();
    await renderScreen(<ProductsScreen />, client);
    await screen.findByText('2 results');
    await user.press(screen.getByTestId('open-sort'));
    await user.press(await screen.findByRole('radio', { name: 'Price: low to high' }));
    await waitFor(() => expect(calls.some((c) => c.path.includes('sort=price_asc'))).toBe(true));
    expect(screen.getByRole('button', { name: 'Sort, Price: low to high' })).toBeOnTheScreen();
  });

  it('offers to clear filters when nothing matches', async () => {
    params.current = { q: 'zzz', minRating: '4' };
    const { client } = setup([]);
    await renderScreen(<ProductsScreen />, client);
    expect(await screen.findByText('No matching products')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeOnTheScreen();
  });
});
