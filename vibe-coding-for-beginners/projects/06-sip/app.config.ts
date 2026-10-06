import type { ExpoConfig } from 'expo/config';

/**
 * Extends app.json. Sip is fully offline and stores everything on the device, so
 * release builds must not request any Android permission. Libraries and the
 * Expo template add some by default; blocking them here strips them from the
 * final merged manifest.
 *
 * Development builds (EAS profile "development", which sets APP_VARIANT=development)
 * keep them: the dev client needs INTERNET to reach the Metro bundler, and
 * SYSTEM_ALERT_WINDOW for the dev overlay. For a local dev build run:
 *   APP_VARIANT=development npx expo run:android
 */
const isDevelopment = process.env.APP_VARIANT === 'development';

const BLOCKED_PERMISSIONS = [
  'android.permission.INTERNET',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.VIBRATE',
];

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Sip',
  slug: config.slug ?? 'sip',
  android: {
    ...config.android,
    blockedPermissions: isDevelopment ? [] : BLOCKED_PERMISSIONS,
  },
});
