import pandas as pd

orders = pd.read_csv("../data/orders.csv", parse_dates=["order_date"])

big = orders[orders["quantity"] >= 5]
print("orders of 5 or more items:", len(big))

west_lamps = orders[
    (orders["region"] == "West") & (orders["category"] == "Lighting")
]
print("West lighting orders:", len(west_lamps))

promo = orders[orders["discount"].isin([0.1, 0.2])]
print("discounted orders:", len(promo))

december = orders[orders["order_date"].between("2025-12-01", "2025-12-31")]
print("December orders:", len(december))

print(
    orders.query("channel == 'app' and quantity > 4")[
        ["order_id", "product", "quantity"]
    ].head(3)
)
