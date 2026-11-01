import { CartBar } from '@pro/ui';
import { router } from 'expo-router';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { cartBarSubtitle } from '../lib/delivery';
import { useShop } from './ShopProvider';

/** The green "3 items | ₹412  View cart" bar, moving with every stepper tap. */
export function MinutelyCartBar({ style, bottom = 12 }: { style?: StyleProp<ViewStyle>; bottom?: number }) {
  const { summary } = useShop();
  if (summary.itemCount <= 0) return null;
  return (
    <CartBar
      itemCount={summary.itemCount}
      total={summary.total}
      subtitle={cartBarSubtitle({ mrpTotal: summary.mrpTotal, itemTotal: summary.total })}
      tone="primary"
      onPress={() => router.push('/cart')}
      style={[styles.bar, { bottom }, style]}
      testID="cart-bar"
    />
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0 },
});
