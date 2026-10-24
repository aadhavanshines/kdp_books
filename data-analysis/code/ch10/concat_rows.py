import pandas as pd

q1 = pd.DataFrame({"store": ["A", "B"], "sales": [120, 95]})
q2 = pd.DataFrame({"store": ["A", "B"], "sales": [130, 90]})

both = pd.concat([q1, q2], keys=["Q1", "Q2"], names=["quarter", "row"])
print(both)
print(both.groupby("store")["sales"].sum())
