import pandas as pd

orders = pd.read_csv("../data/orders.csv")
customers = pd.read_csv("../data/customers.csv")
check = customers.merge(
    orders[["customer_id"]].drop_duplicates(),
    on="customer_id",
    how="left",
    indicator=True,
)
never = check[check["_merge"] == "left_only"]
print("customers with no orders:", len(never))
print(never["customer_id"].head().tolist())
