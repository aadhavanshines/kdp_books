# Research facts: Diwali 2026 hamper launch, Amudha's Home Bakes

Sources: data/orders.csv (3,448 orders, 1 Oct 2025 to 30 Sep 2026, no blanks, no duplicate order IDs) and data/survey-results.md (September 2026, 126 respondents).
All numbers were computed by python3 scripts: scripts/analyze.py (data checks) and scripts/facts.py (all figures below).

Assumptions: "amount" is treated as product sales only (delivery_charge is a separate column and is not added). "Normal week" is defined below. Revenue is in Rs.

## 1. Diwali 2025 (14 to 21 Oct 2025) versus a normal week

- Diwali window (8 days, inclusive): 131 orders, Rs. 162,785 (Rs. 20,348 per day).
- Normal week: Rs. 63,302 and about 64 orders per 7 days. This is the daily average of all 349 other days, excluding Diwali and the Christmas peak (18 to 25 Dec 2025), times 7. Including Christmas days it is Rs. 64,246. The median full week is Rs. 65,360.
- Like for like (per-day, scaled to 7 days): Diwali week is about Rs. 142,437 and 115 orders. That is +125% in revenue and +79% in orders versus a normal week.
- Raw comparison, 8 days against a 7-day normal week: Rs. 162,785 versus Rs. 63,302, about 2.6 times. Use the per-day figure for a fair claim.
- The week before (7 to 13 Oct): 47 orders, Rs. 60,530, which is a normal level. The jump is specific to Diwali.
- How: filtered rows by date, summed amount, divided by number of distinct days.

## 2. Best-selling products

Full year, by revenue (orders in brackets):
1. Chocolate truffle cake, Rs. 938,000 (839)
2. Rasmalai cake, Rs. 491,050 (369)
3. Black forest cake, Rs. 483,825 (468)
4. Red velvet cake, Rs. 377,150 (306)
5. Butterscotch cake, Rs. 278,775 (289)
6. Festive hamper, Rs. 235,200 (110)

By order count, the top three are Chocolate truffle (839), Black forest (468) and Rasmalai (369).

Diwali window, by revenue:
- Festive hamper: Rs. 64,000 from 28 orders. It was the top product, ahead of Chocolate truffle (Rs. 23,125) and Rasmalai cake (Rs. 21,525).
- Hampers were 39% of Diwali-window revenue (64,000 / 162,785).
- A normal week has about Rs. 3,338 of hamper sales. Diwali was about 19 times that.
- Hamper price is Rs. 1,600 each. 73 orders were 1 hamper and 37 were 2.
- Hamper orders by month: Oct 2025 was 38 (the Diwali month). Other months had 3 to 8, rising to 8, 12 and 9 in Jul, Aug and Sep 2026.
- Other products that lifted most in Diwali week versus normal: Butterscotch cake 2.5 times, Rasmalai cake 2.4 times, Black forest cake 1.7 times. Plum cake did not lift (0.9 times).

Latest 3 months (Jul to Sep 2026) top by revenue: Chocolate truffle cake (Rs. 297,350), Rasmalai cake (Rs. 140,450), Black forest cake (Rs. 134,525).

## 3. Eggless share of cake orders, latest 3 months (Jul to Sep 2026)

- 247 of 712 cake orders were eggless, which is **34.7%**.
- By month: Jul 33.2%, Aug 35.8%, Sep 35.1%.
- Context: the full-year cake share is 33.5%, and Oct to Dec 2025 was 31.3%, so it is edging up.
- Eggless cake orders by product (Jul to Sep): Chocolate truffle 82, Black forest 57, Rasmalai 40, Red velvet 31, Butterscotch 26, Plum 11.
- The share across all categories over the full year: brownies 40.1%, cupcakes 33.0%, hampers 29.1%.
- How: filtered category == cake and date 1 Jul to 30 Sep 2026, counted eggless == yes.
- Survey support: 47 of 126 respondents (37%) asked for more eggless options. The hamper has the lowest eggless share (29.1%), so an eggless hamper option is worth considering.

## 4. Fastest-growing area

**OMR is the fastest-growing area by a wide margin.**
- Orders per quarter: Oct to Dec 2025 had 30, Jan to Mar 2026 had 53, Apr to Jun had 85, Jul to Sep had 119. That is nearly 4 times the first quarter (+297% orders, +355% revenue, Rs. 30,220 to Rs. 137,350).
- Latest 3 months versus the previous 3: OMR orders +40% (85 to 119) and revenue +76%. The next best was Anna Nagar at +19% orders (307 to 365).
- Other areas, Q3 versus Q4 orders: Anna Nagar +27%, Adyar +15%, Velachery +13%, T. Nagar +3%, Other -1%. T. Nagar fell 18% versus the previous quarter.
- OMR was still small in Diwali 2025: only 5 of 131 orders in the Diwali window.
- Anna Nagar is the largest area overall (1,219 orders of 3,448).
- Survey link: 25 of 33 OMR respondents said they gave up ordering because the Rs. 180 delivery charge is too high. In the orders file, OMR is charged Rs. 180 (264 orders) or Rs. 0 (23 orders). Other areas pay Rs. 60 (Anna Nagar) or Rs. 120. OMR is growing despite the highest delivery charge, so there is likely unmet demand.

## Other survey facts relevant to the launch

- 126 respondents: 81 existing customers and 45 non-customers who follow on Instagram.
- 64% would order more often if delivery took under 90 minutes.
- Only 9 respondents would pay more than Rs. 1,200 for a 1 kg celebration cake. The hamper at Rs. 1,600 already sold well in 2025, but price sensitivity is worth keeping in mind.
- 11 respondents work in OMR IT parks whose offices order desserts at least monthly. This is a possible corporate hamper angle.

## Caveats

- The survey and the orders data cover different periods and the survey has a small sample. Treat the survey as directional.
- The Diwali comparison rests on a single year, so one festival.
- Whether the amount includes delivery is not stated in the data. It was assumed to exclude it.
- The Diwali 2026 dates are not in the data. The launch timing should be set separately.
