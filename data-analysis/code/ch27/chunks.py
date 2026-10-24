import pandas as pd

totals = {}
for chunk in pd.read_csv("../data/sessions.csv", chunksize=5_000):
    part = chunk.groupby("variant")["revenue"].sum()
    for variant, revenue in part.items():
        totals[variant] = totals.get(variant, 0) + revenue
    print(f"read {len(chunk):,} rows; running total A {totals['A']:,.2f}")

whole = pd.read_csv("../data/sessions.csv").groupby("variant")["revenue"]
print(
    "same as reading it all at once:",
    all(abs(totals[v] - s) < 0.01 for v, s in whole.sum().items()),
)
