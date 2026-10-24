import pandas as pd

orders = pd.read_csv("../data/orders.csv", parse_dates=["order_date"])
products = pd.read_csv("../data/products.csv")
df = orders.merge(
    products[["product", "unit_cost"]], on="product", validate="many_to_one"
)
df["revenue"] = df["quantity"] * df["unit_price"] * (1 - df["discount"])
df["profit"] = df["revenue"] - df["quantity"] * df["unit_cost"]

print(
    f"Revenue ${df['revenue'].sum():,.0f}, "
    f"profit ${df['profit'].sum():,.0f} "
    f"({df['profit'].sum() / df['revenue'].sum():.1%} margin)"
)
print()

h1 = df["order_date"].dt.month <= 6
growth = (
    df[~h1].groupby("category")["revenue"].sum()
    / df[h1].groupby("category")["revenue"].sum()
    - 1
)
cats = df.groupby("category").agg(
    revenue=("revenue", "sum"), profit=("profit", "sum")
)
cats["margin"] = cats["profit"] / cats["revenue"]
cats["H2 vs H1"] = growth
print(
    cats.sort_values("revenue", ascending=False).round(
        {"revenue": 0, "profit": 0, "margin": 3, "H2 vs H1": 3}
    )
)
