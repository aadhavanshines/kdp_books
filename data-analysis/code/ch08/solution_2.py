import pandas as pd

survey = pd.read_csv("../data/survey.csv")
survey["mood"] = survey["satisfaction"].map(
    {1: "unhappy", 2: "unhappy", 3: "neutral", 4: "happy", 5: "happy"}
)
print(survey["mood"].value_counts())
