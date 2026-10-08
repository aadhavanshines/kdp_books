# Research facts: Amudha's Home Bakes, Diwali 2026 hamper launch

Sources: `data/orders.csv` (3,448 orders, 1 Oct 2025 to 30 Sep 2026; no blank cells, no duplicate order IDs) and `data/survey-results.md` (126 respondents, 1 to 20 Sep 2026). Every order figure was computed by python3 scripts in `scripts/`: `research.py` (orders), `survey_calc.py` (survey percentages) and `quote_check.py` (one quote check). Amounts are in rupees. Facts only; no copy or pricing recommendations.

## 1. Diwali 2025 sales (14 to 21 Oct 2025) versus a normal week

- Diwali window (8 days, inclusive): Rs 162,785 from 131 orders (average Rs 1,243 per order).
- A normal week: Rs 64,585 and 65.6 orders. This is the daily average over every day in the dataset except 7 to 28 Oct 2025 (343 days), multiplied by 7. Excluding only the 8 window days gives a similar Rs 64,246 and 65.0 orders.
- Window versus a normal week:
  - Raw 8-day total: 2.52x revenue, 2.00x orders.
  - Like-for-like, per-day rate: 2.21x revenue, 1.75x orders.
- Busiest days: 19 Oct 2025 (Rs 32,000, 24 orders) and 18 Oct (Rs 24,165, 21 orders). Sales were already up on 14 Oct (Rs 20,825, 17 orders) and dropped on 22 Oct (Rs 7,645, 7 orders) and 23 Oct (Rs 2,625, 5 orders).
- Hampers: the Festive hamper made Rs 64,000 from 28 orders in the window. That is 39.3% of window revenue (64,000 / 162,785). Hamper orders by month: Oct 2025 had 38 of the year's 110, and every other month had 3 to 12.
- Other categories in the window: cake Rs 85,075 (76 orders), brownies Rs 8,760 (16), cupcakes Rs 4,950 (11).
- Eggless in the window: 21 of 76 cake orders (27.6%) and 31 of 131 orders overall.
- Caveats:
  - "Normal week" depends on the baseline. The week 7 to 13 Oct was Rs 60,530 from 47 orders, and 1 to 7 Oct was Rs 52,065 from 50 orders.
  - Only one Diwali (2025) is in the data.
- How: `scripts/research.py` section 1. Sum of `amount` and count of rows where `date` is 2025-10-14 to 2025-10-21. The baseline is the same sums over the other days, divided by day count, times 7.

## 2. Best-selling products (full year, 1 Oct 2025 to 30 Sep 2026)

Ranked by number of orders. Quantity is not comparable across products (kg for cakes, boxes or units for others), so orders are used.

| Rank | Product | Orders | Revenue | Revenue per order |
| --- | --- | --- | --- | --- |
| 1 | Chocolate truffle cake | 839 | Rs 938,000 | Rs 1,118 |
| 2 | Black forest cake | 468 | Rs 483,825 | Rs 1,034 |
| 3 | Rasmalai cake | 369 | Rs 491,050 | Rs 1,331 |
| 4 | Assorted cupcakes (6) | 330 | Rs 199,800 | Rs 605 |
| 5 | Walnut brownies (box of 6) | 316 | Rs 176,820 | Rs 560 |
| 6 | Red velvet cake | 306 | Rs 377,150 | Rs 1,233 |
| 7 | Butterscotch cake | 289 | Rs 278,775 | Rs 965 |
| 8 | Classic brownies (box of 6) | 267 | Rs 128,520 | Rs 481 |
| 9 | Plum cake | 154 | Rs 130,200 | Rs 845 |
| 10 | Festive hamper | 110 | Rs 235,200 | Rs 2,138 |

- By revenue: Chocolate truffle cake (Rs 938,000), Rasmalai cake (Rs 491,050), Black forest cake (Rs 483,825), Red velvet cake (Rs 377,150), Butterscotch cake (Rs 278,775), then the Festive hamper (Rs 235,200, sixth) from only 110 orders. Total revenue is Rs 3,439,340.
- In the Diwali 2025 window, by orders: Festive hamper 28, Chocolate truffle cake 22, Rasmalai cake 16, Black forest cake 15, Butterscotch cake 13.
- Festive hamper details: list price Rs 1,600 each (every order is Rs 1,600 per unit; orders are quantity 1 or 2, so Rs 1,600 or Rs 3,200). Average rating 4.37 (cake 4.41, brownies 4.46, cupcakes 4.29). Hamper orders by area: Anna Nagar 36, Velachery 23, T. Nagar 17, Adyar 14, Other 11, OMR 9. In the latest 3 months, hamper orders ran at 8, 12 and 9 per month (Jul, Aug, Sep 2026).
- How: `scripts/research.py` section 2. Group by `product`, count rows, sum `amount`.

## 3. Eggless share of cake orders, latest 3 months

