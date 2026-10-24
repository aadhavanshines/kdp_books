import pandas as pd

orders = pd.read_csv("../data/orders.csv", parse_dates=["order_date"])
orders["revenue"] = orders["quantity"] * orders["unit_price"]
daily = orders.set_index("order_date")["revenue"].resample("D").sum()

monthly = daily.resample("MS").sum()  # MS: month start labels
print((monthly / 1000).round(1).to_string())
print()
print("month-on-month change, last 3 months:")
print(monthly.pct_change().tail(3).round(3).to_string())
