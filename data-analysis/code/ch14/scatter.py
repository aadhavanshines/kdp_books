import matplotlib.pyplot as plt
import pandas as pd

air = pd.read_csv("../data/air_quality.csv", parse_dates=["date"])
visits = pd.read_csv("../data/clinic_visits.csv", parse_dates=["date"])
city = air.merge(visits, on=["date", "city"]).query("city == 'Brightwater'")

fig, ax = plt.subplots()
ax.scatter(city["pm25"], city["visits"], s=10, alpha=0.6)
ax.set_title("Brightwater: pollution and clinic visits on the same day")
ax.set_xlabel("PM2.5 (micrograms per cubic meter)")
ax.set_ylabel("Clinic visits")
fig.tight_layout()
fig.savefig("scatter.png")
print("Saved scatter.png")
