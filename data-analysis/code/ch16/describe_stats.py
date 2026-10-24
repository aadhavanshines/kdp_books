import pandas as pd

orders = pd.read_csv("../data/orders.csv")
value = orders["quantity"] * orders["unit_price"] * (1 - orders["discount"])

q1, q3 = value.quantile([0.25, 0.75])
print(f"mean     {value.mean():8.2f}")
print(f"median   {value.median():8.2f}")
print(f"std      {value.std():8.2f}")
print(f"IQR      {q3 - q1:8.2f}  (middle half: {q1:.0f} to {q3:.0f})")
print(f"skew     {value.skew():8.2f}  (positive: a long right tail)")
print(f"top 1%   {value.quantile(0.99):8.2f} and above")
