import pandas as pd

orders = pd.read_csv("../data/orders.csv")
orders["price_band"] = pd.cut(
    orders["unit_price"],
    bins=[0, 25, 50, 200],
    labels=["budget", "mid", "premium"],
)
print(orders["price_band"].value_counts().sort_index())
