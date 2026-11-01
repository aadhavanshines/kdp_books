/**
 * Full-bleed title backdrop that crossfades when the title changes (hero
 * rotation, focus moving along a row), with scrims so text on the left and
 * rows at the bottom stay readable.
 */
import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import type { Title } from '../data/types';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { CANVAS_HEIGHT, CANVAS_WIDTH, s } from '../theme/scale';
import { colors } from '../theme/tokens';
import { GradientFill } from './GradientFill';
import { KeyArt } from './KeyArt';

export function Backdrop({ title, height = CANVAS_HEIGHT, dim = 0 }: { title: Title; height?: number; dim?: number }) {
  const [layers, setLayers] = useState<{ prev: Title | null; cur: Title }>({ prev: null, cur: title });
  const [fade] = useState(() => new Animated.Value(1));
  const reduceMotion = useReduceMotion();

  // A new title: keep the old one underneath and fade the new one in over it.
  if (title.id !== layers.cur.id) setLayers({ prev: layers.cur, cur: title });

  useEffect(() => {
    if (reduceMotion) {
      fade.setValue(1);
      return;
    }
    fade.setValue(0);
    const anim = Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: Platform.OS !== 'web' });
    anim.start();
    return () => anim.stop();
  }, [layers.cur.id, fade, reduceMotion]);

  const w = s(CANVAS_WIDTH);
  const h = s(height);
  const art = (t: Title) => <KeyArt tone={t.tone} art={t.art} accents={t.accents} variant="backdrop" width={w} height={h} />;
  return (
    <View style={[styles.wrap, { height: h }]} pointerEvents="none">
      {layers.prev ? <View style={StyleSheet.absoluteFill}>{art(layers.prev)}</View> : null}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>{art(layers.cur)}</Animated.View>
      <GradientFill
        colors={[colors.scrim, colors.scrim, colors.scrim]}
        opacities={[1, 0.85, 0]}
        offsets={[0, 0.38, 0.7]}
        direction="horizontal"
      />
      <GradientFill colors={[colors.scrim, colors.scrim]} opacities={[0, 1]} offsets={[0.4, 0.86]} direction="vertical" />
      {dim > 0 ? <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim, opacity: dim }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
});
