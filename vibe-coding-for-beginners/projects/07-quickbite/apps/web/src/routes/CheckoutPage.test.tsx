import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Backend } from '../backend';
import { getBackend, setBackendForTests } from '../backend';
import { createMemoryBackend } from '../backend/memory';
import { useCart } from '../features/cart/cartStore';
import { useCheckoutStore } from '../features/checkout/checkoutStore';
import { useLocationStore } from '../features/location/locationStore';
import { renderRoute, TEST_USER } from '../test/render';
import { CheckoutPage } from './CheckoutPage';

async function fillCart() {
  const backend = await getBackend();
  const restaurant = (await backend.catalog.getRestaurantBySlug('tandoor-tales-koramangala'))!;
  const menu = await backend.catalog.getMenu(restaurant.id);
  const dish = menu.items.find((i) => i.name === 'Butter Chicken')!;
  useCart.getState().add(restaurant, dish);
  useCart.getState().add(restaurant, dish);
  return dish;
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    useCart.getState().clear();
    useCheckoutStore.setState({ addressId: null });
    useLocationStore.setState({ areaId: 'blr-koramangala' });
  });

  it('shows an empty state with no items', async () => {
    renderRoute(<CheckoutPage />, { path: '/checkout' });
    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument();
  });

  it('adds an address, prices the order and applies a coupon', async () => {
    renderRoute(<CheckoutPage />, { path: '/checkout' });
    const dish = await fillCart();

    await userEvent.click(
      (await screen.findAllByRole('button', { name: /Add (delivery )?address/ }))[0]!,
    );
    const dialog = await screen.findByRole('dialog', { name: 'Add delivery address' });
    const form = within(dialog);
    await userEvent.type(
      form.getByLabelText('Flat / house no., building'),
      'Flat 4B, Palm Residency',
    );
    await userEvent.type(form.getByLabelText('Street, sector, locality'), '5th Block');
    await userEvent.type(form.getByLabelText('PIN code'), '560095');
    await userEvent.type(form.getByLabelText('Receiver’s name'), 'Asha Rao');
    await userEvent.type(form.getByLabelText('Mobile number'), '98765');
    await userEvent.click(form.getByRole('button', { name: /Save address/ }));
    expect(await form.findByText('Enter a valid 10-digit mobile number')).toBeInTheDocument();
    await userEvent.type(form.getByLabelText('Mobile number'), '43210');
    await userEvent.click(form.getByRole('button', { name: /Save address/ }));

    const bill = await screen.findByRole('region', { name: 'Bill details' });
    expect(within(bill).getByText('Item total').nextSibling).toHaveTextContent(
      `₹${(dish.price * 2) / 100}`,
    );
    const before = screen.getByTestId('to-pay').textContent;

    await userEvent.click(screen.getByRole('button', { name: /Apply coupon/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Apply WELCOME50' }));
    expect(await screen.findByText(/‘WELCOME50’ applied/)).toBeInTheDocument();
    expect(screen.getByText(/Coupon discount \(WELCOME50\)/)).toBeInTheDocument();
    expect(screen.getByTestId('to-pay').textContent).not.toBe(before);
  });

  it('asks signed-out customers to sign in before showing addresses', async () => {
    renderRoute(<CheckoutPage />, { path: '/checkout', user: null });
    await fillCart();
    const link = await screen.findByRole('link', { name: 'Sign in to continue' });
    expect(link).toHaveAttribute('href', '/login?next=%2Fcheckout');
    expect(screen.queryByRole('heading', { name: 'Delivery address' })).not.toBeInTheDocument();
  });

  it('explains a coupon that does not exist', async () => {
    const backend = createMemoryBackend({ latencyMs: 0, user: TEST_USER });
    setBackendForTests(backend);
    await fillCart();
    const address = await backend.addresses.save({
      label: 'Home',
      name: 'Asha',
      phone: '9876543210',
      line1: 'Flat 1',
      line2: 'Main Rd',
      landmark: '',
      areaId: 'blr-koramangala',
      pincode: '560095',
    });
    useCheckoutStore.setState({ addressId: address.id });
    useCart.getState().setCoupon('NOPE123');
    renderRoute(<CheckoutPage />, { path: '/checkout', backend });
    expect(await screen.findByText(/NOPE123: That code doesn’t exist/)).toBeInTheDocument();
  });

  describe('with Razorpay', () => {
    afterEach(() => {
      delete (window as unknown as Record<string, unknown>).Razorpay;
    });

    it('keeps the cart and explains a declined payment; paying again reuses the order', async () => {
      const base = createMemoryBackend({ latencyMs: 0, user: TEST_USER });
      const place = vi.fn(async () => ({
        ok: true as const,
        orderId: 'ord_rzp',
        payment: {
          provider: 'razorpay' as const,
          providerOrderId: 'order_Same1',
          amount: 100,
          currency: 'INR',
          keyId: 'rzp_test_key',
        },
      }));
      const backend: Backend = { ...base, orders: { ...base.orders, place } };
      setBackendForTests(backend);
      await fillCart();
      const address = await backend.addresses.save({
        label: 'Home',
        name: 'Asha',
        phone: '9876543210',
        line1: 'Flat 1',
        line2: 'Main Rd',
        landmark: '',
        areaId: 'blr-koramangala',
        pincode: '560095',
      });
      useCheckoutStore.setState({ addressId: address.id });
      const opened: { ondismiss: () => void; fail?: (f: unknown) => void }[] = [];
      (window as unknown as Record<string, unknown>).Razorpay = class {
        private readonly entry;
        constructor(o: { modal: { ondismiss: () => void } }) {
          this.entry = { ondismiss: o.modal.ondismiss } as (typeof opened)[number];
          opened.push(this.entry);
        }
        on(_e: string, listener: (f: unknown) => void) {
          this.entry.fail = listener;
        }
        open() {}
      };
      renderRoute(<CheckoutPage />, { path: '/checkout', backend });

      const payButton = (await screen.findAllByRole('button', { name: /Proceed to pay/ }))[0]!;
      await waitFor(() => expect(payButton).toBeEnabled());
      await userEvent.click(payButton);
      await waitFor(() => expect(opened).toHaveLength(1));
      act(() => {
        opened[0]!.fail!({ error: { description: 'Card declined by bank' } });
        opened[0]!.ondismiss();
      });
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Payment failed: Card declined by bank. You can try again.',
      );
      expect(useCart.getState().lines).not.toHaveLength(0);

      await userEvent.click(payButton);
      await waitFor(() => expect(opened).toHaveLength(2));
      // The same checkout attempt: the same idempotency key, so the same order.
      const keys = place.mock.calls.map(
        (c) => (c as unknown as [{ idempotencyKey: string }])[0].idempotencyKey,
      );
      expect(keys[0]).toBe(keys[1]);
    });
  });
});
