/**
 * Side navigation rail. Collapsed it is a column of icons on an opaque panel
 * that fades softly into the content (rows clip at its edge, see Shelf); as
 * soon as any item takes focus it expands over the content with labels. The active
 * section is the group's entry point, so pressing Left from anywhere lands
 * on it rather than on whichever icon happens to be level with the focus.
 */
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type HostInstance } from 'react-native';

import { FocusGroup } from '../focus/FocusGroup';
import { useScreenFocus } from '../focus/ScreenFocus';
import { useBack } from '../nav/useBack';
import type { TopLevel } from '../nav/stack';
import { useApp } from '../state/AppState';
import { s } from '../theme/scale';
import { colors, radii } from '../theme/tokens';
import { Art } from './Art';
import { Focusable } from './Focusable';
import { GradientFill } from './GradientFill';
import { Icon, type IconName } from './Icon';
import { RAIL_COLLAPSED, RAIL_EXPANDED, RAIL_FADE } from './layout';
import { Text } from './Text';

export const RAIL_ITEMS: readonly { id: TopLevel; label: string; icon: IconName; iconActive: IconName }[] = [
  { id: 'search', label: 'Search', icon: 'search-outline', iconActive: 'search' },
  { id: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { id: 'movies', label: 'Movies', icon: 'film-outline', iconActive: 'film' },
  { id: 'series', label: 'Series', icon: 'tv-outline', iconActive: 'tv' },
  { id: 'sports', label: 'Sports', icon: 'trophy-outline', iconActive: 'trophy' },
  { id: 'guide', label: 'Live TV', icon: 'radio-outline', iconActive: 'radio' },
  { id: 'mylist', label: 'My list', icon: 'bookmark-outline', iconActive: 'bookmark' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

/** The menu for a profile: Kids profiles have no sports, so no Sports entry. */
export function railItemsFor(profile: { kids?: boolean } | null | undefined) {
  return profile?.kids ? RAIL_ITEMS.filter((i) => i.id !== 'sports') : RAIL_ITEMS;
}

export function Rail({ active, onExpandedChange }: { active: TopLevel; onExpandedChange?: (expanded: boolean) => void }) {
  const { navigate, profile } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [entry, setEntry] = useState<HostInstance | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screen = useScreenFocus();

  // Back from the rail goes back into the page (its initial focus), not out of the screen.
  useBack(() => {
    screen.focus(null);
    return true;
  }, screen.active && expanded);

  useEffect(() => () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
  }, []);

  const onFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    if (!expanded) {
      setExpanded(true);
      onExpandedChange?.(true);
    }
  };
  // Focus moving between rail items blurs one and focuses the next; only collapse if focus really left.
  const onBlur = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(() => {
      setExpanded(false);
      onExpandedChange?.(false);
    }, 40);
  };

  const width = s(expanded ? RAIL_EXPANDED : RAIL_COLLAPSED);
  return (
    <View style={[styles.rail, { width }]} accessibilityRole="menu" accessibilityLabel="Navigation">
      {expanded ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]}>
          <View style={[styles.edge, { left: width }]}>
            <GradientFill colors={[colors.scrim, colors.scrim]} opacities={[0.7, 0]} direction="horizontal" />
          </View>
        </View>
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
          <View style={[styles.fade, { left: width }]}>
            <GradientFill colors={[colors.background, colors.background]} opacities={[1, 0]} direction="horizontal" />
          </View>
        </View>
      )}
      <View style={styles.brand}>
        <View style={styles.mark}>
          <GradientFill colors={colors.gradient} direction="diagonal" />
          <Text variant="headline" style={styles.markText}>
            R
          </Text>
        </View>
        {expanded ? (
          <Text variant="title3" style={{ marginLeft: s(16) }}>
            Reelhouse
          </Text>
        ) : null}
      </View>
      <FocusGroup id="rail" entry={entry} style={styles.items}>
        {profile ? (
          <Focusable
            accessibilityLabel={`Profile: ${profile.name}. Switch profile`}
            onPress={() => navigate({ type: 'profiles' })}
            onFocus={onFocus}
            onBlur={onBlur}
            indicator="none"
            focusScale={1}
            focusKey="rail:profile"
            style={[styles.item, { marginBottom: s(28) }]}
          >
            {({ focused }) => (
              <View style={[styles.itemBody, focused && styles.itemFocused]}>
                <View style={[styles.avatar, focused && { borderColor: colors.primary }]}>
                  <Art name={profile.art} size={s(44)} decorative />
                </View>
                {expanded ? (
                  <Text variant="label" color={focused ? 'onFocusFill' : 'textSecondary'} style={styles.label} numberOfLines={1}>
                    {profile.name}
                  </Text>
                ) : null}
              </View>
            )}
          </Focusable>
        ) : null}
        {railItemsFor(profile).map((item) => {
          const isActive = item.id === active;
          return (
            <Focusable
              key={item.id}
              accessibilityLabel={item.label}
              accessibilityState={{ selected: isActive }}
              onPress={() => navigate({ type: 'section', section: item.id })}
              onFocus={onFocus}
              onBlur={onBlur}
              indicator="none"
              focusScale={1}
              focusKey={`rail:${item.id}`}
              isGroupDefault={isActive}
              hostRef={isActive ? setEntry : undefined}
              style={styles.item}
            >
              {({ focused }) => (
                <View style={[styles.itemBody, focused && styles.itemFocused]}>
                  {isActive && !focused ? <View style={styles.activeBar} /> : null}
                  <Icon
                    name={isActive ? item.iconActive : item.icon}
                    size={38}
                    color={focused ? 'onFocusFill' : isActive ? 'text' : 'textMuted'}
                  />
                  {expanded ? (
                    <Text
                      variant="label"
                      color={focused ? 'onFocusFill' : isActive ? 'text' : 'textSecondary'}
                      style={styles.label}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  ) : null}
                </View>
              )}
            </Focusable>
          );
        })}
      </FocusGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 50, paddingHorizontal: s(16) },
  edge: { position: 'absolute', top: 0, bottom: 0, width: s(160) },
  fade: { position: 'absolute', top: 0, bottom: 0, width: s(RAIL_FADE) },
  brand: { flexDirection: 'row', alignItems: 'center', marginTop: s(48), marginLeft: s(8) },
  mark: { width: s(64), height: s(64), borderRadius: s(16), overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  markText: { fontFamily: 'Inter_900Black', fontSize: s(36), lineHeight: s(42) },
  items: { flex: 1, justifyContent: 'center', paddingBottom: s(80) },
  item: { height: s(72), marginVertical: s(4), alignSelf: 'stretch' },
  itemBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    borderRadius: radii.pill,
  },
  itemFocused: { backgroundColor: colors.focusFill, boxShadow: `0px 0px ${s(28)}px ${s(4)}px ${colors.focusGlow}` },
  activeBar: { position: 'absolute', left: s(2), width: s(6), height: s(32), borderRadius: s(3), backgroundColor: colors.primary },
  avatar: {
    width: s(56),
    height: s(56),
    marginLeft: s(-9),
    borderRadius: s(28),
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: { marginLeft: s(20) },
});
