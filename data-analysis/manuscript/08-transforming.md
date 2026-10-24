# Chapter 8: Transforming Columns

Raw data rarely has the column you need. Orders have quantity, price and discount, but you want revenue; customers have a birth year, but you want age bands. This chapter covers the ways to make new columns: arithmetic, `assign`, conditions, mappings and bins. It ends with the most important performance habit in pandas: work on whole columns, not row by row.

## New Columns From Old Ones

```python
@include code/ch08/new_columns.py
```

```
@include code/ch08/new_columns.out
```

- **Arithmetic on columns** works row by row automatically: `revenue` multiplies each order's quantity, price and (1 minus) discount.
- **`assign`** adds several columns at once and returns a new DataFrame. Here it adds the month and a weekend flag from the date's `.dt` accessor (`dayofweek` counts Monday as 0, so 5 and 6 are Saturday and Sunday).
- **`np.select`** chooses between values by conditions, checked in order: revenue under $30 is "small", under $100 "medium", and everything else the `default`, "large". It's the column version of `if`/`elif`/`else`.
- **`map`** with a dictionary replaces each value with its partner: short channel codes become readable names. Values missing from the dictionary would become missing, so make sure the dictionary covers every value.

## Bins: Turning Numbers Into Groups

Ages, prices and incomes are often easier to analyze in groups:

```python
@include code/ch08/bins.py
```

```
@include code/ch08/bins.out
```

`pd.cut` puts each value into a band you define. The bin edges `[0, 29, 44, 59, 120]` mean "over 0 up to 29", "over 29 up to 44", and so on: each band includes its right edge. `pd.qcut` instead makes bands with (almost) the same number of people in each: the age quartiles each hold about 300 customers, and the table shows where the boundaries fell.

> **Tip:** Use `cut` when the band edges mean something (legal ages, price points), and `qcut` when you want equal-sized groups for comparison, such as "the top quarter of customers".

## Row by Row, or Whole Columns?

`apply(..., axis=1)` runs your own function once per row. It's flexible, but it calls Python for every row, which is slow on large tables. The same logic can almost always be written with whole-column operations:

```python
@include code/ch08/apply_vs_vector.py
```

```
@include code/ch08/apply_vs_vector.out
```

The rule: free shipping on orders of $100 or more; otherwise $6, or $4 through the app. The vectorized version starts with $6 for everyone, then uses `mask` to replace values where a condition is true: $4 for app orders, then $0 for large orders. The later `mask` wins, so a large app order ships free, matching the function's logic. Both give the same answer, $24,808 in total, but the vectorized version works on whole columns at once. On this table the difference is a fraction of a second; on ten million rows, it's the difference between seconds and many minutes.

> **Common Mistake:** Writing a loop like `for i in range(len(df)): df.loc[i, "revenue"] = ...`. It works, but it's the slowest possible way. Look for a column operation, `np.select`, `mask`, `where` or `map` first.

## Exercises

1. **Price bands.** Put each order into a price band with `pd.cut`: "budget" (up to $25), "mid" (up to $50) and "premium" (up to $200). How many orders fall in each band?
2. **Mood.** In `survey.csv`, map satisfaction scores 1 and 2 to "unhappy", 3 to "neutral", and 4 and 5 to "happy", and count each mood.

## Key Takeaways

- Column arithmetic, `assign` and the `.dt` accessor make new columns in one line.
- `np.select` handles if/elif/else rules; `map` translates values with a dictionary.
- `cut` makes bands with chosen edges; `qcut` makes equal-sized groups.
- Prefer whole-column operations to `apply(axis=1)` and loops: same answer, far faster.
