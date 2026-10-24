import pandas as pd

sessions = pd.read_csv("../data/sessions.csv")
before = sessions.memory_usage(deep=True).sum()
small = sessions.astype(
    {
        "variant": "category",
        "device": "category",
        "pages": "int16",
        "converted": "int8",
        "revenue": "float32",
    }
)
after = small.memory_usage(deep=True).sum()
print(f"{before / 1e6:.2f} MB -> {after / 1e6:.2f} MB")
