# Appendix C: Troubleshooting

The problems below are the ones you're most likely to meet with this book's code and with Expo apps in general. For each, try the fix, then ask Claude with the exact error message and what you were doing.

## Setting Up

**`npm install` fails with peer dependency errors in `tv/`.**
The TV fork's version, `0.88.0-0`, doesn't satisfy ranges such as `>=0.78` in other packages. The `tv/.npmrc` file sets `legacy-peer-deps` for this reason; make sure you run `npm install` inside `tv/`, not from the root.

**The app shows "Network request failed" or loads forever.**
The server isn't running, or the app can't reach it. Start it with `npm run server` and check `http://localhost:4000` in a browser. On an Android emulator, set `EXPO_PUBLIC_API_URL=http://10.0.2.2:4000`, because `localhost` inside the emulator means the emulator itself. On a physical phone, use your computer's local network address and make sure both are on the same Wi-Fi.

**The demo login doesn't accept the code.**
Use phone 9876543210 and code 123456. If you changed the seed data, run `npm run seed` to reset the database.

**Orders move too fast or too slowly to watch.**
Set `SIM_SPEED` when starting the server; 2 runs the simulation twice as fast, 0.5 half as fast.

## Running the Apps

**Metro says it can't find `@pro/ui` or `@pro/api`.**
Run `npm install` from the repository root so the workspace links the packages, then restart Metro with `npx expo start --clear`.

**A change doesn't show up.**
Restart Metro with `--clear` to empty its cache. For changes to `app.json`, plugins or native libraries, you need a new development build; JavaScript reloading isn't enough.

**"This library isn't available in Expo Go" or a native module is missing.**
You've added a library with native code. Build a development build (`npx expo run:android`, `npx expo run:ios`, or `eas build --profile development`) and use it instead of Expo Go.

**Push notifications don't arrive.**
Expo Go doesn't support remote push from SDK 53 on: use a development build. Check permission was granted, the token reached your server, Firebase credentials are set for Android, and you're on a physical device or an emulator with Google Play services.

**Text or layout looks different on Android and iOS.**
Fonts and line heights differ slightly. Use the design system's `Text` with its line heights rather than raw styles, and check both platforms. Shadows also differ; check them on both platforms.

## Tests

**A test passes alone and fails when everything runs.**
Look for timers and animations that outlive the test, shared state between tests, or assertions that don't wait. Chapter 18 shows a real example. Use the shared `testQueryClient()` and `findBy...` or `waitFor` for anything asynchronous.

**Jest says it "did not exit one second after the test run".**
Something left a timer or connection open: often a query client with default cache timers or an event stream. Use the test query client and close streams in `afterEach`.

**"Unable to find an element with role button and name …".**
The label changed or doesn't exist. Print the tree with `screen.debug()`; then fix the component's `accessibilityLabel`, which also fixes it for screen readers.

## Builds and Stores

**EAS build fails in a monorepo.**
Run EAS from the app's folder, make sure the lockfile is committed at the root, and read the build log's first error rather than the last. Expo's monorepo guide covers the settings.

**"Version code has already been used" (Play) or "build number already exists" (App Store).**
Every upload needs a higher build number. Use `"appVersionSource": "remote"` and `"autoIncrement": true` in `eas.json`.

**Play rejects the bundle for its target API level.**
Upgrade to an Expo SDK that targets the required level (API 36 from 31 August 2026; API 34 for TV) and rebuild.

**App Review rejects with guideline 2.1.**
Usually a crash, a broken screen or a demo account that didn't work. Test the exact build and account the reviewer used, fix it, and explain the fix in your reply.

**An EAS update doesn't reach users.**
Check the channel matches the build's channel, the runtime version matches, and the app has been restarted twice (once to download, once to apply, by default).

## Android TV

**Focus disappears or jumps somewhere odd.**
Every screen needs one element with initial focus. Wrap rows in focus groups so they remember their last item, and set a destination for groups that should be entered at a specific place, like the rail's current section.

**The app doesn't appear on the TV's home screen.**
The manifest needs the `LEANBACK_LAUNCHER` category and a banner. Prebuild with `EXPO_TV=1` so the config plugin adds them, and check the generated `AndroidManifest.xml`.

**Remote buttons don't reach your handler.**
Use the TV event handler from react-native-tvos for keys such as play/pause, and map them in one place (Chapter 30's `remoteKeys.ts`). Arrow keys normally move focus and don't need handling.
