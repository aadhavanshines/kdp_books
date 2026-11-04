# Chapter 28: Shipping to the App Store

Apple's App Store reviews every app and every update by hand, against its App Review Guidelines. That makes the first submission feel daunting, but the process is predictable once you know what reviewers check. This chapter takes Platter from an EAS build to a release on the App Store.

> **Warning:** Apple updates its requirements several times a year. Everything here was checked against Apple's developer news and documentation in October 2026; check App Store Connect's current requirements before you submit.

## The Requirements in 2026

- **Apple Developer Program membership**: $99 a year. Organizations need a D-U-N-S number.
- **Build tools.** Since 28 April 2026, apps uploaded to App Store Connect must be built with Xcode 26 or later, using the iOS 26 SDK. EAS's build servers handle this when you use a current Expo SDK.
- **Minimum iOS version.** Since 9 September 2026, iOS apps uploaded must support iOS 13 or later as their minimum. Expo SDK 58 apps require a much newer iOS version than that anyway.
- **Age ratings** use Apple's updated rating system, required since 31 January 2026: answer the new questionnaire in App Store Connect.
- **A privacy policy, privacy details and a privacy manifest** (Chapter 25).

## Step 1: Create the App Record

In App Store Connect, create a new app with its name, primary language, bundle ID (it must match `ios.bundleIdentifier` in `app.json`), and an SKU of your choosing. EAS Submit can create the record for you on the first upload.

## Step 2: Upload and TestFlight

`eas submit --platform ios` uploads the build. After Apple processes it (usually minutes), it appears in **TestFlight**:

- **Internal testers**: up to 100 members of your App Store Connect team, available immediately.
- **External testers**: up to 10,000 people by email or public link. The first build for external testing goes through a short beta review.

Use TestFlight the way you'd use Play's closed test: real people, real tasks, real devices, with feedback sent from the TestFlight app.

## Step 3: The Product Page

- **Name** (up to 30 characters) and **subtitle** (up to 30).
- **Description**, **keywords** (100 characters, comma-separated) and **promotional text** (which you can change without a new build).
- **Screenshots** for the iPhone display sizes App Store Connect asks for (the largest size can be scaled for smaller ones), and for iPad if you support it. The apps in this book are phone-only (`supportsTablet: false`).
- **App previews** (short videos), optional.
- **Support URL**, **marketing URL** and **privacy policy URL**.
- **Category** and **age rating**.

As with Play: no other company's names or logos, no claims the app can't back up.

## Step 4: App Privacy

The **App Privacy** section asks what data the app collects, whether it's linked to the user's identity, and whether it's used for tracking. Apple shows the answers on your product page. They must cover third-party SDKs, and they must agree with your privacy manifest and your Play Data safety form; reviewers and users compare them.

## Step 5: Review Information

This is where many first submissions fail. Provide:

- **Sign-in details**: a demo account that works, with any one-time code the reviewer will need. For OTP logins, a reviewer number with a fixed code is standard.
- **Notes**: anything a reviewer needs to see the app's features, such as "Order tracking moves through each stage within two minutes in the review environment."
- **Contact information** for someone who can answer quickly.

## Step 6: Submit for Review

Choose the build, answer the export compliance question (apps that use encryption only for standard HTTPS connections usually qualify for an exemption, but check your app's actual use of encryption first; you can declare this once in `app.json` with `ios.config.usesNonExemptEncryption: false`), choose manual or automatic release, and submit. Many reviews finish within a day or two. When approved, release the app manually, automatically, or as a **phased release** over seven days, which is Apple's version of a staged rollout.

## What App Review Checks

Apple's guidelines are long, but most rejections of apps like these come from a handful of them:

- **App completeness (2.1)**: crashes, broken links, placeholder content, a demo account that doesn't work. Reviewers will find the one broken screen.
- **Accurate metadata (2.3)**: screenshots and descriptions that match the app.
- **Minimum functionality (4.2)**: the app must do something useful beyond a website in a frame.
- **Payments (3.1)**: digital goods and subscriptions must use In-App Purchase; physical goods and services must not (Chapter 23).
- **Sign in with Apple (4.8)**: required as an option in many apps that offer third-party sign-in.
- **Account deletion (5.1.1)**: apps that let users create accounts must let them start account deletion in the app.
- **Privacy (5.1)**: permissions requested only when needed, with clear purpose strings, and privacy details that match.
- **User-generated content (1.2)**: apps like Lumo, where people post and message, must offer a way to report content, block users, and filter objectionable material, and must act on reports.

If you're rejected, the message cites the guideline. Reply in App Store Connect's Resolution Center if you think the reviewer misunderstood, or fix and resubmit. Be specific and polite; reviews of resubmissions are usually quick.

## Lumo and the Rules for Social Apps

Lumo shows why it pays to read the guidelines before you build. A real social app needs, from its first version:

- **Report** on every post, comment, story and message.
- **Block** on every profile.
- **A way to act on reports** quickly, with a moderation tool or service.
- **Terms of use** that users accept, forbidding objectionable content.
- **Age-appropriate defaults** for younger users.

None of these exist in the demo. Ask Claude to add them before you ever submit a social app.

```text
Prepare Lumo for App Review guideline 1.2 (user-generated content).
Add Report to every post, comment, story and message (with reasons),
Block and Unblock on profiles (hiding blocked users everywhere,
including screens already open), a moderation queue where an admin can
review, hide content or suspend accounts, and resolve each report, a
notice to the reporter when their report is resolved, a limit on how
many reports one account can file, a way to escalate urgent safety
reports, and terms acceptance at sign-up. Add server and screen tests,
and list anything the guideline asks for that this doesn't yet cover.
```

## Key Takeaways

- In 2026, App Store uploads need Xcode 26 and the iOS 26 SDK, a minimum iOS of 13 or later, the updated age-rating questionnaire, and a $99 yearly membership.
- Upload with EAS Submit, test with TestFlight, then complete the product page, privacy details and review information.
- Give reviewers a working demo account and clear notes; most rejections are about completeness, metadata, payments, privacy or account deletion.
- Use a phased release, and answer rejections specifically in the Resolution Center.
- Social apps need reporting, blocking and moderation before their first submission.
