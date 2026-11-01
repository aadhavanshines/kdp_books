import type { GroceryCategory } from '@pro/api';
import { ArtTile, PressableScale, Text } from '@pro/ui';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

/** A bright square category tile with its name underneath, kept to the tile's width. */
export function CategoryTile({ category, size }: { category: GroceryCategory; size: number }) {
  return (
    <PressableScale
      onPress={() => router.push(`/category/${category.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${category.name}, open category`}
      style={[styles.tile, { width: size }]}
    >
      <ArtTile art={category.art} tone={category.tone} size={size} artScale={0.68} decorative />
      <Text variant="caption" weight={600} align="center" numberOfLines={2} style={styles.label}>
        {category.name}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', gap: 6 },
  label: { fontSize: 12, lineHeight: 15 },
});
