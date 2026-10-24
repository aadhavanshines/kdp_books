# Chapter 11: Reshaping Data

The same numbers can be laid out in different shapes. A **wide** table has one row per thing and one column per month; a **long** table has one row per thing *per month*. People like wide tables for reading; pandas, charts and databases usually prefer long ones. This chapter shows how to switch between them.

## Tidy Data

A table is **tidy** when:

1. each column is one variable (store, month, sales),
2. each row is one observation (one store in one month), and
3. each cell holds one value.

Tidy tables are easy to filter, group and chart, because every question is about columns. Spreadsheets you receive are often not tidy: months spread across columns, or two values squeezed into one cell. Reshaping fixes the first problem; text tools (Chapter 13) fix the second.

## melt and pivot

```python
@include code/ch11/melt_pivot.py
```

```
@include code/ch11/melt_pivot.out
```

- `melt` turns columns into rows. `id_vars="store"` keeps the store column; every other column becomes a pair of values in `month` and `sales`. Two stores times three months gives six rows.
- `pivot` goes back: `index` gives the rows, `columns` the new column headers, and `values` fills the cells. Selecting `[["Jan", "Feb", "Mar"]]` restores the calendar order, because pivot sorts the new columns alphabetically.

> **Common Mistake:** `pivot` fails with "Index contains duplicate entries" when two rows have the same index and column (the same store and month twice). Then you need `pivot_table` with an `aggfunc`, such as `sum`, to say how to combine them.

## stack and unstack

When a Series has a two-level index, `unstack` moves the inner level into columns and `stack` moves it back:

```python
@include code/ch11/stack_unstack.py
```

```
@include code/ch11/stack_unstack.out
```

Grouping by two columns gives a Series indexed by region and channel, convenient to compute but awkward to read. `unstack()` turns it into a region-by-channel table. `stack()` reverses it exactly, as the final `True` confirms.

## Exercises

1. **Long prices.** `prices.csv` has one column per company. Melt it into a long table with columns `date`, `ticker` and `close`. How many rows does it have, and what was each ticker's highest close?
2. **Orders by discount.** Make a table with regions as rows, the three discount levels as columns, and the number of orders in each cell.

## Key Takeaways

- Tidy data has one variable per column and one observation per row.
- `melt` turns wide tables long; `pivot` turns long tables wide (`pivot_table` when there are duplicates).
- `unstack` and `stack` move index levels into and out of columns.
