import pandas as pd

prices = pd.read_csv("../data/prices.csv")
long = prices.melt(id_vars="date", var_name="ticker", value_name="close")
print(long.shape)
print(long.groupby("ticker")["close"].max())
