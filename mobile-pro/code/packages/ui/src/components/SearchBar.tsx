import { useEffect, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, useReducedMotion } from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  /** Static placeholder. Ignored while `rotatingHints` is cycling. */
  placeholder?: string;
  /** Cycles 'Search "biryani"', 'Search "pizza"'... every 2.5 s. */
  rotatingHints?: readonly string[];
  /** Turns the bar into a button that opens a search screen. */
  onPress?: () => void;
  autoFocus?: boolean;
  /** Extra control on the right, e.g. a mic or filter button. */
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SearchBar({
  value = '',
  onChangeText,
  onSubmit,
  placeholder = 'Search',
  rotatingHints,
  onPress,
  autoFocus,
  trailing,
  style,
  testID,
}: SearchBarProps) {
  const theme = useTheme();
  const { colors } = theme;
  const reduceMotion = useReducedMotion();
  const [hintIndex, setHintIndex] = useState(0);
  const hints = rotatingHints && rotatingHints.length > 0 ? rotatingHints : null;

  useEffect(() => {
    if (!hints || hints.length < 2 || value) return;
    const id = setInterval(() => setHintIndex((i) => (i + 1) % hints.length), 2500);
    return () => clearInterval(id);
  }, [hints, value]);

  const hint = hints ? `Search "${hints[hintIndex % hints.length]}"` : placeholder;
  const box = [styles.box, { backgroundColor: colors.surface, borderColor: colors.border }, theme.shadow('sm'), style];

  // Over the input the hint is an overlay; in button mode it is a normal flex child.
  const hintText = (
    <View style={onPress ? styles.hintInline : styles.hintClip} pointerEvents="none">
      <Animated.View
        key={hint}
        entering={reduceMotion ? undefined : FadeInDown.duration(220)}
        exiting={reduceMotion ? undefined : FadeOutUp.duration(160)}
      >
        <Text variant="body" color="textMuted" numberOfLines={1}>
          {hint}
        </Text>
      </Animated.View>
    </View>
  );

  if (onPress) {
    return (
      <PressableScale
        testID={testID}
        onPress={onPress}
        accessibilityRole="search"
        accessibilityLabel={hints ? `Search, for example ${hints[hintIndex % hints.length]}` : placeholder}
        style={box}
        scaleTo={0.99}
      >
        <Icon name="search" size={20} color="primary" />
        {hintText}
        {trailing}
      </PressableScale>
    );
  }

  return (
    <View style={box} accessibilityRole="search" testID={testID}>
      <Icon name="search" size={20} color="primary" />
      <View style={styles.inputWrap}>
        {!value ? hintText : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={(e) => onSubmit?.(e.nativeEvent.text)}
          autoFocus={autoFocus}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel={hints ? 'Search' : placeholder}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          maxFontSizeMultiplier={1.8}
          style={[
            styles.input,
            webNoOutline,
            { color: colors.text, fontFamily: theme.fontFamilies[400], fontSize: theme.typography.body.fontSize },
          ]}
        />
      </View>
      {value ? (
        <IconButton name="close-circle" label="Clear search" size={28} color="textMuted" onPress={() => onChangeText?.('')} />
      ) : null}
      {trailing}
    </View>
  );
}

// The bar's border shows focus; drop the browser's own focus ring around the input.
const webNoOutline = (Platform.OS === 'web' ? { outlineStyle: 'none' } : null) as TextStyle | null;

const styles = StyleSheet.create({
  box: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrap: { flex: 1, justifyContent: 'center', alignSelf: 'stretch' },
  hintClip: { ...StyleSheet.absoluteFill, overflow: 'hidden', justifyContent: 'center' },
  hintInline: { flex: 1, overflow: 'hidden', justifyContent: 'center' },
  input: { flex: 1, paddingVertical: 10 },
});
