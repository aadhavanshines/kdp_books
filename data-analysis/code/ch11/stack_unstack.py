import pandas as pd

orders = pd.read_csv("../data/orders.csv")
units = orders.groupby(["region", "channel"])["quantity"].sum()
print(units.head(4))  # a Series with a two-level index
print(units.unstack())  # inner level becomes columns
print(units.unstack().stack().equals(units))
