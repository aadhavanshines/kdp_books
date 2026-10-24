import pandas as pd

sessions = pd.read_csv("../data/sessions.csv")

summary = sessions.groupby("variant").agg(
    sessions=("session", "count"),
    conversions=("converted", "sum"),
    revenue=("revenue", "sum"),
)
summary["rate"] = summary["conversions"] / summary["sessions"]
summary["revenue_per_session"] = summary["revenue"] / summary["sessions"]
print(summary.round(4))
lift = summary.loc["B", "rate"] / summary.loc["A", "rate"] - 1
print(f"B converts {lift:.1%} better than A")
