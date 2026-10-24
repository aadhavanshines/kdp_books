import pandas as pd


def add_revenue(df):
    return df.assign(
        revenue=df["quantity"] * df["unit_price"] * (1 - df["discount"])
    )


summary = (
    pd.read_csv("../data/orders.csv", parse_dates=["order_date"])
    .pipe(add_revenue)
    .query("channel != 'marketplace'")
    .groupby(["region", "channel"], as_index=False)["revenue"]
    .sum()
    .sort_values("revenue", ascending=False)
    .head(4)
    .round(0)
)
print(summary.to_string(index=False))
