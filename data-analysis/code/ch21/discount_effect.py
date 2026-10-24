import pandas as pd

orders = pd.read_csv("../data/orders.csv")
customers = pd.read_csv("../data/customers.csv")
df = orders.merge(customers[["customer_id", "segment"]], on="customer_id")

table = df.pivot_table(
    index="discount", columns="segment", values="quantity", aggfunc="mean"
)
print("average items per order:")
print(table.round(2))
print()
print(df.groupby("discount").size().rename("orders"))
