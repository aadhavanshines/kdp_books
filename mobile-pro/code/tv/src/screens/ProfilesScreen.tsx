/** "Who's watching?": art avatars on brand gradients, including a Kids profile. */
import { StyleSheet, View } from 'react-native';

import { Art } from '../components/Art';
import { Tag } from '../components/Badge';
import { Focusable } from '../components/Focusable';
import { Glow, GradientFill } from '../components/GradientFill';
import { Text } from '../components/Text';
import { PROFILES } from '../data/catalog';
import { FocusGroup } from '../focus/FocusGroup';
import { useApp } from '../state/AppState';
import { s } from '../theme/scale';
import { colors, tones } from '../theme/tokens';

const AVATAR = 220;

export function ProfilesScreen() {
  const { navigate, setProfile, profile: current } = useApp();
  const initial = current?.id ?? PROFILES[0]!.id;
  return (
    <View style={styles.screen}>
      <Glow color={colors.primary} cx={0.5} cy={0.1} r={0.7} opacity={0.32} />
      <Glow color={colors.accent} cx={0.85} cy={1} r={0.5} opacity={0.12} />
      <View style={styles.brand}>
        <View style={styles.mark}>
          <GradientFill colors={colors.gradient} direction="diagonal" />
          <Text variant="title3" style={{ fontFamily: 'Inter_900Black' }}>
            R
          </Text>
        </View>
        <Text variant="title3" style={{ fontFamily: 'Inter_900Black', letterSpacing: s(6) }}>
          REELHOUSE
        </Text>
      </View>
      <Text variant="title1" align="center" accessibilityRole="header">
        Who’s watching?
      </Text>
      <FocusGroup id="profiles" style={styles.row}>
        {PROFILES.map((p) => (
          <Focusable
            key={p.id}
            accessibilityLabel={`${p.name}${p.kids ? ', Kids profile' : ''}`}
            focusKey={`profile:${p.id}`}
            autoFocus={p.id === initial}
            indicator="none"
            focusScale={1.1}
            style={styles.item}
            onPress={() => {
              setProfile(p);
              navigate({ type: 'enter' });
            }}
          >
            {({ focused }) => (
              <View style={styles.itemBody}>
                <View style={[styles.avatarRing, focused && styles.avatarRingFocused]}>
                  <View style={styles.avatar}>
                    <GradientFill colors={tones[p.tone]} direction="diagonal" />
                    <Art name={p.art} size={s(AVATAR * 0.72)} decorative />
                  </View>
                </View>
                <Text variant="title3" color={focused ? 'text' : 'textMuted'} style={{ marginTop: s(28) }}>
                  {p.name}
                </Text>
                <View style={styles.tagSlot}>{p.kids ? <Tag label="KIDS" tone="accent" /> : null}</View>
              </View>
            )}
          </Focusable>
        ))}
      </FocusGroup>
      <Text variant="caption" color="textMuted" align="center">
        Use the arrows to choose, then press select
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  brand: { position: 'absolute', top: s(64), left: s(96), flexDirection: 'row', alignItems: 'center', gap: s(16) },
  mark: { width: s(56), height: s(56), borderRadius: s(14), overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: s(56), marginTop: s(80), marginBottom: s(72) },
  item: { width: s(AVATAR + 40), height: s(AVATAR + 160) },
  itemBody: { alignItems: 'center' },
  avatarRing: {
    width: s(AVATAR + 24),
    height: s(AVATAR + 24),
    borderRadius: s((AVATAR + 24) / 2),
    borderWidth: s(6),
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRingFocused: { borderColor: colors.focusRing, boxShadow: `0px 0px ${s(48)}px ${s(8)}px ${colors.focusGlow}` },
  avatar: {
    width: s(AVATAR),
    height: s(AVATAR),
    borderRadius: s(AVATAR / 2),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagSlot: { height: s(36), marginTop: s(10) },
});
