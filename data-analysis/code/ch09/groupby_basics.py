import pandas as pd

orders = pd.read_csv("../data/orders.csv")
orders["revenue"] = (
    orders["quantity"] * orders["unit_price"] * (1 - orders["discount"])
)

print(orders.groupby("region")["revenue"].sum().round(0))
print()
by_region = orders.groupby("region").agg(
    orders=("order_id", "count"),
    revenue=("revenue", "sum"),
    avg_order=("revenue", "mean"),
    customers=("customer_id", "nunique"),
)
print(by_region.round(1).sort_values("revenue", ascending=False))
