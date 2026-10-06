import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { getBackend } from '../backend';
import { useCart } from '../features/cart/cartStore';
import { useCheckoutStore } from '../features/checkout/checkoutStore';
import { useLocationStore } from '../features/location/locationStore';
import { renderRoute } from '../test/render';
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

  it('explains a coupon that does not exist', async () => {
    await fillCart();
    const backend = await getBackend();
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
    renderRoute(<CheckoutPage />, { path: '/checkout' });
    expect(await screen.findByText(/NOPE123: That code doesn’t exist/)).toBeInTheDocument();
  });
});
