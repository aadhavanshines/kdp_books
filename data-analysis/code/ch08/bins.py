import pandas as pd

customers = pd.read_csv("../data/customers.csv")
customers["age"] = 2025 - customers["birth_year"]

customers["age_band"] = pd.cut(
    customers["age"],
    bins=[0, 29, 44, 59, 120],
    labels=["under 30", "30-44", "45-59", "60+"],
)
print(customers["age_band"].value_counts().sort_index())

# qcut makes groups of (almost) equal size instead of equal width
customers["age_quartile"] = pd.qcut(
    customers["age"], 4, labels=["Q1", "Q2", "Q3", "Q4"]
)
print(
    customers.groupby("age_quartile", observed=True)["age"].agg(
        ["min", "max", "count"]
    )
)
