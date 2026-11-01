import { useCart } from '@pro/api';
import { IconButton } from '@pro/ui';
import { router } from 'expo-router';

/** Header cart icon with the item count. */
export function CartButton() {
  const count = useCart('cartly').data?.itemCount ?? 0;
  return <IconButton name="cart-outline" label="Cart" badge={count || undefined} onPress={() => router.push('/cart')} testID="header-cart" />;
}
