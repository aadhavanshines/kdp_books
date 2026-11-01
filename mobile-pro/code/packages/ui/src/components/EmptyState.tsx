import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { type ArtName } from '../art/registry';
import { ArtTile } from './Art';
import { Button } from './Button';
import { Text } from './Text';

export interface EmptyStateProps {
  art: ArtName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Friendly empty or error screen: art, title, message, one action. */
export function EmptyState({ art, title, message, actionLabel, onAction, style }: EmptyStateProps) {
  return (
    <View style={[styles.wrap, style]}>
      <ArtTile art={art} size={128} shape="circle" artScale={0.66} decorative />
      <Text variant="title3" align="center" accessibilityRole="header">
        {title}
      </Text>
      {message ? (
        <Text variant="footnote" color="textSecondary" align="center" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  message: { maxWidth: 300 },
  action: { marginTop: 8, alignSelf: 'center' },
});
