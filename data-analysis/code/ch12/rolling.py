import pandas as pd

orders = pd.read_csv("../data/orders.csv", parse_dates=["order_date"])
orders["revenue"] = orders["quantity"] * orders["unit_price"]
daily = orders.set_index("order_date")["revenue"].resample("D").sum()

week = daily.rolling(7).mean()  # average of each day and the 6 before
print(
    pd.DataFrame({"daily": daily, "7-day average": week})
    .loc["2025-11-24":"2025-11-30"]
    .round(0)
)
print(
    "best 7 days ended on",
    week.idxmax().date(),
    f"with ${week.max():,.0f} a day",
)
