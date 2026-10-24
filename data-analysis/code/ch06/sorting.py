import pandas as pd

orders = pd.read_csv("../data/orders.csv")
orders["revenue"] = orders["quantity"] * orders["unit_price"]

cols = ["order_id", "product", "quantity", "revenue"]
# Ties at the top are broken by order_id, so the result never varies
top = orders.sort_values(["revenue", "order_id"], ascending=[False, True])
print(top[cols].head(3))
print(orders.nlargest(3, "quantity")[cols])
print(
    orders.sort_values(["region", "revenue"], ascending=[True, False])
    .groupby("region")
    .head(1)[["region"] + cols[1:]]
)
