import type { Address } from '@pro/api';
import { Button, Text, useTheme } from '@pro/ui';
import { StyleSheet, View } from 'react-native';

/** "Deliver to: Riya Sharma, 560101" with a Change button. */
export function DeliverTo({ address, onChange }: { address: Address | undefined; onChange: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.deliver, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
      <View style={styles.flex}>
        <Text variant="footnote" numberOfLines={1}>
          {'Deliver to: '}
          <Text variant="footnote" weight={700}>
            {address ? `${address.recipient}, ${address.pincode}` : '…'}
          </Text>
        </Text>
        {address ? (
          <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
            {`${address.line1}, ${address.locality}`}
          </Text>
        ) : null}
      </View>
      <Button title="Change" variant="secondary" size="sm" onPress={onChange} accessibilityLabel="Change delivery address" />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  deliver: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
});
