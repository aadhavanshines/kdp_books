# Fact check: launch-kit/posts.md

| # | Claim (where) | Source | Result |
|---|---|---|---|
| 1 | Three hampers this year (IG 1) | pricing.md, data/hamper-costs.json: Deepam, Jyothi, Jyothi Eggless | OK |
| 2 | Last Diwali the festive hamper was the top seller (IG 1, WhatsApp) | research.md s2: top product in the Diwali window, Rs. 64,000 from 28 orders. I recounted 28 hamper orders in the 14-21 Oct 2025 rows of orders.csv (131 orders in the window, matching research.md). Applies to the Diwali window only. Over the full year it ranks 6th by revenue. | OK |
| 3 | Each hamper has a gift box, ribbon, diya and greeting card (IG 1, WhatsApp) | hamper-costs.json: all three hampers include "Festive gift box and ribbon" and "Diya and greeting card" | OK |
| 4 | "Packed by hand" (IG 1) | Not in research.md, pricing.md or data | WRONG (unsupported), removed |
| 5 | Deepam (small) Rs. 749 (IG 1, WhatsApp) | pricing.md: cost 425, minimum 708.33, price 749, margin 43.3%. I recomputed the cost from item costs (140+150+95+40 = 425). | OK |
| 6 | Jyothi (medium) Rs. 1,349 (IG 1, IG 3, WhatsApp) | pricing.md: cost 785 (285+190+175+95+40), minimum 1308.33, price 1,349, margin 41.8% | OK |
| 7 | Jyothi Eggless (medium) Rs. 1,349 (IG 1, IG 2, IG 3, WhatsApp) | pricing.md: cost 805 (140+205+175+150+95+40), minimum 1341.67, price 1,349, margin 40.3% | OK |
| 8 | Jyothi Eggless is the same price as Jyothi (IG 3) | pricing.md: both Rs. 1,349 | OK |
| 9 | Deepam contents: rasmalai cake jar, badam milk cookies 200 g (WhatsApp) | hamper-costs.json | OK |
| 10 | Jyothi contents: mini chocolate truffle cake 500 g, walnut brownies box of 6, kaju katli cookies 200 g (IG 3, WhatsApp) | hamper-costs.json | OK |
| 11 | Jyothi Eggless contents: rasmalai cake jar, eggless walnut brownies (6), kaju katli cookies, badam milk cookies (IG 2 Tamil, WhatsApp) | hamper-costs.json. The Tamil text matches: rasmalai jar, eggless walnut brownie (6), kaju katli cookies, badam milk cookies. | OK |
| 12 | Chocolate truffle is our most-loved cake all year (IG 3) | research.md s2: #1 by revenue (Rs. 938,000) and by orders (839) over the full year | OK |
| 13 | An eggless hamper is new this year (IG 2) | research.md s3: hampers had the lowest eggless share (29.1%) and survey asks for eggless options (47 of 126). The hamper-costs.json hampers include the eggless one. | OK |
| 14 | Diwali 2026 / hashtags / "order early" | research.md caveat: 2026 dates are not in the data. The posts give no date. | OK (no date claimed) |

Prices follow the rule price >= cost/0.6, rounded up to a number ending in 49 or 99. All three satisfy it.

## Changes made to posts.md
- Instagram caption 1: "each packed by hand with a gift box" changed to "each packed with a gift box". No source supports "by hand".

## Notes (no change needed)
- Research.md figures such as the +125% Diwali lift, the OMR growth and the 34.7% eggless share are not used in the posts.
- "Top seller" is true for Diwali week. Do not extend it to "top seller all year".

VERDICT: FAIL (one unsupported claim, "packed by hand", found and fixed in posts.md. The revised posts.md should pass.)
