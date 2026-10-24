import pandas as pd

messy = pd.Series([" 12 kg", "7kg", "n/a", "15 KG ", ""])
weights = pd.to_numeric(
    messy.str.lower().str.replace("kg", "").str.strip(), errors="coerce"
)
print(weights.tolist())
print("mean of known weights:", weights.mean())
