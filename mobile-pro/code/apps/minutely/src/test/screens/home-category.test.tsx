import { screen, userEvent, waitFor, within } from '@testing-library/react-native';

import CategoryScreen from '../../app/category/[id]';
import HomeScreen from '../../app/(tabs)/index';
import { apple, line } from '../fixtures';
import { renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { params, resetRouter, router } from '../router-mock';
import { minutelyServer } from '../server';

jest.mock('expo-router', () => {
  const mock = jest.requireActual<typeof RouterMock>('../router-mock');
  return { ...mock, useLocalSearchParams: () => mock.params.current };
});

beforeEach(resetRouter);

describe('Home', () => {
  it('leads with the delivery time and opens categories and offers', async () => {
    const user = userEvent.setup();
    const { client } = minutelyServer();
    await renderScreen(<HomeScreen />, client);
    expect(await screen.findByRole('header', { name: 'Delivery in 7 minutes' })).toBeOnTheScreen();
    expect(screen.getByText('Fresh fruits, 15% off')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Dairy & bread, open category' }));
    expect(router.push).toHaveBeenCalledWith('/category/dairy');
    await user.press(screen.getByRole('button', { name: /^Fresh fruits, 15% off/ }));
    expect(router.push).toHaveBeenCalledWith('/category/fruits');
  });

  it('adds to the cart at once and the cart bar follows every tap', async () => {
    const user = userEvent.setup();
    const { client, calls, cart } = minutelyServer();
    await renderScreen(<HomeScreen />, client);
    await user.press(await screen.findByRole('button', { name: 'Add Shimla Apple' }));
    expect(screen.getByRole('button', { name: '1 item, ₹189. View cart' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Add one more Shimla Apple' }));
    expect(await screen.findByRole('button', { name: '2 items, ₹378. View cart' })).toBeOnTheScreen();
    expect(screen.getByText('Saved ₹62')).toBeOnTheScreen();
    await waitFor(() => expect(cart().itemCount).toBe(2));
    expect(calls.filter((c) => c.method === 'PUT').map((c) => c.body)).toEqual([
      { productId: 'g-001', quantity: 1 },
      { productId: 'g-001', quantity: 2 },
    ]);
    await user.press(screen.getByTestId('cart-bar'));
    expect(router.push).toHaveBeenCalledWith('/cart');
  });

  it('opens the product sheet with details and similar items', async () => {
    const user = userEvent.setup();
    const { client } = minutelyServer([line(apple, 1)]);
    await renderScreen(<HomeScreen />, client);
    await user.press(await screen.findByRole('button', { name: /^Robusta Banana, 6 pcs/ }));
    const sheet = await screen.findByTestId('product-sheet');
    expect(await within(sheet).findByRole('header', { name: 'Robusta Banana' })).toBeOnTheScreen();
    expect(within(sheet).getByText('You save ₹8 on MRP')).toBeOnTheScreen();
    expect(within(sheet).getAllByText('7 MINS').length).toBeGreaterThan(0);
    await user.press(within(sheet).getByTestId('sheet-add'));
    expect(await screen.findByRole('button', { name: '2 items, ₹241. View cart' })).toBeOnTheScreen();
  });
});

describe('Category page', () => {
  beforeEach(() => {
    params.current = { id: 'fruits' };
  });

  it('lists the category, filters by subcategory and sorts', async () => {
    const user = userEvent.setup();
    const { client, calls } = minutelyServer();
    await renderScreen(<CategoryScreen />, client);
    expect(await screen.findByText('Shimla Apple')).toBeOnTheScreen();
    expect(screen.getByText('Out of stock')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Fresh fruits' })).toBeSelected();

    await user.press(screen.getByRole('button', { name: 'Seasonal' }));
    await waitFor(() => expect(screen.queryByText('Shimla Apple')).not.toBeOnTheScreen());
    expect(screen.getByText('Alphonso Mango')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Seasonal' }));
    await user.press(screen.getByRole('button', { name: /^Sort/ }));
    await user.press(await screen.findByRole('radio', { name: 'Price: low to high' }));
    await waitFor(() => expect(calls.some((c) => c.path.includes('sort=price_asc'))).toBe(true));

    await user.press(screen.getByRole('tab', { name: 'Dairy & bread' }));
    expect(router.setParams).toHaveBeenCalledWith({ id: 'dairy' });
  });
});
