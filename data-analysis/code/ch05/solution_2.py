import pandas as pd

orders = pd.read_csv("../data/orders.csv")
for region, group in orders.groupby("region"):
    group.to_csv(f"orders_{region.lower()}.csv", index=False)
    print(f"orders_{region.lower()}.csv: {len(group)} rows")
