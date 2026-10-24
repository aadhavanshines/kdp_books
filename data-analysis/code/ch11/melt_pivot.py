import pandas as pd

wide = pd.DataFrame(
    {
        "store": ["Avon", "Bray"],
        "Jan": [120, 95],
        "Feb": [130, 90],
        "Mar": [150, 110],
    }
)
print(wide)

long = wide.melt(id_vars="store", var_name="month", value_name="sales")
print(long)

back = long.pivot(index="store", columns="month", values="sales")
print(back[["Jan", "Feb", "Mar"]])
