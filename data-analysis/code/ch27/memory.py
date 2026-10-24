import pandas as pd

orders = pd.read_csv("../data/orders.csv")
before = orders.memory_usage(deep=True).sum()

smaller = orders.astype(
    {
        "region": "category",
        "channel": "category",
        "category": "category",
        "product": "category",
        "quantity": "int8",
        "discount": "float32",
    }
)
after = smaller.memory_usage(deep=True).sum()
print(
    f"before {before / 1e6:.2f} MB, after {after / 1e6:.2f} MB "
    f"({after / before:.0%} of the original)"
)
print(smaller.dtypes[["region", "quantity", "discount"]])
