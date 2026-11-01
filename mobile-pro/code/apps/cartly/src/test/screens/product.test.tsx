import { screen, userEvent, waitFor } from '@testing-library/react-native';

import ProductScreen from '../../app/product/[id]';
import { cart, home, line, listing, product, summary } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { params, resetRouter, router } from '../router-mock';

jest.mock('expo-router', () => {
  const mock = jest.requireActual<typeof RouterMock>('../router-mock');
  return { ...mock, useLocalSearchParams: () => mock.params.current };
});

function setup() {
  let current = cart([]);
  return fakeClient((method, path, body) => {
    if (path === '/cartly/products/p-01') return { body: product() };
    if (path.startsWith('/cartly/products?')) return { body: listing([product(), summary({ id: 'p-02', title: 'Voltix Nova Pro 5G', rating: 4.5, ratingCount: 12406 })]) };
    if (path === '/cart/cartly' && method === 'GET') return { body: current };
    if (path === '/me/addresses') return { body: [home] };
    if (path.startsWith('/cartly/delivery-estimate?pincode=560101')) {
      return { body: { pincode: '560101', serviceable: true, date: '2026-11-02', label: 'Delivery by tomorrow, Mon, 2 Nov', fee: 0, cashOnDelivery: true } };
    }
    if (path.startsWith('/cartly/delivery-estimate?pincode=110001')) {
      return { body: { pincode: '110001', serviceable: true, date: '2026-11-06', label: 'Delivery by Fri, 6 Nov', fee: 0, cashOnDelivery: false } };
    }
    if (path === '/cart/cartly/items') {
      const v = (body as { variant: { color: string; storage: string } }).variant;
      current = cart([
        line({
          options: [
            { groupId: 'color', groupName: 'Colour', optionId: v.color, name: v.color, price: 0 },
            { groupId: 'storage', groupName: 'Storage', optionId: v.storage, name: v.storage, price: 0 },
          ],
        }),
      ]);
      return { body: current };
    }
    return undefined;
  });
}

describe('Product page', () => {
  beforeEach(() => {
    resetRouter();
    params.current = { id: 'p-01' };
  });

  it('shows price, offers, highlights, delivery and reviews', async () => {
    const { client } = setup();
    await renderScreen(<ProductScreen />, client);
    expect(await screen.findByLabelText('24% off. Price ₹18,999, MRP ₹24,999')).toBeOnTheScreen();
    expect(screen.getByText('CARTLY10')).toBeOnTheScreen();
    expect(screen.getByText('6.7-inch 120 Hz AMOLED display')).toBeOnTheScreen();
    expect(await screen.findByText('Delivery by tomorrow, Mon, 2 Nov')).toBeOnTheScreen();
    expect(screen.getByText('Pay on delivery available')).toBeOnTheScreen();
    expect(screen.getByLabelText('Rated 4.3 out of 5 from 41,872 ratings')).toBeOnTheScreen();
    expect(screen.getByText('Good for the price')).toBeOnTheScreen();
  });

  it('prices the chosen variant and adds it to the cart', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup();
    await renderScreen(<ProductScreen />, client);
    await user.press(await screen.findByRole('radio', { name: 'Storage 256 GB, plus ₹2,000' }));
    expect(screen.getByLabelText('22% off. Price ₹20,999, MRP ₹26,999')).toBeOnTheScreen();
    await user.press(screen.getByRole('radio', { name: 'Colour Fern Green' }));
    expect(screen.getByText('Fern Green')).toBeOnTheScreen();

    await user.press(screen.getByTestId('add-to-cart'));
    await waitFor(() => expect(calls.find((c) => c.path === '/cart/cartly/items')?.body).toEqual({ productId: 'p-01', quantity: 1, variant: { color: 'fern-green', storage: '256-gb' } }));
    expect(await screen.findByRole('button', { name: 'Go to cart' })).toBeOnTheScreen();
    await user.press(screen.getByTestId('buy-now'));
    expect(router.push).toHaveBeenCalledWith('/checkout');
  });

  it('checks delivery for another pincode', async () => {
    const user = userEvent.setup();
    const { client } = setup();
    await renderScreen(<ProductScreen />, client);
    await user.press(await screen.findByRole('button', { name: 'Change delivery pincode' }));
    await user.type(screen.getByLabelText('Delivery pincode'), '110001');
    await user.press(screen.getByRole('button', { name: 'Check' }));
    expect(await screen.findByText('Delivery by Fri, 6 Nov')).toBeOnTheScreen();
    expect(screen.getByText('Pay on delivery not available here')).toBeOnTheScreen();
  });
});
