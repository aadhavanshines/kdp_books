import pandas as pd

orders = pd.read_csv("../data/orders.csv")
orders["revenue"] = orders["quantity"] * orders["unit_price"]

cols = ["order_id", "product", "quantity", "revenue"]
print(orders.sort_values("revenue", ascending=False)[cols].head(3))
print(orders.nlargest(3, "quantity")[cols])
print(
    orders.sort_values(["region", "revenue"], ascending=[True, False])
    .groupby("region")
    .head(1)[["region"] + cols[1:]]
)
