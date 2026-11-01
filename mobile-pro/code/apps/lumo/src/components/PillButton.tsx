import { PressableScale, Text, useTheme } from '@pro/ui';
import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

export interface PillButtonProps {
  title: string;
  onPress?: () => void;
  /** `muted`: gray (Edit profile, Following, Message). `accent`: blue (Follow). */
  tone?: 'muted' | 'accent';
  loading?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** The compact, quiet buttons on profiles and activity rows. */
export function PillButton({ title, onPress, tone = 'muted', loading, accessibilityLabel, style }: PillButtonProps) {
  const { colors } = useTheme();
  const accent = tone === 'accent';
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={[styles.pill, { backgroundColor: accent ? colors.accent : colors.surfaceMuted }, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={accent ? colors.onAccent : colors.text} />
      ) : (
        <Text variant="subhead" weight={700} color={accent ? 'onAccent' : 'text'} numberOfLines={1}>
          {title}
        </Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pill: { minHeight: 36, borderRadius: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
});
