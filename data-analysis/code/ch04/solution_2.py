import pandas as pd

products = pd.read_csv("../data/products.csv")
products["margin"] = 1 - products["unit_cost"] / products["list_price"]
print(
    products.sort_values("margin", ascending=False)[["product", "margin"]]
    .head(3)
    .round(3)
)
