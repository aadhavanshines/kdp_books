import pandas as pd

raw = pd.read_csv("../data/orders_raw.csv")

print(raw.dtypes)
print()
print("missing values per column:")
print(raw.isna().sum()[raw.isna().sum() > 0])
print()
print("region spellings:")
print(raw["region"].value_counts().sort_index())
print("duplicate rows:", raw.duplicated().sum())
print("first prices:", raw["unit_price"].head(3).tolist())
print("first dates:", raw["order_date"].head(3).tolist())
