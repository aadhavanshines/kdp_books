import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

sessions = pd.read_csv("../data/sessions.csv")
rng = np.random.default_rng(5)

fig, ax = plt.subplots(figsize=(6.4, 2.8))
labels, rates, errors = [], [], []
for device in ["desktop", "mobile"]:
    for variant in ["A", "B"]:
        x = sessions.query("device == @device and variant == @variant")
        x = x["converted"].to_numpy()
        boot = [rng.choice(x, len(x)).mean() for _ in range(2_000)]
        low, high = np.percentile(boot, [2.5, 97.5])
        labels.append(f"{device} {variant}")
        rates.append(x.mean() * 100)
        errors.append([(x.mean() - low) * 100, (high - x.mean()) * 100])
ax.errorbar(rates, labels, xerr=np.array(errors).T, fmt="o", capsize=4)
ax.set_xlabel("Conversion rate (%), with 95% intervals")
ax.set_title("Checkout test: conversion by device and variant")
ax.invert_yaxis()
fig.tight_layout()
fig.savefig("ab_chart.png")
print("Saved ab_chart.png")