- The latest data month is September 2026, so the latest 3 months are 1 Jul to 30 Sep 2026. Cake orders (`category` = cake) were 712, of which 247 were eggless (`eggless` = yes): **34.7%**.
- By kg rather than by order: 289.0 of 829.0 kg (34.9%).
- By month: Jul 33.2% (80 of 241), Aug 35.8% (83 of 232), Sep 35.1% (84 of 239).
- Earlier quarters, for trend: Oct to Dec 2025 31.3% (173 of 553), Jan to Mar 2026 34.7% (177 of 510), Apr to Jun 2026 33.1% (215 of 650).
- By cake in the latest 3 months: Black forest 42.9% (57 of 133), Rasmalai 37.4% (40 of 107), Red velvet 32.3% (31 of 96), Plum 32.4% (11 of 34), Butterscotch 32.1% (26 of 81), Chocolate truffle 31.4% (82 of 261).
- Eggless carries a Rs 50 per kg premium on every cake (for example Rasmalai Rs 1,150 per kg regular, Rs 1,200 eggless). Brownies, cupcakes and hampers are priced the same eggless or not.
- Eggless is not limited to cakes: across all categories in the latest 3 months, 375 of 1,011 orders (37.1%) were eggless. For the year, 32 of 110 hamper orders (29.1%) were eggless.
- How: `scripts/research.py` section 3. Filter `category` = cake and `date` 2026-07-01 to 2026-09-30, then count `eggless` = yes.

## 4. Fastest-growing area

**OMR (Thoraipakkam to Sholinganallur area) is the fastest-growing area on all three comparisons run.**

- Latest 3 months (Jul to Sep 2026) versus the previous 3 (Apr to Jun 2026): OMR orders 85 to 119 (+40.0%), revenue Rs 78,155 to Rs 137,350 (+75.7%). Next is Adyar (+28.0% orders, +22.3% revenue), then Anna Nagar (+18.9%, +12.4%). T. Nagar fell (-18.4% orders, -23.9% revenue).
- Last 6 months (Apr to Sep 2026) versus the first 6 (Oct 2025 to Mar 2026): OMR orders 83 to 204 (+145.8%), revenue Rs 83,760 to Rs 215,505 (+157.3%). Next is Anna Nagar (+22.9% orders).
- First quarter (Oct to Dec 2025) versus the latest: OMR orders 30 to 119 (+296.7%), revenue +354.5%. Next is Anna Nagar (+26.7%).
- Monthly OMR orders: 8 (Oct 2025), 9, 13, 21, 15, 17, 27, 35, 23, 39, 39, 41 (Sep 2026).
- Caveats:
  - OMR started from a small base. In Jul to Sep 2026 it was 119 of 1,011 orders (11.8%). Anna Nagar is the largest area at 365 orders (36.1%), then Velachery 206 (20.4%).
  - OMR has the highest delivery charge: Rs 180 on 264 of 287 OMR orders over the year (the other 23 are walk-ins with Rs 0). Other areas pay Rs 60 (Anna Nagar) or Rs 120.
  - OMR is the weakest area for hampers: 9 of 110 hamper orders.
- How: `scripts/research.py` section 4. Group by `area` and period, count rows, sum `amount`. Growth = later period / earlier period - 1.

## 5. Survey facts (`data/survey-results.md`, 126 respondents, 1 to 20 Sep 2026)

All counts are as stated in the survey file. Percentages marked "computed" come from `scripts/survey_calc.py`.

- Respondents: 81 existing customers and 45 Instagram followers who have never ordered (35.7% never ordered, computed). Key findings section.
- Where respondents live (table in the file): Anna Nagar and nearby 38, OMR 33, Velachery, Madipakkam, Medavakkam 29, Adyar and Besant Nagar 14, Other 12. These sum to 126. OMR is 26.2% of respondents (computed).
- Delivery speed: 64% said they would order more often if delivery took under 90 minutes. The file gives only the percentage (64% of 126 is about 81 people, computed, not stated).
- Delivery charge: 25 of the 33 OMR respondents (75.8%, computed) said they tried to order but gave up because the Rs 180 OMR delivery charge was too high.
- Eggless: 47 respondents (37.3% of 126, computed) asked for more eggless options, the most requested addition.
- Price sensitivity: only 9 respondents (7.1%, computed) would pay more than Rs 1,200 for a 1 kg celebration cake. For reference, the highest per-kg cake price in the orders data is Rs 1,200 (eggless Rasmalai); the Festive hamper is Rs 1,600 per unit.
- Corporate demand: 11 respondents (8.7% of all, 33.3% of the OMR respondents, computed) work in OMR IT parks and said their offices order desserts for events at least once a month. This came up unprompted.
- Exact comments in the file:
  - "I live in Sholinganallur and the delivery fee is more than half the price of the cake."
  - "Please open somewhere closer to OMR, all my office friends want to order."
  - "Love the rasmalai cake, but I wish there were more eggless choices."
- Fact-check note on the first comment: Rs 180 is more than half the price in only one product and size in the orders data (a 0.5 kg Plum cake at Rs 350; 16 orders). For a typical cake it is about 16% to 19% of a 1 kg price (Rs 180 / Rs 1,150 Rasmalai = 15.7%; Rs 180 / Rs 950 Chocolate truffle = 18.9%) and 11.2% of the Rs 1,600 hamper. Treat the quote as a customer's view, not a verified ratio. Source: `scripts/quote_check.py`, `scripts/survey_calc.py`.

## Gaps and cautions

- The survey says nothing about hampers, Diwali, gifting, hamper contents or hamper price expectations. Its only price-expectation figure is for a 1 kg cake.
- The data covers one Diwali (2025) and one Festive hamper at Rs 1,600. Hampers are 110 of 3,448 orders (3.2%). No order data covers a hamper in any other price or size.
- Survey area groups do not match the order data areas (the survey has no T. Nagar, and groups Adyar with Besant Nagar), so area counts cannot be compared directly.
- Survey respondents are not a random sample (81 customers plus 45 Instagram followers who answered a voluntary survey), so percentages describe respondents only.
- `data/hamper-costs.json` was read but is not used here. It holds costs for the planned 2026 hampers, which is a pricing topic rather than a research fact.
