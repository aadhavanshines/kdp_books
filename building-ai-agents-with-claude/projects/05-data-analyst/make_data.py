"""Create data/orders.csv: one year of made-up orders for Amudha's Home Bakes.

The numbers are random but realistic: steady growth, a Diwali and Christmas rush,
and OMR orders growing fastest. A fixed seed makes the file the same every time.
"""
import csv
import random
from datetime import date, timedelta
from pathlib import Path

rnd = random.Random(2026)
PRODUCTS = [  # name, category, price per unit, unit
    ("Chocolate truffle cake", "cake", 950, "kg"), ("Black forest cake", "cake", 850, "kg"),
    ("Rasmalai cake", "cake", 1150, "kg"), ("Red velvet cake", "cake", 1050, "kg"),
    ("Butterscotch cake", "cake", 800, "kg"), ("Walnut brownies (box of 6)", "brownies", 420, "box"),
    ("Classic brownies (box of 6)", "brownies", 360, "box"), ("Assorted cupcakes (6)", "cupcakes", 450, "box"),
    ("Plum cake", "cake", 700, "kg"), ("Festive hamper", "hamper", 1600, "box"),
]
WEIGHTS = [22, 14, 10, 9, 8, 9, 8, 9, 3, 2]
AREAS = ["Anna Nagar", "Velachery", "OMR", "Adyar", "T. Nagar", "Other"]
CHANNELS = ["Instagram", "WhatsApp", "Website", "Walk-in"]
DELIVERY = {"Anna Nagar": 60, "T. Nagar": 120, "Adyar": 120, "Velachery": 120, "OMR": 180, "Other": 120}


def daily_orders(d, i):
    base = 6 + i * 0.012                                   # slow, steady growth
    if d.weekday() >= 5:
        base *= 1.6                                        # weekends are busier
    if date(2025, 10, 14) <= d <= date(2025, 10, 21):
        base *= 2.4                                        # Diwali 2025 (20 October)
    if date(2025, 12, 18) <= d <= date(2025, 12, 25):
        base *= 1.9                                        # Christmas plum cakes
    return max(0, int(rnd.gauss(base, 1.5)))


def main():
    rows, n = [], 0
    start = date(2025, 10, 1)
    for i in range(365):
        d = start + timedelta(days=i)
        for _ in range(daily_orders(d, i)):
            n += 1
            weights = list(WEIGHTS)
            if date(2025, 12, 10) <= d <= date(2025, 12, 31):
                weights[8] = 30                            # plum cake season
            if date(2025, 10, 10) <= d <= date(2025, 10, 22):
                weights[9] = 25                            # Diwali hampers
            name, cat, price, unit = rnd.choices(PRODUCTS, weights)[0]
            omr_share = 0.03 + 0.09 * i / 365              # OMR grows over the year
            area = rnd.choices(AREAS, [30, 18, omr_share * 100, 12, 10, 8])[0]
            qty = rnd.choice([0.5, 1, 1, 1, 1.5, 2]) if unit == "kg" else rnd.choice([1, 1, 2])
            eggless = rnd.random() < (0.28 + 0.12 * i / 365)
            amount = round(price * qty + (50 * qty if eggless and cat == "cake" else 0))
            channel = rnd.choices(CHANNELS, [45, 30, 15, 10])[0]
            delivery = 0 if channel == "Walk-in" else DELIVERY[area]
            rating = rnd.choices([5, 4, 3, 2, 1], [62, 26, 7, 3, 2])[0]
            rows.append([f"CB-{n:05d}", d.isoformat(), area, name, cat, "yes" if eggless else "no",
                         qty, amount, delivery, channel, rating])
    path = Path(__file__).parent / "data" / "orders.csv"
    with path.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["order_id", "date", "area", "product", "category", "eggless", "quantity",
                    "amount", "delivery_charge", "channel", "rating"])
        w.writerows(rows)
    print(f"{len(rows)} orders written to {path}")


if __name__ == "__main__":
    main()
