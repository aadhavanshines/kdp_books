import json, math
from fractions import Fraction

with open("data/hamper-costs.json") as f:
    d = json.load(f)

def round_up(p):
    # smallest integer >= p whose last two digits are 49 or 99
    n = math.ceil(p)
    while n % 100 not in (49, 99):
        n += 1
    return n

lines = ["# Diwali 2026 Hamper Pricing", "",
         "Rule: price >= cost / 0.6, rounded up to the next amount ending in 49 or 99. Amounts in rupees.", "",
         "| Hamper | Items | Cost | Price | Margin |",
         "|---|---|---|---|---|"]
for name, items in d["hampers"].items():
    cost = sum(d["items"][i] for i in items)
    price = round_up(Fraction(cost) / Fraction(6, 10))
    margin = (price - cost) / price * 100
    assert margin >= 40
    lines.append(f"| {name} | {'; '.join(items)} | {cost} | {price} | {margin:.1f}% (Rs {price-cost}) |")
    print(name, cost, price, f"{margin:.1f}%")

with open("launch-kit/pricing.md", "w") as f:
    f.write("\n".join(lines) + "\n")
