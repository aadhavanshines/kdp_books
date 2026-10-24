import numpy as np
import pandas as pd

sessions = pd.read_csv("../data/sessions.csv")

# 1. Sample ratio: did the split really give each variant about half?
counts = sessions["variant"].value_counts()
rng = np.random.default_rng(3)
fair = rng.binomial(len(sessions), 0.5, 10_000)
gap = abs(counts["A"] - len(sessions) / 2)
p = (abs(fair - len(sessions) / 2) >= gap).mean()
print(counts.to_string())
print(f"split p-value: {p:.2f}")
print()

# 2. Is the effect the same on desktop and mobile?
rates = sessions.pivot_table(
    index="device", columns="variant", values="converted", aggfunc="mean"
)
rates["lift"] = rates["B"] / rates["A"] - 1
print(rates.round(4))
