import pandas as pd

air = pd.read_csv("../data/air_quality.csv", parse_dates=["date"])
city = air[air["city"] == "Avonford"].set_index("date")["pm25"]
month = city.resample("MS").mean()
print("worst month:", month.idxmax().strftime("%B"), round(month.max(), 1))
print("best month:", month.idxmin().strftime("%B"), round(month.min(), 1))
