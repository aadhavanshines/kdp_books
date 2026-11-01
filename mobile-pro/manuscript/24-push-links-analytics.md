# Chapter 24: Push Notifications, Deep Links and Analytics

Three systems connect a professional app to the world outside it. Push notifications bring users back ("Your order is out for delivery"). Deep links take them straight to the right screen from a notification, an email, a message or a website. Analytics tell you what they actually do once they're there. This chapter adds all three to the apps, with care for privacy.

## Push Notifications

The apps already have a notifications screen (Cartly's, in Chapter 14) and live order updates while the app is open. Push extends both to when the app is closed.

### How Push Works

1. The app asks the user for permission to send notifications.
2. If they agree, the operating system gives the app a **push token**, an address for this app on this device.
3. The app sends the token to **your server**, which stores it against the signed-in user.
4. When something happens (an order ships), your server sends a message to that token through a push service: Firebase Cloud Messaging for Android, Apple Push Notification service for iOS, or Expo's push service, which forwards to both.
5. The phone shows the notification, and when the user taps it, the app opens on the right screen.

With Expo, `expo-notifications` handles permission, the token and tapping. The outline:

```tsx
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export async function registerForPush(api: Api) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await api.savePushToken(token);
}
```

Things to know before you start:

- **Push needs a development build.** From Expo SDK 53, Expo Go doesn't support remote push notifications; local notifications still work there. Android needs Firebase Cloud Messaging credentials, which EAS can store for you; iOS needs an Apple push key.
- **Android 13 and later ask the user**, as iOS always has. Before Android 13, notifications were allowed by default.
- **Test on physical devices**, or an Android emulator with Google Play services.

### Asking at the Right Moment

The single biggest mistake is asking for notification permission at first launch, before the user knows why. Professional apps ask in context: right after the first order is placed, with a short explanation of what they'll get ("We'll tell you when your order is on its way"). If the user says no, the app keeps working, and the account screen offers a way to turn notifications on later.

### Sending Notifications That Help

- **Transactional first.** Order confirmed, out for delivery, delivered, refund completed: users want these.
- **Marketing sparingly, and with consent.** Offers and "your cart misses you" messages need the user's agreement in many places, and they're the main reason people turn notifications off. Give separate switches for order updates and offers.
- **Use channels on Android.** Separate notification channels ("Order updates", "Offers") let users silence one without the other.
- **Make every notification a deep link** to the screen it's about.
- **Clean up tokens.** When a push service says a token is no longer valid, delete it; when a user signs out, unlink the token from their account.

## Deep Links

A deep link opens the app on a specific screen. Expo Router makes this almost free: every file in `app/` is already a route, so `app/order/[id].tsx` answers `/order/123`.

There are two kinds of link:

- **Custom scheme links** such as `platter://order/123`. Each app in this book declares its scheme in `app.json` (`"scheme": "platter"`). They're easy, and good for notifications and internal use, but any app can claim a scheme, and they don't work if the app isn't installed.
- **Universal links (iOS) and App Links (Android)** such as `https://platter.example/order/123`. They're ordinary web addresses that open the app if it's installed and the website if not. They need proof that you own the domain: an `apple-app-site-association` file and an `assetlinks.json` file served from the site's `/.well-known/` folder, plus the associated domain and intent filters in the app's configuration.

Use universal links for anything shared outside the app: emails, messages, social posts, QR codes.

### Handle Every Link Safely

A deep link is input from outside the app, so treat it like any other untrusted input:

- **Check that the user may see the target.** A link to someone else's order must show "not found", which the server already enforces.
- **Send signed-out users to sign in first**, then on to the target.
- **Ignore unknown links rather than crashing.** Minutely's banner links show the idea in miniature:

```ts
@include code/apps/minutely/src/lib/links.ts
```

Only known shapes become routes; anything else is ignored.

## Analytics

Analytics answer the questions you can't answer by asking: where do people drop out of checkout? Which banner gets tapped? Did the new filter sheet help people find products?

### Measure a Few Things Well

Start with a small **event plan** written down before any code: a dozen events that describe your main journey, each with a name and a few properties.

| Event | Properties |
| --- | --- |
| `app_opened` | source (icon, notification, link) |
| `search_performed` | query length, results count |
| `product_viewed` | product ID, category, position in list |
| `cart_item_added` | product ID, quantity, screen |
| `checkout_started` | item count, total band |
| `payment_completed` | method, total band |
| `order_delivered` | minutes from order |

From these, you can build the funnel that matters most: viewed, added, started checkout, paid. Choose an analytics provider (Firebase Analytics, Amplitude, Mixpanel, PostHog and others all have React Native SDKs), and wrap it in one small module of your own, `track(event, properties)`, so screens never call the provider directly and you can switch providers or add consent checks in one place.

### Privacy Comes First

- **Collect the minimum.** Don't send names, phone numbers, emails, addresses or exact amounts in analytics events. Use IDs and bands ("₹500 to ₹999").
- **Ask where the law requires it.** Rules on consent differ by country; India's Digital Personal Data Protection Act, Europe's GDPR and US state laws all apply to apps used there.
- **Declare it.** Everything you collect must appear in the Play Data safety form and Apple's privacy details (Chapters 27 and 28), including data collected by SDKs you add.
- **Apple's tracking rule.** If you track users across other companies' apps or websites (for advertising, for example), iOS requires you to ask permission with the App Tracking Transparency prompt.

## A Prompt for All Three

```text
Add push notifications to Platter for order updates only: ask for
permission after the first order is placed, with a one-line explanation;
store the Expo push token on the server against the user; send a push on
each order status change from the simulator; and open the order screen
when a notification is tapped, after sign-in if needed. Add an
"Order updates" switch in Profile. Then add an analytics module with a
track() function that logs to the console in development, and call it
for the seven events in docs/EVENTS.md, with no personal data in any
event. Test the server side and the routing logic.
```

## Key Takeaways

- Push needs permission, a token stored on your server, and a development build; ask for permission in context, not at launch.
- Send transactional notifications freely, marketing sparingly and with consent, and make every notification a deep link.
- Expo Router turns every screen into a link; use universal links and App Links for anything shared outside the app.
- Treat deep links as untrusted input: check permissions, handle signed-out users, and ignore unknown shapes.
- Plan a small set of analytics events, wrap the provider in one module, collect no personal data, and declare everything you collect.
