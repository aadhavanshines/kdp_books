import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { Icon, type IconSpec } from './Icon';
import { PressableScale } from './PressableScale';
import { Text, type ColorToken } from './Text';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  /** An icon in a soft circle, or any node (Avatar, ArtTile). */
  leading?: IconSpec | ReactNode;
  /** Text or node on the right ("₹120", a Switch, a Badge). */
  trailing?: ReactNode;
  /** Show a chevron (default when pressable and no trailing node). */
  chevron?: boolean;
  onPress?: () => void;
  /** Red title for destructive rows like "Log out". */
  destructive?: boolean;
  selected?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function isIconSpec(value: unknown): value is IconSpec {
  return typeof value === 'object' && value !== null && 'name' in value && !('$$typeof' in value);
}

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  chevron,
  onPress,
  destructive,
  selected,
  accessibilityHint,
  style,
  testID,
}: ListItemProps) {
  const { colors } = useTheme();
  const titleColor: ColorToken = destructive ? 'danger' : 'text';
  const showChevron = chevron ?? (!!onPress && trailing == null);

  const content = (
    <>
      {leading != null ? (
        isIconSpec(leading) ? (
          <View style={[styles.iconWell, { backgroundColor: destructive ? colors.dangerSoft : colors.surfaceMuted }]}>
            <Icon {...leading} size={20} color={destructive ? 'danger' : 'textSecondary'} />
          </View>
        ) : (
          leading
        )
      ) : null}
      <View style={styles.body}>
        <Text variant="headline" weight={500} color={titleColor} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" color="textMuted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {typeof trailing === 'string' ? (
        <Text variant="subhead" color="textSecondary" tabular>
          {trailing}
        </Text>
      ) : (
        trailing
      )}
      {selected ? <Icon name="checkmark-circle" size={22} color="primary" /> : null}
      {showChevron ? <Icon name="chevron-forward" size={18} color="textMuted" /> : null}
    </>
  );

  if (onPress) {
    return (
      <PressableScale
        testID={testID}
        onPress={onPress}
        accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
        accessibilityHint={accessibilityHint}
        accessibilityState={selected != null ? { selected } : undefined}
        scaleTo={0.99}
        style={[styles.row, style]}
      >
        {content}
      </PressableScale>
    );
  }
  return (
    <View testID={testID} style={[styles.row, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  body: { flex: 1, gap: 2 },
  iconWell: { width: 40, height: 40, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
});
