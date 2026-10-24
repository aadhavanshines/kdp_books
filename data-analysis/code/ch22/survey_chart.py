import matplotlib.pyplot as plt
import pandas as pd

survey = pd.read_csv("../data/survey.csv")
survey["group"] = pd.cut(
    survey["recommend"],
    bins=[-1, 6, 8, 10],
    labels=["Detractors (0-6)", "Passives (7-8)", "Promoters (9-10)"],
)
shares = (
    pd.crosstab(survey["plan"], survey["group"], normalize="index").reindex(
        ["Basic", "Plus", "Pro"]
    )
    * 100
)

fig, ax = plt.subplots(figsize=(6.4, 2.6))
left = pd.Series(0.0, index=shares.index)
for group, color in zip(shares.columns, ["C1", "C2", "C0"]):
    ax.barh(
        shares.index, shares[group], left=left, color=color, label=group
    )
    left += shares[group]
ax.set_xlim(0, 100)
ax.set_xlabel("% of respondents")
ax.set_title("Would you recommend us? Answers by plan")
ax.legend(ncol=3, loc="upper center", bbox_to_anchor=(0.5, -0.3))
ax.grid(axis="y", visible=False)
fig.tight_layout()
fig.savefig("survey_chart.png")
print("Saved survey_chart.png")
