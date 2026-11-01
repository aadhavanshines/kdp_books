import type { OrderStreamEvent } from '@pro/api';
import { act, screen, userEvent, waitFor } from '@testing-library/react-native';

import OrderConfirmedScreen from '../../app/order-confirmed/[id]';
import OrderDetailsScreen from '../../app/order/[id]';
import OrdersScreen from '../../app/orders';
import ReturnScreen from '../../app/return/[id]';
import { order, orderSummary } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { params, resetRouter, router } from '../router-mock';

jest.mock('expo-router', () => {
  const mock = jest.requireActual<typeof RouterMock>('../router-mock');
  return { ...mock, useLocalSearchParams: () => mock.params.current };
});

beforeEach(() => {
  resetRouter();
  params.current = { id: 'ord_1' };
});

describe('Orders list', () => {
  it('filters orders by state and opens one', async () => {
    const user = userEvent.setup();
    const { client } = fakeClient((_m, path) =>
      path === '/orders?app=cartly'
        ? { body: [orderSummary({ id: 'ord_2', status: 'shipped', statusLabel: 'Shipped', title: 'Drift Buds', deliveredAt: null }), orderSummary()] }
        : undefined,
    );
    await renderScreen(<OrdersScreen />, client);
    expect(await screen.findByText('Drift Buds')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Delivered' }));
    expect(screen.queryByText('Drift Buds')).not.toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: /^Delivered on/ }));
    expect(router.push).toHaveBeenCalledWith('/order/ord_1');
  });
});

describe('Order details', () => {
  function setup(initial = order('packed')) {
    const { client, calls } = fakeClient((method, path) => {
      if (path === '/orders/ord_1') return { body: initial };
      if (path === '/orders/ord_1/cancel' && method === 'POST') return { body: order('cancelled', { cancelledAt: '2026-11-01T08:00:00.000Z' }) };
      return undefined;
    });
    let push: (e: OrderStreamEvent) => void = () => undefined;
    client.orders.subscribe = jest.fn((_id, handlers) => {
      push = handlers.onEvent;
      handlers.onOpen?.();
      return { close: jest.fn() } as unknown as ReturnType<typeof client.orders.subscribe>;
    });
    return { client, calls, send: (e: OrderStreamEvent) => act(async () => push(e)) };
  }

  it('tracks the shipment live and lets you cancel before it ships', async () => {
    const user = userEvent.setup();
    const { client, send, calls } = setup();
    await renderScreen(<OrderDetailsScreen />, client);
    expect(await screen.findByText('LIVE')).toBeOnTheScreen();
    expect(screen.getByLabelText('Packed')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cancel order' })).toBeOnTheScreen();
    await send({ type: 'status', order: order('shipped') });
    // Wait on what only the shipped state changes: a packed order also shows
    // "Arriving by" and a "Shipped" step, so those alone prove nothing.
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Cancel order' })).not.toBeOnTheScreen());
    expect(screen.getByRole('header', { name: /^Arriving by/ })).toBeOnTheScreen();
    expect(screen.getAllByText('Shipped').length).toBeGreaterThan(0);

    await send({ type: 'status', order: order('packed') });
    await user.press(await screen.findByRole('button', { name: 'Cancel order' }));
    await user.press(await screen.findByRole('button', { name: 'Yes, cancel' }));
    await waitFor(() => expect(calls.some((c) => c.path === '/orders/ord_1/cancel')).toBe(true));
  });

  it('offers a return once delivered', async () => {
    const user = userEvent.setup();
    const { client } = setup(order('delivered'));
    await renderScreen(<OrderDetailsScreen />, client);
    await user.press(await screen.findByTestId('return-items'));
    expect(router.push).toHaveBeenCalledWith('/return/ord_1');
  });
});

describe('Return flow', () => {
  it('requests a return for the chosen items and confirms the pickup', async () => {
    const user = userEvent.setup();
    const { client, calls } = fakeClient((method, path) => {
      if (path === '/orders/ord_1' && method === 'GET') return { body: order('delivered') };
      if (path === '/orders/ord_1/returns' && method === 'POST') {
        return {
          body: order('delivered', {
            returns: [{ id: 'ret_ab12', lineIds: ['l2'], reason: 'No longer needed', comment: null, status: 'pickup_scheduled', refundAmount: 2499, pickupDate: '2026-11-02T10:00:00.000Z', createdAt: '' }],
          }),
        };
      }
      return undefined;
    });
    await renderScreen(<ReturnScreen />, client);
    const submit = await screen.findByTestId('submit-return');
    expect(submit).toBeDisabled();
    await user.press(screen.getByRole('checkbox', { name: /^Drift Buds/ }));
    expect(screen.getByText('₹2,499')).toBeOnTheScreen();
    await user.press(screen.getByRole('radio', { name: 'No longer needed' }));
    await user.press(submit);
    await waitFor(() => expect(calls.find((c) => c.method === 'POST')?.body).toEqual({ lineIds: ['l2'], reason: 'No longer needed' }));
    expect(await screen.findByRole('header', { name: 'Return requested' })).toBeOnTheScreen();
    expect(screen.getByText('RET_AB12')).toBeOnTheScreen();
  });
});

describe('Order confirmation', () => {
  it('celebrates and links to tracking', async () => {
    const user = userEvent.setup();
    const { client } = fakeClient((_m, path) => {
      if (path === '/orders/ord_1') return { body: order('confirmed') };
      if (path === '/me') return { body: { id: 'u1', name: 'Riya Kapoor', phone: '9876543210', email: 'riya@northbay.example', handle: 'riya', avatar: null, createdAt: '' } };
      if (path.startsWith('/cartly/delivery-estimate')) return { body: { pincode: '560101', serviceable: true, date: '', label: 'Delivery by tomorrow, Mon, 2 Nov', fee: 0, cashOnDelivery: true } };
      return undefined;
    });
    await renderScreen(<OrderConfirmedScreen />, client);
    expect(await screen.findByRole('header', { name: 'Order placed!' })).toBeOnTheScreen();
    expect(await screen.findByText('Delivery by tomorrow, Mon, 2 Nov')).toBeOnTheScreen();
    expect(screen.getByText('CRT-482913')).toBeOnTheScreen();
    expect(screen.getByText('You saved ₹10,540 on this order')).toBeOnTheScreen();
    await user.press(screen.getByTestId('track-order'));
    expect(router.replace).toHaveBeenCalledWith('/order/ord_1');
  });
});
