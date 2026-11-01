import { Dimensions } from 'react-native';

/** Every layout number in the app is written for a 1920 x 1080 canvas. */
export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

/**
 * Factor from canvas units to device-independent pixels. A 1080p Android TV
 * reports a 960 x 540 dp window (density 2), so the factor there is 0.5; the
 * web build at 1920 x 1080 and device scale 1 gets exactly 1.
 */
export function scaleFor(windowWidth: number): number {
  if (!Number.isFinite(windowWidth) || windowWidth <= 0) return 1;
  return windowWidth / CANVAS_WIDTH;
}

const factor = scaleFor(Dimensions.get('window').width);

/** Canvas units to dp, rounded to half a pixel so borders stay crisp. */
export function s(units: number): number {
  return Math.round(units * factor * 2) / 2;
}
