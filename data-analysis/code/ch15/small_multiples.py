import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pandas as pd

air = pd.read_csv("../data/air_quality.csv", parse_dates=["date"])
weekly = air.set_index("date").groupby("city")["pm25"].resample("W").mean()

cities = ["Avonford", "Brightwater", "Cedarvale"]
fig, axes = plt.subplots(1, 3, figsize=(6.4, 2.6), sharey=True)
for ax, city in zip(axes, cities):
    ax.plot(weekly[city].index, weekly[city])
    ax.set_title(city)
    ax.xaxis.set_major_locator(mdates.MonthLocator(bymonth=[1, 4, 7, 10]))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b"))
axes[0].set_ylabel("PM2.5, weekly average")
fig.tight_layout()
fig.savefig("small_multiples.png")
print("Saved small_multiples.png")
