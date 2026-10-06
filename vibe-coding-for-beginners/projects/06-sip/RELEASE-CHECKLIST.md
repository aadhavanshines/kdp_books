# Release Checklist: Sip

Work top to bottom. Nothing in this project has been built in the cloud or submitted yet.

## 0. Decide before anything else (these are hard to change later)

- [x] **App identifiers are set** to `com.vibecodingbook.sip` (`ios.bundleIdentifier` and `android.package` in `app.json`). Neither store lets you change the ID after the first upload, so be sure you own and want this one. Create the apps in both stores with exactly this ID.
- [ ] **Replace the placeholder icons and splash.** They are still the Expo template images in `assets/images/` (`icon.png`, `android-icon-*.png`, `splash-icon.png`, `favicon.png`) and `assets/expo.icon`. The App Store icon must be 1024×1024 with no transparency.
- [ ] Fill the placeholders in `PRIVACY.md` and `STORE-LISTING.md` (date, contact email, developer name).
- [ ] Publish `PRIVACY.md` at a public URL (GitHub Pages, your own site, or a hosted page). Both stores require a link.

## 1. Accounts

- [ ] Google Play Console developer account (one-time fee; identity verification can take days).
- [ ] Apple Developer Program membership (annual fee; enrollment can take days).
- [ ] Expo account: `npx eas-cli@latest login`.

## 2. Local checks

- [ ] `npm run typecheck`, `npm test`, `npx expo export --platform web` all pass.
- [ ] Run on a real iPhone and a real Android phone (Expo Go is fine for a first look): log drinks, undo, change the goal, close and reopen the app, try dark mode, try VoiceOver / TalkBack.
- [ ] Test the midnight rollover by changing the phone's date/time forward past midnight, then reopening the app.
- [ ] Optional: `npx expo-doctor` (needs normal internet access).

## 3. Set up EAS (first time only)

- [ ] `npx eas-cli@latest init` (links the project to your Expo account, adds `extra.eas.projectId` to app config).
- [ ] `eas.json` is already in the project: `development` (dev client, keeps dev-only permissions), `preview` (internal APK), `production` (Android App Bundle, build numbers auto-increment). Version numbers are tracked remotely by EAS (`appVersionSource: "remote"`); set the initial values with `eas build:version:set` if you need them to start higher than 1.

## 4. Preview build and device test

- [ ] `eas build --profile preview --platform android` and install the APK on a phone.
- [ ] `eas build --profile preview --platform ios` needs your device registered (`eas device:create`) and an Apple Developer account.
- [ ] Confirm the permissions: after installing the Android preview build, Settings → Apps → Sip → Permissions should list none.

## 5. Store listings (prepare while builds run)

- [ ] Take screenshots from a real device or simulator: phone sizes for both stores (Apple requires 6.9" or 6.5" iPhone sizes; check the current required sizes in App Store Connect). Light and dark versions are nice to have.
- [ ] Google Play: a 512×512 icon and a 1024×500 feature graphic.
- [ ] Paste the text from `STORE-LISTING.md`.
- [ ] Complete Google Play's **Data safety** form and Apple's **App Privacy** section using the answers in `STORE-LISTING.md`.
- [ ] Complete the age/content rating questionnaires, target audience, and the Health apps declaration (Google Play).

## 6. Google Play: closed testing, then production

- [ ] `eas build --profile production --platform android` produces the `.aab`.
- [ ] **Upload the first release manually** in Play Console (Testing → Closed testing → Create release). The Play API cannot create an app's first release, so `eas submit` works only for later releases.
- [ ] Opt in to Play App Signing when prompted.
- [ ] Add testers by email or Google Group and share the opt-in link.
- [ ] **New personal developer accounts must run a closed test with a minimum number of testers (currently 12) for 14 continuous days before they can apply for production access.** Confirm the current requirement in Play Console's "Dashboard" checklist; Google changes it. Organization accounts are exempt.
- [ ] Fix any pre-launch report issues Play shows (it tests on real devices; accessibility findings appear there too).
- [ ] Apply for production access, then create a production release from the same bundle (or a newer one), set the countries, and submit for review.

## 7. Apple: TestFlight, then App Store

- [ ] Create the app in App Store Connect with the same bundle ID.
- [ ] `eas build --profile production --platform ios` (EAS creates or reuses the certificates and provisioning profile for you, after you sign in to your Apple account).
- [ ] `eas submit --platform ios` uploads the build to App Store Connect (first time it asks for your App Store Connect app ID).
- [ ] Wait for processing (and answer the export compliance question if asked).
- [ ] **TestFlight:** add yourself as an internal tester (immediate, up to 100 people on your team). For friends, create an external group (the first external build goes through a short Beta App Review).
- [ ] Test the TestFlight build on a real iPhone.
- [ ] In the App Store version page: select the build, add screenshots, description, keywords, support URL, privacy policy URL, and the App Privacy answers; add review notes ("No login required. All data is stored locally.").
- [ ] Submit for review. Typical review takes 1–2 days. Fix and resubmit if rejected.
- [ ] Choose manual or automatic release after approval.

## 8. After release

- [ ] Install the live app from each store and run through the basics.
- [ ] For each update: bump `version` in `app.json` for user-visible releases (build numbers auto-increment), rebuild with the production profile, and submit (`eas submit`).
- [ ] If you ever add analytics, network calls, notifications, or ads: update `PRIVACY.md`, both store privacy forms, and the permission block list in `app.config.ts` first.
