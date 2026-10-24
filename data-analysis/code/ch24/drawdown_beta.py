import numpy as np
import pandas as pd

prices = pd.read_csv(
    "../data/prices.csv", parse_dates=["date"], index_col="date"
)
returns = prices.pct_change().dropna()

peak = prices.cummax()
drawdown = prices / peak - 1
print("largest fall from a previous high:")
print(drawdown.min().round(3).to_string())
print("deepest point for BRKN:", drawdown["BRKN"].idxmin().date())
print()

for ticker in ["ALDR", "BRKN", "CDLX"]:
    slope, _ = np.polyfit(returns["INDEX"], returns[ticker], 1)
    print(f"{ticker} beta against the index: {slope:.2f}")
