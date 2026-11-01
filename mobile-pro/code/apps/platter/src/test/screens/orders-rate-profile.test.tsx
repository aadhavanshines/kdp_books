import type { OrderSummary } from '@pro/api';
import { screen, userEvent, waitFor } from '@testing-library/react-native';

import OrdersScreen from '../../app/(tabs)/orders';
import ProfileScreen from '../../app/(tabs)/profile';
import RateScreen from '../../app/rate/[id]';
import { home, order } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { params, resetRouter, router } from '../router-mock';

jest.mock('expo-router', () => {
  const mock = jest.requireActual<typeof RouterMock>('../router-mock');
  return { ...mock, useLocalSearchParams: () => mock.params.current };
});

const summary = (o: Partial<OrderSummary>): OrderSummary => ({
  id: 'o1',
  number: 'PLT-1',
  app: 'platter',
  status: 'delivered',
  statusLabel: 'Delivered',
  title: 'Saffron Courtyard',
  art: 'curry-and-rice',
  itemsPreview: '2 x Dal makhani',
  itemCount: 2,
  total: 711,
  placedAt: '2026-10-30T14:00:00.000Z',
  deliveredAt: '2026-10-30T14:30:00.000Z',
  rating: null,
  ...o,
});

describe('Orders screen', () => {
  beforeEach(resetRouter);

  it('separates active and past orders with the right actions', async () => {
    const user = userEvent.setup();
    const { client } = fakeClient((_m, path) =>
      path === '/orders?app=platter'
        ? { body: [summary({ id: 'live', status: 'on_the_way', statusLabel: 'On the way' }), summary({ id: 'old' }), summary({ id: 'rated', rating: 4 })] }
        : undefined,
    );
    await renderScreen(<OrdersScreen />, client);
    expect(await screen.findByText('Active')).toBeOnTheScreen();
    expect(screen.getByText('Past orders')).toBeOnTheScreen();
    expect(screen.getByLabelText('You rated 4 stars')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Track order' }));
    expect(router.push).toHaveBeenCalledWith('/order/live');
    await user.press(screen.getByRole('button', { name: 'Rate order' }));
    expect(router.push).toHaveBeenCalledWith('/rate/old');
  });

  it('shows an empty state', async () => {
    const { client } = fakeClient((_m, path) => (path === '/orders?app=platter' ? { body: [] } : undefined));
    await renderScreen(<OrdersScreen />, client);
    expect(await screen.findByText('No orders yet')).toBeOnTheScreen();
  });
});

describe('Rate screen', () => {
  beforeEach(() => {
    resetRouter();
    params.current = { id: 'ord_1' };
  });

  it('submits stars, tags and a comment', async () => {
    const user = userEvent.setup();
    const { client, calls } = fakeClient((method, path) => {
      if (path === '/orders/ord_1' && method === 'GET') return { body: order('delivered') };
      if (path === '/orders/ord_1/rating') return { body: order('delivered') };
      return undefined;
    });
    await renderScreen(<RateScreen />, client);
    const submit = await screen.findByRole('button', { name: 'Submit rating' });
    expect(submit).toBeDisabled();

    await user.press(screen.getByRole('button', { name: '5 stars' }));
    await user.press(screen.getByRole('button', { name: 'Tasty food' }));
    await user.type(screen.getByLabelText('Tell us more (optional)'), 'Lovely');
    await user.press(submit);
    await waitFor(() => expect(router.back).toHaveBeenCalled());
    expect(calls.find((c) => c.path === '/orders/ord_1/rating')?.body).toEqual({ stars: 5, tags: ['Tasty food'], comment: 'Lovely' });
  });
});

describe('Profile screen', () => {
  it('shows the user and addresses, and logs out after confirming', async () => {
    const user = userEvent.setup();
    const { client } = fakeClient((_m, path) => {
      if (path === '/me') return { body: { id: 'u', name: 'Riya Kapoor', phone: '9876543210', email: 'riya@northbay.example', handle: 'r', avatar: 'woman', createdAt: '' } };
      if (path === '/me/addresses') return { body: [home] };
      if (path === '/orders?app=platter') return { body: [summary({})] };
      return undefined;
    });
    await renderScreen(<ProfileScreen />, client);
    expect(await screen.findByText('Riya Kapoor')).toBeOnTheScreen();
    expect(await screen.findByText('Home (default)')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Log out' }));
    expect(await screen.findByText('Log out of Platter?')).toBeOnTheScreen();
    await user.press(screen.getAllByRole('button', { name: 'Log out' }).at(-1)!);
    expect(client.getToken()).toBeNull();
  });
});
