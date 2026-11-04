# Chapter 22: Testing: Unit, Component, API and End to End

When Claude writes most of the code, tests are how you know it works, and how Claude knows it hasn't broken something three screens away. The apps in this book were built with tests from the first session: more than 300 Jest tests across the apps and packages, the server's own Vitest suite, and 84 more in the TV app. This chapter explains the four layers they use, adds the fifth, end-to-end tests on a device with Maestro, and shows how to make Claude a disciplined tester.

## The Testing Pyramid for a Mobile App

| Layer | What it checks | Tool here | Speed |
| --- | --- | --- | --- |
| Unit | Pure logic: bills, filters, ETAs, plurals | Jest, Vitest | Milliseconds |
| Component | One component's look and behavior | Jest with React Native Testing Library | Fast |
| Screen | A whole screen against a fake server | Jest with React Native Testing Library | Seconds |
| API | Server routes, rules and money | Vitest on the server | Fast |
| End to end | The real app on a device or emulator | Maestro | Minutes |

The lower layers catch most bugs cheaply; the top layer catches what only a real device shows: navigation, the keyboard, permissions, the back button, a slow network.

## Unit Tests: Logic Lives in Pure Functions

The single most useful habit in this codebase is that every rule worth testing lives in a plain function, outside any component: `pendingSummary` (Chapter 19), `etaHeadline`, `countdownWindow`, story ordering, the return reasons, the tap detector with its injected clock. Those functions are tested directly, with exact inputs and expected outputs, in milliseconds.

When you review Claude's code, look for logic inside components. "Move this rule into a function in `lib/` and test it" is one of the most valuable prompts you can give.

## Screen Tests Against a Fake Server

The screen tests render a real screen with a real React Query client, but with an API client whose `fetch` is replaced by a small in-memory server. The test then behaves like a user: it presses buttons found by their accessible names, and checks what's on screen and what the server received.

```tsx
@include code/apps/minutely/src/test/screens/home-category.test.tsx#L31-L47
```

This one test checks a lot: the ADD button turns into a stepper, the cart bar's name and total follow each tap, the savings appear, the server's cart ends up with two apples, and the app sent exactly two `PUT` requests with the right bodies, no more. Because it finds elements by role and label, it also proves those labels exist for screen readers (Chapter 21).

Chapter 18 told the story of one flaky screen test and its fix. The lesson is worth repeating: when a screen test fails only sometimes, look for timers and animations that outlive the test, and fix the cause rather than adding retries.

## API Tests on the Server

Money, permissions and state changes are decided on the server, so they're tested there: bills for every app with every fee and coupon, quantity limits, order transitions, who can see whose orders, the event stream. These tests start the Hono app in memory against a fresh SQLite database, which takes milliseconds, so there are many of them.

## End to End With Maestro

Everything above runs in Node. The last layer runs the real app. Maestro is a popular tool for this in React Native: you describe a journey in a short YAML file, and Maestro drives an Android emulator or iOS simulator through it, waiting automatically for screens to settle.

A flow for Minutely's main journey looks like this:

```yaml
appId: app.minutely.example
---
- launchApp:
    clearState: true
- tapOn: "Mobile number"
- inputText: "9876543210"
- tapOn: "Continue"
- inputText: "123456"
- assertVisible: "Delivery in .* minutes"
- tapOn: "Add Shimla Apple"
- assertVisible: "1 item, ₹189. View cart"
- tapOn: "1 item, ₹189. View cart"
- tapOn: "Proceed to pay"
- tapOn: "Pay .*"
- assertVisible: "Order confirmed"
```

Run it with `maestro test flows/minutely-order.yaml`. Maestro finds elements by their visible text or accessibility label, so the same labels that serve screen readers and Jest serve Maestro too. Text is matched as a regular expression, which is why `"Delivery in .* minutes"` matches any ETA.

> **Note:** The flows in this chapter couldn't be run for this book, because the build machine had no hardware acceleration for emulators. The labels they use are the ones the screen tests check. Run the flows on your own computer, and expect to adjust a step or two, such as how the one-time code field takes focus.

## Android Pitfalls a Browser Can't Show

Web builds and screen tests prove layout and logic, but not native behavior. Two Android pitfalls are common in React Native apps, and neither shows up in a browser:

- **The keyboard covers the inputs.** Many examples set `KeyboardAvoidingView`'s `behavior` only for iOS (`Platform.OS === 'ios' ? 'padding' : undefined`), which leaves Android to fend for itself; with edge-to-edge layouts, the keyboard slides over the phone field, the one-time code or the message box. The apps in this book use `behavior="padding"` on both platforms.
- **SVG gradients render black.** A browser resolves `url(#id)` across the whole page, so a gradient defined in one `<Svg>` can fill a shape in another. On Android each `<Svg>` is its own document, and the fill fails. Define every gradient in the same `<Svg>` that uses it, as `PhotoScene` does.

A unit test can't see Android rendering, but it can read the source. `packages/ui/src/nativePitfalls.test.ts` scans every app and package and fails if either pattern appears: once you know a pitfall, write it down as a test.

> **Warning:** Before every release, run each app on at least one Android emulator or phone and one iPhone simulator or phone, and type into every field with the on-screen keyboard.

A good set of end-to-end flows is small: one per critical journey (sign in, order, pay, track; browse, add, return; post, like, message), run before every release and, ideally, on every pull request with a cloud service. EAS Workflows (Chapter 26) can run Maestro flows against a fresh build.

## Testing What Tests Can't

Some things need a human with a phone:

- **Real devices:** a cheap Android phone, a recent iPhone, and a tablet if you support one.
- **Bad networks:** turn on a network throttle or use the phone in a lift. Every request needs a loading state, an error state and a retry.
- **Interruptions:** a phone call during payment, switching apps while an order is placed, the phone locking during tracking.
- **System settings:** largest text, dark mode, reduce motion, TalkBack and VoiceOver, another language.

Write these as a checklist (Appendix B has one) and go through it before each release.

## Making Claude a Disciplined Tester

The project's rules said "New logic needs a test" and "Before saying a task is done, run typecheck, lint and tests, and fix everything they report." Those two lines did more for quality than any other part of the prompts. A few more habits:

- **Ask for a failing test first** when fixing a bug: "Write a test that reproduces this, show me it failing, then fix it."
- **Ask how a test could pass wrongly.** Claude is good at spotting tests that would pass even if the feature broke.
- **Never accept skipped tests or raised timeouts** as fixes.
- **Read the test names.** Good names read like a specification: "adds to the cart at once and the cart bar follows every tap".

```text
Add Maestro flows for Platter's three critical journeys (sign in and
order, pay and track, rate a delivered order) in flows/platter/, using
the accessibility labels the screen tests already use. Then list any
screen where a label a flow needs is missing, and add it with a test.
```

## Key Takeaways

- Test in layers: pure logic, components, screens against a fake server, server routes, and a few end-to-end flows on a device.
- Keep rules in pure functions; it's what makes most of the code testable in milliseconds.
- Find elements by role and accessible name, so tests, screen readers and Maestro all agree.
- Keep end-to-end flows few and focused on critical journeys, and run them before every release.
- Make "new logic needs a test" and "run the checks before saying done" project rules for Claude.
