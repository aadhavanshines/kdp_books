Build Reelhouse TV, the bonus streaming app in docs/PRD.md section 5, in
tv/: its own Expo SDK 58 project (NOT part of the npm workspace) that uses
`react-native-tvos` 0.88.0-0 as its `react-native` dependency and the
`@react-native-tvos/config-tv` plugin, following Expo's "Build Expo apps
for TV" guide. It is dark only, built for a 1920x1080 screen viewed from
across a room, and every action works with a D-pad remote: arrow keys,
select, back. Use the violet/cyan Reelhouse brand from docs/DESIGN.md.

Since tv/ is outside the workspace, copy what it needs from @pro/ui (theme
tokens, the Art component and the art files) into tv/src/ rather than
importing the workspace packages, and keep its data in a local typed
catalog module (fictional titles, seasons, episodes, channels, live
matches); no server is needed.

Screens: profile picker, Home (rotating hero billboard that follows the
focused title, rows including Continue watching with progress, a numbered
Top 10, Live sports with LIVE badges, tall Originals posters), side
navigation rail that expands on focus, Title details (seasons and
episodes, More like this), Search with an on-screen keyboard grid, Player
with auto-hiding controls and a Next episode card, and a Live TV guide grid.
Posters and backdrops are composed from the 3D art on rich gradients, with
title "logos" set in bold display type.

Focus is the heart of a TV app: a clear focus ring/glow and scale on every
focusable, sensible initial focus on every screen, rows that scroll to keep
the focused card visible, and Back that always goes somewhere sensible.

Verify it two ways:
1. Make it run on the web too (react-native-web), with arrow keys and
   Enter driving focus, so it can be checked in headless Chromium at
   1920x1080, device scale 1. Capture every screen, with real focus states
   visible, and fix anything that looks unpolished.
2. Run `EXPO_TV=1 npx expo prebuild --platform android --clean` and confirm
   the generated AndroidManifest declares the leanback launcher intent,
   android.software.leanback and touchscreen not required, and a 320x180
   banner with the app name (add the banner image). Do not build the APK;
   there is no Android SDK here. Remove the generated android/ folder after
   checking, and note what you found.

Add tests for the focus/navigation logic and the catalog helpers, plus
typecheck and lint for tv/. Save screenshots to tv/screenshots/
(01-profiles.png, ...). Keep it focused enough for one session of about an
hour and a half. Finish with a summary of the screens, how focus works,
what prebuild produced, and anything left undone.
