import pandas as pd

df = pd.read_csv("data/orders.csv")
print(df.shape)
print(df.dtypes)
print(df.isna().sum())
print(df.describe(include="all").T.to_string())
for c in [
    "area",
    "product",
    "category",
    "eggless",
    "channel",
    "rating",
    "quantity",
]:
    print(df[c].value_counts(dropna=False).to_string())
    print()
print(
    "dup ids",
    df.order_id.duplicated().sum(),
    "dup rows",
    df.duplicated().sum(),
)
d = pd.to_datetime(df.date, errors="coerce")
print("bad dates", d.isna().sum(), d.min(), d.max())
print(df[df.amount.astype(str).str.contains(r"[^0-9.]")].head())
