import { GradientFill, Icon, Text, useTheme, type TextVariant } from '@pro/ui';
import { StyleSheet, View } from 'react-native';

/** The Lumo mark (an aperture on the brand gradient) and name. */
export function Wordmark({ size = 28, variant = 'title1', showMark = true }: { size?: number; variant?: TextVariant; showMark?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel="Lumo">
      {showMark ? (
        <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.3 }]}>
          <GradientFill colors={colors.gradient} direction="diagonal" />
          <Icon name="aperture" size={size * 0.68} color="textInverse" />
        </View>
      ) : null}
      <Text variant={variant} weight={800} style={styles.name}>
        lumo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  name: { letterSpacing: -1.2 },
});
