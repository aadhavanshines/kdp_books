import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { Icon, type IconSpec } from './Icon';
import { PressableScale } from './PressableScale';
import { Text, type ColorToken } from './Text';

export type ToastTone = 'neutral' | 'success' | 'danger' | 'info';

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  icon?: IconSpec;
  /** e.g. "UNDO", "VIEW CART". */
  actionLabel?: string;
  onAction?: () => void;
  /** Milliseconds. Defaults to 2800, or 4500 with an action. */
  duration?: number;
}

interface ToastState extends ToastOptions {
  id: number;
}

interface ToastApi {
  show: (options: ToastOptions | string) => void;
  hide: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  /** Lift toasts above a tab bar or cart bar. */
  bottomOffset?: number;
}

const toneIcons: Record<ToastTone, IconSpec | null> = {
  neutral: null,
  success: { name: 'checkmark-circle' },
  danger: { name: 'alert-circle' },
  info: { name: 'information-circle' },
};

/** Hosts one toast at a time at the bottom of the screen. Wrap the app once. */
export function ToastProvider({ children, bottomOffset = 0 }: ToastProviderProps) {
  const theme = useTheme();
  const insets = useContext(SafeAreaInsetsContext);
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setToast(null);
  }, []);

  const show = useCallback((options: ToastOptions | string) => {
    const next = typeof options === 'string' ? { message: options } : options;
    counter.current += 1;
    setToast({ ...next, id: counter.current });
    AccessibilityInfo.announceForAccessibility(next.message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(hide, toast.duration ?? (toast.actionLabel ? 4500 : 2800));
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [toast, hide]);

  const api = useMemo(() => ({ show, hide }), [show, hide]);
  const tone = toast?.tone ?? 'neutral';
  const icon = toast?.icon ?? toneIcons[tone];
  const iconColor: ColorToken = tone === 'success' ? 'success' : tone === 'danger' ? 'danger' : tone === 'info' ? 'info' : 'background';
  // The toast is an inverted surface: dark in light mode, light in dark mode.
  const bg = theme.colors.text;

  return (
    <ToastContext.Provider value={api}>
      {children}
      <View pointerEvents="box-none" style={[styles.host, { bottom: (insets?.bottom ?? 0) + 16 + bottomOffset }]}>
        {toast ? (
          <Animated.View
            key={toast.id}
            entering={FadeInDown.duration(220)}
            exiting={FadeOutDown.duration(180)}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={[styles.toast, { backgroundColor: bg }, theme.shadow('lg')]}
          >
            {icon ? <Icon {...icon} size={20} color={iconColor} /> : null}
            <Text variant="subhead" color="background" style={styles.message} numberOfLines={3}>
              {toast.message}
            </Text>
            {toast.actionLabel ? (
              <PressableScale
                onPress={() => {
                  toast.onAction?.();
                  hide();
                }}
                accessibilityLabel={toast.actionLabel}
                hitSlop={10}
                style={styles.action}
              >
                <Text variant="subhead" weight={800} color="primary" uppercase>
                  {toast.actionLabel}
                </Text>
              </PressableScale>
            ) : null}
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

/** Show a toast: `toast.show('Added to cart')`. Needs a ToastProvider. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>');
  return api;
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: {
    width: '100%',
    maxWidth: 520,
    minHeight: 48,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  message: { flex: 1 },
  action: { minHeight: 32, justifyContent: 'center', paddingLeft: 8 },
});
