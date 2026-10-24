import pandas as pd

orders = pd.read_csv("../data/orders.csv")
orders["revenue"] = orders["quantity"] * orders["unit_price"]
by_region = orders.groupby("region")["revenue"].sum()

# Cheap checks that catch most wrong answers, from people or AI
assert abs(by_region.sum() - orders["revenue"].sum()) < 0.01, (
    "parts != whole"
)
assert len(by_region) == orders["region"].nunique(), "a region went missing"
assert (by_region > 0).all(), "a region has no revenue"
print("totals add up; all regions present and positive")
print(by_region.round(0).to_string())
