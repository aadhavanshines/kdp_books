import pandas as pd

stock = pd.Series(
    [12, 0, 7, 25], index=["mugs", "lamps", "vases", "frames"]
)
print(stock)
print()
print(stock["vases"])  # by label
print(stock.iloc[0])  # by position
print(stock[stock > 5])  # a mask keeps matching items
print(stock.sum(), stock.mean(), stock.idxmax())
