import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { spacing, type SpacingToken } from '../tokens/scale';
import { Text } from './Text';

export interface DividerProps {
  /** hairline: 1px line; thick: an 8px gray band between sections. */
  variant?: 'hairline' | 'thick' | 'dashed';
  /** Optional centered label ("OR", "MENU"). */
  label?: string;
  inset?: SpacingToken;
  vertical?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Divider({ variant = 'hairline', label, inset, vertical, style }: DividerProps) {
  const { colors } = useTheme();
  if (vertical) {
    return <View style={[{ width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: colors.border }, style]} />;
  }
  const line: ViewStyle =
    variant === 'thick'
      ? { height: 8, backgroundColor: colors.background }
      : variant === 'dashed'
        ? { height: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.border }
        : { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider };
  const margin = inset ? { marginHorizontal: spacing[inset] } : null;
  if (!label) return <View accessibilityRole="none" style={[line, margin, style]} />;
  return (
    <View style={[styles.row, margin, style]}>
      <View style={[line, styles.flex]} />
      <Text variant="overline" color="textMuted">
        {label}
      </Text>
      <View style={[line, styles.flex]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
});
