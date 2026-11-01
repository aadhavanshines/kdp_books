# Appendix D: Glossary

**10-foot interface.** An interface designed to be used from across a room, as on a TV.

**Accessibility label.** The text a screen reader announces for an element, and the name tests use to find it.

**ANR (App Not Responding).** An Android error when an app's main thread is blocked for several seconds. Play's Android vitals report ANR rates.

**App Bundle (`.aab`).** The format Google Play requires; Play builds optimized APKs for each device from it.

**App Links / universal links.** Ordinary web addresses that open your app if it's installed, verified by files on your domain.

**Claude Code.** Anthropic's AI coding assistant that works in your terminal and repository, used to build every app in this book.

**`CLAUDE.md`.** A file in the repository that Claude Code reads at the start of every session: the project's layout, commands and rules.

**Config plugin.** A small module that changes the native Android and iOS projects during prebuild, configured in `app.json`.

**D-pad.** The four-way directional pad on a TV remote, with a select button in the middle.

**Deep link.** A link that opens an app on a specific screen.

**Design system.** A shared set of tokens (colors, type, spacing) and components that every screen uses, so all apps look consistent.

**Development build.** Your own debuggable app with your native libraries, used in place of Expo Go once you add native code.

**EAS (Expo Application Services).** Expo's cloud services: Build, Submit, Update and Workflows.

**EAS Update.** Over-the-air delivery of JavaScript and asset changes to installed apps.

**Expo.** A framework and set of tools on top of React Native.

**Expo Go.** An app that runs Expo projects without building them, limited to its own native libraries.

**Expo Router.** File-based navigation for Expo apps: each file in `app/` is a screen and a URL.

**Feature flag.** A server-controlled switch that turns a feature on or off without a release.

**Focus (TV).** The highlighted element that the select button will activate.

**Focus group.** A container that manages focus for its children, remembering the last focused one.

**Hermes.** The JavaScript engine React Native uses on phones.

**Idempotent.** An operation that has the same effect whether it runs once or many times; essential for payment webhooks.

**Leanback.** Android's name for the TV experience; TV apps declare the leanback feature and launcher category.

**Live region.** An element whose changes a screen reader announces automatically.

**Maestro.** A tool that runs end-to-end tests on a device or emulator from YAML flows.

**Monorepo.** One repository holding several apps and packages.

**MRP (maximum retail price).** The printed price in India, often shown struck through beside the selling price.

**Optimistic update.** Updating the screen as if a request succeeded, then rolling back if it fails.

**Prebuild.** Generating the native Android and iOS projects from `app.json` and config plugins.

**Privacy manifest.** A file Apple requires that declares data collection and the use of certain APIs, for the app and its SDKs.

**React Native.** A framework for building native apps with React and JavaScript or TypeScript.

**React Query (TanStack Query).** A library for fetching, caching and updating server data in React.

**react-native-tvos.** A community fork of React Native with Android TV and Apple TV support.

**react-native-web.** A library that renders React Native components in a browser.

**Reanimated.** A library that runs animations on the UI thread for smoothness.

**Runtime version.** A label that marks which builds an EAS update is compatible with.

**Server-Sent Events (SSE).** A simple way for a server to push a stream of events to a client over HTTP, used for live order tracking.

**Staged rollout / phased release.** Releasing an update to a growing share of users so problems can be caught early.

**TestFlight.** Apple's beta testing service.

**Token (design).** A named value such as a color role or spacing step.

**Token (auth).** A string that proves who the user is to the server.

**UPI (Unified Payments Interface).** India's real-time payment system, used through UPI apps.

**Webhook.** A message a service sends to your server when something happens, such as a payment succeeding.
