import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { IconButton } from './IconButton';
import { Text } from './Text';

export interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  /** Shows a back arrow. */
  onBack?: () => void;
  backLabel?: string;
  /** Actions on the right (IconButtons). */
  right?: ReactNode;
  /** Add the top safe-area inset (default true). */
  safeTop?: boolean;
  /** No background or divider, e.g. over a hero. */
  transparent?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** A compact app bar: back, title and subtitle, trailing actions. */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Go back',
  right,
  safeTop = true,
  transparent,
  style,
}: ScreenHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: (safeTop ? insets.top : 0) + 4,
          backgroundColor: transparent ? 'transparent' : colors.surface,
          borderBottomColor: transparent ? 'transparent' : colors.divider,
        },
        style,
      ]}
    >
      {onBack ? <IconButton name="arrow-back" label={backLabel} onPress={onBack} size={40} /> : <View style={styles.spacer} />}
      <View style={styles.titles}>
        {title ? (
          <Text variant="headline" weight={700} numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 6,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  spacer: { width: 8 },
  titles: { flex: 1, minHeight: 40, justifyContent: 'center' },
  right: { flexDirection: 'row', alignItems: 'center' },
});
