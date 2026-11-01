import type { ProductFacets } from '@pro/api';
import { BottomSheet, Button, Chip, Divider, OptionRow, Text, formatINR } from '@pro/ui';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  activeFilterCount,
  DISCOUNT_OPTIONS,
  discountLabel,
  NO_FILTERS,
  PRICE_BUCKETS,
  priceLabel,
  RATING_OPTIONS,
  ratingLabel,
  samePrice,
  SORTS,
  toggleBrand,
  type FilterState,
} from '../lib/filters';

function Group({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <View style={styles.groupHead}>
        <Text variant="headline" accessibilityRole="header">
          {title}
        </Text>
        {note ? (
          <Text variant="caption" weight={400} color="textMuted">
            {note}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  value: FilterState;
  facets: ProductFacets | undefined;
  onApply: (next: FilterState) => void;
}

/** Price, rating, discount and brand filters, applied together. */
export function FilterSheet({ visible, onClose, value, facets, onApply }: FilterSheetProps) {
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(visible);
  // Start from the applied filters each time the sheet opens.
  if (visible !== seen) {
    setSeen(visible);
    if (visible) setDraft(value);
  }
  const brands = facets?.brands ?? [];
  const count = activeFilterCount(draft);
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filters"
      subtitle={count ? `${count} applied` : 'Narrow down the results'}
      testID="filter-sheet"
      footer={
        <View style={styles.footer}>
          <Button title="Clear all" variant="secondary" disabled={count === 0} onPress={() => setDraft({ ...NO_FILTERS, sort: draft.sort })} style={styles.flex} />
          <Button title="Show results" onPress={() => onApply(draft)} style={styles.flex} testID="apply-filters" />
        </View>
      }
    >
      <Group title="Price" note={facets ? `${formatINR(facets.price.min)} to ${formatINR(facets.price.max)} in these results` : undefined}>
        <View style={styles.chips}>
          {PRICE_BUCKETS.map((b) => {
            const on = samePrice(draft.price, b);
            return <Chip key={priceLabel(b)} label={priceLabel(b)} selected={on} onPress={() => setDraft({ ...draft, price: on ? null : b })} />;
          })}
        </View>
      </Group>
      <Divider />
      <Group title="Customer rating">
        <View style={styles.chips}>
          {RATING_OPTIONS.map((r) => (
            <Chip key={r} label={ratingLabel(r)} selected={draft.minRating === r} onPress={() => setDraft({ ...draft, minRating: draft.minRating === r ? null : r })} />
          ))}
        </View>
      </Group>
      <Divider />
      <Group title="Discount">
        <View style={styles.chips}>
          {DISCOUNT_OPTIONS.map((d) => (
            <Chip key={d} label={discountLabel(d)} selected={draft.minDiscount === d} onPress={() => setDraft({ ...draft, minDiscount: draft.minDiscount === d ? null : d })} />
          ))}
        </View>
      </Group>
      {brands.length ? (
        <>
          <Divider />
          <Group title="Brand" note={draft.brands.length ? `${draft.brands.length} selected` : undefined}>
            {brands.map((b) => (
              <OptionRow
                key={b.name}
                control="checkbox"
                title={b.name}
                trailing={`${b.count}`}
                selected={draft.brands.includes(b.name)}
                onPress={() => setDraft(toggleBrand(draft, b.name))}
              />
            ))}
          </Group>
        </>
      ) : null}
    </BottomSheet>
  );
}

export function SortSheet({ visible, onClose, value, onChange }: { visible: boolean; onClose: () => void; value: FilterState['sort']; onChange: (s: FilterState['sort']) => void }) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Sort by" testID="sort-sheet">
      {SORTS.map((s) => (
        <OptionRow key={s.key} title={s.label} selected={value === s.key} onPress={() => onChange(s.key)} />
      ))}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  group: { paddingVertical: 14, gap: 10 },
  groupHead: { gap: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { flexDirection: 'row', gap: 12 },
});
