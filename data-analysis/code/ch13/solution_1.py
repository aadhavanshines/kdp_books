import pandas as pd

budget = pd.read_csv("../data/budget.csv")
cafes = budget[budget["description"].str.contains("CAFE")]
print(cafes["description"].str.title().value_counts())
