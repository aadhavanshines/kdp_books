import pandas as pd

survey = pd.read_csv("../data/survey.csv", keep_default_na=False)
comments = survey["comment"]

print(comments.str.len().describe().round(1))
print()
print("mention 'slow':", comments.str.contains("slow").sum())
print(
    "mention price or value:",
    comments.str.contains(r"price|value", regex=True).sum(),
)
print()
words = comments.str.lower().str.split().explode()
stopwords = {"to", "is", "was", "too", "the"}
print(words[~words.isin(stopwords)].value_counts().head(5))
