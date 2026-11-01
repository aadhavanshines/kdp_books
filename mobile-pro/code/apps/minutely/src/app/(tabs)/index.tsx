import { addressLine, defaultAddress, useAddresses, useMinutelyHome, type Banner, type GroceryCategory, type Rail } from '@pro/api';
import {
  AddressSheet,
  addressIcon,
  Art,
  ErrorState,
  GradientFill,
  Icon,
  IconButton,
  PressableScale,
  SearchBar,
  SectionHeader,
  Skeleton,
  Text,
  useTheme,
} from '@pro/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryTile } from '../../components/CategoryTile';
import { MinutelyCartBar } from '../../components/MinutelyCartBar';
import { ProductCard } from '../../components/ProductCard';
import { SEARCH_HINTS } from '../../lib/catalog';
import { etaHeadline } from '../../lib/delivery';
import { bannerHref } from '../../lib/links';

const GRID_COLUMNS = 4;
const GAP = 10;

function CategoryGrid({ categories }: { categories: GroceryCategory[] }) {
  const { width } = useWindowDimensions();
  const tile = Math.floor((Math.min(width, 520) - 32 - GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS);
  return (
    <View style={styles.grid}>
      {categories.map((c) => (
        <CategoryTile key={c.id} category={c} size={tile} />
      ))}
    </View>
  );
}

function OfferBanner({ banner }: { banner: Banner }) {
  const theme = useTheme();
  const href = bannerHref(banner.link);
  const fg = theme.onTone(banner.tone);
  const dark = fg === 'textInverse';
  return (
    <PressableScale
      onPress={href ? () => router.push(href) : undefined}
      disabled={!href}
      accessibilityRole="button"
      accessibilityLabel={`${banner.title}. ${banner.subtitle}. ${banner.cta}`}
      style={[styles.banner, theme.shadow('sm')]}
    >
      <GradientFill colors={theme.tone(banner.tone)} direction="diagonal" />
      <View style={styles.bannerText}>
        <Text variant="title3" color={fg} numberOfLines={2}>
          {banner.title}
        </Text>
        <Text variant="caption" weight={500} color={fg} numberOfLines={2} style={styles.dim}>
          {banner.subtitle}
        </Text>
        <View style={[styles.cta, { backgroundColor: dark ? theme.colors.surface : theme.colors.text }]}>
          <Text variant="caption" weight={800} color={dark ? 'text' : 'textInverse'}>
            {banner.cta}
          </Text>
          <Icon name="arrow-forward" size={12} color={dark ? 'text' : 'textInverse'} />
        </View>
      </View>
      <Art name={banner.art} size={104} decorative style={styles.bannerArt} />
    </PressableScale>
  );
}

function ProductRail({ rail }: { rail: Rail }) {
  return (
    <View style={styles.section}>
      <SectionHeader
        title={rail.title}
        actionLabel={rail.categoryId ? 'See all' : undefined}
        onAction={rail.categoryId ? () => router.push(`/category/${rail.categoryId}`) : undefined}
        style={styles.pad}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {rail.items.map((item) => (
          <ProductCard key={item.id} item={item} width={128} testID={`card-${item.id}`} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const home = useMinutelyHome();
  const addresses = useAddresses();
  const [addressId, setAddressId] = useState<string>();
  const [addressOpen, setAddressOpen] = useState(false);
  const address = addresses.data?.find((a) => a.id === addressId) ?? defaultAddress(addresses.data);
  const data = home.data;

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        stickyHeaderIndices={[1]}
        refreshControl={<RefreshControl refreshing={home.isRefetching} onRefresh={() => void home.refetch()} tintColor={colors.primary} />}
        testID="home-scroll"
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <GradientFill colors={[colors.accentSoft, colors.background]} direction="vertical" />
          <View style={styles.headTop}>
            <View style={styles.flex}>
              <Text variant="overline" color="textSecondary">
                {data ? `Minutely · ${data.store.locality}` : 'Minutely'}
              </Text>
              <View style={styles.etaRow}>
                <Icon name="flash" size={24} color="primary" />
                <Text variant="title2" weight={800} numberOfLines={1} adjustsFontSizeToFit accessibilityRole="header" testID="eta-headline" style={styles.addressText}>
                  {etaHeadline(data?.etaMinutes ?? 9)}
                </Text>
              </View>
              <PressableScale
                onPress={() => setAddressOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={address ? `Delivering to ${address.label}, ${addressLine(address)}. Change address` : 'Choose a delivery address'}
                style={styles.address}
              >
                {address ? <Icon {...addressIcon(address.label)} size={14} color="text" /> : null}
                <Text variant="footnote" weight={700} numberOfLines={1} style={styles.addressText}>
                  {address ? `${address.label.toUpperCase()}  ` : 'Choose address'}
                  <Text variant="footnote" weight={400} color="textSecondary">
                    {address ? `${addressLine(address)}, ${address.locality}` : ''}
                  </Text>
                </Text>
                <Icon name="chevron-down" size={14} color="text" />
              </PressableScale>
            </View>
            <IconButton name="person-circle" size={44} iconSize={36} label="Your account" color="text" onPress={() => router.push('/account')} />
          </View>
        </View>

        <View style={[styles.searchWrap, { backgroundColor: colors.background }]}>
          <SearchBar rotatingHints={SEARCH_HINTS} onPress={() => router.push('/search')} testID="home-search" />
        </View>

        {home.isError && !data ? (
          <ErrorState art="shopping-trolley" error={home.error} onRetry={() => void home.refetch()} />
        ) : !data ? (
          <View style={styles.loading} accessible accessibilityLabel="Loading the store">
            <Skeleton height={140} radius={16} />
            <Skeleton height={220} radius={16} />
            <Skeleton height={200} radius={16} />
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.banners} snapToInterval={300 + 12} decelerationRate="fast">
              {data.banners.map((b) => (
                <OfferBanner key={b.id} banner={b} />
              ))}
            </ScrollView>

            {data.rails.slice(0, 1).map((r) => (
              <ProductRail key={r.id} rail={r} />
            ))}

            <View style={styles.section}>
              <SectionHeader title="Shop by category" style={styles.pad} />
              <CategoryGrid categories={data.categories} />
            </View>

            {data.rails.slice(1).map((r) => (
              <ProductRail key={r.id} rail={r} />
            ))}

            <View style={styles.footer}>
              <Text variant="title1" weight={800} color="textMuted" style={styles.footerTitle}>
                {'Groceries\nin minutes.'}
              </Text>
              <Text variant="footnote" color="textMuted">
                {`From ${data.store.name}, a few streets away`}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <MinutelyCartBar />

      <AddressSheet
        visible={addressOpen}
        onClose={() => setAddressOpen(false)}
        addresses={addresses.data}
        selectedId={address?.id}
        onSelect={(a) => {
          setAddressOpen(false);
          setAddressId(a.id);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  dim: { opacity: 0.9 },
  scroll: { paddingBottom: 96 },
  header: { paddingHorizontal: 16, paddingBottom: 8, overflow: 'hidden' },
  headTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, marginLeft: -2 },
  address: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 32, marginTop: 2 },
  addressText: { flexShrink: 1 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 8 },
  loading: { padding: 16, gap: 16 },
  banners: { paddingHorizontal: 16, gap: 12, paddingVertical: 8 },
  banner: { width: 300, height: 136, borderRadius: 18, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' },
  bannerText: { flex: 1, padding: 16, gap: 4 },
  bannerArt: { marginRight: 12 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  section: { marginTop: 16, gap: 10 },
  pad: { paddingHorizontal: 16 },
  rail: { paddingHorizontal: 16, gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: 16, rowGap: 14 },
  footer: { padding: 24, paddingTop: 40, gap: 8 },
  footerTitle: { lineHeight: 38 },
});
