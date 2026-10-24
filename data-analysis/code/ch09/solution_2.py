import pandas as pd

survey = pd.read_csv("../data/survey.csv")
print(
    survey.pivot_table(
        index="age_group",
        columns="plan",
        values="satisfaction",
        aggfunc="mean",
    ).round(2)
)
