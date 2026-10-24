import pandas as pd

sessions = pd.read_csv("../data/sessions.csv", parse_dates=["date"])
weekly = sessions.set_index("date")["converted"].resample("W").mean()
print(weekly.round(4))
