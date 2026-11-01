import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** "See all" link on the right. */
  actionLabel?: string;
  onAction?: () => void;
  /** Extra node next to the title, e.g. a countdown. */
  accessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** A section title with an optional subtitle and a "See all" link. */
export function SectionHeader({ title, subtitle, actionLabel = 'See all', onAction, accessory, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.titles}>
        <View style={styles.titleRow}>
          <Text variant="title3" accessibilityRole="header" numberOfLines={1} style={styles.shrink}>
            {title}
          </Text>
          {accessory}
        </View>
        {subtitle ? (
          <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onAction ? (
        <PressableScale
          onPress={onAction}
          accessibilityLabel={`${actionLabel}: ${title}`}
          hitSlop={8}
          style={styles.action}
        >
          <Text variant="subhead" weight={700} color="primary">
            {actionLabel}
          </Text>
          <Icon name="chevron-forward" size={14} color="primary" />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titles: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shrink: { flexShrink: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 32 },
});
