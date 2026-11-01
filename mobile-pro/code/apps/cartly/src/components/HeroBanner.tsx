import type { Banner } from '@pro/api';
import { Art, GradientFill, Icon, PressableScale, Text, useTheme } from '@pro/ui';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { linkToHref } from '../lib/links';

export function HeroBanner({ banner }: { banner: Banner }) {
  const theme = useTheme();
  const fg = theme.onTone(banner.tone);
  const go = () => {
    const href = linkToHref(banner.link);
    if (href) router.push(href as never);
  };
  return (
    <PressableScale onPress={go} accessibilityLabel={`${banner.title}. ${banner.subtitle}. ${banner.cta}`} scaleTo={0.98} style={styles.slide}>
      <GradientFill colors={theme.tone(banner.tone)} />
      <View style={styles.text}>
        <Text variant="title2" color={fg} numberOfLines={2}>
          {banner.title}
        </Text>
        <Text variant="footnote" weight={500} color={fg} numberOfLines={2} style={styles.sub}>
          {banner.subtitle}
        </Text>
        <View style={[styles.cta, { backgroundColor: theme.colors.accent }]}>
          <Text variant="caption" weight={800} color="onAccent">
            {banner.cta}
          </Text>
          <Icon name="arrow-forward" size={12} color="onAccent" />
        </View>
      </View>
      <Art name={banner.art} size={120} decorative style={styles.art} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  slide: { height: 164, borderRadius: 18, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1, padding: 18, gap: 4 },
  sub: { opacity: 0.92 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  art: { marginRight: 10 },
});
