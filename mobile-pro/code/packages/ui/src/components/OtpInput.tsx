import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type TextInputInstance, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { Text } from './Text';

export interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
  /** Called once all digits are entered. */
  onComplete?: (code: string) => void;
  length?: number;
  /** Red boxes, e.g. after a wrong code. */
  error?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Keeps only digits, up to `length`. */
export function sanitizeOtp(text: string, length = 6): string {
  return text.replace(/\D/g, '').slice(0, length);
}

/**
 * A one-time-code entry: boxes over a single hidden TextInput, so paste,
 * SMS autofill (`oneTimeCode` / `sms-otp`) and backspace all just work.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  error,
  autoFocus,
  disabled,
  style,
  testID,
}: OtpInputProps) {
  const { colors, fontFamilies } = useTheme();
  const input = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);
  const digits = value.split('');

  return (
    <Pressable
      onPress={() => input.current?.focus()}
      accessibilityRole="none"
      importantForAccessibility="no"
      style={[styles.row, style]}
    >
      {Array.from({ length }, (_, i) => {
        const active = focused && (i === digits.length || (i === length - 1 && digits.length === length));
        return (
          <View
            key={i}
            style={[
              styles.box,
              {
                backgroundColor: colors.surface,
                borderColor: error ? colors.danger : active ? colors.primary : digits[i] ? colors.text : colors.border,
                borderWidth: active || error ? 2 : 1,
              },
            ]}
          >
            <Text variant="title2" tabular>
              {digits[i] ?? ''}
            </Text>
          </View>
        );
      })}
      <TextInput
        ref={input}
        testID={testID}
        value={value}
        onChangeText={(text) => {
          const next = sanitizeOtp(text, length);
          onChange(next);
          if (next.length === length && next !== value) onComplete?.(next);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        caretHidden
        accessibilityLabel={`${length}-digit code`}
        accessibilityValue={{ text: value ? value.split('').join(' ') : 'empty' }}
        style={[StyleSheet.absoluteFill, styles.hidden, { fontFamily: fontFamilies[400] }]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  box: { flex: 1, maxWidth: 52, aspectRatio: 0.86, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  // Kept on screen (not display:none) so it can take focus and autofill; invisible.
  hidden: { opacity: 0.011, color: 'transparent' },
});
