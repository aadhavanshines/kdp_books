import pandas as pd

air = pd.read_csv("../data/air_quality.csv", parse_dates=["date"])
visits = pd.read_csv("../data/clinic_visits.csv", parse_dates=["date"])
air["pm25"] = air.groupby("city")["pm25"].transform(
    lambda s: s.interpolate(limit=3)
)
df = air.merge(visits, on=["date", "city"]).sort_values(["city", "date"])
df["pm25_lag2"] = df.groupby("city")["pm25"].shift(2)

# WHO 2021 guideline for a 24-hour average: 15 micrograms per cubic meter
df["polluted"] = df["pm25_lag2"] > 15
rows = []
for city, g in df.dropna().groupby("city"):
    rows.append(
        {
            "city": city,
            "days >15": int(g["polluted"].sum()),
            "visits (clean)": round(
                g.loc[~g["polluted"], "visits"].mean(), 1
            ),
            "visits (polluted)": round(
                g.loc[g["polluted"], "visits"].mean(), 1
            ),
            "r (lag 2)": round(g["visits"].corr(g["pm25_lag2"]), 2),
        }
    )
print(pd.DataFrame(rows).set_index("city"))
