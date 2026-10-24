import pandas as pd

codes = pd.Series(["INV-2025-0041", "inv-2025-0042", "PO-2024-0007"])
parts = codes.str.upper().str.extract(
    r"(?P<kind>\w+)-(?P<year>\d{4})-(?P<num>\d+)"
)
parts["num"] = parts["num"].astype(int)
print(parts)
