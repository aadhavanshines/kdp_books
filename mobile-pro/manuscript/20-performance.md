# Part VI: Production

# Chapter 20: Performance: Lists, Images, Startup and Smooth Animation

The four apps work. This part makes them ready for real users, on real phones, from a real store. It starts with performance, because the apps people call "professional" are, above all, the ones that never stutter.

Performance on a phone comes down to three numbers users feel without measuring: how long the app takes to open, whether scrolling stays smooth, and how quickly a tap shows a response. This chapter covers each, with prompts you can give Claude for your own app.

## Measure on a Real, Cheap Phone

Your development phone is probably fast. Many of your users' phones are not. Before tuning anything, install a **release build** (Chapter 26) on the slowest Android phone you can borrow and use the app for ten minutes. Development builds are much slower than release builds, because they include debugging tools and don't optimize the JavaScript, so never judge performance from one.

Then measure:

- **Startup:** time from tapping the icon to a usable home screen. Aim for under two seconds on a mid-range phone.
- **Frame rate:** React Native's performance monitor (in the developer menu) shows the JavaScript and UI frame rates. Both should stay near 60 while scrolling, or near your screen's refresh rate.
- **Profiles:** React DevTools' profiler shows which components re-render and how long they take. Android Studio's and Xcode's profilers show native CPU and memory.

> **Note:** The screenshots in this book come from web builds, and no app in it was profiled on a physical phone. Everything in this chapter is what you should do on your devices before release.

## Long Lists

Feeds, product grids and order histories are the most common source of jank. React Native's `FlatList` renders items lazily, but each item that scrolls into view still mounts new components. Three rules cover most problems:

1. **Keep row components cheap and stable.** Wrap rows in `memo`, pass stable callbacks (`useCallback`), and give each item a stable `keyExtractor`. A row that re-renders whenever its parent does is the most common cause of a slow list.
2. **Don't nest lists in a scroll view.** A `FlatList` inside a `ScrollView` renders everything at once and loses virtualization. Use the list's header and footer components instead.
3. **Use a recycling list for large or complex feeds.** FlashList (version 2.3.2 is the one bundled with Expo SDK 58) reuses row views instead of creating new ones, which makes a big difference with long feeds of rich cards. It's a near drop-in replacement for `FlatList`.

The apps in this book use `FlatList` and ordinary scroll views, because their seed data is small. A prompt to move a real feed onto FlashList:

```text
Lumo's feed and Cartly's product list will hold thousands of items in
production. Move both to FlashList (the version bundled with our Expo
SDK), keep every existing test passing, make sure post and product rows
are memoized with stable props, and tell me anything that behaves
differently, such as scroll restoration or the sticky header.
```

## Images

The apps draw their pictures with illustrations, but a real app loads photos from a server, and photos are usually the heaviest thing it does. Professional apps:

- **Request the right size.** Ask your image service for a 400-pixel-wide thumbnail for a 130-point card, not the 4,000-pixel original.
- **Cache on disk.** `expo-image` caches downloaded images in memory and on disk, so scrolling back up doesn't download again.
- **Show something immediately.** A blurred placeholder (a short "blurhash" string sent with the data) or the dominant color fills the space while the photo loads, and a short fade-in replaces it.
- **Use modern formats.** WebP or AVIF are much smaller than JPEG at the same quality.

In this book's code, `PhotoScene` (Chapter 15) and `ArtTile` are where real images would go. Replacing them with `expo-image` is a contained change: the components' props already carry an ID and a size.

## Startup

Startup time is spent loading the JavaScript bundle, running your top-level code, and fetching the first data. To shorten it:

- **Keep the splash screen up until the first screen is ready**, then hide it, so users never see a blank frame. The apps already do this with `expo-splash-screen` while their fonts load.
- **Do less at launch.** Don't import heavy libraries at the top of the root layout if only one screen needs them.
- **Show cached data first.** React Query can persist its cache to storage, so the home screen draws instantly from last time's data and refreshes in the background.
- **Keep the bundle small.** Remove unused dependencies, and check what's large with a bundle analyzer before release.

## Animations at 60 Frames per Second

React Native runs your JavaScript on one thread and draws the interface on another. An animation driven from JavaScript stutters whenever JavaScript is busy, for example while a list renders. Reanimated (4.7.1 with SDK 58) runs animations on the UI thread instead, which is why the apps' heart burst, sheets and pressable scale stay smooth while data loads.

The rules:

- **Animate transforms and opacity**, not width, height or margins, which force layout on every frame.
- **Use springs for things users touch** (they feel physical), and short timings for things that appear on their own.
- **Respect reduce motion.** The design system's animations check the system setting and replace movement with a simple fade (Chapter 16).

## Taps That Feel Instant

The fastest request is the one the user doesn't wait for. The apps use optimistic updates for likes, wishlists and cart steppers (Chapters 6 and 19), give every pressable a visual response on press, and keep heavy work off the press handler. If a tap must wait for the server, as payment does, show progress on the button itself.

## A Performance Review Prompt

When you're ready to tune your own app, ask for a review before you ask for changes:

```text
Review this app for performance problems a user would feel on a
mid-range Android phone. Look for: lists that re-render whole rows,
lists nested in scroll views, images loaded at full size, work done at
startup that could wait, animations driven from JavaScript, and anything
that blocks a press handler. Rank what you find by how much a user would
notice it, explain each in one sentence, and don't change any code yet.
```

Then fix the top items one at a time, with a release build on a real phone to check each.

## Key Takeaways

- Judge performance only in release builds, on a cheap phone.
- Memoize list rows, never nest lists in scroll views, and use FlashList for long, rich feeds.
- Load images at the right size, cache them, and show a placeholder at once.
- Keep the splash screen up until the first screen is ready, do less at launch, and show cached data first.
- Animate transforms and opacity on the UI thread with Reanimated, and respect reduce motion.
