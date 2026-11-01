import { forwardRef, useState, type ReactNode } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, typography } from '../tokens/scale';
import { Text } from './Text';

export interface TextFieldProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  /** Shown above the field and used as the accessible name. */
  label: string;
  /** Hide the visible label (still announced). */
  hideLabel?: boolean;
  /** Fixed text before the input, e.g. "+91". */
  prefix?: string;
  /** Node after the input, e.g. a "Verify" link. */
  trailing?: ReactNode;
  /** Help text under the field. */
  helper?: string;
  /** Error text; also turns the border red. */
  error?: string | null;
  style?: StyleProp<ViewStyle>;
}

/** A labelled text input with optional prefix, helper and error text. */
export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  { label, hideLabel, prefix, trailing, helper, error, multiline, style, onFocus, onBlur, editable = true, ...rest },
  ref,
) {
  const { colors, fontFamilies } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;
  const body = typography.body;
  return (
    <View style={style}>
      {hideLabel ? null : (
        <Text variant="subhead" weight={600} color="textSecondary" style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.box,
          multiline && styles.multiline,
          { borderColor, borderWidth: focused || error ? 1.5 : 1, backgroundColor: editable ? colors.surface : colors.surfaceMuted },
        ]}
      >
        {prefix ? (
          <View style={[styles.prefix, { borderRightColor: colors.divider }]}>
            <Text variant="body" weight={600}>
              {prefix}
            </Text>
          </View>
        ) : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error ?? helper}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            { color: colors.text, fontFamily: fontFamilies[500], fontSize: body.fontSize },
          ]}
          {...rest}
        />
        {trailing}
      </View>
      {error || helper ? (
        <Text
          variant="caption"
          weight={error ? 600 : 400}
          color={error ? 'danger' : 'textMuted'}
          style={styles.helper}
          accessibilityLiveRegion={error ? 'polite' : undefined}
        >
          {error ?? helper}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: { marginBottom: 6 },
  box: { minHeight: 52, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  multiline: { alignItems: 'flex-start', paddingVertical: 10 },
  prefix: { paddingRight: 12, marginRight: 12, borderRightWidth: 1, alignSelf: 'stretch', justifyContent: 'center' },
  input: { flex: 1, minHeight: 48, paddingVertical: 0 },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top', paddingTop: 4 },
  helper: { marginTop: 6 },
});
