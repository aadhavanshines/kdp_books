import pandas as pd

air = pd.read_csv("../data/air_quality.csv", parse_dates=["date"])
visits = pd.read_csv("../data/clinic_visits.csv", parse_dates=["date"])
city = (
    air.merge(visits, on=["date", "city"])
    .query("city == 'Brightwater'")
    .set_index("date")
)

for lag in range(5):
    r = city["visits"].corr(city["pm25"].shift(lag))
    print(f"pollution {lag} days earlier: r = {r:.2f}")
