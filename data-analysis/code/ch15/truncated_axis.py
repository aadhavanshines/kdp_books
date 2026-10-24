import matplotlib.pyplot as plt

plans = ["Basic", "Plus", "Pro"]
satisfied = [71, 74, 76]  # percent of customers satisfied

fig, (bad, good) = plt.subplots(1, 2, figsize=(6.4, 2.8))
bad.bar(plans, satisfied)
bad.set_ylim(70, 77)
bad.set_title("Misleading: axis starts at 70")
good.bar(plans, satisfied)
good.set_ylim(0, 100)
good.set_title("Honest: axis starts at 0")
for ax in (bad, good):
    ax.set_ylabel("% satisfied")
fig.tight_layout()
fig.savefig("truncated_axis.png")
print("Saved truncated_axis.png")
