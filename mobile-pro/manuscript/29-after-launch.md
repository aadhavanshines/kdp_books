# Chapter 29: After Launch: Crashes, Reviews, Updates and Experiments

Launch day is the start of an app's life, not the end of its project. The apps users love are the ones that keep getting better, quickly and safely, based on what real people do. This chapter covers the loop that keeps a professional app healthy: watch, listen, fix, improve.

## Watch: Crashes and Errors

The first thing to set up, before launch, is crash and error reporting. A service such as Sentry, Firebase Crashlytics or Bugsnag catches JavaScript errors and native crashes on users' phones and sends them to a dashboard with the stack trace, the device, the app version and the steps leading up to it.

- **Upload source maps** with every build and update, so stack traces point to your TypeScript, not minified code. The services' Expo integrations do this during EAS builds.
- **Watch the store dashboards too.** The Play Console's Android vitals report crashes and **ANRs** ("App Not Responding", when the app freezes for several seconds). Google uses these rates in ranking and may warn users about apps above its thresholds. App Store Connect and Xcode show crashes and hangs for iOS.
- **Track the crash-free rate per release.** A common target is well above 99 percent of users without a crash; set yours from your own baseline. A new release that drops the rate gets its staged rollout halted.
- **Add context, not personal data.** Attach the screen name and the user's ID, never their phone number or address.

A prompt that turns a crash into a fix:

```text
Here is a crash report from Sentry for Platter 1.2.0 (stack trace
below, personal data removed). Find the cause in the code, write a test
that reproduces it, fix it, and tell me whether the fix can ship as an
EAS update or needs a store build. Then look for the same mistake
anywhere else in the apps.
```

The last sentence is where Claude earns its keep: the same mistake is rarely made only once.

## Watch: Performance and Business Metrics

Beyond crashes, keep an eye on a few numbers each week:

- **Startup time and slow screens**, from your monitoring service's performance traces.
- **The main funnel** from Chapter 24: viewed, added, checked out, paid. A drop after a release is a bug until proven otherwise.
- **Retention**: how many new users come back after a day, a week and a month.
- **Server health**: error rates, response times, and the event stream for live tracking.

## Listen: Store Reviews and Support

Reviews are public, affect ranking, and are full of bug reports.

- **Reply to reviews**, especially negative ones, briefly and helpfully: acknowledge, explain the fix or ask them to contact support. Both consoles let you reply.
- **Ask for reviews at a good moment** with the platforms' in-app review prompts (the `expo-store-review` library), for example after a successful delivery, never after a failure, and not often; the platforms limit how frequently the prompt appears.
- **Make support easy** from the account screen: help articles for common questions, and a way to contact a person about an order.
- **Tag and count.** Ask Claude to group a month of reviews and support messages by theme, with counts and examples. The biggest theme is your next priority.

```text
Here are last month's 300 Play Store reviews for Minutely (exported CSV,
names removed). Group them into themes with a count and two short
example quotes each, separate bugs from feature requests, and suggest
the three changes that would most improve the rating. Don't invent
themes with fewer than five reviews.
```

## Fix: Hotfixes and Updates

When something breaks in production:

1. **Assess.** How many users, how bad, is money involved? Halt the staged rollout if a new release caused it.
2. **Reproduce** with a failing test.
3. **Fix** in a small change, run the checks, and review it.
4. **Ship** the fastest safe way: an EAS update for JavaScript-only fixes (to the preview channel first, then production), or a new store build with an expedited review request if native code changed. Apple offers expedited review for critical fixes; use it sparingly.
5. **Write it down.** A short note on what happened, why, and what will prevent it next time.

A regular release rhythm, such as every two weeks, keeps updates small and reviews quick. Small releases are easier to test, easier to roll back and easier to explain.

## Improve: Feature Flags and Experiments

Professional apps rarely release a big change to everyone at once.

- **Feature flags** turn features on and off from the server without a release. Ship the new checkout behind a flag, turn it on for your team, then 10 percent of users, then everyone. If it misbehaves, turn it off in seconds.
- **Experiments (A/B tests)** show two versions to random halves of users and compare a metric that matters, such as checkout completion. Decide the metric and the length of the test before you start, and don't stop early because one day looks good.
- **Remove old flags.** Each flag left in the code is a branch nobody tests. Ask Claude to remove a flag's dead side once the decision is made.

Services such as Firebase Remote Config, LaunchDarkly, Statsig and PostHog provide flags and experiments, or your own server can return a small set of flags with the user's profile.

## Keep the Platform Current

Mobile platforms move quickly. Plan for:

- **One Expo SDK upgrade a year at least.** Each SDK supports a specific React Native version; the stores' target API and Xcode requirements move every year, and older SDKs eventually can't meet them. Expo's upgrade guide and `npx expo install --fix` do most of the work; your tests do the rest.
- **Dependency updates** monthly, in small batches, with the full checks.
- **New store requirements**: read the Play Console and App Store Connect announcements, and put deadlines in your calendar.

Claude is a good upgrade partner, provided you ask for evidence:

```text
Upgrade this monorepo from Expo SDK 58 to the next SDK, following Expo's
upgrade guide for that version. Upgrade one package at a time, run the
checks after each, and keep a log of every breaking change you had to
handle and how. Then rebuild the web exports, retake the screenshots,
and compare them with the old ones; list every visual difference.
```

## The Loop

Every week: look at crashes, the funnel and reviews; pick the most important problem; fix it with a test; ship it safely; and check the numbers moved. That loop, kept up for months, is what turns a well-built app into a professional one.

## Key Takeaways

- Set up crash reporting with source maps before launch, watch Android vitals and Apple's crash reports, and halt rollouts that hurt the crash-free rate.
- Watch a few numbers weekly: startup, the main funnel, retention and server health.
- Reply to reviews, ask for ratings at happy moments, and use Claude to group feedback into themes.
- Fix production issues with a failing test first, and ship by the fastest safe route.
- Release big changes behind feature flags, test them with experiments, remove old flags, and keep the SDK and dependencies current.
