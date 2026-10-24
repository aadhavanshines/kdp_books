import numpy as np
import pandas as pd

sessions = pd.read_csv("../data/sessions.csv")
a = sessions.loc[sessions["variant"] == "A", "revenue"].to_numpy()
b = sessions.loc[sessions["variant"] == "B", "revenue"].to_numpy()

rng = np.random.default_rng(4)
diffs = [
    rng.choice(b, len(b)).mean() - rng.choice(a, len(a)).mean()
    for _ in range(5_000)
]
low, high = np.percentile(diffs, [2.5, 97.5])
print(f"revenue per session: A ${a.mean():.3f}, B ${b.mean():.3f}")
print(
    f"difference ${b.mean() - a.mean():.3f}, "
    f"95% interval ${low:.3f} to ${high:.3f}"
)
monthly_sessions = 600_000
print(
    f"at {monthly_sessions:,} sessions a month: "
    f"${low * monthly_sessions:,.0f} to ${high * monthly_sessions:,.0f}"
)
