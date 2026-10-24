import matplotlib.pyplot as plt
import pandas as pd

orders = pd.read_csv("../data/orders.csv", parse_dates=["order_date"])
orders["revenue"] = orders["quantity"] * orders["unit_price"]
monthly = (
    orders.set_index("order_date")
    .groupby("category")["revenue"]
    .resample("MS")
    .sum()
    .unstack(level=0)
)

fig, ax = plt.subplots()
for category in ["Bedding", "Lighting", "Garden"]:
    ax.plot(
        monthly.index, monthly[category] / 1000, marker="o", label=category
    )
ax.set_title("Monthly revenue, three categories")
ax.set_ylabel("Revenue ($ thousands)")
ax.legend()
fig.tight_layout()
fig.savefig("line_chart.png")
print("Saved line_chart.png")
