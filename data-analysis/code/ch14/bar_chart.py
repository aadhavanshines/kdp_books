import matplotlib.pyplot as plt
import pandas as pd

orders = pd.read_csv("../data/orders.csv")
orders["revenue"] = orders["quantity"] * orders["unit_price"]
by_region = orders.groupby("region")["revenue"].sum().sort_values()

fig, ax = plt.subplots(figsize=(6.4, 2.8))
bars = ax.barh(by_region.index, by_region / 1000)
ax.bar_label(bars, fmt="%.0fk", padding=3)
ax.set_title("Revenue by region, 2025")
ax.set_xlabel("Revenue ($ thousands)")
ax.grid(axis="y", visible=False)
fig.tight_layout()
fig.savefig("bar_chart.png")
print("Saved bar_chart.png")
