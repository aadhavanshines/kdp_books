import pandas as pd

orders = pd.read_csv("../data/orders.csv")

print(orders[["quantity", "unit_price", "discount"]].describe().round(2))
print()
print(orders["channel"].value_counts())
print()
print(orders["category"].value_counts(normalize=True).round(3))
