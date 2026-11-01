import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from './Card';
import { Text } from './Text';

export interface SectionCardProps {
  children?: ReactNode;
  title?: string;
  /** headline: bold section title (Cartly); overline: small caps label (Platter). */
  titleVariant?: 'headline' | 'overline';
  /** Shown at the right of the title, e.g. a "Change" button. */
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A white card that groups one part of a screen (cart, checkout, order details) under a title. */
export function SectionCard({ children, title, titleVariant = 'headline', right, style, testID }: SectionCardProps) {
  return (
    <Card shadow="sm" style={[styles.card, style]} testID={testID}>
      {title || right ? (
        <View style={styles.head}>
          {titleVariant === 'overline' ? (
            <Text variant="overline" color="textSecondary" accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
          ) : (
            <Text variant="headline" weight={700} accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
          )}
          {right}
        </View>
      ) : null}
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flexShrink: 1 },
});
