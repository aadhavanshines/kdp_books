import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getBackend } from '../../backend';
import { useCart } from '../cart/cartStore';

/**
 * Asks the backend to price the cart. Only ids, quantities, the coupon code and
 * the address id are sent; every price comes back from the backend.
 */
export function useQuote(addressId: string | null) {
  const restaurantId = useCart((s) => s.restaurant?.id ?? null);
  const lines = useCart((s) => s.lines);
  const couponCode = useCart((s) => s.couponCode);
  const sync = useCart((s) => s.sync);
  const pricesChanged = useCart((s) => s.pricesChanged);
  const dismissPricesChanged = useCart((s) => s.dismissPricesChanged);

  const items = lines.map((l) => ({ itemId: l.itemId, qty: l.qty }));
  const query = useQuery({
    queryKey: ['quote', restaurantId, items, couponCode, addressId],
    queryFn: async () =>
      (await getBackend()).orders.quote({
        restaurantId: restaurantId!,
        items,
        couponCode: couponCode ?? undefined,
        addressId: addressId!,
      }),
    enabled: Boolean(restaurantId && addressId && items.length),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  // If the server's prices differ from what the cart showed, update the cart and tell the customer.
  const data = query.data;
  useEffect(() => {
    if (data?.ok && !query.isPlaceholderData) {
      sync(data.lines, data.unavailableItemIds);
    }
  }, [data, query.isPlaceholderData, sync]);

  return { ...query, pricesChanged, dismissPricesChanged };
}
