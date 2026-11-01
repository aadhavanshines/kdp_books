import { StyleSheet, View } from 'react-native';

import { lengthLabel, type Title } from '../data/catalog';
import { s } from '../theme/scale';
import { RatingBadge } from './Badge';
import { Text } from './Text';

/** "98% match · 2026 · U/A 13+ · 2 seasons · Sci-fi · Thriller" */
export function TitleMeta({ title }: { title: Title }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${title.match}% match, ${title.year}, rated ${title.maturity}, ${lengthLabel(title)}, ${title.genres.join(', ')}`}>
      <Text variant="bodyStrong" color="success">
        {title.match}% match
      </Text>
      <Text variant="bodyStrong" color="textSecondary">
        {title.year}
      </Text>
      <RatingBadge label={title.maturity} />
      <Text variant="bodyStrong" color="textSecondary">
        {lengthLabel(title)}
      </Text>
      <Text variant="body" color="textSecondary">
        {title.genres.join('  ·  ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: s(24), marginTop: s(20) },
});
