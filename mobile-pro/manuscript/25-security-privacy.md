# Chapter 25: Security and Privacy

A mobile app runs on a device you don't control, talks over networks you don't control, and is installed by people who trust you with their phone number, address, and sometimes their payment details. Security and privacy are where "it works" and "it's ready" are furthest apart. This chapter walks through the main risks for apps like the ones in this book, what the code already does, and what must change before real users arrive.

## Assume the App Is Public

Everything inside your app bundle can be read. Anyone can download it from the store, unpack it and read your JavaScript, configuration and images. That one fact decides most mobile security:

- **No secrets in the app.** API secret keys, payment secret keys, database passwords and signing keys belong on the server. Environment variables that start with `EXPO_PUBLIC_` are built into the bundle, so they're public by definition; the apps use one only for the API address.
- **The server makes every decision that matters.** Prices, bills, coupons, whether an order is paid, who can see what. The apps already work this way (Chapter 6), so a modified app can't give itself a discount.
- **Hiding logic in the client isn't security.** Obfuscation slows people down; it doesn't stop them.

## Storing Tokens Securely

When a user signs in, the server returns a token that proves who they are. The apps store it so the user stays signed in. The shared session code accepts any storage with three methods:

```tsx
@include code/packages/api/src/session.tsx#L7-L12
```

In the demo, that storage is AsyncStorage, which is a plain, unencrypted file. That's fine for a demo and wrong for production. On a real device, store tokens in the **Keychain** on iOS and the **Keystore**-backed encrypted storage on Android, which `expo-secure-store` provides. Because the session takes an interface, the change is small:

```text
Store the session token with expo-secure-store instead of AsyncStorage
in all four apps, through the existing TokenStorage interface, keeping
the web build on localStorage. Add a test for the adapter, and make sure
a token stored by the old version is moved over once and then deleted.
```

The last sentence is the kind of detail that matters in a real release: existing users shouldn't be signed out by an update.

Store the minimum. The token is enough; don't keep the user's profile, address or order history in plain storage. Cached data should be cleared on sign-out, which the apps already do (Chapter 14).

## Authentication Done Right

The demo logs in with a fixed one-time code (123456), which is obviously only for development. A real one-time password login needs:

- **Codes from an SMS provider**, random, six digits, valid for a few minutes, usable once.
- **Rate limits** on sending codes (per phone number and per device) and on guessing them, with a lockout after a few wrong tries. Without limits, attackers can run up your SMS bill or guess codes.
- **Short-lived access tokens** (minutes to an hour) with longer-lived refresh tokens that can be revoked, so a stolen phone or a leaked token can be cut off from the server.
- **Refresh-token rotation**: issue a new refresh token each time one is used, and if an old one is ever used again, treat it as stolen and end that session.
- **Sign out everywhere** in the account screen.

Apple also requires that if your app offers third-party or social sign-in, it offers an equivalent privacy-focused option such as Sign in with Apple, with some exceptions; check the current App Review Guidelines.

## The Network

- **HTTPS only.** Both platforms block plain HTTP by default in release builds; don't turn that protection off. The demo uses `http://localhost` only in development.
- **Validate everything on the server.** The demo server validates request bodies with Zod schemas, so a malformed request is refused before it reaches any logic; make sure every route in your own server does the same.
- **Check access to every object.** Signing in proves who the user is, not what they may see: every request for an order, a message or an address must check that it belongs to that user. The demo server does this for orders and messages; it is the check most often forgotten.
- **Lock down CORS and add rate limits on the server.** The demo server allows requests from any origin, for development convenience; a production API should allow only its own web origins and limit requests per user and per IP address.
- **Certificate pinning** (accepting only your server's certificate) adds protection against interception on compromised networks, but it can lock users out if certificates change unexpectedly. Use it only with a plan for rotation.

## Permissions

Ask only for what you need, only when you need it, and explain why. The apps need almost nothing: notifications (Chapter 24), and in a real version perhaps location to suggest the delivery address, and the camera or photo library for Lumo. Each permission:

- is requested at the moment it's used, never at launch;
- comes with a clear purpose string (iOS requires one in the app's configuration, and reviewers read them);
- has a graceful fallback when refused (type the address instead of locating it).

Prefer the photo picker, which lets users choose specific photos without giving the app the whole library, over broad storage permissions.

## Privacy Is a Product Feature

Users and stores both expect it:

- **Collect the minimum**, keep it for the shortest time, and know where every piece of personal data goes.
- **Account deletion.** Both Apple and Google require that apps with accounts let users request deletion of their account and data; Google Play also requires a way to request it from the web, outside the app. Build it from the start.
- **A privacy policy** that matches what the app does, linked from the app and the store listing.
- **Store declarations.** Google Play's Data safety form and Apple's privacy details ("nutrition labels") must describe what your app and its SDKs collect, and why. Apple also requires a privacy manifest declaring data use and "required reason" APIs, including in third-party SDKs; Expo lets you set the app's manifest entries in `app.json`.
- **Laws.** India's Digital Personal Data Protection Act, Europe's GDPR and US state privacy laws may all apply to your users. Get advice.

## A Security Review Prompt

Ask Claude for a review before every release, and give it the shape of the answer you want:

```text
Do a security and privacy review of this repository before release.
Check for: secrets in the app or in git history; tokens in unencrypted
storage; anything the client decides that the server should; endpoints
without authentication, authorization checks or validation; missing
rate limits on login and OTP; CORS and HTTP settings; permissions asked
without need; personal data in logs or analytics; and account deletion.
Rank findings by severity with file and line, and explain how each could
be exploited in one sentence. Don't change code yet.
```

Then fix the findings one by one, each with a test. A review like this is a strong first pass, not a guarantee; for an app that handles payments or sensitive data, an independent security review before launch is money well spent.

## Key Takeaways

- Everything in the app bundle is public: keep secrets and decisions on the server.
- Store tokens in the Keychain or Keystore with `expo-secure-store`, keep little on the device, and clear it on sign-out.
- Real OTP login needs random single-use codes, rate limits, short-lived tokens and revocation.
- Use HTTPS only, validate on the server, restrict CORS and rate-limit the API.
- Ask for permissions in context with clear reasons, build account deletion, and make store privacy declarations match the app and its SDKs.
