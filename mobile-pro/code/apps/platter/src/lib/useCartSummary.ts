import { useCart } from '@pro/api';
import { router } from 'expo-router';

/** Props for the floating CartBar, or null when the cart is empty. */
export function useCartSummary() {
  const { data: cart, isFetching } = useCart('platter');
  if (!cart || cart.itemCount <= 0) return null;
  return {
    itemCount: cart.itemCount,
    total: cart.bill.itemTotal,
    subtitle: cart.restaurant ? `From ${cart.restaurant.name}` : undefined,
    updating: isFetching && cart.bill.itemTotal === 0,
    onPress: () => router.push('/cart'),
  };
}
