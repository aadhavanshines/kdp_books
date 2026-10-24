import pandas as pd

orders = pd.read_csv("../data/orders.csv")
lamps = orders[
    orders["product"].str.contains("Lamp") & (orders["discount"] == 0)
]
print(len(lamps))
print(lamps["product"].value_counts())
