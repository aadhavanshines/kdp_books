# Research facts: Amudha's Home Bakes, Diwali 2026 hamper launch

Sources, cited as [orders] and [survey] throughout:
- [orders] = `data/orders.csv`: 3,448 orders, 1 Oct 2025 to 30 Sep 2026. Checked: no blank cells, no duplicate order IDs. Total revenue Rs 3,439,340.
- [survey] = `data/survey-results.md`: 126 respondents, 1 to 20 Sep 2026.
- Calculation scripts: `scripts/research.py` (all [orders] figures) and `scripts/survey_calc.py` (survey percentages). Both were run with python3, and every figure below came from their output. Amounts are in rupees.
- Facts only. No copy or pricing recommendations. `data/hamper-costs.json` was read but is a pricing input, so it is not used here.

## 1. Diwali 2025 (14 to 21 Oct 2025) versus a normal week [orders]

- Window (8 days): Rs 162,785 from 131 orders, average Rs 1,243 per order.
- A normal week: Rs 64,585 and 65.6 orders. This is the daily average over every day except 7 to 28 Oct 2025 (343 days), times 7. The median of the 52 full weeks since 1 Oct 2025 is Rs 65,385, which agrees.
- Window versus a normal week: 2.52x revenue and 2.00x orders for the raw 8-day total. Per day it is 2.21x revenue and 1.75x orders.
- Build-up: 7 to 13 Oct had 47 orders and Rs 60,530 in total. Daily orders then jumped to 17 on Tue 14 Oct.
- Peak days: Sun 19 Oct (24 orders, Rs 32,000) and Sat 18 Oct (21 orders, Rs 24,165).
- Drop-off: 22 Oct had 7 orders and 23 Oct had 5 (Rs 2,625).
- The window is the one the brief specified. Only one Diwali is in the data.

## 2. Best-selling products [orders]

Full year, ranked by orders. Quantity is not comparable across products (kg for cakes, boxes or packs for the rest).

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

- By revenue the order is Chocolate truffle, Rasmalai, Black forest, Red velvet, Butterscotch, then the Festive hamper in sixth place from just 110 orders.
- Latest 3 months (Jul to Sep 2026) top products by orders: Chocolate truffle 261, Black forest 133, Rasmalai 107, Assorted cupcakes 101, Red velvet 96, Walnut brownies 96.
- In the Diwali 2025 window, by orders:
  - Festive hamper 28 (the number one product that week)
  - Chocolate truffle 22
  - Rasmalai 16
  - Black forest 15
  - Butterscotch 13
  - Walnut brownies 11
  - Assorted cupcakes 11
- In the window the hamper made Rs 64,000, which is 39.3% of window revenue. The other categories: cake Rs 85,075 (76 orders), brownies Rs 8,760 (16), cupcakes Rs 4,950 (11).
- Rasmalai cake has the highest revenue per order among cakes (Rs 1,331). The planned hampers use a Rasmalai cake jar.

## 3. Festive hamper history, the closest evidence for the 2026 hampers [orders]

- Overall: 110 orders (3.2% of all orders) and Rs 235,200 (6.8% of revenue), 147 units. There is one hamper product, the Festive hamper, always at Rs 1,600 per unit. No other hamper price or size has been sold.
- Quantity per order: 73 orders of 1 unit and 37 orders of 2 units. In the Diwali window: 16 orders of 1 and 12 orders of 2, 40 units in total.
- Seasonality, by order date:
  - 1 to 6 Oct 2025: 1 order
  - 7 to 13 Oct: 7
  - 14 to 21 Oct: 28
  - 22 to 31 Oct: 2
  - Oct 2025 as a whole: 38 of the year's 110
  - Every other month: 3 to 12 (Jul 8, Aug 12, Sep 9 in 2026)
- Peak hamper days in the window: 20 Oct (6 orders), 14 Oct (5) and 18 Oct (5).
- Area: Anna Nagar 36, Velachery 23, T. Nagar 17, Adyar 14, Other 11, OMR 9.
- Channel: Instagram 48, WhatsApp 33, Website 17, Walk-in 12.
- Eggless: 32 of 110 hamper orders (29.1%).
- Average rating 4.37 (all orders 4.41; cake 4.41, brownies 4.46, cupcakes 4.29).

## 4. Eggless share of cake orders, latest 3 months [orders]

- 1 Jul to 30 Sep 2026: 247 of 712 cake orders were eggless, which is **34.7%**.
- Earlier quarters: Oct to Dec 2025 31.3% (173 of 553), Jan to Mar 2026 34.7% (177 of 510), Apr to Jun 2026 33.1% (215 of 650).
- Across all categories in the latest 3 months: 375 of 1,011 orders (37.1%).
- Eggless carries a Rs 50 per kg premium on every cake, for example Rasmalai Rs 1,150 regular and Rs 1,200 eggless. All six cakes follow this pattern.
- Eggless and regular orders rate the same (4.41 and 4.40).
- Survey [survey]: 47 of 126 respondents (37.3%, computed) asked for more eggless options. It was the most requested addition.

