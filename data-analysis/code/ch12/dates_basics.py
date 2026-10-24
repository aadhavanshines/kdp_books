import pandas as pd

orders = pd.read_csv("../data/orders.csv", parse_dates=["order_date"])
d = orders["order_date"]

print(d.min().date(), "to", d.max().date())
print(
    orders.assign(
        weekday=d.dt.day_name(),
        month=d.dt.month_name(),
        week=d.dt.isocalendar().week,
    )[["order_date", "weekday", "month", "week"]].head(3)
)

by_day = orders.groupby(d.dt.day_name())["order_id"].count()
order = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]
print(by_day.reindex(order))
