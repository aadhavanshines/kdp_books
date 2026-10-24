# Appendix B: pandas Cheat Sheet

The operations used most often in this book, with the chapter that explains each.

## Loading and Saving (Chapter 5)

| Task | Code |
| --- | --- |
| Read a CSV | `pd.read_csv("f.csv", parse_dates=["date"])` |
| Only some columns | `pd.read_csv("f.csv", usecols=["a", "b"])` |
| Read Excel, every sheet | `pd.read_excel("f.xlsx", sheet_name=None)` |
| Run SQL | `pd.read_sql("SELECT ...", conn)` |
| Save | `df.to_csv("out.csv", index=False)`, `df.to_excel(...)`, `df.to_sql(...)` |

## Looking (Chapter 4)

| Task | Code |
| --- | --- |
| Size, first rows, types | `df.shape`, `df.head()`, `df.dtypes` |
| Summary of numbers | `df.describe()` |
| Count values | `df["col"].value_counts(normalize=True)` |
| Missing values | `df.isna().sum()` |
| Columns, memory | `df.info()` |

## Selecting (Chapter 6)

| Task | Code |
| --- | --- |
| One column, several | `df["a"]`, `df[["a", "b"]]` |
| By label, by position | `df.loc["row", "col"]`, `df.iloc[0, 2]` |
| Filter | `df[(df["a"] > 5) & (df["b"] == "x")]` |
| In a list, in a range | `df["a"].isin([1, 2])`, `df["a"].between(1, 5)` |
| Query string | `df.query("a > 5 and b == 'x'")` |
| Sort, top rows | `df.sort_values("a", ascending=False)`, `df.nlargest(5, "a")` |

## Cleaning and Transforming (Chapters 7 and 8)

| Task | Code |
| --- | --- |
| Remove duplicates | `df.drop_duplicates()` |
| Missing values | `df.dropna()`, `df["a"].fillna(value)` |
| Fix text | `df["a"].str.strip().str.title()` |
| Convert types | `df["a"].astype(float)`, `pd.to_numeric(s, errors="coerce")` |
| Parse dates | `pd.to_datetime(s, format="%Y-%m-%d")` |
| New column | `df["c"] = df["a"] * df["b"]`, `df.assign(c=...)` |
| Conditions | `np.select([cond1, cond2], [v1, v2], default=v3)` |
| Translate values | `df["a"].map({"x": "X"})` |
| Bands | `pd.cut(s, bins=[...], labels=[...])`, `pd.qcut(s, 4)` |

## Grouping, Combining, Reshaping (Chapters 9 to 11)

| Task | Code |
| --- | --- |
| Group and sum | `df.groupby("a")["b"].sum()` |
| Several results | `df.groupby("a").agg(n=("b", "count"), total=("c", "sum"))` |
| Group value on each row | `df.groupby("a")["b"].transform("sum")` |
| Pivot table | `df.pivot_table(index="a", columns="b", values="c", aggfunc="sum")` |
| Count combinations | `pd.crosstab(df["a"], df["b"], normalize="index")` |
| Merge | `left.merge(right, on="key", how="left", validate="many_to_one")` |
| Stack tables | `pd.concat([df1, df2])` |
| Wide to long, long to wide | `df.melt(id_vars="a")`, `df.pivot(index=..., columns=..., values=...)` |

## Dates and Text (Chapters 12 and 13)

| Task | Code |
| --- | --- |
| Date parts | `s.dt.year`, `s.dt.month`, `s.dt.day_name()` |
| Regroup by period | `df.set_index("date")["a"].resample("MS").sum()` |
| Rolling average | `s.rolling(7).mean()` |
| Change, earlier value | `s.pct_change()`, `s.shift(1)` |
| Contains, extract | `s.str.contains("x")`, `s.str.extract(r"#(\d+)")` |

## Charts (Chapter 14)

| Task | Code |
| --- | --- |
| Start | `fig, ax = plt.subplots()` |
| Line, bars, histogram, scatter | `ax.plot(x, y)`, `ax.barh(x, y)`, `ax.hist(s, bins=20)`, `ax.scatter(x, y)` |
| Labels | `ax.set_title(...)`, `ax.set_xlabel(...)`, `ax.legend()` |
| Save | `fig.tight_layout()`, `fig.savefig("chart.png")` |
