import { useRestaurant, type MenuCategory, type MenuItem, type Offer } from '@pro/api';
import {
  BottomSheet,
  CartBar,
  Chip,
  Divider,
  ErrorState,
  formatCompact,
  formatINR,
  Icon,
  IconButton,
  PressableScale,
  RatingPill,
  ScreenHeader,
  SearchBar,
  Skeleton,
  Text,
  useTheme,
} from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { SectionList, StyleSheet, View, type SectionListInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useItemAdder } from '../../components/ItemAdder';
import { MenuItemRow, MenuItemSkeleton } from '../../components/MenuItemRow';
import { deliveryWindow } from '../../components/RestaurantCard';
import { filterMenu, type MenuFilter } from '../../lib/menu';
import { useCartSummary } from '../../lib/useCartSummary';

type Section = MenuCategory & { data: MenuItem[] };

function OfferCard({ offer }: { offer: Offer }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.offer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={[styles.offerIcon, { backgroundColor: colors.primarySoft }]}>
        <Icon set="mci" name="brightness-percent" size={20} color="primary" />
      </View>
      <View style={styles.flexShrink}>
        <Text variant="subhead" weight={700} numberOfLines={1}>
          {offer.title}
        </Text>
        <Text variant="caption" weight={500} color="textMuted" numberOfLines={1}>
          {offer.code ? `USE ${offer.code}` : offer.description}
        </Text>
      </View>
    </View>
  );
}

