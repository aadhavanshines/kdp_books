# Chapter 21: Accessibility and Localization

An app that only works for people who see well, tap precisely and read English leaves out a large share of its customers. The biggest apps invest heavily in accessibility and localization because it pays: more people can use them, and the same work makes the app better for everyone. This chapter shows what the apps in this book already do and what to add before release.

## Accessibility Was a Rule From Day One

The project's `CLAUDE.md` (Chapter 3) included one line that shaped every screen:

> Accessibility: every touchable has an `accessibilityRole` and label; text scales with the system font size; touch targets at least 44x44.

Because it was a rule from the first session, Claude wrote accessible components from the start, and the tests could use the same labels a screen reader announces. Look at a test from Minutely:

```tsx
@include code/apps/minutely/src/test/screens/home-category.test.tsx#L31-L47
```

The test finds the ADD button by its role and label, "Add Shimla Apple", and then checks the cart bar's accessible name, "1 item, ₹189. View cart". If a screen reader can't find a button, neither can the test, so accessibility can't quietly break.

## Screen Readers

TalkBack on Android and VoiceOver on iOS read the screen aloud and let users move between elements. To work well with them:

- **Every touchable needs a role and a label.** An icon button with a heart needs `accessibilityRole="button"` and a label such as "Like" or "Unlike", not "heart icon".
- **Labels describe the action or the content, briefly.** "Add one more Shimla Apple" is better than "plus".
- **Group what belongs together.** A product card should read as one sentence ("Shimla Apple, 4 pieces, ₹189, was ₹220, 14% off") rather than six separate stops.
- **Announce changes.** When something changes without a tap, such as an order's status, mark the text as a live region. The tracking screens use `accessibilityLiveRegion="polite"` on the status headline, so "On the way" is announced when it changes.
- **Hide decoration.** Illustrations that add nothing, such as the heart burst (Chapter 16), are hidden from screen readers; the like button announces the like.

Test with the real thing. Turn on TalkBack or VoiceOver and complete your app's main journey (log in, find a product, add it to the cart, pay) with your eyes closed. Everything you get stuck on is a bug.

## Text Size

Many people set their phone's text larger. The design system's `Text` component scales with the system setting but caps the scale at 1.8 times, so dense rows such as a bill stay usable:

```tsx
@include code/packages/ui/src/components/Text.tsx#L25-L39
```

At large sizes, layouts must wrap rather than cut off. Check every screen at the largest system text size; rows of chips and price lines are the usual problems.

## Touch Targets, Contrast and Color

- **Touch targets at least 44 by 44 points.** A small icon can sit in a larger touch area; the design system's `IconButton` does this.
- **Contrast.** Body text needs a contrast ratio of at least 4.5:1 against its background, and large text 3:1, following the Web Content Accessibility Guidelines that both stores point to. Bright brand colors on white often fail for small text. Because screens use color roles (Chapter 5), fixing a failing pair is a change in one place.
- **Never color alone.** A discount is green *and* says "14% OFF"; an error is red *and* explains itself in words; the unread dot comes with bold text.
- **Dark mode.** Every color in the apps comes from a theme role, so dark mode works everywhere (Chapter 5). Check contrast in both themes.

## Reduce Motion

Some people feel unwell with movement on screen. The design system reads the system's reduce-motion setting with Reanimated's `useReducedMotion` and replaces springs and flying hearts with simple fades. Ask Claude to check every new animation against this setting; it's easy to forget one.

## An Accessibility Audit Prompt

```text
Audit apps/platter for accessibility. For every screen, check: each
touchable has a role and a clear label; related text is grouped into one
announcement; status changes are announced; decorative art is hidden;
targets are at least 44x44; layout survives the largest text size; and
nothing is shown by color alone. Write the findings as a table (screen,
problem, fix), fix them, add or update a test for each fix using the
accessible names, and run the checks.
```

## Localization

The apps are written for India, in English, with prices in rupees. Real apps in India often support Hindi and other languages; global apps support dozens. Three layers are involved:

1. **Formatting.** Prices, dates, times and numbers depend on the locale. The apps already format money with `Intl.NumberFormat('en-IN')` (so ₹1,23,456 uses Indian grouping) and times with the locale. Never build a price or date by gluing strings together.
2. **Translation.** Every string a user can see moves into a message file per language, looked up by a key. A library such as `i18next` with `expo-localization` (which reports the device's languages) handles lookup, plurals and fallbacks.
3. **Layout.** Translations can be 30 to 50 percent longer than English, and right-to-left languages such as Arabic and Urdu mirror the layout. Use `start` and `end` rather than `left` and `right` in styles, and check that icons with direction (arrows, chevrons) flip.

Plurals deserve care. The apps already handle "1 item" versus "2 items" and "1 minute" versus "6 minutes" in tested helpers (Chapter 19). Other languages have more plural forms than English; a translation library's plural rules handle them, so give each message its plural variants rather than writing `if (n === 1)` in a screen.

A prompt to start:

```text
Prepare Minutely for Hindi. Move every user-visible string into
en.json and hi.json files using i18next and expo-localization, keep
prices and dates formatted with Intl for the current locale, use plural
rules for counts, and leave the Hindi values as English placeholders
marked TODO for a translator. Add a test that renders Home in each
language. Don't translate anything yourself.
```

The last line matters. Machine translation of an interface is a starting point at best; for a real release, have a fluent speaker translate and review the strings in context.

## Key Takeaways

- Make accessibility a project rule from the first session, and test through the same labels screen readers use.
- Give every touchable a role and a short, specific label; group related text; announce changes; hide decoration.
- Support large text (with a sensible cap), 44-point targets, sufficient contrast and reduce motion, and never use color alone.
- Localize in three layers: formatting with `Intl`, translation through message files with plural rules, and layouts that survive long text and right-to-left languages.
- Test with TalkBack and VoiceOver yourself, and have real translators review real translations.
