import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { formatINR } from '../utils/format';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface CartBarProps {
  /** Number of items (sum of quantities). The bar hides itself at 0. */
  itemCount: number;
  total: number;
  /** Small line under the count, e.g. "From Saffron Courtyard" or "You save ₹40". */
  subtitle?: string;
  /** Button text on the right. */
  actionLabel?: string;
  onPress: () => void;
  /** Bar fill: the brand accent (default) or the primary color. */
  tone?: 'accent' | 'primary';
  /** Total is being recalculated: show a quiet hint instead of a stale number. */
  updating?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The floating "2 items | ₹498   View cart >" bar that sits above the tab
 * bar or the bottom of a menu. Slides in when the first item is added.
 */
export function CartBar({
  itemCount,
  total,
  subtitle,
  actionLabel = 'View cart',
  onPress,
  updating,
  tone = 'accent',
  style,
  testID,
}: CartBarProps) {
  const theme = useTheme();
  const fill = tone === 'primary' ? theme.colors.primary : theme.colors.accent;
  const on = tone === 'primary' ? 'onPrimary' : 'onAccent';
  if (itemCount <= 0) return null;
  const countLabel = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
  return (
    <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutDown.duration(160)} style={[styles.wrap, style]}>
      <PressableScale
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${countLabel}, ${formatINR(total)}. ${actionLabel}`}
        style={[styles.bar, { backgroundColor: fill }, theme.shadow('lg')]}
      >
        <View style={styles.left}>
          <Text variant="subhead" weight={700} color={on} tabular numberOfLines={1}>
            {countLabel}
            {'  |  '}
            {updating ? '…' : formatINR(total)}
          </Text>
          {subtitle ? (
            <Text variant="caption" color={on} numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.right}>
          <Text variant="headline" weight={700} color={on}>
            {actionLabel}
          </Text>
          <Icon name="chevron-forward" size={18} color={on} />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12 },
  bar: {
    minHeight: 56,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: { flexShrink: 1 },
  subtitle: { opacity: 0.9 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
