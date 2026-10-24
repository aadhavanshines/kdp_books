import pandas as pd

orders = pd.read_csv("../data/orders.csv")
orders["revenue"] = (
    orders["quantity"] * orders["unit_price"] * (1 - orders["discount"])
)

print(f"Orders: {len(orders):,}")
print(f"Revenue: ${orders['revenue'].sum():,.2f}")
print()
print("Revenue by category:")
print(orders.groupby("category")["revenue"].sum().sort_values().round(2))
