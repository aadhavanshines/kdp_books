import pandas as pd

orders = pd.read_csv("../data/orders.csv")
customers = pd.read_csv("../data/customers.csv")
df = orders.merge(
    customers[["customer_id", "birth_year"]], on="customer_id"
)
df["age"] = 2025 - df["birth_year"]
print(df.groupby("category")["age"].median())
