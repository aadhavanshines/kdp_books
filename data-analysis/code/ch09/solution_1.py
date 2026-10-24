import pandas as pd

orders = pd.read_csv("../data/orders.csv")
best = orders.groupby(["category", "product"])["quantity"].sum()
print(best.groupby("category").idxmax().str[1])
