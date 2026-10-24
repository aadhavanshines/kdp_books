import numpy as np
import pandas as pd

sessions = pd.read_csv("../data/sessions.csv")
converted = sessions["converted"].to_numpy()
is_b = (sessions["variant"] == "B").to_numpy()
observed = converted[is_b].mean() - converted[~is_b].mean()

rng = np.random.default_rng(2)
count = 0
trials = 5_000
for _ in range(trials):
    shuffled = rng.permutation(is_b)  # pretend the labels mean nothing
    diff = converted[shuffled].mean() - converted[~shuffled].mean()
    count += abs(diff) >= abs(observed)

print(f"observed difference: {observed:.4f}")
print(f"p-value: {count / trials:.3f}")
