Two visual bugs in Reelhouse TV (tv/), found by reviewing the screenshots:

1. tv/screenshots/04-home-top10.png: when a row scrolls, cards slide
   underneath the collapsed side navigation rail and show through it: the
   "Ember Crown" card is visible behind the rail icons at the far left.
   The rail must sit above the content on an opaque background (with a
   soft fade into the content is fine), and rows should clip at the rail's
   edge. Check every screen with rows (Home, Movies, Series, Sports, Kids,
   My list, details' More like this) the same way.
2. tv/screenshots/19-live-tv-guide.png: the guide's preview panel shows
   placeholder text, "Island Time on Reel One." Give every programme in the
   catalog a real one-line synopsis and show it there.

Fix both, re-capture every affected screenshot, run tv's typecheck, lint
and tests, and summarize what changed.
