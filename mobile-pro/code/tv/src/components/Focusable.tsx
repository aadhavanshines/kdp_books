/**
 * The one focusable building block. Everything a remote can land on is a
 * Focusable: it grows on focus, draws a white ring with a violet glow (or
 * lets the child restyle itself through the render prop), takes initial or
 * restored focus for its screen, and is tagged for the web navigator.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type AccessibilityRole,
  type HostInstance,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { requestFocus, type FocusableHost } from '../focus/requestFocus';
import { shouldTakeFocus, useScreenFocus } from '../focus/ScreenFocus';
import { webData } from '../focus/webData';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { s } from '../theme/scale';
import { colors, motion } from '../theme/tokens';

export interface FocusState {
  focused: boolean;
}

export interface FocusableProps {
  children: ReactNode | ((state: FocusState) => ReactNode);
  onPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  accessibilityLabel: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  accessibilityHint?: string;
  /** Outer box: size and margins. */
  style?: StyleProp<ViewStyle>;
  /** The surface that scales (clips children to `radius`). */
  surfaceStyle?: StyleProp<ViewStyle>;
  radius?: number;
  /** Scale when focused; 1 for none. */
  focusScale?: number;
  /** 'ring' draws the white ring and glow; 'glow' only the glow; 'none' leaves it to the child. */
  indicator?: 'ring' | 'glow' | 'none';
  /** Restores focus here when the screen comes back, and lets the screen focus it by key. */
  focusKey?: string;
  /** Take focus when the screen first shows. One per screen. */
  autoFocus?: boolean;
  /** The entry point of its FocusGroup on web (the rail's active item). */
  isGroupDefault?: boolean;
  /** Receives the host view, e.g. for a FocusGroup entry. */
  hostRef?: (view: HostInstance | null) => void;
  disabled?: boolean;
}

/** CSS-style glow; React Native 0.76+ and react-native-web both accept boxShadow strings. */
const GLOW = `0px 0px ${s(36)}px ${s(6)}px ${colors.focusGlow}`;

export function Focusable({
  children,
  onPress,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  accessibilityHint,
  style,
  surfaceStyle,
  radius = s(12),
  focusScale = motion.focusScale,
  indicator = 'ring',
  focusKey,
  autoFocus = false,
  isGroupDefault,
  hostRef,
  disabled,
}: FocusableProps) {
  const [focused, setFocused] = useState(false);
  const host = useRef<HostInstance | null>(null);
  const [scale] = useState(() => new Animated.Value(1));
  const reduceMotion = useReduceMotion();
  const screen = useScreenFocus();
  const takeFocus = shouldTakeFocus(screen.active, screen.target, focusKey, autoFocus);

  useEffect(() => {
    if (!takeFocus) return;
    // Let the screen finish laying out (it may have just become visible).
    const id = setTimeout(() => requestFocus(host.current as unknown as FocusableHost), 0);
    return () => clearTimeout(id);
  }, [takeFocus, screen.target.nonce]);

  useEffect(() => {
    const to = focused ? focusScale : 1;
    if (reduceMotion) {
      scale.setValue(to);
      return;
    }
    const anim = Animated.timing(scale, {
      toValue: to,
      duration: motion.focusMs,
      useNativeDriver: Platform.OS !== 'web',
    });
    anim.start();
    return () => anim.stop();
  }, [focused, focusScale, reduceMotion, scale]);

  const content = typeof children === 'function' ? children({ focused }) : children;
  const ringInset = s(7);

  return (
    <Pressable
      ref={(v) => {
        host.current = v;
        hostRef?.(v);
      }}
      onPress={disabled ? undefined : onPress}
      onFocus={() => {
        setFocused(true);
        if (focusKey) screen.noteFocused(focusKey);
        onFocus?.();
      }}
      onBlur={() => {
        setFocused(false);
        onBlur?.();
      }}
      hasTVPreferredFocus={takeFocus}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      style={[style, focused && styles.raised]}
      {...webData({
        tvFocusable: 'true',
        tvAutofocus: autoFocus ? 'true' : undefined,
        tvDefault: isGroupDefault ? 'true' : undefined,
        tvKey: focusKey,
      })}
    >
      <Animated.View style={[styles.fill, { transform: [{ scale }] }]}>
        <View
          style={[
            styles.fill,
            { borderRadius: radius },
            focused && indicator !== 'none' ? { boxShadow: GLOW } : null,
            surfaceStyle,
          ]}
        >
          {content}
        </View>
        {focused && indicator === 'ring' ? (
          <View
            pointerEvents="none"
            style={[
              styles.ring,
              {
                top: -ringInset,
                left: -ringInset,
                right: -ringInset,
                bottom: -ringInset,
                borderRadius: radius + ringInset,
                borderWidth: s(5),
              },
            ]}
          />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flexGrow: 1, flexShrink: 1 },
  raised: { zIndex: 10 },
  ring: { position: 'absolute', borderColor: colors.focusRing },
});
