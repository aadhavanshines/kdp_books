import matplotlib.pyplot as plt
import pandas as pd

orders = pd.read_csv("../data/orders.csv")
value = orders["quantity"] * orders["unit_price"] * (1 - orders["discount"])

fig, ax = plt.subplots()
ax.hist(value, bins=range(0, 620, 20), edgecolor="white")
ax.axvline(
    value.median(),
    color="C1",
    linestyle="--",
    label=f"median ${value.median():.0f}",
)
ax.axvline(
    value.mean(),
    color="C2",
    linestyle=":",
    label=f"mean ${value.mean():.0f}",
)
ax.set_title("How much each order is worth")
ax.set_xlabel("Order value ($)")
ax.set_ylabel("Number of orders")
ax.legend()
fig.tight_layout()
fig.savefig("histogram.png")
print("Saved histogram.png")
