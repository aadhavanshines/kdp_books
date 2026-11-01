import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { G, Line, Path, Polyline, Rect } from 'react-native-svg';

import { type ArtName } from '../art/registry';
import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { fitViewBox, pointAlongRoute, splitRoute, toPixels, MAP_SIZE, type MapPoint } from '../utils/geometry';
import { Art } from './Art';
import { Icon, type IconSpec } from './Icon';
import { Text } from './Text';

/**
 * The fictional city of Northbay, in map units (1000 x 1000). Streets run
 * every 100 units; the server routes riders along them. The bay sits along
 * the top edge, so nothing is placed above y = 200.
 */
export const NORTHBAY = {
  grid: 100,
  majorX: [300, 700],
  majorY: [400, 700],
  streetTop: 170,
  park: { x: 508, y: 508, width: 184, height: 184 },
  lake: { x: 108, y: 608, width: 184, height: 84 },
  /** Shoreline of the bay. */
  water:
    'M -200 -200 L 1200 -200 L 1200 120 C 1100 150 1000 95 880 128 C 760 160 690 110 560 140 C 430 170 360 112 240 136 C 140 156 60 118 -200 132 Z',
} as const;

export interface MapMarker {
  key: string;
  point: MapPoint;
  /** A 3D art inside a round pin (restaurant, store). */
  art?: ArtName;
  /** Or an icon in a brand-colored pin (home). */
  icon?: IconSpec;
  /** Small caption under the pin. */
  label?: string;
}

