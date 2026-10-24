import pandas as pd

raw = pd.read_csv("../data/orders_raw.csv")
dupes = raw[raw.duplicated(keep=False)]
print(dupes[["order_id", "product", "quantity"]].sort_values("order_id"))
