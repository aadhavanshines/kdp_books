import matplotlib.pyplot as plt
import pandas as pd

air = pd.read_csv("../data/air_quality.csv", parse_dates=["date"])
visits = pd.read_csv("../data/clinic_visits.csv", parse_dates=["date"])
df = air.merge(visits, on=["date", "city"]).query("city == 'Brightwater'")
weekly = df.set_index("date")[["pm25", "visits"]].resample("W").mean()

fig, (top, bottom) = plt.subplots(2, 1, figsize=(6.4, 3.8), sharex=True)
top.plot(weekly.index, weekly["pm25"])
top.axhline(15, color="C1", linestyle="--", label="WHO 24-hour guideline")
top.set_ylabel("PM2.5")
top.set_title("Brightwater, weekly averages")
top.legend()
bottom.plot(weekly.index, weekly["visits"], color="C2")
bottom.set_ylabel("Clinic visits")
fig.tight_layout()
fig.savefig("health_chart.png")
print("Saved health_chart.png")
