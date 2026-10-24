import pandas as pd

budget = pd.read_csv("../data/budget.csv")
coffee = -budget.loc[budget["description"].str.contains("CAFE"), "amount"]
print(coffee.describe().round(2))
