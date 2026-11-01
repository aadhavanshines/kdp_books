import type { Restaurant } from '@pro/api';
import { screen, userEvent, waitFor } from '@testing-library/react-native';

import RestaurantScreen from '../../app/restaurant/[id]';
import { butterChicken, cart, dalMakhani, line, restaurant } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { params, resetRouter } from '../router-mock';

jest.mock('expo-router', () => {
  const mock = jest.requireActual<typeof RouterMock>('../router-mock');
  return { ...mock, useLocalSearchParams: () => mock.params.current };
});

const detail: Restaurant = {
  ...restaurant,
  address: '14 Mill Road',
  location: { x: 200, y: 300 },
  hours: '11:30 am to 11:30 pm',
  offers: [{ code: 'WELCOME50', title: '50% OFF up to ₹100', description: 'On orders above ₹149' }],
  menu: [{ id: 'c-main', name: 'Main course', items: [butterChicken, dalMakhani] }],
};

function setup(conflict = false) {
  let current = cart();
  return fakeClient((method, path, body) => {
    if (path === '/platter/restaurants/r-01') return { body: detail };
    if (path === '/cart/platter' && method === 'GET') return { body: current };
    if (path === '/cart/platter/items') {
      const input = body as { productId: string; quantity: number; replaceCart?: boolean };
      if (conflict && !input.replaceCart) return { status: 409, body: { error: { code: 'CART_CONFLICT', message: 'Cart has items from Roll Call' } } };
      current = cart([line({ productId: input.productId, quantity: input.quantity, lineTotal: 320 * input.quantity })]);
      return { body: current };
    }
    return undefined;
  });
}

describe('Restaurant screen', () => {
  beforeEach(() => {
    resetRouter();
    params.current = { id: 'r-01' };
  });

  it('shows the header, offers and menu with veg marks', async () => {
    const { client } = setup();
    await renderScreen(<RestaurantScreen />, client);
    expect(await screen.findByRole('header', { name: 'Saffron Courtyard' })).toBeOnTheScreen();
    expect(screen.getByText('USE WELCOME50')).toBeOnTheScreen();
    expect(screen.getByText('Main course (2)')).toBeOnTheScreen();
    expect(screen.getByText('Butter chicken')).toBeOnTheScreen();
    expect(screen.getByText('customisable')).toBeOnTheScreen();
  });

  it('adds a plain dish and shows the cart bar', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup();
    await renderScreen(<RestaurantScreen />, client);
    await user.press(await screen.findByRole('button', { name: 'Add Dal makhani' }));
    expect(await screen.findByRole('button', { name: /1 item, ₹320/ })).toBeOnTheScreen();
    expect(calls.find((c) => c.method === 'PUT')?.body).toEqual({ productId: 'i-dal', quantity: 1 });
  });

  it('opens the customisation sheet with a live price', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup();
    await renderScreen(<RestaurantScreen />, client);
    await user.press(await screen.findByRole('button', { name: 'Add Butter chicken' }));
    expect(await screen.findByRole('button', { name: 'Add item ₹480' })).toBeOnTheScreen();
    await user.press(screen.getByRole('radio', { name: 'Full, + ₹290' }));
    await user.press(screen.getByRole('checkbox', { name: 'Butter naan, + ₹60' }));
    await user.press(screen.getByRole('button', { name: 'Add item ₹830' }));
    await waitFor(() =>
      expect(calls.find((c) => c.method === 'PUT')?.body).toEqual({
        productId: 'i-butter',
        quantity: 1,
        options: [
          { groupId: 'portion', optionId: 'full' },
          { groupId: 'addons', optionId: 'naan' },
        ],
      }),
    );
  });

  it('asks before replacing a cart from another restaurant', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup(true);
    await renderScreen(<RestaurantScreen />, client);
    await user.press(await screen.findByRole('button', { name: 'Add Dal makhani' }));
    expect(await screen.findByText('Replace cart item?')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Replace' }));
    await waitFor(() => expect(calls.filter((c) => c.method === 'PUT').at(-1)?.body).toMatchObject({ replaceCart: true }));
  });
});
