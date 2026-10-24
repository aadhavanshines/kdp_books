import pandas as pd

raw = pd.read_csv("../data/orders_raw.csv")
clean = raw.drop_duplicates().copy()

clean["region"] = clean["region"].str.strip().str.title()
clean["unit_price"] = (
    clean["unit_price"].str.replace("$", "", regex=False).astype(float)
)
# Two date layouts: try each one explicitly, never guess
iso = pd.to_datetime(
    clean["order_date"], format="%Y-%m-%d", errors="coerce"
)
dmy = pd.to_datetime(
    clean["order_date"], format="%d/%m/%Y", errors="coerce"
)
clean["order_date"] = iso.fillna(dmy)
assert clean["order_date"].notna().all()

too_big = clean["quantity"] > 50
print("rows with an impossible quantity:", too_big.sum())
clean.loc[too_big, "quantity"] = None
clean["quantity"] = clean["quantity"].fillna(clean["quantity"].median())
clean["quantity"] = clean["quantity"].astype(int)

print("rows:", len(raw), "->", len(clean))
print("regions:", sorted(clean["region"].unique()))
print(clean.dtypes[["order_date", "quantity", "unit_price"]])
print(clean[["order_date", "region", "quantity", "unit_price"]].head(3))
