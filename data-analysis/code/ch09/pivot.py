import pandas as pd

orders = pd.read_csv("../data/orders.csv", parse_dates=["order_date"])
orders["revenue"] = orders["quantity"] * orders["unit_price"]
orders["quarter"] = orders["order_date"].dt.quarter

table = orders.pivot_table(
    index="category",
    columns="quarter",
    values="revenue",
    aggfunc="sum",
    margins=True,
    margins_name="Total",
)
print((table / 1000).round(1))  # thousands of dollars
print()
print(
    pd.crosstab(
        orders["region"], orders["channel"], normalize="index"
    ).round(2)
)
