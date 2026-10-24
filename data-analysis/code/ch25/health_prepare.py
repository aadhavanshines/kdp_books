import pandas as pd

air = pd.read_csv("../data/air_quality.csv", parse_dates=["date"])
visits = pd.read_csv("../data/clinic_visits.csv", parse_dates=["date"])

missing = air["pm25"].isna().groupby(air["city"]).sum()
print("missing PM2.5 readings:", missing.to_dict())

# Fill short sensor gaps (up to 3 days) from the neighboring days
air["pm25"] = air.groupby("city")["pm25"].transform(
    lambda s: s.interpolate(limit=3)
)
df = air.merge(visits, on=["date", "city"], validate="one_to_one")
print("rows:", len(df), "| still missing:", df["pm25"].isna().sum())

df["quarter"] = df["date"].dt.quarter
print(
    df.pivot_table(index="city", columns="quarter", values="pm25").round(1)
)
