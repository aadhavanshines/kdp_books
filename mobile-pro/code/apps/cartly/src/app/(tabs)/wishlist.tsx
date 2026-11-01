import { useCart, useSetCartItem, useWishlist, type ProductSummary } from '@pro/api';
import { Button, EmptyState, ErrorState, Text, useTheme, useToast } from '@pro/ui';
import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard, ProductCardSkeleton } from '../../components/ProductCard';

function MoveToCart({ product }: { product: ProductSummary }) {
  const toast = useToast();
  const cart = useCart('cartly');
  const setItem = useSetCartItem('cartly');
  const inCart = cart.data?.items.some((l) => l.productId === product.id);
  return (
    <Button
      title={inCart ? 'In cart' : 'Add to cart'}
      variant={inCart ? 'ghost' : 'secondary'}
      size="sm"
      fullWidth
      icon={{ name: inCart ? 'checkmark' : 'cart-outline' }}
      loading={setItem.isPending}
      accessibilityLabel={inCart ? `${product.title} is in your cart` : `Add ${product.title} to cart`}
      onPress={() =>
        inCart
          ? router.push('/cart')
          : setItem.mutate(
              { productId: product.id, quantity: 1 },
              { onSuccess: () => toast.show({ message: 'Added to cart', tone: 'success', actionLabel: 'VIEW CART', onAction: () => router.push('/cart') }) },
            )
      }
    />
  );
}

export default function WishlistScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wishlist = useWishlist();
  const cardWidth = (Math.min(width, 600) - 16 * 2 - 12) / 2;
  const items = wishlist.data;

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface }]}>
        <Text variant="title2" accessibilityRole="header">
          My wishlist
        </Text>
        {items?.length ? (
          <Text variant="footnote" color="textMuted">
            {`${items.length} saved ${items.length === 1 ? 'item' : 'items'} · we will tell you when prices drop`}
          </Text>
        ) : null}
      </View>
      {wishlist.isError && !items ? (
        <ErrorState error={wishlist.error} onRetry={() => void wishlist.refetch()} art="red-heart" />
      ) : !items ? (
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <ProductCardSkeleton key={i} width={cardWidth} />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={wishlist.isRefetching} onRefresh={() => void wishlist.refetch()} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <View style={[styles.cell, { width: cardWidth }]}>
              <ProductCard product={item} width={cardWidth} />
              <MoveToCart product={item} />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              art="red-heart"
              title="Your wishlist is empty"
              message="Tap the heart on anything you like to save it here."
              actionLabel="Explore products"
              onAction={() => router.push('/')}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, gap: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 },
  list: { padding: 16, gap: 16 },
  column: { gap: 12 },
  cell: { gap: 8 },
});
