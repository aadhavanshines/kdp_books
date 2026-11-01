import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { BottomSheet } from './BottomSheet';
import { Icon, type IconSpec } from './Icon';
import { OptionRow } from './OptionRow';
import { Skeleton } from './Skeleton';

/** The fields of an @pro/api Address the sheet shows. */
export interface AddressOption {
  id: string;
  label: string;
  line1: string;
  line2: string;
  locality: string;
  pincode?: string;
}

export function addressIcon(label: string): IconSpec {
  const l = label.toLowerCase();
  if (l === 'home') return { name: 'home' };
  if (l === 'work') return { name: 'briefcase' };
  return { name: 'location' };
}

export interface AddressSheetProps<A extends AddressOption> {
  visible: boolean;
  onClose: () => void;
  /** Undefined while loading. */
  addresses: readonly A[] | undefined;
  selectedId: string | undefined;
  onSelect: (address: A) => void;
  title?: string;
  /** Add the pincode to each row (shopping apps deliver by pincode). */
  showPincode?: boolean;
}

/** Pick a saved address. */
export function AddressSheet<A extends AddressOption>({
  visible,
  onClose,
  addresses,
  selectedId,
  onSelect,
  title = 'Choose a delivery address',
  showPincode,
}: AddressSheetProps<A>) {
  const { colors } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} subtitle="Saved addresses" testID="address-sheet">
      {addresses
        ? addresses.map((a) => (
            <OptionRow
              key={a.id}
              title={a.label}
              subtitle={[a.line1, a.line2, a.locality, showPincode ? a.pincode : null].filter(Boolean).join(', ')}
              selected={a.id === selectedId}
              onPress={() => onSelect(a)}
              leading={
                <View style={[styles.well, { backgroundColor: colors.primarySoft }]}>
                  <Icon {...addressIcon(a.label)} size={18} color="onPrimarySoft" />
                </View>
              }
            />
          ))
        : [0, 1, 2].map((i) => <Skeleton key={i} height={48} style={styles.skeleton} />)}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  well: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  skeleton: { marginVertical: 8 },
});
