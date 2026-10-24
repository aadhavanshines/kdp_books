import pandas as pd

left = pd.DataFrame({"id": [1, 2, 3], "name": ["Asha", "Ben", "Chen"]})
right = pd.DataFrame({"id": [2, 3, 4], "city": ["Leeds", "Pune", "Oslo"]})

for how in ["inner", "left", "right", "outer"]:
    print(f"--- {how}")
    print(left.merge(right, on="id", how=how, indicator=True))