## 5. Fastest-growing area [orders]

**OMR (Thoraipakkam to Sholinganallur) grew fastest on every comparison.**
- Latest 3 months versus the previous 3 (Jul to Sep 2026 against Apr to Jun 2026):
  - OMR: orders 85 to 119 (+40.0%), revenue Rs 78,155 to Rs 137,350 (+75.7%)
  - Adyar: +28.0% orders, +22.3% revenue
  - Anna Nagar: +18.9% orders
  - Velachery: +5.6% orders
  - T. Nagar: -18.4% orders, -23.9% revenue
- Last 6 months versus the first 6: OMR orders 83 to 204 (+145.8%). The next fastest is Anna Nagar at +22.9%.
- OMR monthly orders from Oct 2025 to Sep 2026: 8, 9, 13, 21, 15, 17, 27, 35, 23, 39, 39, 41.
- Caveats:
  - OMR starts from a small base. It was 119 of 1,011 orders (11.8%) in the latest 3 months.
  - Anna Nagar is the largest area, with 1,219 of 3,448 orders for the year (35.4%).
  - OMR is the weakest area for hampers (9 of 110 hamper orders, 1 of 28 in the Diwali window).
  - OMR has the highest delivery charge: Rs 180 on 264 of 287 OMR orders (the other 23 show Rs 0). Anna Nagar pays Rs 60 and the other areas Rs 120.

## 6. Customer preferences and price sensitivity

From [survey] (percentages computed in `scripts/survey_calc.py`):
- Respondents: 81 existing customers and 45 Instagram followers who have never ordered (35.7%).
- Where they live: Anna Nagar and nearby 38, OMR 33 (26.2%), Velachery, Madipakkam, Medavakkam 29, Adyar and Besant Nagar 14, Other 12.
- Price: only 9 respondents (7.1%) would pay more than Rs 1,200 for a 1 kg celebration cake. This is the only price-expectation question in the survey.
- Delivery speed: 64% said they would order more often if delivery took under 90 minutes. The file gives only the percentage (about 81 people, computed).
- Delivery charge: 25 of 33 OMR respondents (75.8%) tried to order but gave up because the Rs 180 charge was too high.
- Corporate demand: 11 respondents work in OMR IT parks and said their offices order desserts for events at least once a month (8.7% of all respondents, 33.3% of OMR respondents). This came up unprompted.
- Rasmalai cake: one comment says "Love the rasmalai cake, but I wish there were more eggless choices."
- Exact quote on delivery: "I live in Sholinganallur and the delivery fee is more than half the price of the cake."

Price context from [orders]:
- Highest per-kg cake price is Rs 1,200 (eggless Rasmalai). No cake order exceeds Rs 1,200 per kg.
- 729 of 2,425 cake orders (30.1%) exceed Rs 1,200 in total, because of kg size. Cake sizes sold are 0.5, 1, 1.5 and 2 kg, with 1 kg the most common (1,243 orders).
- Order value across all orders: median Rs 900, 75th percentile Rs 1,200, 90th percentile Rs 1,725. Orders of Rs 1,600 or more number 559 of 3,448 (16.2%, including hampers and large cakes).
- The Rs 180 OMR delivery charge is 11.25% of a Rs 1,600 hamper and 15.7% of a 1 kg regular Rasmalai cake (Rs 1,150).

## 7. Order timing and channel [orders]

- Weekend orders are the busiest: Sat 687 and Sun 684 orders, against 393 to 443 on each weekday. Hampers show the same pattern: Sat 28, Fri 18, Sun 18.
- Monthly orders ran at 212 to 355. Oct 2025 had 295 orders and the highest revenue (Rs 336,755) until Aug 2026 (Rs 348,410). Business is growing: Jul to Sep 2026 ran at 325 to 355 orders a month.
- Channel (all orders): Instagram 1,587, WhatsApp 1,010, Website 525, Walk-in 326. Instagram also led in the Diwali window (62 of 131).

## Gaps and cautions

- [survey] says nothing about hampers, Diwali, gifting, contents or hamper price expectations. Its only price figure is for a 1 kg cake.
- [orders] covers one Diwali (2025) and one hamper product at Rs 1,600. Demand at any other hamper price, size or content is unobserved.
- Survey respondents answered voluntarily (customers plus Instagram followers), so percentages describe respondents only. Survey area groups differ from the order-data areas (no T. Nagar, and Adyar is grouped with Besant Nagar), so the two cannot be compared directly.
- The "normal week" baseline depends on method. The median of the 52 full weeks (Rs 65,385) is within about 1.2% of the Rs 64,585 used here.
