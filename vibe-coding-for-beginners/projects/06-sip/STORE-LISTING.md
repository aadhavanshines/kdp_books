# Sip: Store Listing

Placeholders in `[BRACKETS]` need your input. Text below is ready to paste.

## App name

**Sip** (Google Play limit: 30 characters. Apple limit: 30 characters.)

Check the name is free in both stores when you create the listings. Names are unique per store, so "Sip" may already be taken; a fallback is "Sip: Water Tracker".

## Short description (Google Play, 80 characters max)

> Log water in one tap, track your daily goal, and see the last 7 days.

(68 characters.)

## Apple subtitle (30 characters max)

> Simple daily water tracker

## Full description

> Sip is a simple, private water tracker.
>
> Tap +250 ml or +500 ml each time you drink. Made a mistake? "Undo last" removes your most recent entry.
>
> • Big buttons that are easy to hit
> • A daily goal you can change (starts at 2,000 ml)
> • Today's progress as a bar, an amount, and a percentage
> • A list of your last 7 days with each day's total
> • A new day starts automatically at your local midnight
> • Light and dark mode
> • Works with VoiceOver and TalkBack, with large touch targets
>
> Private by design: everything stays on your phone. No account, no ads, no tracking, and no internet connection needed.

## Other listing fields

| Field | Suggested value |
|---|---|
| Category | Health & Fitness |
| Keywords (Apple, 100 chars) | water,hydration,drink,intake,tracker,daily goal,health |
| Privacy policy URL | [URL where PRIVACY.md is published; both stores require a public link] |
| Support URL / email | [YOUR SUPPORT URL OR EMAIL] |
| Price | Free |
| Contains ads | No |
| Content rating | Everyone / 4+ (answer the questionnaires honestly; Sip has no user content, violence, etc.) |
| Screenshots | Required, you must capture them (see RELEASE-CHECKLIST.md) |

## Google Play: Data safety form

Sip's code has no network access and no analytics or third-party SDKs, and the release build requests no Android permissions.

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | Not applicable (nothing is collected or transmitted); the form hides this question once you answer No above |
| Do you provide a way for users to request that their data be deleted? | Not applicable (no data collected; no accounts) |
| Privacy policy | Link to the published PRIVACY.md |

The form shows a summary: "No data collected" and "No data shared". Also complete the other App content declarations: Ads (No), Target audience (13+ or all ages, since the app is not aimed at children), Health apps declaration (Sip is a general wellness tracker with no medical claims; say it is not a medical app), Government app (No), and the rest as prompted.

## Apple: App Privacy ("nutrition label")

| Question | Answer |
|---|---|
| Do you or your third-party partners collect data from this app? | **No, we do not collect data from this app** |
| Resulting label | **Data Not Collected** |
| Privacy Policy URL | Link to the published PRIVACY.md |
| Tracking (App Tracking Transparency) | None; no tracking, so no prompt is needed |

Also answer:
- **Export compliance:** `ITSAppUsesNonExemptEncryption` is set to `false` in app.json, meaning Sip uses no encryption beyond what the OS provides. Confirm that is true for you when App Store Connect asks.
- **Age rating questionnaire:** all "None".
- **App Review notes:** "No login required. All data is stored locally on the device."

## What to re-check if the app changes

Adding analytics, crash reporting, ads, cloud sync, notifications, or any network call changes these answers, the privacy policy, and the Android permissions list. Update all three together.
