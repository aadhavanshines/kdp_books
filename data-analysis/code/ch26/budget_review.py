import pandas as pd

budget = pd.read_csv("../data/budget.csv", parse_dates=["date"])
rules = {
    "Income": r"SALARY",
    "Housing": r"RENT|POWER",
    "Groceries": r"FRESHMART",
    "Coffee": r"CAFE",
    "Transport": r"TRANSIT|RIDESHARE",
    "Shopping": r"ONLINE STORE",
    "Subscriptions": r"SUBSCRIPTION",
}
budget["category"] = "Other"
for name, pattern in rules.items():
    budget.loc[budget["description"].str.contains(pattern), "category"] = (
        name
    )

income = budget.loc[budget["amount"] > 0, "amount"].sum()
spending = -budget.loc[budget["amount"] < 0, "amount"].sum()
print(
    f"income ${income:,.2f}, spending ${spending:,.2f}, "
    f"saved {1 - spending / income:.1%}"
)
print()
monthly = (
    budget[budget["amount"] < 0]
    .pivot_table(
        index=budget["date"].dt.month,
        columns="category",
        values="amount",
        aggfunc="sum",
    )
    .mul(-1)
    .fillna(0)
)
print(
    monthly.mean()
    .sort_values(ascending=False)
    .round(2)
    .rename("average per month")
)
