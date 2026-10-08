import pandas as pd

d = pd.read_csv("data/orders.csv")
print(d.shape)
print(d.dtypes)
print(d.isna().sum())
print(d.order_id.duplicated().sum(), d.duplicated().sum())
for c in [
    "area",
    "product",
    "category",
    "eggless",
    "channel",
    "rating",
    "quantity",
]:
    print(d[c].value_counts(dropna=False).to_string())
print(d.amount.describe())
print(d.date.min(), d.date.max())
