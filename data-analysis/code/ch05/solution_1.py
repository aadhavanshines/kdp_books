import pandas as pd

survey = pd.read_csv(
    "../data/survey.csv",
    usecols=["plan", "satisfaction"],
    dtype={"plan": "category"},
)
print(survey.dtypes)
print(survey["plan"].cat.categories.tolist())
