import matplotlib.pyplot as plt
import pandas as pd

orders = pd.read_csv("../data/orders.csv", parse_dates=["order_date"])
orders["revenue"] = (
    orders["quantity"] * orders["unit_price"] * (1 - orders["discount"])
)
monthly = orders.set_index("order_date")["revenue"].resample("MS").sum()
by_cat = orders.groupby("category")["revenue"].sum().sort_values()
by_channel = orders.groupby("channel")["revenue"].sum().sort_values()
weekday = orders.groupby(orders["order_date"].dt.dayofweek)["order_id"]
weekday = weekday.count() / 52

fig, axes = plt.subplots(2, 2, figsize=(6.4, 4.6))
axes[0, 0].plot(monthly.index.strftime("%b"), monthly / 1000, marker="o")
axes[0, 0].set_title("Revenue by month ($k)")
axes[0, 0].tick_params(axis="x", labelsize=7)
axes[0, 1].barh(by_cat.index, by_cat / 1000)
axes[0, 1].set_title("Revenue by category ($k)")
axes[1, 0].bar(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], weekday)
axes[1, 0].set_title("Orders per weekday")
axes[1, 1].barh(by_channel.index, by_channel / 1000)
axes[1, 1].set_title("Revenue by channel ($k)")
fig.tight_layout()
fig.savefig("dashboard.png")
print("Saved dashboard.png")
