import { useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '../theme/ThemeProvider';
import { motion, radii } from '../tokens/scale';
import { IconButton } from './IconButton';
import { Text } from './Text';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  /** Pinned under the scrollable content, e.g. an "Add item ₹249" button. */
  footer?: ReactNode;
  /** Max height as a fraction of the window. */
  maxHeightRatio?: number;
  /** Allow closing by backdrop tap, drag and back button. */
  dismissible?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 1.1;

/**
 * A modal sheet that springs up from the bottom. Drag the handle down,
 * tap the backdrop or press back to close. Content sizes the sheet up to
 * `maxHeightRatio` of the window.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxHeightRatio = 0.9,
  dismissible = true,
  contentStyle,
  testID,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  // Optional: apps without a SafeAreaProvider still get a sheet.
  const insets = useContext(SafeAreaInsetsContext);
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(windowHeight);
  const backdrop = useSharedValue(0);

  // Mount as soon as the sheet is asked to show (state adjusted during
  // render); unmount only after the closing animation finishes.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      translateY.set(withSpring(0, motion.spring.sheet));
      backdrop.set(withTiming(1, { duration: motion.duration.base }));
      return;
    }
    backdrop.set(withTiming(0, { duration: motion.duration.fast }));
    translateY.set(
      withTiming(windowHeight, { duration: motion.duration.base }, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      }),
    );
  }, [visible, windowHeight, translateY, backdrop]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => dismissible && g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_e, g) => {
          translateY.set(Math.max(0, g.dy));
        },
        onPanResponderRelease: (_e, g) => {
          if (g.dy > DISMISS_DISTANCE || g.vy > DISMISS_VELOCITY) onClose();
          else translateY.set(withSpring(0, motion.spring.sheet));
        },
        onPanResponderTerminate: () => {
          translateY.set(withSpring(0, motion.spring.sheet));
        },
      }),
    [dismissible, onClose, translateY],
  );

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={dismissible ? onClose : () => undefined}
      testID={testID}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.fill}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, backdropStyle]}>
          <Pressable
            style={styles.fill}
            onPress={dismissible ? onClose : undefined}
            accessibilityRole="button"
            accessibilityLabel="Close"
            disabled={!dismissible}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              maxHeight: windowHeight * maxHeightRatio,
              paddingBottom: Math.max(insets?.bottom ?? 0, 16),
            },
            sheetStyle,
          ]}
        >
          <View {...pan.panHandlers} style={styles.dragZone}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            {title ? (
              <View style={styles.header}>
                <View style={styles.fill}>
                  <Text variant="title3" accessibilityRole="header">
                    {title}
                  </Text>
                  {subtitle ? (
                    <Text variant="footnote" color="textMuted">
                      {subtitle}
                    </Text>
                  ) : null}
                </View>
                {dismissible ? (
                  <IconButton name="close" label="Close" variant="soft" color="text" size={32} onPress={onClose} />
                ) : null}
              </View>
            ) : null}
          </View>
          <Animated.ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {children}
          </Animated.ScrollView>
          {footer ? <View style={[styles.footer, { borderTopColor: colors.divider }]}>{footer}</View> : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
  },
  dragZone: { paddingTop: 8 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8, gap: 12 },
  scroll: { flexGrow: 0 },
  content: { paddingHorizontal: 20, paddingBottom: 12 },
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
