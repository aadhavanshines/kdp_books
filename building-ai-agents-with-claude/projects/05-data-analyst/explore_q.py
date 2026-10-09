import pandas as pd
df = pd.read_csv("data/orders.csv")
print(df.shape); print(df.dtypes); print(df.isna().sum())
print(df.order_id.duplicated().sum(), df.duplicated().sum())
for c in ["area","product","category","eggless","channel","rating","quantity"]:
    print(df[c].value_counts(dropna=False).to_string())
print(df.date.min(), df.date.max())
print(df.amount.describe())
