# Fact-check: launch-kit/posts.md

Sources: launch-kit/research.md, launch-kit/pricing.md, data/hamper-costs.json, data/orders.csv (window rows re-counted directly). No scripts were re-run (no shell available); the order counts below were counted by hand from the matching rows in orders.csv.

| # | Where | Claim | Source | Result |
|---|---|---|---|---|
| 1 | IG 1, WA | Deepam is Rs 749 | pricing.md: cost 425 (140+150+95+40, matches hamper-costs.json), 425/0.6 = 708.33, next price ending 49/99 is 749, margin 43.26% | OK |
| 2 | IG 3, WA | Jyothi is Rs 1,349 | pricing.md: cost 785 (matches json), 785/0.6 = 1308.33, rounds up to 1349, margin 41.81% | OK |
| 3 | IG 2 (Tamil), IG 3, WA | Jyothi Eggless is Rs 1,349 | pricing.md: cost 805 (matches json), 805/0.6 = 1341.67, rounds up to 1349, margin 40.33% (above the 40% floor) | OK |
| 4 | IG 1, WA | Deepam contents: rasmalai cake jar, badam milk cookies (200 g), gift box and ribbon, diya and card | hamper-costs.json "Deepam (small)" | OK |
| 5 | IG 3, WA | Jyothi contents: mini chocolate truffle cake (500 g), walnut brownies (box of 6), kaju katli cookies (200 g), gift box and ribbon, diya and card | hamper-costs.json "Jyothi (medium)" | OK |
| 6 | IG 2 (Tamil), WA | Jyothi Eggless contents: rasmalai cake jar, eggless walnut brownies (6), kaju katli cookies (200 g), badam milk cookies (200 g), gift box, ribbon, diya, card | hamper-costs.json "Jyothi Eggless (medium)". Tamil text checked item by item (200 கி, brownies 6) | OK |
| 7 | WA | "Each comes in a festive gift box with ribbon, a diya and a greeting card" | json: all three hampers include both "Festive gift box and ribbon" and "Diya and greeting card" | OK |
| 8 | IG 3, WA | Size labels: Deepam small, Jyothi medium, Jyothi Eggless medium | json hamper names | OK |
| 9 | IG 3 | "This year there are three hampers" | json lists 3 hampers | OK |
| 10 | IG 3 | "Last Diwali, our Festive hamper was the top-ordered item in the festival week" | research.md section 2: Diwali 2025 window (14 to 21 Oct 2025), by orders, Festive hamper 28, Chocolate truffle cake 22, Rasmalai cake 16. Recounted in orders.csv: 28 Festive hamper rows and 22 Chocolate truffle cake rows in the window | OK, see caveats |
| 11 | IG 3 | "with 28 orders" | research.md section 1 and 2 (28 orders, Rs 64,000); orders.csv recount = 28 | OK |
| 12 | IG 3 | "The Jyothi Eggless hamper is also Rs 1,349" | pricing.md summary (same price as Jyothi) | OK |
| 13 | IG 2 | "முட்டை இல்லாத ஹேம்பர்" (egg-free hamper) | Only the brownies are explicitly the eggless version (json). Nothing in the sources says the rasmalai jar, kaju katli cookies or badam milk cookies are egg-free | NOT VERIFIED (not wrong; see caveats) |
| 14 | IG 1 to 3 | Hashtags, "Diwali 2026", "Chennai bakery" | Brand name, Chennai areas in orders.csv; no numbers | OK |

## Caveats (no edits made)

- Row 10, "top-ordered": true by number of orders, not by quantity (cakes are sold in kg, other items in boxes or units). The ranking is for the Diwali window only, not the full year (over the full year Chocolate truffle cake leads with 839 orders and the Festive hamper is tenth with 110).
- Row 10, "festival week": the data window is 8 days (14 to 21 Oct 2025), not 7. Loose but harmless. If you want it exact, say "over the Diwali days last year".
- Last year's Festive hamper (Rs 1,600 per unit, one product) is not the same as the 2026 Deepam, Jyothi and Jyothi Eggless hampers. The copy does not claim they are, and no price comparison is made. Do not use the 28 orders as a forecast for 2026.
- Row 13: confirm with Amudha that every item in the Jyothi Eggless hamper is egg-free before this goes out. Rasmalai cake is sold eggless at a Rs 50 per kg premium in the orders data, so a regular and an eggless version exist, and the cost list has one "Rasmalai cake jar" with no eggless variant. Cookies are not mentioned as eggless anywhere. Safer wording if unconfirmed: "with eggless brownies".
- IG 3 "Jyothi is the one for the bigger gift": there is no larger hamper than Jyothi in 2026, so this is fair, but Jyothi is labelled "medium".
- The survey (126 respondents) says nothing about hampers or Diwali, and the copy does not cite it.

## Changes made to posts.md

None. No number, price or content claim was wrong.

VERDICT: PASS