export interface MapViewProps {
  /** The rider's route in map units, from pickup to drop. */
  route?: readonly MapPoint[];
  /** How far along the route the rider is, 0 to 1. Omit to hide the rider. */
  progress?: number | null;
  markers?: readonly MapMarker[];
  /** Art for the moving rider. */
  riderArt?: ArtName;
  /** width / height of the map. */
  aspectRatio?: number;
  /** Extra map units around the route. */
  padding?: number;
  radius?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const MARKER = 40;
const RIDER = 44;

function toPoints(points: readonly MapPoint[]): string {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

/** The static city: land, bay, park, lake, blocks and streets. */
function CityLayer() {
  const { colors } = useTheme();
  const m = colors.map;
  const g = NORTHBAY.grid;
  const lines = useMemo(() => {
    const cells: { x: number; y: number }[] = [];
    for (let x = -g; x < MAP_SIZE + g; x += g) {
      for (let y = 100; y < MAP_SIZE + g; y += g) cells.push({ x, y });
    }
    const verticals: number[] = [];
    for (let x = 0; x <= MAP_SIZE; x += g) verticals.push(x);
    const horizontals: number[] = [];
    for (let y = 200; y <= MAP_SIZE; y += g) horizontals.push(y);
    return { cells, verticals, horizontals };
  }, [g]);

  const majorX: readonly number[] = NORTHBAY.majorX;
  const majorY: readonly number[] = NORTHBAY.majorY;
  return (
    <G>
      <Rect x={-400} y={-400} width={MAP_SIZE + 800} height={MAP_SIZE + 800} fill={m.land} />
      {lines.cells.map((c) => (
        <Rect key={`${c.x}:${c.y}`} x={c.x + 9} y={c.y + 9} width={g - 18} height={g - 18} rx={6} fill={m.block} />
      ))}
      <Rect {...NORTHBAY.park} rx={10} fill={m.park} />
      <Rect {...NORTHBAY.lake} rx={40} fill={m.water} />
      {lines.horizontals.map((y) => (
        <Line
          key={`h${y}`}
          x1={-400}
          y1={y}
          x2={MAP_SIZE + 400}
          y2={y}
          stroke={majorY.includes(y) ? m.roadMajor : m.road}
          strokeWidth={majorY.includes(y) ? 14 : 9}
        />
      ))}
      {lines.verticals.map((x) => (
        <Line
          key={`v${x}`}
          x1={x}
          y1={NORTHBAY.streetTop}
          x2={x}
          y2={MAP_SIZE + 400}
          stroke={majorX.includes(x) ? m.roadMajor : m.road}
          strokeWidth={majorX.includes(x) ? 14 : 9}
        />
      ))}
      <Path d={NORTHBAY.water} fill={m.water} />
    </G>
  );
}

/**
 * A delivery map drawn with react-native-svg (no map SDK), so it renders on
 * Android, iOS and web. Shows the route, pins and a rider that glides to
 * each new `progress` value.
 */
export function MapView({
  route = [],
  progress = null,
  markers = [],
  riderArt = 'motor-scooter',
  aspectRatio = 1.25,
  padding = 80,
  radius = radii.lg,
  accessibilityLabel,
  style,
  children,
}: MapViewProps) {
  const theme = useTheme();
  const { colors } = theme;
  const [size, setSize] = useState({ width: 0, height: 0 });

  const box = useMemo(
    () => fitViewBox([...route, ...markers.map((mk) => mk.point)], aspectRatio, padding),
    [route, markers, aspectRatio, padding],
  );
  const showRider = progress != null && route.length > 1;
  const [done, rest] = useMemo(
    () => (showRider ? splitRoute(route, progress) : [[], [...route]]),
    [route, progress, showRider],
  );

  const riderX = useSharedValue(0);
  const riderY = useSharedValue(0);
  const riderTarget = showRider && size.width > 0 ? toPixels(pointAlongRoute(route, progress), box, size) : null;
  const tx = riderTarget?.x;
  const ty = riderTarget?.y;
  useEffect(() => {
    if (tx == null || ty == null) return;
    const first = riderX.get() === 0 && riderY.get() === 0;
    const timing = { duration: first ? 0 : 900, easing: Easing.linear };
    riderX.set(withTiming(tx - RIDER / 2, timing));
    riderY.set(withTiming(ty - RIDER / 2, timing));
  }, [tx, ty, riderX, riderY]);
  const riderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: riderX.value }, { translateY: riderY.value }],
  }));

  const pct = showRider ? Math.round(Math.min(1, Math.max(0, progress)) * 100) : null;
  const label =
    accessibilityLabel ?? (pct != null ? `Delivery map. Rider is ${pct}% of the way to you.` : 'Delivery map');

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      style={[styles.wrap, { aspectRatio, borderRadius: radius, backgroundColor: colors.map.land }, style]}
    >
      {size.width > 0 ? (
        <Svg
          width={size.width}
          height={size.height}
          viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
          preserveAspectRatio="none"
        >
          <CityLayer />
          {route.length > 1 ? (
            <>
              <Polyline
                points={toPoints(rest)}
                fill="none"
                stroke={colors.surface}
                strokeWidth={14}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Polyline
                points={toPoints(rest)}
                fill="none"
                stroke={colors.primary}
                strokeWidth={8}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {done.length > 1 ? (
                <Polyline
                  points={toPoints(done)}
                  fill="none"
                  stroke={colors.map.routeDone}
                  strokeWidth={6}
                  strokeDasharray="2 12"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ) : null}
            </>
          ) : null}
        </Svg>
      ) : null}

      {size.width > 0
        ? markers.map((mk) => {
            const p = toPixels(mk.point, box, size);
            return (
              <View
                key={mk.key}
                pointerEvents="none"
                style={[styles.markerWrap, { left: p.x - MARKER / 2, top: p.y - MARKER / 2 }]}
              >
                <View
                  style={[
                    styles.marker,
                    { backgroundColor: mk.icon ? colors.primary : colors.surface, borderColor: colors.surface },
                    theme.shadow('md'),
                  ]}
                >
                  {mk.art ? <Art name={mk.art} size={MARKER - 12} decorative /> : null}
                  {mk.icon ? <Icon {...mk.icon} size={20} color="onPrimary" /> : null}
                </View>
                {mk.label ? (
                  <View style={[styles.markerLabel, { backgroundColor: colors.surface }, theme.shadow('sm')]}>
                    <Text variant="caption" weight={700} numberOfLines={1}>
                      {mk.label}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })
        : null}

      {riderTarget ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.rider, { backgroundColor: colors.surface, borderColor: colors.primary }, theme.shadow('lg'), riderStyle]}
        >
          <Art name={riderArt} size={RIDER - 12} decorative />
        </Animated.View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden' },
  markerWrap: { position: 'absolute', width: MARKER, alignItems: 'center' },
  marker: {
    width: MARKER,
    height: MARKER,
    borderRadius: MARKER / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerLabel: { marginTop: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.sm, maxWidth: 120 },
  rider: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: RIDER,
    height: RIDER,
    borderRadius: RIDER / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
