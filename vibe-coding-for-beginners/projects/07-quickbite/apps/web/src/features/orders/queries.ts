import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getBackend, type Order, type PlaceOrderRequest } from '../../backend';
import { useUid } from '../auth/sessionStore';

export const orderKeys = {
  list: (uid: string | null) => ['orders', uid] as const,
};

export function useOrders() {
  const uid = useUid();
  return useQuery({
    queryKey: orderKeys.list(uid),
    queryFn: async () => (await getBackend()).orders.list(),
    enabled: Boolean(uid),
  });
}

type LiveOrder =
  | { status: 'loading'; order: null }
  | { status: 'ready'; order: Order | null }
  | { status: 'error'; order: null; error: Error };

/** Follows one order live (Firestore listener / in-memory subscription). */
export function useLiveOrder(orderId: string): LiveOrder {
  const uid = useUid();
  const [state, setState] = useState<{ key: string; value: LiveOrder }>({
    key: '',
    value: { status: 'loading', order: null },
  });
  const key = `${uid}:${orderId}`;

  useEffect(() => {
    if (!uid) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    void getBackend().then((backend) => {
      if (cancelled) return;
      stop = backend.orders.watch(
        orderId,
        (order) => setState({ key, value: { status: 'ready', order } }),
        (error) => setState({ key, value: { status: 'error', order: null, error } }),
      );
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [key, orderId, uid]);

  // A different order (or user) than the last update means we're loading again.
  return state.key === key ? state.value : { status: 'loading', order: null };
}

export function usePlaceOrder() {
  return useMutation({
    mutationFn: async (request: PlaceOrderRequest) => (await getBackend()).orders.place(request),
  });
}

/** Fresh provider payment details for an unpaid order (the order page's retry button). */
export function useStartPayment() {
  return useMutation({
    mutationFn: async (orderId: string) => (await getBackend()).orders.startPayment(orderId),
  });
}

export function usePayFake() {
  const uid = useUid();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, outcome }: { orderId: string; outcome: 'success' | 'failure' }) =>
      (await getBackend()).orders.payFake(orderId, outcome),
    onSettled: () => client.invalidateQueries({ queryKey: orderKeys.list(uid) }),
  });
}
