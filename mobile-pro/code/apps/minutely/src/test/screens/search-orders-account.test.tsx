import type { OrderSummary } from '@pro/api';
import { screen, userEvent, waitFor } from '@testing-library/react-native';

import AccountScreen from '../../app/(tabs)/account';
import OrdersScreen from '../../app/(tabs)/orders';
import SearchScreen from '../../app/search';
import { renderScreen } from '../render';
import { resetRouter, router } from '../router-mock';
import { minutelyServer } from '../server';

jest.mock('expo-router', () => jest.requireActual('../router-mock'));

beforeEach(resetRouter);

const summary = (overrides: Partial<OrderSummary>): OrderSummary => ({
  id: 'ord_1',
  number: 'MNT-1',
  app: 'minutely',
  status: 'delivered',
  statusLabel: 'Delivered',
  title: 'Shimla Apple and 2 more',
  art: 'red-apple',
  itemsPreview: '2 x Shimla Apple, 1 x Robusta Banana',
  itemCount: 3,
  total: 430,
  placedAt: '2026-10-30T09:00:00.000Z',
  deliveredAt: '2026-10-30T09:08:00.000Z',
  rating: null,
  ...overrides,
});

describe('Search', () => {
  it('suggests trending searches and finds products as you type', async () => {
    const user = userEvent.setup();
    const { client } = minutelyServer();
    await renderScreen(<SearchScreen />, client);
    await user.press(await screen.findByRole('button', { name: 'Banana' }));
    expect(await screen.findByText('1 result for "Banana"', {}, { timeout: 2000 })).toBeOnTheScreen();
    expect(screen.getByText('Robusta Banana')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Add Robusta Banana' }));
    expect(await screen.findByRole('button', { name: '1 item, ₹52. View cart' })).toBeOnTheScreen();
  });
});

describe('Orders', () => {
  it('puts live tracking one tap away for active orders', async () => {
    const user = userEvent.setup();
    const { client } = minutelyServer([], (_m, path) =>
      path === '/orders?app=minutely' ? { body: [summary({ id: 'ord_live', status: 'on_the_way', statusLabel: 'On the way' }), summary({})] } : undefined,
    );
    await renderScreen(<OrdersScreen />, client);
    expect(await screen.findByText('Arriving in minutes · Track live')).toBeOnTheScreen();
    expect(screen.getByText('2 x Shimla Apple, 1 x Robusta Banana')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: /^On the way\./ }));
    expect(router.push).toHaveBeenCalledWith('/order/ord_live');
  });
});

describe('Account', () => {
  it('shows the profile and stats, and logs out after confirming', async () => {
    const user = userEvent.setup();
    const { client } = minutelyServer([], (_m, path) => {
      if (path === '/me') return { body: { id: 'u1', name: 'Riya Kapoor', phone: '9876543210', email: 'riya@northbay.example', handle: 'riya', avatar: null, createdAt: '' } };
      if (path === '/orders?app=minutely') return { body: [summary({}), summary({ id: 'ord_2', total: 570 })] };
      return undefined;
    });
    await renderScreen(<AccountScreen />, client);
    expect(await screen.findByText('Riya Kapoor')).toBeOnTheScreen();
    expect(await screen.findByText('₹1,000')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Log out' }));
    expect(await screen.findByRole('header', { name: 'Log out?' })).toBeOnTheScreen();
    // The sheet's confirm button comes after the list row.
    await user.press(screen.getAllByRole('button', { name: 'Log out' }).at(-1)!);
    await waitFor(() => expect(client.getToken()).toBeNull());
  });
});
