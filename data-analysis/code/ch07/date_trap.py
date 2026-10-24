import pandas as pd

dates = pd.Series(["05/01/2025", "2025-01-06", "2025-01-08"])

guessed = pd.to_datetime(dates, format="mixed", dayfirst=True)
print(guessed.dt.strftime("%d %b %Y").tolist())

iso = pd.to_datetime(dates, format="%Y-%m-%d", errors="coerce")
dmy = pd.to_datetime(dates, format="%d/%m/%Y", errors="coerce")
print(iso.fillna(dmy).dt.strftime("%d %b %Y").tolist())
