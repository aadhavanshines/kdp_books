# Appendix E: Sources

Facts in this book about versions, store requirements and platform rules were checked in October 2026 against the sources below. Requirements change often; check the current version of each before you rely on it.

| Topic | Fact | Source |
| --- | --- | --- |
| Expo | Expo SDK 58 is current: the stable release was announced on 15 October 2026 (after a beta from 15 September); 58.0.22 was the latest patch at the time of writing | expo.dev/changelog/sdk-58; npm registry versions of `expo` |
| Expo | SDK 58 pairs with React Native 0.88.1, React 19.3.0, react-native-web ~0.21.4, Expo Router ~58.0.29, Reanimated 4.7.1, Worklets 0.13.0, Gesture Handler ~3.3.0, Screens ~4.30.1 and FlashList 2.3.2 | `bundledNativeModules.json` in the `expo` 58.0.22 package |
| Expo | From SDK 53, Expo Go doesn't support remote push notifications; use a development build. Android needs Firebase Cloud Messaging credentials | Expo documentation: Notifications reference and push notifications FAQ |
| TV | The TV fork matching SDK 58 is `react-native-tvos` 0.88.0-0 | npm registry |
| TV | Expo builds for TV with `react-native-tvos` as the `react-native` dependency and the `@react-native-tvos/config-tv` plugin, applied when `EXPO_TV=1` at prebuild; the TV version must match the SDK's React Native version; not every library supports TV | Expo documentation, "Building for TV" guide (expo/expo repository) |
| TV | The Android TV emulator needs an Android TV system image, API 31 or later | Same guide |
| Google Play | From 31 August 2026, new apps and updates must target Android 16 (API 36); Android TV apps API 34 or higher | developer.android.com, "Target API level requirements for Google Play apps" |
| Google Play | From 1 August 2026, TV apps must support 32- and 64-bit and 16 KB page sizes; launcher banner 320 x 180 with the app name; 160 x 160 xhdpi icon | developer.android.com, TV app quality guidelines |
| Google Play | TV manifest: `android.software.leanback`, touchscreen not required, `android:banner`, `LEANBACK_LAUNCHER` | developer.android.com, "Get started with TV apps" |
| Google Play | $25 one-time registration; new personal accounts (created after 13 November 2023) need a closed test with at least 12 testers opted in for 14 consecutive days before production | Play Console Help |
| Android | Developer verification: app registration required for stores including Google Play in Brazil, Indonesia, Singapore and Thailand from 30 September 2026; global rollout planned for 2027 | Android Developers Blog (June 2026) and Android Developer Console Help |
| Apple | Since 28 April 2026, uploads must be built with Xcode 26 and the iOS 26 SDK; since 9 September 2026, iOS apps must target iOS 13 or later; age ratings use the updated system since 31 January 2026 | developer.apple.com, "Upcoming requirements" |
| Apple | Apple Developer Program $99 a year; TestFlight up to 100 internal and 10,000 external testers | Apple Developer documentation |
| Apple | App Review Guidelines sections cited: 1.2 (user-generated content), 2.1 (completeness), 2.3 (metadata), 3.1 (payments), 4.2 (minimum functionality), 4.8 (sign-in options), 5.1 (privacy, including account deletion) | developer.apple.com, App Review Guidelines |
| Payments | Stripe's React Native SDK provides PaymentSheet and the `usePlatformPay` hook for Apple Pay and Google Pay; Google Pay isn't supported in Expo Go | stripe.dev API reference for `@stripe/stripe-react-native`; Stripe documentation |
| Payments | Razorpay's React Native SDK needs a development build, not Expo Go | Expo forums and the `react-native-razorpay` repository |
| Payments | Stripe sign-up for new businesses in India is by invitation (since May 2024) | Stripe India documentation, checked for *Vibe Coding for Beginners* (2026) |
| Art | Microsoft Fluent Emoji 3D artwork, used for every illustration in the apps, is MIT-licensed (via `@lobehub/fluent-emoji-3d` 1.1.0) | github.com/microsoft/fluentui-emoji; npm registry |
| Tools | Claude Code version used for every session: 2.1.316 | `claude --version` |

## What Was Verified, and What Wasn't

**Verified for this book:** every app and the TV app were built by Claude Code sessions whose prompts are in Appendix A; `npm run check` (typecheck, lint, 316 Jest tests and 97 server Vitest tests) and the TV app's checks (84 tests) pass on a clean install, also in GitHub Actions; every screenshot is a capture of the real web build in headless Chromium; the Android TV manifest was checked after `EXPO_TV=1 npx expo prebuild`. All four phone apps were also run on an Android 16 emulator through Expo Go, completing each main journey, and, separately from the session that built it (whose machine had no Android SDK, as its prompt in Appendix A shows), Reelhouse was built natively and run on an Android 16 TV emulator with D-pad input.

**Not verified here:** the apps were not run on an iPhone simulator, a physical phone or a real TV, or as store builds; no store submission was made; no payment provider, push service or analytics service was called; the Maestro flows were not run. The production chapters describe what to do and what to check on your own devices and accounts.
