import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { formatDuration, secondsUntil, spokenDuration, splitDuration } from '../utils/format';
import { Text, type ColorToken } from './Text';

export interface CountdownTimerProps {
  /** When the countdown ends: epoch ms, ISO string or Date. */
  endsAt: number | string | Date;
  /**
   * text: "02:14:09". boxes: deal-of-the-day style blocks. ring: a circular
   * progress ring with the time in the middle (needs `totalSeconds`).
   */
  variant?: 'text' | 'boxes' | 'ring';
  format?: 'auto' | 'hms' | 'ms';
  /** Full duration, for the ring's progress. */
  totalSeconds?: number;
  /** Ring diameter. */
  size?: number;
  /** Text before the time ("Ends in"), or under the time in a ring ("mins left"). */
  label?: string;
  /** Shown when the countdown reaches zero. */
  doneLabel?: string;
  color?: ColorToken;
  /** Ring only: the progress arc. Defaults to `primary`. */
  fillColor?: ColorToken;
  /** Ring only: the track under the arc. Defaults to `primarySoft`. */
  trackColor?: ColorToken;
  onComplete?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Ticks once a second from the device clock, so it stays right after the app sleeps. */
export function CountdownTimer({
  endsAt,
  variant = 'text',
  format = 'auto',
  totalSeconds,
  size = 120,
  label,
  doneLabel,
  color = 'text',
  fillColor = 'primary',
  trackColor = 'primarySoft',
  onComplete,
  style,
  testID,
}: CountdownTimerProps) {
  const theme = useTheme();
  const { colors } = theme;
  const [remaining, setRemaining] = useState(() => secondsUntil(endsAt));
  const completed = useRef(false);
  const fireComplete = useEffectEvent(() => onComplete?.());

  const endMs = endsAt instanceof Date ? endsAt.getTime() : typeof endsAt === 'string' ? Date.parse(endsAt) : endsAt;

  useEffect(() => {
    completed.current = false;
    const tick = () => {
      const left = secondsUntil(endMs);
      setRemaining(left);
      if (left === 0 && !completed.current) {
        completed.current = true;
        fireComplete();
      }
      return left;
    };
    if (tick() === 0) return;
    const id = setInterval(() => {
      if (tick() === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endMs]);

  const done = remaining === 0;
  const a11y = done && doneLabel ? doneLabel : `${label ? `${label} ` : ''}${spokenDuration(remaining)}`;
  const common = {
    testID,
    accessible: true,
    accessibilityRole: 'timer' as const,
    accessibilityLabel: a11y,
  };

  if (variant === 'boxes') {
    const { hours, minutes, seconds } = splitDuration(remaining);
    const units = format === 'ms' ? [hours * 60 + minutes, seconds] : [hours, minutes, seconds];
    return (
      <View {...common} style={[styles.row, style]}>
        {label ? (
          <Text variant="caption" weight={600} color={color}>
            {label}
          </Text>
        ) : null}
        {units.map((n, i) => (
          <View key={i} style={styles.row}>
            {i > 0 ? (
              <Text variant="subhead" weight={800} color={color}>
                :
              </Text>
            ) : null}
            <View style={[styles.box, { backgroundColor: colors.text }]}>
              <Text variant="subhead" weight={800} color="background" tabular>
                {String(n).padStart(2, '0')}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (variant === 'ring') {
    const stroke = Math.max(6, Math.round(size * 0.08));
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const total = totalSeconds && totalSeconds > 0 ? totalSeconds : Math.max(remaining, 1);
    const fraction = Math.min(1, remaining / total);
    return (
      <View {...common} style={[{ width: size, height: size }, styles.center, style]}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors[trackColor]} strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors[fillColor]}
            strokeWidth={stroke}
            testID={testID ? `${testID}-arc` : undefined}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - fraction)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <Text variant={size >= 120 ? 'title2' : 'headline'} weight={800} color={color} tabular>
          {done && doneLabel ? doneLabel : formatDuration(remaining, format)}
        </Text>
        {label && !done ? (
          <Text variant="caption" color={color === 'text' ? 'textMuted' : color}>
            {label}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View {...common} style={[styles.row, style]}>
      {label ? (
        <Text variant="subhead" color={color}>
          {label}
        </Text>
      ) : null}
      <Text variant="subhead" weight={700} color={color} tabular>
        {done && doneLabel ? doneLabel : formatDuration(remaining, format)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  box: { minWidth: 28, paddingHorizontal: 4, paddingVertical: 2, borderRadius: radii.sm - 4, alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
