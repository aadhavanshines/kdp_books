import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

export interface VegMarkProps {
  veg: boolean;
  size?: number;
}

/**
 * The Indian food marker: a green square with a dot for vegetarian, a
 * brown square with a triangle for non-vegetarian.
 */
export function VegMark({ veg, size = 14 }: VegMarkProps) {
  const { colors } = useTheme();
  const color = veg ? colors.veg : colors.nonVeg;
  const inner = Math.round(size * 0.5);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={veg ? 'Vegetarian' : 'Non-vegetarian'}
      style={[styles.box, { width: size, height: size, borderColor: color }]}
    >
      {veg ? (
        <View style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: color }} />
      ) : (
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: inner / 2 + 1,
            borderRightWidth: inner / 2 + 1,
            borderBottomWidth: inner,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: color,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1.5, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
});
