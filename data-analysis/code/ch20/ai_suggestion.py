import pandas as pd

orders = pd.read_csv("../data/orders.csv")
orders["revenue"] = orders["quantity"] * orders["unit_price"]

# Suggested by an AI assistant for "average order value by region":
per_customer = orders.groupby(["region", "customer_id"])["revenue"].mean()
suggested = per_customer.groupby("region").mean()

# What the question actually asks: total revenue / number of orders
correct = (
    orders.groupby("region")["revenue"].sum()
    / orders.groupby("region")["order_id"].count()
)

print(pd.DataFrame({"suggested": suggested, "correct": correct}).round(2))
