import pandas as pd

orders = pd.read_csv("../data/orders.csv", parse_dates=["order_date"])

checks = {
    "order IDs are unique": orders["order_id"].is_unique,
    "no missing values": orders.notna().all().all(),
    "quantities between 1 and 20": orders["quantity"].between(1, 20).all(),
    "prices are positive": (orders["unit_price"] > 0).all(),
    "dates are in 2025": (orders["order_date"].dt.year == 2025).all(),
    "known regions only": orders["region"]
    .isin(["North", "South", "East", "West"])
    .all(),
}
for name, passed in checks.items():
    print(f"{'PASS' if passed else 'FAIL'}  {name}")
