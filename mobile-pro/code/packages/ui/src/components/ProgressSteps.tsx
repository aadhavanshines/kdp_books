import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

export interface ProgressStep {
  key: string;
  label: string;
  description?: string;
  /** Preformatted time ("7:42 pm"). */
  time?: string;
}

export interface ProgressStepsProps {
  steps: readonly ProgressStep[];
  /** Index of the step in progress. Steps before it are done; `steps.length` means all done. */
  current: number;
  orientation?: 'vertical' | 'horizontal';
  style?: StyleProp<ViewStyle>;
}

type StepState = 'done' | 'active' | 'pending';

function Dot({ state, size = 22 }: { state: StepState; size?: number }) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (state !== 'active' || reduceMotion) return;
    pulse.set(withRepeat(withTiming(1, { duration: 1400 }), -1, false));
    return () => cancelAnimation(pulse);
  }, [state, reduceMotion, pulse]);

  const halo = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.9 }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {state === 'active' ? (
        <Animated.View
          style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary }, halo]}
        />
      ) : null}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: state === 'pending' ? colors.surface : colors.primary,
          borderWidth: state === 'pending' ? 2 : 0,
          borderColor: colors.border,
        }}
      >
        {state === 'done' ? <Icon name="checkmark" size={14} color="onPrimary" /> : null}
        {state === 'active' ? (
          <View style={{ width: size * 0.36, height: size * 0.36, borderRadius: size, backgroundColor: colors.onPrimary }} />
        ) : null}
      </View>
    </View>
  );
}

const stateWord: Record<StepState, string> = { done: 'completed', active: 'in progress', pending: 'pending' };

/** An order timeline: done steps checked, the current one pulsing. */
export function ProgressSteps({ steps, current, orientation = 'vertical', style }: ProgressStepsProps) {
  const { colors } = useTheme();
  const stateOf = (i: number): StepState => (i < current ? 'done' : i === current ? 'active' : 'pending');

  if (orientation === 'horizontal') {
    return (
      <View accessibilityRole="list" style={[styles.hRow, style]}>
        {steps.map((step, i) => {
          const state = stateOf(i);
          return (
            <View
              key={step.key}
              style={styles.hItem}
              accessible
              accessibilityLabel={`${step.label}, ${stateWord[state]}`}
            >
              <View style={styles.hTrack}>
                <View style={[styles.hLine, { backgroundColor: i === 0 ? 'transparent' : i <= current ? colors.primary : colors.border }]} />
                <Dot state={state} size={18} />
                <View
                  style={[
                    styles.hLine,
                    { backgroundColor: i === steps.length - 1 ? 'transparent' : i < current ? colors.primary : colors.border },
                  ]}
                />
              </View>
              <Text
                variant="caption"
                align="center"
                weight={state === 'active' ? 700 : 500}
                color={state === 'pending' ? 'textMuted' : 'text'}
                numberOfLines={2}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View accessibilityRole="list" style={style}>
      {steps.map((step, i) => {
        const state = stateOf(i);
        const last = i === steps.length - 1;
        return (
          <View
            key={step.key}
            style={styles.vRow}
            accessible
            accessibilityLabel={`${step.label}, ${stateWord[state]}${step.time ? `, ${step.time}` : ''}`}
          >
            <View style={styles.vRail}>
              <Dot state={state} />
              {!last ? <View style={[styles.vLine, { backgroundColor: i < current ? colors.primary : colors.border }]} /> : null}
            </View>
            <View style={[styles.vBody, !last && styles.vGap]}>
              <View style={styles.vHead}>
                <Text
                  variant="headline"
                  weight={state === 'active' ? 700 : 500}
                  color={state === 'pending' ? 'textMuted' : 'text'}
                  style={styles.flex}
                >
                  {step.label}
                </Text>
                {step.time ? (
                  <Text variant="caption" color="textMuted" tabular>
                    {step.time}
                  </Text>
                ) : null}
              </View>
              {step.description ? (
                <Text variant="footnote" color="textSecondary">
                  {step.description}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  vRow: { flexDirection: 'row', gap: 12 },
  vRail: { alignItems: 'center', width: 22 },
  vLine: { width: 2, flex: 1, minHeight: 18, marginVertical: 2, borderRadius: 1 },
  vBody: { flex: 1, paddingTop: 0 },
  vGap: { paddingBottom: 18 },
  vHead: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 22 },
  hRow: { flexDirection: 'row' },
  hItem: { flex: 1, alignItems: 'center', gap: 6 },
  hTrack: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  hLine: { flex: 1, height: 2 },
});
