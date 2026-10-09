# Research facts: Amudha's Home Bakes, Diwali 2026 hamper launch

Sources: data/orders.csv (3,448 orders, 1 Oct 2025 to 30 Sep 2026, no blanks, no duplicate order IDs) and data/survey-results.md (126 respondents, 1-20 Sep 2026; 81 customers, 45 non-customers). All numbers were computed by python3 scripts/analyze.py (and scripts/explore.py for data checks). "Sales" means the `amount` column; it excludes delivery (e.g. a 0.5 kg Rasmalai cake is Rs. 575 = 0.5 x 1150 with a separate delivery charge).

## 1. Diwali 2025 (14-21 Oct 2025) versus a normal week

- Diwali window, 14-21 Oct inclusive (8 days): 131 orders, Rs. 162,785.
- Normal baseline: all 357 days outside the window averaged 9.29 orders and Rs. 9,178 per day. Scaled to 8 days that is about 74 orders and Rs. 73,424. Diwali was about 2.2x normal (Rs. 20,348 per day vs Rs. 9,178), roughly +122% in sales.
- If you prefer a strict 7-day week (14-20 Oct): 118 orders, Rs. 145,775, against a normal 7-day week of about Rs. 64,246. That is about 2.3x.
- The 8 days just before (6-13 Oct) made 51 orders and Rs. 64,210, so the lift began on 14 Oct. Peak day was 19 Oct: 24 orders, Rs. 32,000. Sales fell back to normal by 22 Oct.
- Festive hamper drove it: 28 hamper orders and Rs. 64,000 in the window, the top product that week (the next, Chocolate truffle cake, made Rs. 23,125). Over the other 357 days there were 82 hamper orders in total (38 in October 2025, 3 to 12 per month after).
- Method: filter by date, sum `amount`, divide the non-Diwali total by 357 days and multiply by 8 (or 7).
- Caveat: one year of data, so "normal" is the year's average. The business grew through 2026, so a 2026 baseline would be higher than the 2025 months.

## 2. Best-selling products (all 12 months, by orders; revenue in Rs.)

| Product | Orders | Revenue |
| --- | --- | --- |
| Chocolate truffle cake | 839 | 938,000 |
| Black forest cake | 468 | 483,825 |
| Rasmalai cake | 369 | 491,050 |
| Assorted cupcakes (6) | 330 | 199,800 |
| Walnut brownies (box of 6) | 316 | 176,820 |
| Red velvet cake | 306 | 377,150 |
| Butterscotch cake | 289 | 278,775 |
| Classic brownies (box of 6) | 267 | 128,520 |
| Plum cake | 154 | 130,200 |
| Festive hamper | 110 | 235,200 |

- Chocolate truffle cake is first by both orders and revenue. Rasmalai cake is second by revenue (just ahead of Black forest) despite fewer orders, because of its higher price (Rs. 1,150-1,200 per kg).
- Festive hamper: only 110 orders but Rs. 235,200 revenue, the highest revenue per order. Price is a flat Rs. 1,600 each; average rating 4.37 (overall average 4.41).
- Diwali-week ranking by orders: Festive hamper 28, Chocolate truffle 22, Rasmalai 16, Black forest 15, Butterscotch 13, Walnut brownies 11, Cupcakes 11.
- Method: group by `product`, count rows, sum `amount`.

## 3. Eggless share of cake orders, latest 3 months (Jul-Sep 2026)

- 247 of 712 cake orders were eggless: 34.7%. By month: Jul 33.2%, Aug 35.8%, Sep 35.1%.
- Earlier quarters for context: Oct-Dec 2025 31.3%, Jan-Mar 2026 34.7%, Apr-Jun 2026 33.1%. Steady at about one third, not a sharp rise.
- Across all categories (not just cake) the Jul-Sep eggless share was 37.1%.
- Method: filter `category == cake` and date from 1 Jul 2026 (latest data is 30 Sep 2026), count `eggless == yes` over total.
- Survey support: 47 of 126 respondents (37%) asked for more eggless options, the most requested addition. One comment: "I wish there were more eggless choices."

## 4. Fastest-growing area: OMR

| Area | Orders Oct-Dec 2025 | Orders Apr-Jun 2026 | Orders Jul-Sep 2026 |
| --- | --- | --- | --- |
| OMR | 30 | 85 | 119 |
| Anna Nagar | 288 | 307 | 365 |
| Adyar | 119 | 107 | 137 |
| Velachery | 182 | 195 | 206 |
| T. Nagar | 90 | 114 | 93 |
| Other | 92 | 81 | 91 |

- OMR orders rose about 297% (30 to 119) from the first quarter to the latest quarter, and 40% over the previous quarter (revenue +76%, Rs. 78,155 to Rs. 137,350). No other area is close; Anna Nagar is next at about +27% over the year, and T. Nagar fell 18% last quarter.
- OMR is still small in absolute terms (119 orders vs 365 for Anna Nagar), but it overtook "Other" and T. Nagar in the latest quarter.
- Method: count orders and sum `amount` per `area` per quarter, compute percentage change.
- Survey support: OMR is the most delivery-sensitive area. 25 of 33 OMR respondents said they tried to order but gave up because the Rs. 180 delivery charge was too high (OMR is the dearest zone; Anna Nagar pays Rs. 60, other areas Rs. 120). 11 respondents work in OMR IT parks whose offices order desserts at least monthly (a corporate hamper opportunity).

## 5. Other facts useful for pricing and copy

- Price sensitivity: only 9 of 126 respondents (7%) would pay more than Rs. 1,200 for a 1 kg celebration cake. Current 1 kg cake prices run Rs. 700-1,200. The existing hamper is Rs. 1,600, above that threshold, though a hamper is a gift and the threshold was asked about cakes. Treat it as a caution on the price ceiling, not a hard limit. Average order value over the year is Rs. 997.
- Delivery: 64% of respondents would order more often if delivery took under 90 minutes. Delivery charge was a complaint (one comment: "the delivery fee is more than half the price of the cake").
- Channels (share of orders): Instagram 46.0%, WhatsApp 29.3%, Website 15.2%, Walk-in 9.5%. Instagram is the main place to run the campaign.
- Hamper cost data (data/hamper-costs.json): the 40% minimum margin rule means price >= cost / 0.6, rounded up to a price ending in 49 or 99. Pricing is for the pricing step; not computed here.
- Timing: 2025 demand was elevated from 14 to 21 Oct, with a pre-Diwali build-up of weekend sales on 10-11 Oct (Rs. 13,395 and Rs. 13,370) and the peak on 19 Oct. For 2026 check the actual Diwali date and start promotion about a week before.

## Limits

- The survey is self-selected (126 people, 45 of them non-customers) and its percentages are of respondents, not of all customers.
- The sales data covers one Diwali only, so the uplift is a single observation.
