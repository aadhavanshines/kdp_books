/** My list: a grid of saved titles, or an empty state that points back to browsing. */
import { StyleSheet, View } from 'react-native';

import { Art } from '../components/Art';
import { Button } from '../components/Button';
import { CONTENT_LEFT } from '../components/layout';
import { Rail } from '../components/Rail';
import { Text } from '../components/Text';
import { TitleGrid } from '../components/TitleGrid';
import { findTitle, type Title } from '../data/catalog';
import { useApp } from '../state/AppState';
import { s } from '../theme/scale';
import { colors } from '../theme/tokens';

export function MyListScreen() {
  const { myList, navigate, profile } = useApp();
  const titles = myList.map(findTitle).filter((t): t is Title => !!t && (!profile?.kids || t.kids));
  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        <Text variant="title1" accessibilityRole="header">
          My list
        </Text>
        <Text variant="body" color="textMuted" style={{ marginTop: s(8) }}>
          {titles.length === 1 ? '1 title' : `${titles.length} titles`} saved to watch later
        </Text>
        {titles.length > 0 ? (
          <TitleGrid
            id="mylist"
            autoFocusFirst
            titles={titles}
            columns={4}
            cardWidth={384}
            height={860}
            style={{ marginLeft: s(-28), marginTop: s(16) }}
            onPress={(t) => navigate({ type: 'push', route: { name: 'details', titleId: t.id } })}
          />
        ) : (
          <View style={styles.empty}>
            <Art name="popcorn" size={s(180)} decorative />
            <Text variant="title3" style={{ marginTop: s(24) }}>
              Nothing saved yet
            </Text>
            <Text variant="body" color="textMuted" style={{ marginTop: s(8), marginBottom: s(32) }}>
              Choose My list on any title to keep it here.
            </Text>
            <Button label="Browse Home" icon="home" variant="primary" autoFocus onPress={() => navigate({ type: 'section', section: 'home' })} />
          </View>
        )}
      </View>
      <Rail active="mylist" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { position: 'absolute', top: s(80), left: s(CONTENT_LEFT), right: s(64), bottom: 0 },
  empty: { marginTop: s(120), alignItems: 'flex-start' },
});
