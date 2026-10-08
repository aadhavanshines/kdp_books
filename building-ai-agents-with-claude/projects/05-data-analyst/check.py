import pandas as pd
d = pd.read_csv("data/orders.csv")
print(d.shape)
print(d.isna().sum())
print(d.dtypes)
print("dup ids", d.order_id.duplicated().sum(), "dup rows", d.duplicated().sum())
for c in ["area", "product", "category", "eggless", "channel", "rating", "quantity"]:
    print(d[c].value_counts(dropna=False).to_string(), "\n")
print(d.amount.describe())
print(d.date.min(), d.date.max())
print(pd.to_datetime(d.date, errors="coerce").isna().sum())
