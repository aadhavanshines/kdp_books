import pandas as pd

orders = pd.read_csv("../data/orders.csv", parse_dates=["order_date"])
orders["revenue"] = (
    orders["quantity"] * orders["unit_price"] * (1 - orders["discount"])
)

per_customer = orders.groupby("customer_id").agg(
    orders=("order_id", "count"), revenue=("revenue", "sum")
)
print("customers who ordered:", len(per_customer))
print(
    "ordered more than once:", (per_customer["orders"] > 1).mean().round(3)
)
print()

ranked = per_customer["revenue"].sort_values(ascending=False)
top_fifth = ranked.head(len(ranked) // 5).sum() / ranked.sum()
print(f"top 20% of customers bring {top_fifth:.0%} of revenue")
print()

first = orders.groupby("customer_id")["order_date"].transform("min")
orders["new_or_returning"] = (orders["order_date"] == first).map(
    {True: "new", False: "returning"}
)
mix = (
    orders.groupby([orders["order_date"].dt.quarter, "new_or_returning"])[
        "revenue"
    ]
    .sum()
    .unstack()
)
print((mix.div(mix.sum(axis=1), axis=0)).round(2))
