# Appendix B: Release Checklists

Use these before every release. Copy them into your repository as `RELEASE.md`, tick them off in a pull request, and add the lessons from each release.

## Every Release, Both Platforms

**Code and checks**

- `npm run check` passes: typecheck, lint, every test.
- Maestro flows for every critical journey pass on an Android emulator and an iOS simulator.
- The version number is increased and the changelog updated.
- No secrets in the app, the repository or its history; only public `EXPO_PUBLIC_` values.
- Analytics events checked: no personal data.

**On real devices (release build)**

- A cheap Android phone and a recent iPhone: sign in, the main journey, payment in test mode, tracking, sign out.
- Startup under about two seconds; scrolling smooth on the longest list.
- Slow network and no network: every screen shows loading, error and retry states.
- Interruptions: a call during payment, switching apps while ordering, locking during tracking.
- Push notifications arrive, and tapping one opens the right screen.
- Deep links and universal links open the right screen, signed in and signed out.

**Accessibility and settings**

- TalkBack and VoiceOver: the main journey can be completed without looking.
- Largest system text size: nothing cut off, nothing overlapping.
- Dark mode and light mode, with sufficient contrast.
- Reduce motion: no movement-heavy animations.
- Each supported language, including long translations.

**Store and privacy**

- Privacy policy matches what the app and its SDKs collect.
- Data safety form and App Privacy details are up to date.
- Account deletion works in the app (and from the web for Google Play).
- The reviewer's demo account works today.
- Screenshots and descriptions match this version.

**Rollout**

- Crash reporting receives events from this build, with source maps.
- Staged rollout (Play) or phased release (App Store) chosen.
- Someone watches crashes and reviews for the first 48 hours.

## Google Play

- Developer account verified; for a new personal account, the 12-tester, 14-day closed test completed and production access granted.
- Target API level 36 (from 31 August 2026).
- Signed Android App Bundle (`.aab`), with Google Play App Signing.
- Store listing: name (30 characters), short description (80), full description (4,000), 512 x 512 icon, 1024 x 500 feature graphic, at least two phone screenshots.
- App content: privacy policy, app access instructions, ads, content rating, target audience, Data safety, account deletion URL, other declarations.
- Release notes in plain language.
- Staged rollout percentage set; ready to halt.

## App Store

- Apple Developer Program membership active ($99 a year).
- Built with Xcode 26 and the iOS 26 SDK (EAS on a current Expo SDK).
- Minimum iOS version 13 or later.
- Age rating questionnaire answered (updated system).
- Privacy manifest entries for the app and SDKs; App Privacy details complete.
- Product page: name, subtitle, description, keywords, screenshots for the required sizes, support and privacy URLs.
- Review information: demo account, one-time code, notes, contact.
- Export compliance answered.
- Sign in with Apple offered if third-party sign-in is offered and no exception applies.
- For apps with user-generated content: report, block, moderation and terms.
- Release option chosen: manual, automatic or phased.

## Android TV

- Built with `react-native-tvos` matching the SDK's React Native version and `@react-native-tvos/config-tv`, prebuilt with `EXPO_TV=1`.
- Manifest: `LEANBACK_LAUNCHER` category, `android.software.leanback` declared, touchscreen not required.
- 320 x 180 banner with the app name; 160 x 160 icon at xhdpi.
- Target API level 34 or higher.
- 64-bit and 16 KB page size support (from 1 August 2026).
- Every screen usable with the D-pad only: visible focus everywhere, initial focus on every screen, Back always works.
- Content inside safe margins; text readable from three meters.
- Tested on an Android TV emulator (API 31 or later) and on a real TV or streaming stick.
- Android TV form factor opted in on the Play Console, with TV screenshots and a TV banner.
- Subscriptions through Google Play Billing, checked on the server.
