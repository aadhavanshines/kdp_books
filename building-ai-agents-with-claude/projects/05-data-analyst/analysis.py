import json, os
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

os.makedirs("output", exist_ok=True)
df = pd.read_csv("data/orders.csv", parse_dates=["date"])


def rs(n):
    s = str(int(round(n)))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        parts = []
        while len(head) > 2:
            parts.insert(0, head[-2:]); head = head[:-2]
        if head:
            parts.insert(0, head)
        s = ",".join(parts + [tail])
    return "Rs. " + s


# 1 monthly revenue
df["month"] = df.date.dt.strftime("%Y-%m")
monthly = df.groupby("month").amount.sum()
best_month = monthly.idxmax()

# 2 top products
prod = df.groupby("product").amount.sum().sort_values(ascending=False)
top5 = prod.head(5)

# 3 area growth
q1 = df[(df.date >= "2025-10-01") & (df.date <= "2025-12-31")].groupby("area").size()
q4 = df[(df.date >= "2026-07-01") & (df.date <= "2026-09-30")].groupby("area").size()
growth = ((q4 - q1) / q1 * 100).round(1).sort_values(ascending=False)
fastest = growth.idxmax()

# 4 eggless share of cake orders
cakes = df[df.category == "cake"]
def egg(a, b):
    c = cakes[(cakes.date >= a) & (cakes.date <= b)]
    return round((c.eggless == "yes").mean() * 100, 1), len(c)
e1, n1 = egg("2025-10-01", "2025-12-31")
e2, n2 = egg("2026-07-01", "2026-09-30")

# 5 rating by channel
rating = df.groupby("channel").rating.mean().round(2)

print(monthly, best_month, top5, q1, q4, growth, (e1, n1), (e2, n2), rating, sep="\n")

# charts
fig, ax = plt.subplots(figsize=(9, 4.5))
ax.bar(monthly.index, monthly.values / 1000, color="#c2185b")
ax.set_ylabel("Revenue (Rs. thousands)"); ax.set_title("Monthly revenue")
plt.xticks(rotation=45); plt.tight_layout(); fig.savefig("output/monthly-revenue.png", dpi=120); plt.close()

fig, ax = plt.subplots(figsize=(8, 4.5))
g = growth.sort_values()
ax.barh(g.index, g.values, color=["#2e7d32" if v >= 0 else "#c62828" for v in g.values])
ax.set_xlabel("Change in orders, Oct-Dec 2025 to Jul-Sep 2026 (%)"); ax.set_title("Order growth by area")
plt.tight_layout(); fig.savefig("output/area-growth.png", dpi=120); plt.close()

fig, ax = plt.subplots(figsize=(9, 4.5))
t = top5.sort_values()
ax.barh(t.index, t.values / 1000, color="#ef6c00")
ax.set_xlabel("Revenue (Rs. thousands)"); ax.set_title("Top 5 products by revenue")
plt.tight_layout(); fig.savefig("output/top-products.png", dpi=120); plt.close()

answers = {
    "monthly_revenue": {k: int(v) for k, v in monthly.items()},
    "best_month": best_month,
    "top_products": list(top5.index),
    "fastest_growing_area": fastest,
    "area_growth_percent": {k: float(v) for k, v in growth.items()},
    "eggless_share_percent": {"oct_dec_2025": e1, "jul_sep_2026": e2},
    "rating_by_channel": {k: float(v) for k, v in rating.items()},
}
json.dump(answers, open("output/answers.json", "w"), indent=2)

# report
months_tbl = "\n".join(f"| {m} | {rs(v)} |" for m, v in monthly.items())
prod_lines = "\n".join(f"{i+1}. {p} – {rs(v)}" for i, (p, v) in enumerate(top5.items()))
area_lines = "\n".join(f"- {a}: {q1[a]} → {q4[a]} orders ({v:+.1f}%)" for a, v in growth.items())
rate_lines = "\n".join(f"- {c}: {v:.2f}" for c, v in rating.sort_values(ascending=False).items())
report = f"""# Amudha's Home Bakes – Year in Review (Oct 2025 – Sep 2026)

Total revenue for the year: **{rs(df.amount.sum())}** from {len(df):,} orders (delivery charges not included).

## Monthly revenue
Best month: **{best_month}** with {rs(monthly.max())}.

| Month | Revenue |
|---|---|
{months_tbl}

![Monthly revenue](monthly-revenue.png)

## Top 5 products by revenue
{prod_lines}

![Top products](top-products.png)

## Which area is growing fastest?
Orders in Oct–Dec 2025 compared with Jul–Sep 2026:

{area_lines}

**{fastest}** grew fastest ({growth[fastest]:+.1f}%).

![Area growth](area-growth.png)

## Eggless cakes
Eggless share of cake orders: **{e1}%** in Oct–Dec 2025 ({n1} cake orders) vs **{e2}%** in Jul–Sep 2026 ({n2} cake orders).

## Customer ratings by channel (average out of 5)
{rate_lines}

## Three suggestions
1. **SUGGEST1**
2. **SUGGEST2**
3. **SUGGEST3**
"""
open("output/report.md", "w").write(report)
