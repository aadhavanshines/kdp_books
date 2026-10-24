import numpy as np
import pandas as pd

sessions = pd.read_csv("../data/sessions.csv")
a = sessions.loc[sessions["variant"] == "A", "converted"].to_numpy()
b = sessions.loc[sessions["variant"] == "B", "converted"].to_numpy()

rng = np.random.default_rng(1)
diffs = np.empty(5_000)
for i in range(len(diffs)):
    diffs[i] = rng.choice(b, len(b)).mean() - rng.choice(a, len(a)).mean()

low, high = np.percentile(diffs, [2.5, 97.5])
print(f"difference in conversion rate: {b.mean() - a.mean():.4f}")
print(f"95% bootstrap interval: {low:.4f} to {high:.4f}")
print("interval excludes zero:", bool(low > 0 or high < 0))
