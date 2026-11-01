import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';

export interface BottomBarProps {
  children: ReactNode;
  /** Add the bottom safe-area inset (default true; off above a tab bar). */
  safeBottom?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A sticky footer for a screen's main action ("Add to cart / Buy now",
 * "Place order"): a surface with a top hairline and a soft upward shadow.
 * Lay it out after the scroll view in a flex column.
 */
export function BottomBar({ children, safeBottom = true, style, testID }: BottomBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      testID={testID}
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.divider,
          paddingBottom: (safeBottom ? insets.bottom : 0) + 10,
        },
        theme.shadow('lg'),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
