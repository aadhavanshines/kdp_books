import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { Icon, type IconSpec } from './Icon';
import { Text, type ColorToken } from './Text';

export type BadgeTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  /** Solid fill or a soft tint. */
  variant?: 'solid' | 'soft';
  icon?: IconSpec;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

/** A small status label: "Bestseller", "20% OFF", "New". */
export function Badge({ label, tone = 'primary', variant = 'soft', icon, size = 'sm', style }: BadgeProps) {
  const { colors } = useTheme();
  const map: Record<BadgeTone, { solid: string; soft: string; onSolid: ColorToken; onSoft: ColorToken }> = {
    primary: { solid: colors.primary, soft: colors.primarySoft, onSolid: 'onPrimary', onSoft: 'onPrimarySoft' },
    accent: { solid: colors.accent, soft: colors.accentSoft, onSolid: 'onAccent', onSoft: 'text' },
    success: { solid: colors.success, soft: colors.successSoft, onSolid: 'textInverse', onSoft: 'success' },
    warning: { solid: colors.warning, soft: colors.warningSoft, onSolid: 'textInverse', onSoft: 'warning' },
    danger: { solid: colors.danger, soft: colors.dangerSoft, onSolid: 'textInverse', onSoft: 'danger' },
    info: { solid: colors.info, soft: colors.infoSoft, onSolid: 'textInverse', onSoft: 'info' },
    neutral: { solid: colors.text, soft: colors.surfaceMuted, onSolid: 'background', onSoft: 'textSecondary' },
  };
  const t = map[tone];
  const fg = variant === 'solid' ? t.onSolid : t.onSoft;
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        styles.badge,
        size === 'md' ? styles.md : styles.sm,
        { backgroundColor: variant === 'solid' ? t.solid : t.soft },
        style,
      ]}
    >
      {icon ? <Icon {...icon} size={size === 'md' ? 14 : 12} color={fg} /> : null}
      <Text variant="caption" weight={700} color={fg} numberOfLines={1} style={size === 'sm' ? styles.smText : null}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, borderRadius: radii.sm - 2 },
  sm: { paddingHorizontal: 6, paddingVertical: 2 },
  md: { paddingHorizontal: 8, paddingVertical: 4 },
  smText: { fontSize: 11, lineHeight: 14 },
});
