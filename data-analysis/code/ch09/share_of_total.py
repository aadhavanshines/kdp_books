import pandas as pd

orders = pd.read_csv("../data/orders.csv")
orders["revenue"] = orders["quantity"] * orders["unit_price"]

sales = orders.groupby(["region", "category"], as_index=False)[
    "revenue"
].sum()
# transform returns one value per row, aligned with the original rows
sales["share"] = sales["revenue"] / sales.groupby("region")[
    "revenue"
].transform("sum")
top = sales.sort_values("share", ascending=False).groupby("region").head(1)
print(top.round({"revenue": 0, "share": 3}).to_string(index=False))
