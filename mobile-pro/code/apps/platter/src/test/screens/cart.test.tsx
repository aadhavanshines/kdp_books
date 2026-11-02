import type { Cart, CouponOffer } from '@pro/api';
import { screen, userEvent, waitFor, within } from '@testing-library/react-native';

import CartScreen from '../../app/cart';
import { cart, home, line, order, work } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import { resetRouter, router } from '../router-mock';

jest.mock('expo-router', () => jest.requireActual('../router-mock'));

const welcome: CouponOffer = {
  code: 'WELCOME50',
  app: 'platter',
  title: '50% OFF up to ₹100',
  description: 'On orders above ₹149',
  kind: 'percent',
  value: 50,
  maxDiscount: 100,
  minOrder: 149,
  restaurantId: null,
  expiresAt: '2030-01-01T00:00:00.000Z',
  applicable: true,
  reason: null,
  estimatedSavings: 100,
};

function setup(items = [line({ quantity: 2, lineTotal: 640 })], overrides: Partial<Cart> = {}) {
  let current = cart(items, overrides);
  return fakeClient((method, path, body) => {
    if (path === '/cart/platter' && method === 'GET') return { body: current };
    if (path === '/me/addresses') return { body: [home, work] };
    if (path === '/coupons?app=platter') return { body: [welcome] };
    if (path === '/cart/platter/coupon') {
      current = { ...current, coupon: welcome, bill: { ...current.bill, couponDiscount: 100, total: current.bill.total - 100, savings: 100 } };
      return { body: current };
    }
    if (path === '/cart/platter/tip') {
      const amount = (body as { amount: number }).amount;
      current = { ...current, tip: amount, bill: { ...current.bill, tip: amount, total: current.bill.total + amount } };
      return { body: current };
    }
    if (path === '/cart/platter/address') {
      // Work is further away: the server re-prices the delivery fee.
      const addressId = (body as { addressId: string }).addressId;
      const fee = addressId === 'addr_work' ? 48 : 33;
      current = { ...current, addressId, bill: { ...current.bill, deliveryFee: fee, total: current.bill.total - current.bill.deliveryFee + fee } };
      return { body: current };
    }
    if (path === '/orders' && method === 'POST') return { body: order('confirmed', { id: 'ord_new' }) };
    return undefined;
  });
}

describe('Cart screen', () => {
  beforeEach(resetRouter);

  it('shows lines and the bill', async () => {
    const { client } = setup();
    await renderScreen(<CartScreen />, client);
    expect(await screen.findByText('Dal makhani')).toBeOnTheScreen();
    expect(screen.getByLabelText('Item total, ₹640')).toBeOnTheScreen();
    expect(screen.getByLabelText('GST and restaurant charges, ₹32')).toBeOnTheScreen();
    expect(screen.getByLabelText('To pay, ₹711')).toBeOnTheScreen();
    expect(screen.getByText('Delivering to Home')).toBeOnTheScreen();
  });

  it('applies a coupon from the sheet and adds a tip', async () => {
    const user = userEvent.setup();
    const { client } = setup();
    await renderScreen(<CartScreen />, client);
    await user.press(await screen.findByRole('button', { name: 'Apply coupon' }));
    await user.press(await screen.findByRole('button', { name: 'Apply WELCOME50' }));
    expect(await screen.findByText("'WELCOME50' applied")).toBeOnTheScreen();
    expect(screen.getByLabelText('Coupon (WELCOME50), -₹100')).toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: 'Tip ₹50' }));
    await waitFor(() => expect(screen.getByLabelText('Delivery partner tip, ₹50')).toBeOnTheScreen());
    expect(screen.getByLabelText('To pay, ₹661')).toBeOnTheScreen();
  });

  it('places the order with the chosen address and payment, then opens tracking', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup();
    await renderScreen(<CartScreen />, client);
    await screen.findByText('Dal makhani');

    await user.press(screen.getByRole('button', { name: /Delivering to Home/ }));
    const sheet = await screen.findByTestId('address-sheet');
    await user.press(within(sheet).getByRole('radio', { name: /^Work/ }));
    await user.press(screen.getByRole('button', { name: /Pay using/ }));
    await user.press(await screen.findByRole('radio', { name: /^Cash on delivery/ }));

    await user.press(screen.getByTestId('place-order'));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/order/ord_new'));
    expect(calls.find((c) => c.path === '/orders')?.body).toEqual({ app: 'platter', addressId: 'addr_work', payment: { kind: 'cash' } });
  });

  it('re-prices for a new address so the button shows what will be charged', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup();
    await renderScreen(<CartScreen />, client);
    await screen.findByText('Dal makhani');
    expect(screen.getByLabelText('To pay, ₹711')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: /Delivering to Home/ }));
    await user.press(within(await screen.findByTestId('address-sheet')).getByRole('radio', { name: /^Work/ }));
    await waitFor(() => expect(screen.getByLabelText('To pay, ₹726')).toBeOnTheScreen());
    expect(calls.find((c) => c.path === '/cart/platter/address')?.body).toEqual({ addressId: 'addr_work' });
    expect(screen.getByTestId('place-order')).toHaveTextContent(/₹726/);
  });

  it('shows the address the cart is priced for when it opens', async () => {
    const { client } = setup(undefined, { addressId: 'addr_work' });
    await renderScreen(<CartScreen />, client);
    expect(await screen.findByText('Delivering to Work')).toBeOnTheScreen();
  });

  it('shows an empty state with no items', async () => {
    const { client } = setup([]);
    await renderScreen(<CartScreen />, client);
    expect(await screen.findByText('Your cart is empty')).toBeOnTheScreen();
  });
});
