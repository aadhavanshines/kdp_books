import type { OrderStreamEvent } from '@pro/api';
import { act, screen } from '@testing-library/react-native';

import TrackingScreen from '../../app/order/[id]';
import { order } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { params, resetRouter } from '../router-mock';

jest.mock('expo-router', () => {
  const mock = jest.requireActual<typeof RouterMock>('../router-mock');
  return { ...mock, useLocalSearchParams: () => mock.params.current };
});

function setup() {
  const { client } = fakeClient((_m, path) => (path === '/orders/ord_1' ? { body: order('preparing') } : undefined));
  let push: (e: OrderStreamEvent) => void = () => undefined;
  const close = jest.fn();
  client.orders.subscribe = jest.fn((_id, handlers) => {
    push = handlers.onEvent;
    handlers.onOpen?.();
    return { close } as unknown as ReturnType<typeof client.orders.subscribe>;
  });
  return { client, send: (e: OrderStreamEvent) => act(async () => push(e)), close };
}

describe('Tracking screen', () => {
  beforeEach(() => {
    resetRouter();
    params.current = { id: 'ord_1' };
  });

  it('follows the order through live status and location events', async () => {
    const { client, send, close } = setup();
    await renderScreen(<TrackingScreen />, client);

    expect(await screen.findByRole('header', { name: 'Preparing your food' })).toBeOnTheScreen();
    expect(screen.getByText('Saffron Courtyard is cooking it fresh')).toBeOnTheScreen();
    expect(screen.getByText(/^LIVE/)).toBeOnTheScreen();

    await send({ type: 'status', order: order('on_the_way') });
    expect(await screen.findByRole('header', { name: 'Arriving in 12 mins' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Call Arjun Mehta' })).toBeOnTheScreen();

    await send({ type: 'location', orderId: 'ord_1', progress: 0.5, position: { x: 400, y: 350 }, etaMinutes: 4 });
    expect(await screen.findByRole('header', { name: 'Arriving in 4 mins' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Delivery map. Rider is 50% of the way to you.')).toBeOnTheScreen();

    await send({ type: 'status', order: order('delivered') });
    expect(await screen.findByRole('header', { name: 'Order delivered' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Rate your order' })).toBeOnTheScreen();
    expect(close).toHaveBeenCalled();
  });
});
