import matplotlib.pyplot as plt
import pandas as pd

budget = pd.read_csv("../data/budget.csv", parse_dates=["date"])
budget = budget[budget["amount"] < 0]
rules = {
    "Housing": r"RENT|POWER",
    "Groceries": r"FRESHMART",
    "Coffee": r"CAFE",
    "Transport": r"TRANSIT|RIDESHARE",
}
budget["category"] = "Other"
for name, pattern in rules.items():
    budget.loc[budget["description"].str.contains(pattern), "category"] = (
        name
    )
monthly = (
    budget.pivot_table(
        index=budget["date"].dt.strftime("%m"),
        columns="category",
        values="amount",
        aggfunc="sum",
    )
    .mul(-1)
    .fillna(0)
)
monthly = monthly[["Housing", "Groceries", "Other", "Coffee", "Transport"]]

fig, ax = plt.subplots()
monthly.plot.bar(stacked=True, ax=ax, width=0.8)
ax.set_xticklabels(
    [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ],
    rotation=0,
)
ax.set_xlabel("")
ax.set_ylabel("Spending ($)")
ax.set_title("Where the money went, month by month")
ax.legend(
    ncol=5, fontsize=7, loc="upper center", bbox_to_anchor=(0.5, -0.1)
)
fig.tight_layout()
fig.savefig("budget_chart.png")
print("Saved budget_chart.png")
