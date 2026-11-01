import { screen, userEvent, waitFor, within } from '@testing-library/react-native';

import CartScreen from '../../app/(tabs)/cart';
import CheckoutScreen from '../../app/checkout';
import { cart, coupon, home, line, order, work } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import { resetRouter, router } from '../router-mock';

jest.mock('expo-router', () => jest.requireActual('../router-mock'));

const buds = line({ id: 'l2', productId: 'p-07', name: 'Drift Buds', art: 'headphone', tone: 'mint', unitPrice: 2499, mrp: 6999, lineTotal: 2499, options: [], optionsLabel: null });

function setup(initial = cart([line(), buds])) {
  let current = initial;
  return fakeClient((method, path, body) => {
    if (path === '/cart/cartly' && method === 'GET') return { body: current };
    if (path === '/me/addresses') return { body: [home, work] };
    if (path === '/me') return { body: { id: 'u1', name: 'Riya Kapoor', phone: '9876543210', email: 'riya@northbay.example', handle: 'riya', avatar: null, createdAt: '' } };
    if (path === '/coupons?app=cartly') return { body: [coupon] };
    if (path.startsWith('/cartly/delivery-estimate')) {
      const pin = new URLSearchParams(path.split('?')[1]).get('pincode');
      return { body: { pincode: pin, serviceable: true, date: '2026-11-02', label: 'Delivery by tomorrow, Mon, 2 Nov', fee: 0, cashOnDelivery: pin === '560101' } };
    }
    if (path === '/cart/cartly/lines/l2' && method === 'PATCH') {
      current = cart([line()], [{ ...buds, savedForLater: true }]);
      return { body: current };
    }
    if (path === '/cart/cartly/coupon') {
      current = { ...current, coupon, bill: { ...current.bill, couponDiscount: 500, total: current.bill.total - 500 } };
      return { body: current };
    }
    if (path === '/orders' && method === 'POST') return { body: order('confirmed', { id: 'ord_new' }) };
    void body;
    return undefined;
  });
}

describe('Cart', () => {
  beforeEach(resetRouter);

  it('shows lines with delivery dates and Cartly price details', async () => {
    const { client } = setup();
    await renderScreen(<CartScreen />, client);
    expect(await screen.findByRole('header', { name: 'My cart (2)' })).toBeOnTheScreen();
    expect(screen.getByText('Midnight Blue, 128 GB')).toBeOnTheScreen();
    expect((await screen.findAllByText('Delivery by tomorrow, Mon, 2 Nov')).length).toBe(2);
    expect(screen.getByLabelText('Price (2 items), ₹31,998')).toBeOnTheScreen();
    expect(screen.getByLabelText('Discount, -₹10,500')).toBeOnTheScreen();
    expect(screen.getByLabelText('Delivery charges, FREE, was ₹40')).toBeOnTheScreen();
    expect(screen.getByLabelText('Total amount, ₹21,498')).toBeOnTheScreen();
  });

  it('saves a line for later, applies a coupon and goes to checkout', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup();
    await renderScreen(<CartScreen />, client);
    await user.press(await screen.findByRole('button', { name: 'Save Drift Buds for later' }));
    await waitFor(() => expect(calls.find((c) => c.method === 'PATCH')?.body).toEqual({ savedForLater: true }));
    expect(await screen.findByRole('header', { name: 'Saved for later (1)' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Move Drift Buds to cart' })).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Apply coupon' }));
    await user.press(await screen.findByRole('button', { name: 'Apply CARTLY10' }));
    expect(await screen.findByLabelText('Coupon (CARTLY10), -₹500')).toBeOnTheScreen();

    await user.press(screen.getByTestId('place-order'));
    expect(router.push).toHaveBeenCalledWith('/checkout');
  });

  it('shows an empty cart', async () => {
    const { client } = setup(cart([]));
    await renderScreen(<CartScreen />, client);
    expect(await screen.findByText('Your cart is empty')).toBeOnTheScreen();
  });
});

describe('Checkout', () => {
  beforeEach(resetRouter);

  it('places the order with the chosen address and payment', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup();
    await renderScreen(<CheckoutScreen />, client);
    expect(await screen.findByText('Phone: +91 9876543210')).toBeOnTheScreen();
    expect(screen.getByText('100% secure payments, encrypted end to end')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Change payment method' }));
    const sheet = await screen.findByTestId('payment-sheet');
    await user.press(within(sheet).getByRole('radio', { name: /^Pay on delivery/ }));
    expect(screen.getByRole('button', { name: 'Place order' })).toBeOnTheScreen();

    await user.press(screen.getByTestId('place-order'));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/order-confirmed/ord_new'));
    expect(calls.find((c) => c.path === '/orders')?.body).toEqual({ app: 'cartly', addressId: 'addr_home', payment: { kind: 'cash' } });
  });

  it('turns off pay on delivery where it is not offered', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup();
    await renderScreen(<CheckoutScreen />, client);
    await user.press(await screen.findByRole('button', { name: 'Change delivery address' }));
    await user.press(within(await screen.findByTestId('address-sheet')).getByRole('radio', { name: /^Work/ }));
    await user.press(screen.getByRole('button', { name: 'Change payment method' }));
    const cod = within(await screen.findByTestId('payment-sheet')).getByRole('radio', { name: /^Pay on delivery, Not available for this pincode/ });
    expect(cod).toBeDisabled();
    await user.press(within(screen.getByTestId('payment-sheet')).getByRole('radio', { name: /^Credit or debit card/ }));
    await user.press(screen.getByTestId('place-order'));
    await waitFor(() => expect(calls.find((c) => c.path === '/orders')?.body).toEqual({ app: 'cartly', addressId: 'addr_work', payment: { kind: 'card', cardLast4: '4242' } }));
  });
});
