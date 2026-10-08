import json, os
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

os.makedirs("output", exist_ok=True)
d = pd.read_csv("data/orders.csv", parse_dates=["date"])
d["month"] = d.date.dt.strftime("%Y-%m")

# 1. monthly revenue (amount only)
monthly = d.groupby("month").amount.sum()
best = monthly.idxmax()

# 2. top products
prod = d.groupby("product").amount.sum().sort_values(ascending=False)
top5 = prod.head(5)

# 3. area growth: orders Oct-Dec 2025 vs Jul-Sep 2026
p1 = d[(d.date >= "2025-10-01") & (d.date <= "2025-12-31")]
p2 = d[(d.date >= "2026-07-01") & (d.date <= "2026-09-30")]
c1, c2 = p1.area.value_counts(), p2.area.value_counts()
areas = pd.DataFrame({"q4_2025": c1, "q3_2026": c2}).fillna(0)
areas["growth"] = (areas.q3_2026 / areas.q4_2025 - 1) * 100
areas = areas.sort_values("growth", ascending=False)

# 4. eggless share of cake orders
def eggless_share(x):
    c = x[x.category == "cake"]
    return (c.eggless == "yes").mean() * 100
egg1, egg2 = eggless_share(p1), eggless_share(p2)

# 5. rating by channel
rating = d.groupby("channel").rating.mean()

print(monthly, best, top5, areas, egg1, egg2, rating, sep="\n\n")

# charts
fig, ax = plt.subplots(figsize=(9, 4.5))
ax.bar(monthly.index, monthly.values / 1000, color="#c8794a")
ax.set_title("Monthly revenue (Rs. thousands)")
ax.set_ylabel("Rs. thousands")
plt.xticks(rotation=45)
plt.tight_layout(); plt.savefig("output/monthly-revenue.png", dpi=120); plt.close()

fig, ax = plt.subplots(figsize=(8, 4.5))
a = areas.sort_values("growth")
ax.barh(a.index, a.growth, color=["#4a8c5c" if g >= 0 else "#b5483a" for g in a.growth])
ax.set_title("Order growth: Oct-Dec 2025 to Jul-Sep 2026 (%)")
ax.set_xlabel("% change in number of orders")
plt.tight_layout(); plt.savefig("output/area-growth.png", dpi=120); plt.close()

fig, ax = plt.subplots(figsize=(9, 4.5))
t = top5.sort_values()
ax.barh(t.index, t.values / 1000, color="#8a5a44")
ax.set_title("Top 5 products by revenue (Rs. thousands)")
ax.set_xlabel("Rs. thousands")
plt.tight_layout(); plt.savefig("output/top-products.png", dpi=120); plt.close()

res = {
    "monthly_revenue": {k: int(v) for k, v in monthly.items()},
    "best_month": best,
    "top_products": list(top5.index),
    "top_products_revenue": {k: int(v) for k, v in top5.items()},
    "fastest_growing_area": areas.growth.idxmax(),
    "area_growth_percent": {k: round(float(v), 1) for k, v in areas.growth.items()},
    "area_orders": {k: [int(r.q4_2025), int(r.q3_2026)] for k, r in areas.iterrows()},
    "eggless_share_percent": {"oct_dec_2025": round(egg1, 1), "jul_sep_2026": round(egg2, 1)},
    "rating_by_channel": {k: round(float(v), 2) for k, v in rating.items()},
    "total_revenue": int(d.amount.sum()),
}
json.dump(res, open("output/answers.json", "w"), indent=1)
