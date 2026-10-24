import matplotlib.pyplot as plt
import pandas as pd

prices = pd.read_csv(
    "../data/prices.csv", parse_dates=["date"], index_col="date"
)
growth = 100 * prices / prices.iloc[0]  # $100 invested on day one

fig, ax = plt.subplots()
for column in growth.columns:
    style = "--" if column == "INDEX" else "-"
    ax.plot(growth.index, growth[column], style, label=column)
ax.axhline(100, color="gray", linewidth=0.8)
ax.set_title("What $100 grew to (fictional companies)")
ax.set_ylabel("Value ($)")
ax.legend(ncol=4)
fig.tight_layout()
fig.savefig("growth_chart.png")
print("Saved growth_chart.png")