export default function RestaurantScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useRestaurant(id);
  const r = query.data;
  const adder = useItemAdder(r?.name);
  const cartBar = useCartSummary();
  const [filter, setFilter] = useState<MenuFilter>({ veg: false, bestseller: false, text: '' });
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const list = useRef<SectionListInstance>(null);

  const sections = useMemo<Section[]>(
    () => (r ? filterMenu(r.menu, filter).map((c) => ({ ...c, data: c.items })) : []),
    [r, filter],
  );

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const header = (
    <ScreenHeader
      onBack={goBack}
      transparent
      style={{ backgroundColor: colors.background }}
      right={
        <>
          <IconButton
            name={searching ? 'close' : 'search'}
            label={searching ? 'Close menu search' : 'Search the menu'}
            onPress={() => {
              setSearching((s) => !s);
              setFilter((f) => ({ ...f, text: '' }));
            }}
          />
          <IconButton name="share-social-outline" label="Share restaurant" />
        </>
      }
    />
  );

  if (query.isError) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <ErrorState art="cooking" error={query.error} onRetry={() => void query.refetch()} />
      </View>
    );
  }

  if (!r) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]} accessibilityLabel="Loading menu" accessible>
        {header}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }, theme.shadow('md')]}>
          <Skeleton width="70%" height={26} />
          <Skeleton width="50%" height={14} />
          <Skeleton width="85%" height={14} />
        </View>
        <MenuItemSkeleton />
        <MenuItemSkeleton />
      </View>
    );
  }

  const listHeader = (
    <View>
      <View style={[styles.infoCard, { backgroundColor: colors.surface }, theme.shadow('md')]}>
        <View style={styles.titleRow}>
          <View style={styles.flexShrink}>
            <Text variant="title2" accessibilityRole="header">
              {r.name}
            </Text>
            <Text variant="footnote" color="textSecondary" numberOfLines={1}>
              {r.cuisines.join(', ')}
            </Text>
          </View>
          <View style={styles.ratingBox}>
            <RatingPill rating={r.rating} size="md" />
            <Text variant="caption" weight={500} color="textMuted">
              {`${formatCompact(r.ratingCount)} ratings`}
            </Text>
          </View>
        </View>
        <Divider variant="dashed" style={styles.divider} />
        <View style={styles.facts}>
          <View style={styles.fact}>
            <Icon name="time" size={16} color="accent" />
            <Text variant="subhead" weight={700}>
              {deliveryWindow(r)}
            </Text>
          </View>
          <Text variant="subhead" color="textMuted">
            •
          </Text>
          <Text variant="subhead" color="textSecondary">
            {`${r.locality}, ${r.distanceKm} km`}
          </Text>
          <Text variant="subhead" color="textMuted">
            •
          </Text>
          <Text variant="subhead" color="textSecondary">
            {`${formatINR(r.costForTwo)} for two`}
          </Text>
        </View>
        <Text variant="caption" weight={400} color="textMuted">
          {`${r.isOpen ? 'Open now' : 'Closed now'} · ${r.hours}`}
        </Text>
      </View>

      {r.offers.length ? (
        <View>
          <SectionList
            horizontal
            sections={[{ data: r.offers }]}
            keyExtractor={(o, i) => `${o.code ?? 'auto'}${i}`}
            renderItem={({ item }) => <OfferCard offer={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offers}
          />
        </View>
      ) : null}

      {searching ? (
        <SearchBar
          value={filter.text}
          onChangeText={(text) => setFilter((f) => ({ ...f, text }))}
          placeholder={`Search in ${r.name}`}
          autoFocus
          style={styles.menuSearch}
        />
      ) : null}
      <View style={styles.chips}>
        <Chip
          label="Veg"
          icon={{ set: 'mci', name: 'leaf' }}
          selected={filter.veg}
          removable
          onPress={() => setFilter((f) => ({ ...f, veg: !f.veg }))}
        />
        <Chip
          label="Bestseller"
          icon={{ name: 'star' }}
          selected={filter.bestseller}
          removable
          onPress={() => setFilter((f) => ({ ...f, bestseller: !f.bestseller }))}
        />
      </View>
      <Divider label="MENU" style={styles.menuLabel} />
    </View>
  );

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      {header}
      <SectionList
        ref={list}
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHead, { backgroundColor: colors.surface }]}>
            <Text variant="title3">{`${section.name} (${section.data.length})`}</Text>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <View style={{ backgroundColor: colors.surface }}>
            <MenuItemRow item={item} quantity={adder.quantityOf(item.id)} onChange={adder.change} disabled={!r.isOpen} />
            {index < section.data.length - 1 ? <Divider variant="dashed" inset="lg" /> : null}
          </View>
        )}
        renderSectionFooter={() => <View style={styles.sectionGap} />}
        ListEmptyComponent={
          <View style={styles.noMatch}>
            <Text variant="headline" align="center">
              No dishes match
            </Text>
            <Text variant="footnote" color="textSecondary" align="center">
              Try another word or clear the filters.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: (cartBar ? 150 : 90) + insets.bottom }}
        onScrollToIndexFailed={() => undefined}
        testID="menu-list"
      />

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]} pointerEvents="box-none">
        <PressableScale
          onPress={() => setMenuOpen(true)}
          accessibilityLabel="Browse menu categories"
          style={[styles.menuButton, { backgroundColor: colors.text }, theme.shadow('lg')]}
        >
          <Icon set="mci" name="silverware-fork-knife" size={18} color="background" />
          <Text variant="subhead" weight={700} color="background">
            Menu
          </Text>
        </PressableScale>
        {cartBar ? <CartBar {...cartBar} subtitle={cartBar.subtitle} testID="cart-bar" /> : null}
      </View>

      <BottomSheet visible={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" testID="menu-sheet">
        {sections.map((s, i) => (
          <PressableScale
            key={s.id}
            scaleTo={0.99}
            accessibilityLabel={`${s.name}, ${s.data.length} dishes`}
            onPress={() => {
              setMenuOpen(false);
              list.current?.scrollToLocation({ sectionIndex: i, itemIndex: 0, viewOffset: 60, animated: true });
            }}
            style={styles.menuRow}
          >
            <Text variant="headline" weight={500}>
              {s.name}
            </Text>
            <Text variant="subhead" color="textMuted" tabular>
              {s.data.length}
            </Text>
          </PressableScale>
        ))}
      </BottomSheet>
      {adder.sheets}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  infoCard: { marginHorizontal: 16, marginTop: 4, padding: 16, borderRadius: 20, gap: 6 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  ratingBox: { alignItems: 'center', gap: 4 },
  divider: { marginVertical: 6 },
  facts: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  offers: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  offer: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 10, width: 230 },
  offerIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  menuSearch: { marginHorizontal: 16, marginBottom: 12 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  menuLabel: { marginTop: 16, marginBottom: 8, marginHorizontal: 16 },
  sectionHead: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 2 },
  sectionGap: { height: 10 },
  noMatch: { padding: 32, gap: 6 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, gap: 12 },
  menuButton: {
    alignSelf: 'flex-end',
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 999,
  },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48 },
});
