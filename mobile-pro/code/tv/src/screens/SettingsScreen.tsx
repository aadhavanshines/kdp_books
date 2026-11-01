/** Settings: who is watching, autoplay, and about. */
import { StyleSheet, View } from 'react-native';

import { Art } from '../components/Art';
import { Focusable } from '../components/Focusable';
import { Icon, type IconName } from '../components/Icon';
import { CONTENT_LEFT } from '../components/layout';
import { Rail } from '../components/Rail';
import { Text } from '../components/Text';
import { FocusGroup } from '../focus/FocusGroup';
import { useApp } from '../state/AppState';
import { s } from '../theme/scale';
import { colors, radii } from '../theme/tokens';

function Row({ icon, label, value, onPress, focusKey, autoFocus }: { icon: IconName; label: string; value: string; onPress: () => void; focusKey: string; autoFocus?: boolean }) {
  return (
    <Focusable accessibilityLabel={`${label}: ${value}`} focusKey={focusKey} autoFocus={autoFocus} indicator="glow" focusScale={1.02} radius={radii.lg} style={styles.row} onPress={onPress}>
      {({ focused }) => (
        <View style={[styles.rowBody, focused && styles.rowFocused]}>
          <Icon name={icon} size={36} color={focused ? 'onFocusFill' : 'textSecondary'} />
          <Text variant="label" color={focused ? 'onFocusFill' : 'text'} style={{ flex: 1, marginLeft: s(24) }}>
            {label}
          </Text>
          <Text variant="label" color={focused ? 'onFocusFill' : 'textMuted'}>
            {value}
          </Text>
        </View>
      )}
    </Focusable>
  );
}

export function SettingsScreen() {
  const { profile, navigate, autoplayNext, setAutoplayNext } = useApp();
  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        <Text variant="title1" accessibilityRole="header">
          Settings
        </Text>
        {profile ? (
          <View style={styles.who}>
            <View style={styles.avatar}>
              <Art name={profile.art} size={s(72)} decorative />
            </View>
            <Text variant="title3" style={{ marginLeft: s(20) }}>
              {profile.name}
            </Text>
          </View>
        ) : null}
        <FocusGroup id="settings" style={{ gap: s(12) }}>
          <Row icon="people-outline" label="Switch profile" value={profile?.name ?? ''} focusKey="set:profile" autoFocus onPress={() => navigate({ type: 'profiles' })} />
          <Row
            icon="play-skip-forward-outline"
            label="Autoplay next episode"
            value={autoplayNext ? 'On' : 'Off'}
            focusKey="set:autoplay"
            onPress={() => setAutoplayNext(!autoplayNext)}
          />
          <Row icon="information-circle-outline" label="About Reelhouse" value="Version 1.0.0 · demo catalog" focusKey="set:about" onPress={() => undefined} />
        </FocusGroup>
      </View>
      <Rail active="settings" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { position: 'absolute', top: s(80), left: s(CONTENT_LEFT), width: s(1100) },
  who: { flexDirection: 'row', alignItems: 'center', marginVertical: s(40) },
  avatar: { width: s(96), height: s(96), borderRadius: s(48), backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  row: { height: s(96) },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: s(32), borderRadius: radii.lg, backgroundColor: colors.surface },
  rowFocused: { backgroundColor: colors.focusFill },
});
