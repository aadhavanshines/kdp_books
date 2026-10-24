import pandas as pd

survey = pd.read_csv("../data/survey.csv", keep_default_na=False)

survey["group"] = pd.cut(
    survey["recommend"],
    bins=[-1, 6, 8, 10],
    labels=["detractor", "passive", "promoter"],
)
shares = pd.crosstab(survey["plan"], survey["group"], normalize="index")
shares["NPS"] = 100 * (shares["promoter"] - shares["detractor"])
print(shares.round(2).reindex(["Basic", "Plus", "Pro"]))
print()
overall = survey["group"].value_counts(normalize=True)
print(
    f"overall NPS: {100 * (overall['promoter'] - overall['detractor']):.0f}"
)
print(survey.groupby("plan")["satisfaction"].mean().round(2).to_string())
