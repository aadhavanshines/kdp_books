import pandas as pd

orders = pd.read_csv("../data/orders.csv", index_col="order_id")

print(orders["product"].head(3))  # one column: a Series
print(orders[["product", "quantity"]].head(3))  # a list: a DataFrame
print(orders.loc["L00010", "product"])  # row and column labels
print(orders.loc["L00010":"L00012", ["region", "quantity"]])  # label slice
print(orders.iloc[0, :3].tolist())  # positions
