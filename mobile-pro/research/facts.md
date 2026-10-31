# Facts and Their Sources (checked 31 October 2026)

| # | Fact | Source (how checked) |
| --- | --- | --- |
| 1 | Expo SDK 58 is the current release: `expo` 58.0.0 was published on 29 September 2026; 58.0.22 is the latest patch (31 October 2026). SDK 57 was 30 June 2026, SDK 56 20 May 2026, SDK 55 25 February 2026 | npm registry publish times (`npm view expo time`) |
| 2 | Expo SDK 58 pairs with React Native 0.88.1, React 19.3.0, react-native-web ~0.21.4, Expo Router ~58.0.29, Reanimated 4.7.1, Worklets 0.13.0, Gesture Handler ~3.3.0, Screens ~4.30.1, FlashList 2.3.2 | `bundledNativeModules.json` in the expo 58.0.22 package (read) |
| 3 | React Native TV fork matching SDK 58: `react-native-tvos` 0.88.0-0 | npm registry |
| 4 | Expo builds for Android TV and Apple TV by using `react-native-tvos` as the `react-native` dependency, plus the `@react-native-tvos/config-tv` config plugin, applied when `EXPO_TV=1` at prebuild; the TV version must match the SDK's React Native version; not every Expo library works on TV (list in the guide) | Expo docs `guides/building-for-tv.mdx`, expo/expo repository on GitHub (read) |
| 5 | Android TV emulator needs an Android TV system image, API 31 or later | Same guide (read) |
| 6 | Google Play: from 31 August 2026, new apps and updates must target Android 16 (API 36); Android TV and Android XR apps must target Android 14 (API 34) or higher; Wear OS and Automotive API 35 | developer.android.com/google/play/requirements/target-sdk (read) |
| 7 | Android TV quality: from 1 August 2026, TV apps must support 32- and 64-bit and 16 KB page sizes (TV-G6); launcher shows a 320x180 banner and a 160x160 xhdpi icon (TV-LB); banner contains the app name (TV-BN) | developer.android.com/docs/quality-guidelines/tv-app-quality (read) |
| 8 | TV manifest: declare `android.software.leanback` (required="false" for phone+TV apps) and `android.hardware.touchscreen` not required; `android:banner` on the application; LEANBACK_LAUNCHER intent | developer.android.com/training/tv/get-started/create (read) |
| 9 | Apple: since 28 April 2026, uploads must be built with Xcode 26 or later and an iOS 26 / iPadOS 26 / tvOS 26 SDK; since 9 September 2026, iOS and iPadOS apps uploaded must target iOS 13 or later; since 31 January 2026, App Store age ratings use the new system | developer.apple.com/news/upcoming-requirements (read) |
| 10 | Android developer verification: app registration became required for participating stores (including Google Play) in Brazil, Indonesia, Singapore and Thailand on 30 September 2026; global rollout to certified devices planned for 2027; unregistered apps can still be installed with adb or an advanced flow | Android Developers Blog, June 2026, and Android Developer Console Help (search results quoting them) |
| 11 | Google Play: $25 one-time registration; new personal accounts (created after 13 November 2023) need a closed test with at least 12 testers opted in for 14 consecutive days before production; Apple Developer Program $99 per year; TestFlight: 100 internal, 10,000 external testers | Checked for *Vibe Coding for Beginners* (2026), Play Console Help and Apple docs |
| 12 | Claude Code CLI version used: 2.1.316 | `claude --version` |
| 13 | Microsoft Fluent Emoji 3D artwork (via `@lobehub/fluent-emoji-3d` 1.1.0) is MIT-licensed | npm registry license field; github.com/microsoft/fluentui-emoji (MIT) |
