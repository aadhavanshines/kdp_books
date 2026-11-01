import type { OrderStreamEvent } from '@pro/api';
import { act, screen, userEvent, waitFor } from '@testing-library/react-native';

import CartScreen from '../../app/cart';
import CheckoutScreen from '../../app/checkout';
import TrackingScreen from '../../app/order/[id]';
import { apple, banana, line, order } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { params, resetRouter, router } from '../router-mock';
import { minutelyServer } from '../server';

jest.mock('expo-router', () => {
  const mock = jest.requireActual<typeof RouterMock>('../router-mock');
  return { ...mock, useLocalSearchParams: () => mock.params.current };
});

beforeEach(resetRouter);

describe('Cart', () => {
  it('calls out savings, nudges to free delivery and takes a tip', async () => {
    const user = userEvent.setup();
    const { client, calls } = minutelyServer([line(banana, 2)]);
    await renderScreen(<CartScreen />, client);
    expect(await screen.findByText("You're saving ₹16 on this order")).toBeOnTheScreen();
    expect(screen.getByText('Add ₹95 more for FREE delivery')).toBeOnTheScreen();
    expect(screen.getByText('Delivery in 7 minutes')).toBeOnTheScreen();
    expect(screen.getByLabelText('To pay, ₹138')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Add one more Robusta Banana' }));
    expect(await screen.findByText('Add ₹43 more for FREE delivery')).toBeOnTheScreen();

    await user.press(screen.getByLabelText('Tip ₹20, most tipped'));
    await waitFor(() => expect(calls.find((c) => c.path === '/cart/minutely/tip')?.body).toEqual({ amount: 20 }));
    expect(await screen.findByLabelText('Delivery partner tip, ₹20')).toBeOnTheScreen();

    await user.press(screen.getByTestId('proceed'));
    expect(router.push).toHaveBeenCalledWith('/checkout');
  });

  it('celebrates free delivery once the cart is big enough', async () => {
    const { client } = minutelyServer([line(apple, 2)]);
    await renderScreen(<CartScreen />, client);
    expect(await screen.findByText('Yay! FREE delivery unlocked')).toBeOnTheScreen();
  });

  it('invites you to shop when empty', async () => {
    const user = userEvent.setup();
    const { client } = minutelyServer();
    await renderScreen(<CartScreen />, client);
    await user.press(await screen.findByRole('button', { name: 'Start shopping' }));
    expect(router.replace).toHaveBeenCalledWith('/');
  });
});

describe('Checkout', () => {
  it('pays with the chosen method and opens live tracking', async () => {
    const user = userEvent.setup();
    const { client, calls } = minutelyServer([line(apple, 2)]);
    await renderScreen(<CheckoutScreen />, client);
    expect(await screen.findByRole('button', { name: 'Pay ₹382 with UPI' })).toBeOnTheScreen();
    await user.press(screen.getByRole('radio', { name: /^Cash on delivery/ }));
    await user.press(screen.getByRole('button', { name: 'Pay ₹382 with cash' }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/order/ord_new'));
    expect(calls.find((c) => c.path === '/orders')?.body).toEqual({ app: 'minutely', addressId: 'addr_home', payment: { kind: 'cash' } });
  });
});

describe('Tracking', () => {
  beforeEach(() => {
    params.current = { id: 'ord_1' };
    jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick', 'setImmediate'] });
    jest.setSystemTime(new Date('2026-11-01T10:04:30.000Z'));
  });
  afterEach(() => jest.useRealTimers());

  function setup() {
    const { client } = fakeClient((_m, path) => (path === '/orders/ord_1' ? { body: order('packing') } : undefined));
    let push: (e: OrderStreamEvent) => void = () => undefined;
    client.orders.subscribe = jest.fn((_id, handlers) => {
      push = handlers.onEvent;
      handlers.onOpen?.();
      return { close: jest.fn() } as unknown as ReturnType<typeof client.orders.subscribe>;
    });
    return { client, send: (e: OrderStreamEvent) => act(async () => push(e)) };
  }

  it('counts down on the ring and follows the delivery live', async () => {
    const { client, send } = setup();
    await renderScreen(<TrackingScreen />, client);
    expect(await screen.findByRole('header', { name: 'Packing your order' })).toBeOnTheScreen();
    expect(screen.getByRole('timer', { name: 'left 4 minutes 30 seconds' })).toBeOnTheScreen();
    expect(screen.getByText('04:30')).toBeOnTheScreen();
    expect(screen.getByText(/^LIVE · Arriving by/)).toBeOnTheScreen();

    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });
    expect(screen.getByText('04:00')).toBeOnTheScreen();

    await send({ type: 'status', order: order('on_the_way') });
    expect(screen.getByRole('header', { name: 'On the way' })).toBeOnTheScreen();
    expect(screen.getByText('Farhan is riding over with your order')).toBeOnTheScreen();
    expect(screen.getByLabelText('Map: your delivery partner is 50% of the way')).toBeOnTheScreen();

    await send({ type: 'location', orderId: 'ord_1', position: { x: 350, y: 500 }, progress: 0.8, etaMinutes: 1 });
    expect(screen.getByLabelText('Map: your delivery partner is 80% of the way')).toBeOnTheScreen();

    await send({ type: 'status', order: order('delivered') });
    expect(screen.getByRole('header', { name: 'Delivered!' })).toBeOnTheScreen();
    expect(screen.getByText('Delivered in 8 minutes. Enjoy!')).toBeOnTheScreen();
    expect(screen.queryByTestId('countdown')).not.toBeOnTheScreen();
  });
});
