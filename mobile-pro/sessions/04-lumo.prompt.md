Build Lumo, the social photo app in docs/PRD.md section 3, as apps/lumo:
an Expo SDK 58 app with Expo Router, using @pro/ui (brand "lumo") and
@pro/api. Follow the structure of apps/platter and apps/cartly and reuse the
shared packages (session, sheets, components) instead of copying.

It should feel like the best photo-sharing apps: content first, quiet
chrome, crisp icons, smooth gestures. The "photos" are rich illustrated
compositions: layered gradients plus the 3D art from @pro/ui (a scene
component in @pro/ui that composes a backdrop, a hero illustration and
small accents from a post's seed, so every post looks distinct).

Screens: Feed (stories row with unseen/seen rings, posts with double-tap
like and heart burst, like/comment/share/save, captions, comment count),
Story viewer (progress bars, tap left/right, hold to pause), Comments
sheet, Create post (pick art, filter strip, caption, share), Explore grid
with mixed tile sizes, Profile (stats, bio, highlights, grid and tagged
tabs), Notifications, Messages list and a chat thread. Tabs: Home,
Explore, Create, Activity, Profile.

As before: plan first and add missing shared pieces to @pro/ui or @pro/api
with tests; build screen by screen and check each one in headless Chromium
at 393x852 CSS pixels, device scale 3, fixing anything unpolished; add
logic and screen tests; save final screenshots of every screen to
apps/lumo/screenshots/ (01-feed.png, ...), with the story viewer captured
mid-story and a heart burst captured on a post if you can. Keep the work
focused so it fits in one session of about an hour. Finish with typecheck,
lint and tests passing for the whole workspace, and a summary.
