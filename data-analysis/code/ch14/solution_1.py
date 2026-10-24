import matplotlib.pyplot as plt
import pandas as pd

sessions = pd.read_csv("../data/sessions.csv")
pages = sessions["pages"].value_counts().sort_index()

fig, ax = plt.subplots()
ax.bar(pages.index, pages)
ax.set_xlabel("Pages viewed in the session")
ax.set_ylabel("Sessions")
ax.set_title("How many pages people view")
fig.savefig("pages.png")
print("Saved pages.png;", len(pages), "bars")
