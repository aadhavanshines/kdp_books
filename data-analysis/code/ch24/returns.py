import numpy as np
import pandas as pd

prices = pd.read_csv(
    "../data/prices.csv", parse_dates=["date"], index_col="date"
)
returns = prices.pct_change().dropna()

summary = pd.DataFrame(
    {
        "total return": prices.iloc[-1] / prices.iloc[0] - 1,
        "annual volatility": returns.std() * np.sqrt(252),
        "best day": returns.max(),
        "worst day": returns.min(),
    }
)
print(summary.round(3))
print()
print(returns.corr().round(2))
