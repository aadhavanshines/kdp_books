import pandas as pd

orders = pd.read_csv("../data/orders.csv")
table = orders.pivot_table(
    index="region", columns="discount", values="order_id", aggfunc="count"
)
print(table)
