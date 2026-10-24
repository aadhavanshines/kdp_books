import pandas as pd

survey = pd.read_csv("../data/survey.csv", keep_default_na=False)
themes = {
    "speed": r"slow|fast",
    "price": r"price|value",
    "support": r"support",
    "ease of use": r"easy|confusing",
}
low = survey[survey["satisfaction"] <= 2]
high = survey[survey["satisfaction"] >= 4]

rows = []
for theme, pattern in themes.items():
    rows.append(
        {
            "theme": theme,
            "unhappy (1-2)": low["comment"].str.contains(pattern).mean(),
            "happy (4-5)": high["comment"].str.contains(pattern).mean(),
        }
    )
print(pd.DataFrame(rows).set_index("theme").round(2))
print()
print("blank comments:", (survey["comment"] == "").sum())
