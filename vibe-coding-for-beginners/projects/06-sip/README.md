# Sip

A simple water intake tracker for iOS and Android, built with Expo (React Native) and TypeScript.

## Run

```bash
npm install
npm start          # then press i / a, or scan the QR code with Expo Go
```

## Checks

```bash
npm run typecheck
npm test
npx expo export --platform web
```

## Layout

- `src/lib/water.ts` – pure date and totals logic (no React, no clock access), tested in `src/__tests__/water.test.ts`
- `src/lib/store.tsx` – state, on-device persistence (AsyncStorage), local-midnight rollover
- `src/app/` – Expo Router screens (`index` for today and history, `settings` for the daily goal)
- `src/theme.ts` – light and dark colour palettes

Before store submission: replace the placeholder icons in `assets/`. The app ID is `com.vibecodingbook.sip` (iOS bundle identifier and Android package, set in `app.json`); it cannot be changed after the first store upload.
