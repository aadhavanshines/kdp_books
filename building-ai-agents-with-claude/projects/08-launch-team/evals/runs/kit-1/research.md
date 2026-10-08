# Research facts: Amudha's Home Bakes, Diwali hamper launch

Sources: `data/orders.csv` (3,448 orders, 1 Oct 2025 to 30 Sep 2026; no missing values or duplicate order IDs) and `data/survey-results.md` (126 respondents, 1 to 20 Sep 2026). All order figures were computed with python3 scripts in `scripts/` (`explore.py`, `research.py`, `ratios.py`). Amounts are in rupees. Facts only; no copy or pricing recommendations.

## 1. Diwali 2025 sales (14 to 21 Oct 2025) versus a normal week

- Diwali window (8 days, inclusive): Rs 162,785 from 131 orders.
- A normal week: Rs 64,585 and 65.6 orders. This is the average over every day in the dataset except 7 to 28 Oct 2025 (343 days), multiplied by 7.
- Diwali window versus a normal week:
  - Raw 8-day total: 2.52x revenue, 2.0x orders.
  - Fairer like-for-like (per-day rate x 7 = Rs 142,437 and 114.6 orders): 2.21x revenue, 1.75x orders.
- Busiest days: 19 Oct 2025 (Rs 32,000, 24 orders) and 18 Oct (Rs 24,165, 21 orders). Daily sales were already above normal from 14 Oct (Rs 20,825, 17 orders). They fell back to Rs 7,645 (7 orders) on 22 Oct.
- Calendar week Mon 13 to Sun 19 Oct was Rs 130,825 from 107 orders. The week before (6 to 12 Oct) was Rs 58,530 from 47 orders.
- Hamper effect: the Festive hamper made up Rs 64,000 from 28 orders in the window. That is 39.3% of window revenue and 25.5% of all 110 hamper orders in the year.
- Other categories in the window: cake Rs 85,075 (76 orders), brownies Rs 8,760 (16 orders), cupcakes Rs 4,950 (11 orders).
- How: `scripts/research.py` section 1 (sums of `amount`, counts of rows by `date`). `scripts/ratios.py` for the ratios.
- Caveat: "normal week" depends on the baseline chosen. Against 1 to 7 Oct 2025 only (Rs 52,065, 50 orders) the per-day uplift is 2.74x revenue and 2.29x orders.

## 2. Best-selling products (full year, 1 Oct 2025 to 30 Sep 2026)

By number of orders (quantity is in kg for cakes and in boxes or units for other items, so it is not comparable across products):

| Rank | Product | Orders | Revenue |
| --- | --- | --- | --- |
| 1 | Chocolate truffle cake | 839 | Rs 938,000 |
| 2 | Black forest cake | 468 | Rs 483,825 |
| 3 | Rasmalai cake | 369 | Rs 491,050 |
| 4 | Assorted cupcakes (6) | 330 | Rs 199,800 |
| 5 | Walnut brownies (box of 6) | 316 | Rs 176,820 |
| 6 | Red velvet cake | 306 | Rs 377,150 |
| 7 | Butterscotch cake | 289 | Rs 278,775 |
| 8 | Classic brownies (box of 6) | 267 | Rs 128,520 |
| 9 | Plum cake | 154 | Rs 130,200 |
| 10 | Festive hamper | 110 | Rs 235,200 |

- By revenue the order is: Chocolate truffle cake, Rasmalai cake, Black forest cake, Red velvet cake, Butterscotch cake, Festive hamper (sixth, from only 110 orders), then the rest.
- During the Diwali 2025 window, the top product by orders was the Festive hamper (28), then Chocolate truffle cake (22), Rasmalai cake (16) and Black forest cake (15).
- How: `scripts/research.py` section 2 (group by `product`; count rows, sum `amount`).

## 3. Eggless share of cake orders, latest 3 months

- Latest 3 months in the data are 1 Jul to 30 Sep 2026. Cake orders (`category` = cake) were 712, of which 247 were eggless: **34.7%**.
- By month: Jul 33.2% (80 of 241), Aug 35.8% (83 of 232), Sep 35.1% (84 of 239).
- Trend: Oct to Dec 2025 was 31.3% (173 of 553) and Apr to Jun 2026 was 33.1% (215 of 650), so the share is edging up.
- Highest eggless share by cake in the latest 3 months: Black forest 42.9% (57 of 133), Rasmalai 37.4% (40 of 107). Chocolate truffle was 31.4% (82 of 261).
- How: `scripts/research.py` section 3 (filter `category` = cake and date range; count `eggless` = yes). Percentages are shares of orders, not of kg.
- Related survey fact: 47 of 126 respondents (37.3%) asked for more eggless options, the most requested addition (`data/survey-results.md`, Key findings).

## 4. Fastest-growing area

**OMR is the fastest-growing area on every comparison I ran.**

- Latest 3 months (Jul to Sep 2026) versus the 3 before (Apr to Jun 2026): OMR orders 85 to 119 (+40.0%), revenue Rs 78,155 to Rs 137,350 (+75.7%). Next is Adyar at +28.0% orders and +22.3% revenue. T. Nagar fell 18.4% in orders.
- Last 6 months (Apr to Sep 2026) versus the first 6 months (Oct 2025 to Mar 2026): OMR orders 83 to 204 (+145.8%), revenue +157.3%. The next fastest is Anna Nagar at +22.9% orders.
- Latest 3 months versus the first 3 months (Oct to Dec 2025): OMR 30 to 119 orders (+296.7%).
- Monthly OMR orders went from 8 in Oct 2025 to 41 in Sep 2026.
- Caveats:
  - OMR started from a small base. It is still only about 11.8% of orders in Jul to Sep 2026, against Anna Nagar at 365 orders, the largest area.
  - Of 287 OMR orders over the year, 264 carry the Rs 180 delivery charge and 23 are walk-in orders with Rs 0 delivery.
- How: `scripts/research.py` section 4 (group by `area` and period; count rows, sum `amount`; growth = later period / earlier period - 1).

## 5. Survey facts (`data/survey-results.md`, 1 to 20 Sep 2026, 126 respondents)

- Respondents: 81 existing customers and 45 Instagram followers who have never ordered.
- Where they live: Anna Nagar and nearby 38, OMR (Thoraipakkam to Sholinganallur) 33, Velachery/Madipakkam/Medavakkam 29, Adyar/Besant Nagar 14, Other 12. These sum to 126.
- 64% said they would order more often if delivery took under 90 minutes (about 81 of 126).
- Of the 33 OMR respondents, 25 (75.8%) said they tried to order but gave up because the Rs 180 OMR delivery charge was too high.
- Price expectation: only 9 respondents (7.1%) would pay more than Rs 1,200 for a 1 kg celebration cake.
- 11 respondents work in OMR IT parks, and said their offices order desserts for events at least once a month (corporate demand, raised unprompted).
- Comments worth knowing: "the delivery fee is more than half the price of the cake" (Sholinganallur), "Please open somewhere closer to OMR", and "Love the rasmalai cake, but I wish there were more eggless choices".

## Gaps and cautions

- The survey does not mention hampers, Diwali, gifting, hamper contents or hamper price expectations. The only price-expectation figure is for a 1 kg cake (item above).
- The orders data has one Diwali (2025). It has no hamper data outside that year, and hampers are 110 of 3,448 orders (3.2%).
- `data/hamper-costs.json` exists but was not used. It is outside the facts asked for.
- The survey's area groupings do not match the order data (no T. Nagar in the survey), so area counts cannot be compared directly.
