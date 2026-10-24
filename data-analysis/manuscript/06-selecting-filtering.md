# Chapter 6: Selecting and Filtering

Most questions are about *some* of the data: one region, last month, orders over $100. This chapter covers the ways to pick out columns and rows, and to sort them, so you can zoom in on exactly the part you need.

## Columns, Labels and Positions

```python
@include code/ch06/selecting.py
```

```
@include code/ch06/selecting.out
```

This time `read_csv` used `index_col="order_id"`, so the order IDs became the index, the row labels. That makes looking up an order by ID natural.

- `orders["product"]`, one name in brackets, gives a single column as a Series.
- `orders[["product", "quantity"]]`, a *list* of names, gives a DataFrame with those columns. The double brackets are easy to miss: the outer pair selects, the inner pair makes a list.
- `loc[row, column]` selects by **labels**. `orders.loc["L00010", "product"]` is the product in order L00010.
- With labels, slices include both ends: `loc["L00010":"L00012"]` gives three rows. That's different from ordinary Python slices.
- `iloc[row, column]` selects by **position**, counting from 0, and its slices exclude the end, like normal Python: `iloc[0, :3]` is the first row's first three values.

> **Tip:** Use `loc` when you know the names, and `iloc` when you know the positions. Avoid `orders["L00010"]` style shortcuts for rows: plain brackets select columns, and mixing the two is a common source of confusing errors.

## Filtering Rows With Conditions

Filtering works exactly like a NumPy mask: a condition on a column gives True or False for every row, and the DataFrame keeps the True rows.

```python
@include code/ch06/filtering.py
```

```
@include code/ch06/filtering.out
```

- `orders["quantity"] >= 5` keeps 56 large orders.
- Combine conditions with `&` (and), `|` (or) and `~` (not), and put **each condition in parentheses**. There were 239 lighting orders from the West.
- `isin([...])` tests membership in a list: 1,749 orders had a 10% or 20% discount.
- `between(a, b)` tests a range, including both ends: 879 December orders.
- `query()` takes the condition as a string, which reads nicely for longer filters. Names inside the string are column names.

> **Common Mistake:** Writing `orders[orders["region"] == "West" and orders["category"] == "Lighting"]`. Python's `and` can't combine two whole columns of True/False values, and pandas raises "The truth value of a Series is ambiguous". Use `&` instead, with parentheses around each condition.

## Sorting and Top Values

```python
@include code/ch06/sorting.py
```

```
@include code/ch06/sorting.out
```

`sort_values` sorts by one or more columns, and `ascending` says which way for each: here revenue largest first, then order ID smallest first. `nlargest(3, "quantity")` is a shortcut for "sort and take the top 3", and it's faster on big tables. The third example finds the biggest order in each region: sort by region and then by revenue (largest first), then `groupby("region").head(1)` keeps the first row of each region. You'll see `groupby` properly in Chapter 9.

Several orders tie at $600 (five floor lamps each). When values tie, a sort by revenue alone can put the tied rows in a different order on a different computer, because the fastest sorting method depends on the processor. That's why the first sort adds `order_id` as a second column: it breaks the ties, so everyone gets the same three rows. When the order of tied rows matters, always add a tie-breaker.

## Exercises

1. **Full-price lamps.** How many orders were for a product with "Lamp" in its name and no discount? How many of each lamp? (Hint: `str.contains`, Chapter 13.)
2. **New business customers.** From `customers.csv` (parse `signup_date` as a date), find Business customers who signed up in 2025 or later. How many are there, and who were the first three?

## Key Takeaways

- One column name gives a Series; a list of names gives a DataFrame.
- `loc` selects by label (slices include the end); `iloc` by position (slices exclude it).
- Filter with conditions combined by `&`, `|` and `~`, each in parentheses; `isin`, `between` and `query` keep filters readable.
- `sort_values` and `nlargest` find the top rows; add a tie-breaker column when values can tie.
