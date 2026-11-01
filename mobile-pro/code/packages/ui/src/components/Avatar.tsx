import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { type ArtName } from '../art/registry';
import { useTheme } from '../theme/ThemeProvider';
import { initials } from '../utils/format';
import { Art, toneForArt } from './Art';
import { GradientFill } from './GradientFill';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

/** unseen: brand gradient ring. seen: gray ring. close: green ring (close friends). */
export type StoryRing = 'none' | 'unseen' | 'seen' | 'close';

export interface AvatarProps {
  name: string;
  /** A person illustration. Falls back to initials. */
  art?: ArtName | null;
  size?: number;
  ring?: StoryRing;
  /** A small "+" badge for "Your story". */
  showAdd?: boolean;
  /** Green presence dot. */
  online?: boolean;
  onPress?: () => void;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ name, art, size = 40, ring = 'none', showAdd, online, onPress, accessibilityHint, style }: AvatarProps) {
  const theme = useTheme();
  const { colors } = theme;
  const gradientId = `ring${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const hasRing = ring !== 'none';
  const stroke = Math.max(2, Math.round(size * 0.05));
  const gap = hasRing ? stroke + 2 : 0;
  const outer = size + gap * 2;
  const r = (outer - stroke) / 2;
  const ringStops = ring === 'close' ? [colors.success, colors.success] : colors.gradient;

  const face = (
    <View style={[styles.face, { width: size, height: size, borderRadius: size / 2 }]}>
      {art ? (
        <>
          <GradientFill colors={theme.tone(toneForArt(art))} />
          <Art name={art} size={Math.round(size * 0.82)} decorative />
        </>
      ) : (
        <>
          <GradientFill colors={theme.tone(toneForArt(name))} />
          <Text variant={size >= 56 ? 'title3' : 'subhead'} weight={700} color="textSecondary">
            {initials(name)}
          </Text>
        </>
      )}
    </View>
  );

  const ringLabel = ring === 'unseen' ? ', new story' : ring === 'seen' ? ', story' : ring === 'close' ? ', close friends story' : '';
  const body = (
    <View style={{ width: outer, height: outer, alignItems: 'center', justifyContent: 'center' }}>
      {hasRing ? (
        <Svg width={outer} height={outer} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
              {ringStops.map((c, i) => (
                <Stop key={`${c}-${i}`} offset={i / Math.max(1, ringStops.length - 1)} stopColor={c} />
              ))}
            </LinearGradient>
          </Defs>
          <Circle
            cx={outer / 2}
            cy={outer / 2}
            r={r}
            stroke={ring === 'seen' ? colors.ringSeen : `url(#${gradientId})`}
            strokeWidth={ring === 'seen' ? Math.max(1, stroke - 1) : stroke}
            fill="none"
          />
        </Svg>
      ) : null}
      {face}
      {showAdd ? (
        <View style={[styles.add, { backgroundColor: colors.accent, borderColor: colors.surface }]}>
          <Text variant="caption" weight={800} color="onAccent" style={styles.addText}>
            +
          </Text>
        </View>
      ) : null}
      {online ? (
        <View style={[styles.online, { backgroundColor: colors.success, borderColor: colors.surface, width: size * 0.28, height: size * 0.28, borderRadius: size }]} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        accessibilityLabel={`${name}${ringLabel}`}
        accessibilityHint={accessibilityHint}
        hitSlop={Math.max(0, (44 - outer) / 2)}
        style={style}
      >
        {body}
      </PressableScale>
    );
  }
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`${name}${ringLabel}`} style={style}>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  face: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  add: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { fontSize: 14, lineHeight: 16 },
  online: { position: 'absolute', right: 1, bottom: 1, borderWidth: 2 },
});
