/**
 * Search: an on-screen keyboard grid on the left (D-pad friendly: no text
 * field to summon a system keyboard), live results on the right, and
 * trending searches and popular titles while the query is empty.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Focusable } from '../components/Focusable';
import { Icon, type IconName } from '../components/Icon';
import { CONTENT_LEFT } from '../components/layout';
import { Rail } from '../components/Rail';
import { Text } from '../components/Text';
import { TitleGrid } from '../components/TitleGrid';
import { searchTitles, top10, trendingSearches } from '../data/catalog';
import { FocusGroup } from '../focus/FocusGroup';
import { useApp } from '../state/AppState';
import { s } from '../theme/scale';
import { colors, radii } from '../theme/tokens';
import { applyKey, LETTER_ROWS, type KeyAction } from './keyboard';

const KEY = 96;
const KEY_GAP = 12;
const KB_WIDTH = KEY * 6 + KEY_GAP * 5;
const RESULTS_LEFT = CONTENT_LEFT + KB_WIDTH + 96;
const RESULTS_WIDTH = 1920 - RESULTS_LEFT - 64;
const CARD_W = 290;

function Key({ label, icon, action, wide, onKey, autoFocus }: { label: string; icon?: IconName; action: KeyAction; wide?: boolean; onKey: (a: KeyAction) => void; autoFocus?: boolean }) {
  const width = wide ? KEY * 2 + KEY_GAP : KEY;
  return (
    <Focusable
      accessibilityLabel={label}
      focusKey={`key:${label}`}
      autoFocus={autoFocus}
      indicator="glow"
      focusScale={1.1}
      radius={radii.md}
      style={{ width: s(width), height: s(80) }}
      onPress={() => onKey(action)}
    >
      {({ focused }) => (
        <View style={[styles.key, focused && styles.keyFocused]}>
          {icon ? (
            <Icon name={icon} size={34} color={focused ? 'onFocusFill' : 'text'} />
          ) : (
            <Text variant="headline" color={focused ? 'onFocusFill' : 'text'} style={{ fontFamily: 'Inter_600SemiBold' }}>
              {label.length === 1 ? label.toUpperCase() : label}
            </Text>
          )}
        </View>
      )}
    </Focusable>
  );
}

export function SearchScreen({ initialQuery = '' }: { initialQuery?: string }) {
  const { navigate, profile } = useApp();
  const [query, setQuery] = useState(initialQuery);
  const results = searchTitles(query, profile);
  const onKey = (a: KeyAction) => setQuery((q) => applyKey(q, a));
  const open = (id: string) => navigate({ type: 'push', route: { name: 'details', titleId: id } });

  return (
    <View style={styles.screen}>
      <View style={styles.left}>
        <Text variant="title2" accessibilityRole="header">
          Search
        </Text>
        <View style={styles.field} accessible accessibilityLabel={query ? `Search for ${query}` : 'Search box, empty'} accessibilityLiveRegion="polite">
          <Icon name="search" size={34} color="textMuted" />
          <Text variant="title3" color={query ? 'text' : 'textMuted'} numberOfLines={1} style={{ marginLeft: s(16), flex: 1 }}>
            {query || 'Titles, genres, people'}
            {query ? <Text variant="title3" color="primary">|</Text> : null}
          </Text>
        </View>
        <FocusGroup id="keyboard" style={styles.keyboard}>
          {LETTER_ROWS.map((row, r) => (
            <View key={r} style={styles.keyRow}>
              {row.map((ch) => (
                <Key key={ch} label={ch} action={{ type: 'char', char: ch }} onKey={onKey} autoFocus={ch === 'a'} />
              ))}
            </View>
          ))}
          <View style={styles.keyRow}>
            <Key label="Space" icon="remove-outline" action={{ type: 'space' }} wide onKey={onKey} />
            <Key label="Delete" icon="backspace-outline" action={{ type: 'delete' }} wide onKey={onKey} />
            <Key label="Clear" icon="close-circle-outline" action={{ type: 'clear' }} wide onKey={onKey} />
          </View>
        </FocusGroup>
      </View>

      <View style={styles.right}>
        {query ? (
          <>
            <Text variant="headline" color="textSecondary" style={styles.heading}>
              {results.length > 0 ? `Results for “${query}”` : `No results for “${query}”`}
            </Text>
            {results.length > 0 ? (
              <TitleGrid id="results" titles={results} columns={3} cardWidth={CARD_W} height={880} onPress={(t) => open(t.id)} style={styles.grid} />
            ) : (
              <View style={styles.empty}>
                <Icon name="search-outline" size={72} color="textMuted" />
                <Text variant="body" color="textMuted" style={{ marginTop: s(16), maxWidth: s(760) }}>
                  Try a title like “Starfall”, a genre like “Thriller”, or an actor’s name.
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text variant="headline" color="textSecondary" style={styles.heading}>
              Trending searches
            </Text>
            <FocusGroup id="trending" style={styles.chips}>
              {trendingSearches(profile).map((t) => (
                <Focusable
                  key={t}
                  accessibilityLabel={`Search for ${t}`}
                  focusKey={`trend:${t}`}
                  indicator="glow"
                  focusScale={1.06}
                  radius={s(30)}
                  onPress={() => setQuery(t.toLowerCase())}
                >
                  {({ focused }) => (
                    <View style={[styles.chip, focused && styles.chipFocused]}>
                      <Icon name="trending-up" size={28} color={focused ? 'onFocusFill' : 'accent'} />
                      <Text variant="label" color={focused ? 'onFocusFill' : 'text'} style={{ marginLeft: s(10) }}>
                        {t}
                      </Text>
                    </View>
                  )}
                </Focusable>
              ))}
            </FocusGroup>
            <Text variant="headline" color="textSecondary" style={[styles.heading, { marginTop: s(40) }]}>
              Popular on Reelhouse
            </Text>
            <TitleGrid id="popular" titles={top10(profile).slice(0, 6)} columns={3} cardWidth={CARD_W} height={640} onPress={(t) => open(t.id)} style={styles.grid} />
          </>
        )}
      </View>
      <Rail active="search" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  left: { position: 'absolute', left: s(CONTENT_LEFT), top: s(80), width: s(KB_WIDTH) },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: s(88),
    marginTop: s(28),
    paddingHorizontal: s(24),
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.hairline,
  },
  keyboard: { marginTop: s(32), gap: s(KEY_GAP) },
  keyRow: { flexDirection: 'row', gap: s(KEY_GAP) },
  key: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.surface },
  keyFocused: { backgroundColor: colors.focusFill },
  right: { position: 'absolute', left: s(RESULTS_LEFT), top: s(80), width: s(RESULTS_WIDTH), bottom: 0 },
  heading: { marginTop: s(14) },
  grid: { marginLeft: s(-28), marginTop: s(8) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: s(16), marginTop: s(24) },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: s(60),
    paddingHorizontal: s(24),
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.hairline,
  },
  chipFocused: { backgroundColor: colors.focusFill, borderColor: colors.focusFill },
  empty: { marginTop: s(80), alignItems: 'flex-start' },
});
