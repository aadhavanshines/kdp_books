import pandas as pd

orders = pd.read_csv("../data/orders.csv")
products = pd.read_csv("../data/products.csv")
customers = pd.read_csv("../data/customers.csv")

full = orders.merge(
    products[["product", "unit_cost"]],
    on="product",
    how="left",
    validate="many_to_one",
).merge(
    customers[["customer_id", "segment"]],
    on="customer_id",
    how="left",
    validate="many_to_one",
)
full["revenue"] = (
    full["quantity"] * full["unit_price"] * (1 - full["discount"])
)
full["profit"] = full["revenue"] - full["quantity"] * full["unit_cost"]

print(full.shape)
summary = full.groupby("segment")[["revenue", "profit"]].sum()
summary["margin"] = summary["profit"] / summary["revenue"]
print(summary.round(2))
