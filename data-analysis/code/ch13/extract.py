import pandas as pd

budget = pd.read_csv("../data/budget.csv")

budget["store_no"] = budget["description"].str.extract(r"#(\d+)")
rules = {
    "Groceries": r"FRESHMART",
    "Coffee": r"CAFE",
    "Transport": r"TRANSIT|RIDESHARE",
    "Housing": r"RENT|POWER",
    "Income": r"SALARY",
}
budget["category"] = "Other"
for name, pattern in rules.items():
    budget.loc[budget["description"].str.contains(pattern), "category"] = (
        name
    )

print(budget[budget["store_no"].notna()].head(3))
print(budget.groupby("category")["amount"].sum().round(2).sort_values())
