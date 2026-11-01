# Reelhouse TV

The bonus streaming app from `docs/PRD.md` section 5, for Android TV (and a
web build for checking focus in a browser). A standalone Expo SDK 58
project, outside the npm workspace: `react-native` is
`npm:react-native-tvos@0.88.0-0`, configured by `@react-native-tvos/config-tv`.
Theme tokens, the Art component and the art files are copied from
`@pro/ui` into `src/`; the catalog is local (`src/data/catalog.ts`).

## Commands (run in tv/)
- `npm install` (`.npmrc` sets `legacy-peer-deps`: the `-0` prerelease
  suffix does not satisfy peer ranges like `>=0.78`)
- `npm run check`: typecheck, lint, Jest
- `npm run web`: run in a browser; arrows move focus, Enter selects, Escape/Backspace is Back
- `npm run prebuild:tv`: `EXPO_TV=1 expo prebuild --platform android --clean`
- `npm run android`: build and run on an Android TV device or emulator (needs the Android SDK)
- `npm run gen:art`: regenerate `src/art/registry.ts` after adding art

## Screenshots
`npm run export:web`, then `python3 scripts/serve.py 8765 &` and
`python3 scripts/screenshots.py` (Playwright; pass `--chromium` for a local
Chrome). It drives the app with remote keys only and writes `screenshots/`.
`python3 scripts/make-brand-images.py` renders `assets/tv_banner.png`
(320x180 launcher banner) and `assets/icon.png`.

## How focus works
- Every focusable is a `Focusable` (`src/components/Focusable.tsx`): white
  ring, violet glow, scale up; `autoFocus` for a screen's initial focus;
  `focusKey` so focus is restored when you come Back to a screen.
- Native: the Android TV / tvOS focus engine moves focus; rows and panels
  are `TVFocusGuideView`s (`src/focus/FocusGroup.tsx`) that remember their
  last child, the rail uses `destinations` for its active item, and groups
  can trap directions (the seek bar keeps Left/Right for scrubbing).
- Web: `src/focus/webNavigator.ts` reproduces that with spatial navigation
  (`src/focus/spatial.ts`, unit tested) over `data-tv-*` attributes.
- Rows, pages and grids scroll themselves to keep focus in view
  (`src/focus/scroll.ts`).
- Back (`src/nav/back.ts`): closes a menu, leaves the rail for the page,
  returns from rows to the billboard, otherwise pops the stack
  (`src/nav/stack.ts`); on the profile picker it exits the app.
