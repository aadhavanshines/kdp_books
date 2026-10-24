import numpy as np
import pandas as pd

sessions = pd.read_csv("../data/sessions.csv")
mobile = sessions[sessions["device"] == "mobile"]
a = mobile.loc[mobile["variant"] == "A", "converted"].to_numpy()
b = mobile.loc[mobile["variant"] == "B", "converted"].to_numpy()
rng = np.random.default_rng(6)
diffs = [
    rng.choice(b, len(b)).mean() - rng.choice(a, len(a)).mean()
    for _ in range(5_000)
]
print(np.percentile(diffs, [2.5, 97.5]).round(4))
