import pandas as pd

orders = pd.read_csv("../data/orders.csv")


def shipping(row):
    """Free shipping over $100; otherwise $6, or $4 for app orders."""
    total = row["quantity"] * row["unit_price"]
    if total >= 100:
        return 0.0
    return 4.0 if row["channel"] == "app" else 6.0


slow = orders.apply(shipping, axis=1)  # calls Python once per row

total = orders["quantity"] * orders["unit_price"]
fast = (
    pd.Series(6.0, index=orders.index)
    .mask(orders["channel"] == "app", 4.0)
    .mask(total >= 100, 0.0)
)  # whole-column operations

print("same answer:", slow.equals(fast))
print("total shipping charged:", fast.sum())
