import pandas as pd

orders = pd.read_csv("../data/orders.csv", parse_dates=["order_date"])

print(orders.shape)
print(list(orders.columns[:5]))
print(list(orders.columns[5:]))
print()
print(orders.head(3)[["order_id", "order_date", "product", "quantity"]])
print()
print(orders.dtypes)
