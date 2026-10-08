import json, os
from fractions import Fraction

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(base, "data", "hamper-costs.json")))
items = d["items"]

def price_for(cost):
    min_p = Fraction(cost) / Fraction(6, 10)
    p = int(min_p)
    if p < min_p:
        p += 1
    while p % 100 not in (49, 99):
        p += 1
    return min_p, p

rows = []
for name, parts in d["hampers"].items():
    cost = sum(items[i] for i in parts)
    min_p, p = price_for(cost)
    margin = (p - cost) / p * 100
    assert margin >= 40
    rows.append((name, parts, cost, min_p, p, margin))

lines = ["# Diwali hamper pricing", "",
         "Rule: price >= cost / 0.6 (at least 40% margin), rounded up to the next amount ending in 49 or 99. Amounts in rupees.", "",
         "| Hamper | Items | Cost | Minimum price (cost/0.6) | Price | Margin |",
         "|---|---|---|---|---|---|"]
for name, parts, cost, min_p, p, m in rows:
    lines.append(f"| {name} | {'; '.join(parts)} | {cost} | {float(min_p):.2f} | {p} | {m:.1f}% |")
out = os.path.join(base, "launch-kit", "pricing.md")
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, "w").write("\n".join(lines) + "\n")
print("\n".join(lines))
