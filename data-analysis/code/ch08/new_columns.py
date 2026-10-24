import numpy as np
import pandas as pd

orders = pd.read_csv("../data/orders.csv", parse_dates=["order_date"])

orders["revenue"] = (
    orders["quantity"] * orders["unit_price"] * (1 - orders["discount"])
)
orders = orders.assign(
    month=orders["order_date"].dt.month,
    weekend=orders["order_date"].dt.dayofweek >= 5,
)
orders["size"] = np.select(
    [orders["revenue"] < 30, orders["revenue"] < 100],
    ["small", "medium"],
    default="large",
)
orders["channel"] = orders["channel"].map(
    {"web": "Website", "app": "Mobile app", "marketplace": "Marketplace"}
)
cols = ["order_id", "revenue", "month", "weekend", "size", "channel"]
print(orders[cols].head(4))
print(orders["size"].value_counts())
