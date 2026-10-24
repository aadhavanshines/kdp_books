import pandas as pd

budget = pd.read_csv("../data/budget.csv", parse_dates=["date"])
spend = budget[budget["amount"] < 0]

# A payment is recurring if the same description and amount appear in
# at least 10 different months
by_payment = spend.groupby(["description", "amount"])["date"].agg(
    months=lambda d: d.dt.month.nunique()
)
recurring = by_payment[by_payment["months"] >= 10].reset_index()
recurring["per year"] = -recurring["amount"] * recurring["months"]
print(
    recurring.sort_values("per year", ascending=False).to_string(
        index=False
    )
)
