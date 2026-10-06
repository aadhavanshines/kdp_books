import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Backend } from '../backend';
import { createMemoryBackend } from '../backend/memory';
import { renderRoute, TEST_USER } from '../test/render';
import { OrderTrackingPage } from './OrderTrackingPage';

async function pendingOrder() {
  const backend = createMemoryBackend({ latencyMs: 0, user: TEST_USER });
  const restaurant = (await backend.catalog.getRestaurantBySlug('tandoor-tales-koramangala'))!;
  const dish = (await backend.catalog.getMenu(restaurant.id)).items.find(
    (i) => i.name === 'Butter Chicken',
  )!;
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
  const result = await backend.orders.place({
    restaurantId: restaurant.id,
    items: [{ itemId: dish.id, qty: 2 }],
    addressId: address.id,
    idempotencyKey: 'component-test-key',
  });
  if (!result.ok) throw new Error(result.error);
  return { backend, orderId: result.orderId, amount: result.payment.amount };
}

describe('OrderTrackingPage', () => {
  it('takes a test payment and shows the order as placed, live', async () => {
    const { backend, orderId, amount } = await pendingOrder();
    renderRoute(<OrderTrackingPage />, {
      path: '/orders/:orderId',
      initialEntry: `/orders/${orderId}`,
      backend,
    });
    expect(await screen.findByTestId('order-status')).toHaveTextContent('Waiting for payment');
    expect(screen.getByText('Not paid yet')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Complete payment' }));
    const sheet = await screen.findByRole('dialog', { name: 'Test payment' });
    expect(within(sheet).getByTestId('fake-payment-amount')).toHaveTextContent(
      `₹${(amount / 100).toLocaleString('en-IN')}`,
    );
    await userEvent.click(within(sheet).getByRole('button', { name: /^Pay ₹/ }));

    expect(await screen.findByText('Order placed', { selector: 'h1' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Order progress' })).toHaveTextContent(
      'Order placed (done)',
    );
    expect(screen.getByText(/Paid ₹.* \(test payment\)/)).toBeInTheDocument();
  });

  it('offers a retry after a failed payment', async () => {
    const { backend, orderId } = await pendingOrder();
    renderRoute(<OrderTrackingPage />, {
      path: '/orders/:orderId',
      initialEntry: `/orders/${orderId}`,
      backend,
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Complete payment' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Simulate a failed payment' }));
    expect(await screen.findByText('Payment failed', { selector: 'h1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try paying again' })).toBeInTheDocument();
  });

  it('does not show other people’s orders', async () => {
    const { backend, orderId } = await pendingOrder();
    await backend.auth.signOut();
    const other = await backend.auth.sendSignInLink('ravi@example.com', 'http://localhost/x');
    const ravi = await backend.auth.completeSignIn('ravi@example.com', other.devLink!);
    renderRoute(<OrderTrackingPage />, {
      path: '/orders/:orderId',
      initialEntry: `/orders/${orderId}`,
      backend,
      user: ravi,
    });
    expect(await screen.findByText('Order not found')).toBeInTheDocument();
  });

  describe('with real payment providers', () => {
    afterEach(() => {
      delete (window as unknown as Record<string, unknown>).Razorpay;
    });

    it('shows “Confirming payment…” after returning from a Stripe redirect', async () => {
      const { backend, orderId } = await pendingOrder();
      renderRoute(<OrderTrackingPage />, {
        path: '/orders/:orderId',
        initialEntry: `/orders/${orderId}?payment_intent=pi_1&redirect_status=succeeded`,
        backend,
      });
      expect(await screen.findByTestId('order-status')).toHaveTextContent('Confirming payment…');
      expect(screen.queryByRole('button', { name: 'Complete payment' })).not.toBeInTheDocument();
    });

    it('explains a failed Stripe redirect and offers to pay again', async () => {
      const { backend, orderId } = await pendingOrder();
      renderRoute(<OrderTrackingPage />, {
        path: '/orders/:orderId',
        initialEntry: `/orders/${orderId}?payment_intent=pi_1&redirect_status=failed`,
        backend,
      });
      expect(await screen.findByRole('alert')).toHaveTextContent('didn’t go through');
      expect(screen.getByRole('button', { name: 'Complete payment' })).toBeEnabled();
    });

    it('retries with the provider the server returns (Razorpay here)', async () => {
      const { backend, orderId } = await pendingOrder();
      const startPayment = vi.fn(async () => ({
        provider: 'razorpay' as const,
        providerOrderId: 'order_Retry1',
        amount: 100,
        currency: 'INR',
        keyId: 'rzp_test_key',
      }));
      const opened: { order_id: string; ondismiss: () => void }[] = [];
      (window as unknown as Record<string, unknown>).Razorpay = class {
        constructor(o: { order_id: string; modal: { ondismiss: () => void } }) {
          opened.push({ order_id: o.order_id, ondismiss: o.modal.ondismiss });
        }
        on(_e: string, listener: (f: { error: { description: string } }) => void) {
          listener({ error: { description: 'UPI request expired' } });
        }
        open() {}
      };
      const withRetry: Backend = { ...backend, orders: { ...backend.orders, startPayment } };
      renderRoute(<OrderTrackingPage />, {
        path: '/orders/:orderId',
        initialEntry: `/orders/${orderId}`,
        backend: withRetry,
      });
      await userEvent.click(await screen.findByRole('button', { name: 'Complete payment' }));
      await waitFor(() => expect(opened).toHaveLength(1));
      expect(startPayment).toHaveBeenCalledWith(orderId);
      expect(opened[0]!.order_id).toBe('order_Retry1');
      act(() => opened[0]!.ondismiss());
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Payment failed: UPI request expired. You can try again.',
      );
    });
  });
});
