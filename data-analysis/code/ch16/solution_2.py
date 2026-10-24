import pandas as pd

survey = pd.read_csv("../data/survey.csv")
print(survey[["satisfaction", "recommend"]].corr().round(2))
