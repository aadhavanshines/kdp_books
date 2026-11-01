Build Platter, the food delivery app in docs/PRD.md section 1, as
apps/platter: an Expo SDK 58 app with Expo Router, using @pro/ui (brand
"platter") and @pro/api. It should feel as polished as the best food
delivery apps: dense but calm layouts, real loading skeletons, empty and
error states, smooth press feedback, a sticky cart bar, bottom sheets.

Screens: OTP login, Home, Search, Restaurant (menu, customization sheet),
Cart and checkout (coupons, tip, bill details, address and payment sheets),
Order tracking (live SSE status, SVG map with moving rider, ETA, rider
card), Orders, Rate order, Profile. Tabs: Home, Search, Orders, Profile.

Work like a professional team:
1. Plan first: list the routes, components and data each screen needs, and
   anything missing from @pro/ui or @pro/api. Add missing pieces to the
   shared packages (with tests) rather than inside the app.
2. Build screen by screen. After each one, export the app for web and
   look at it: run the server, serve the web build, and capture the screen
   in headless Chromium at 393x852 CSS pixels with device scale 3 (Playwright
   is installed globally; require('playwright') works). Compare it with the
   PRD and fix anything that looks unpolished: alignment, spacing, text
   cut off, images missing, overlapping elements.
3. Add tests for the app's logic (bill calculation display, cart behavior,
   tracking state) and component tests for the main screens.
4. Make sure `npx expo export -p web` works for the app, and add an
   `npm run export:web -w apps/platter` script.
5. Save your final screenshots of every screen to apps/platter/screenshots/
   (PNG, named 01-login.png, 02-home.png, ...), with the tracking screen
   captured mid-delivery.

Finish with typecheck, lint and tests passing for the whole workspace, then
a summary of the screens, the components you added to the shared packages,
and any problems you hit.
