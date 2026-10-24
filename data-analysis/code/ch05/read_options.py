import pandas as pd

orders = pd.read_csv(
    "../data/orders.csv",
    usecols=["order_id", "order_date", "region", "category", "quantity"],
    parse_dates=["order_date"],
    dtype={"region": "category", "category": "category"},
)
orders.info()
