import pandas as pd

customers = pd.read_csv("../data/customers.csv")
print(customers.shape)
print(customers["segment"].value_counts())
print(customers["birth_year"].min(), customers["birth_year"].max())
