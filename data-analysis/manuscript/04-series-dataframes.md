# Part II: Working With Tables

# Chapter 4: Series and DataFrames

pandas has two main objects. A **Series** is one column of data with labels; a **DataFrame** is a table made of Series that share the same row labels. Almost everything in Part II is something you do to one of these two.

**Interesting Fact:** pandas was started in 2008 by Wes McKinney, then working at the investment firm AQR Capital Management, because he wanted tools for financial data that Python didn't have. AQR allowed him to release it as open source in 2009. The name comes from "panel data", an economics term for tables of observations over time.

## Series

```python
@include code/ch04/series_basics.py
```

```
@include code/ch04/series_basics.out
```

A Series pairs values with an **index**: here the product names. You can select by label (`stock["vases"]`) or by position (`stock.iloc[0]`), filter with a mask exactly as with NumPy, and summarize: the total is 44 items, the mean 11, and `idxmax()` gives the *label* of the largest value.

The last line of the printed Series, `dtype: int64`, is its data type: 64-bit whole numbers.

## DataFrames

Most data arrives as a table, and `read_csv` turns a CSV file into a DataFrame:

```python
@include code/ch04/dataframe_basics.py
```

```
@include code/ch04/dataframe_basics.out
```

- `shape` is (rows, columns): 5,833 orders with 10 columns each.
- `columns` lists the column names. Selecting a list of columns, `orders[[...]]`, gives a smaller DataFrame, and `head(3)` its first three rows.
- The numbers 0, 1, 2 on the left are the **index**. `read_csv` numbers the rows from 0 unless you choose a column to use instead (Chapter 6).
- `dtypes` shows each column's type. Whole numbers are `int64`, decimals `float64`. Text columns show as `str`, the string type that pandas 3 uses by default. `order_date` is `datetime64[us]`, a date and time stored to the microsecond, because the program asked `read_csv` to parse it as a date with `parse_dates`.

> **Note:** Older pandas versions show text columns as `object`. If you see `object` where the book shows `str`, you have a pandas version before 3.0. Almost everything works the same; Chapter 2 shows how to install the book's version.

## A Quick Summary of Any Table

Three methods give a fast overview of a new dataset:

```python
@include code/ch04/describe.py
```

```
@include code/ch04/describe.out
```

`describe()` summarizes numeric columns: the count of values, mean, standard deviation, minimum, quartiles and maximum. Already you learn a lot: most orders are for one item (the median quantity is 1), the largest is 7; prices run from $12 to $120; discounts are at most 20%.

`value_counts()` counts each distinct value, largest first. Half the orders come through the website. With `normalize=True` it gives shares instead of counts: Bedding is the most common category at 23.6% of orders.

> **Tip:** Make `shape`, `head()`, `dtypes`, `describe()` and `value_counts()` the first things you run on any new dataset. Five lines, and you know its size, its columns, its types, its ranges and its categories.

## Exercises

1. **Customers.** Load `customers.csv`. How many customers are there, how many in each segment, and what are the earliest and latest birth years?
2. **Margins.** Load `products.csv` and add a `margin` column: `1 - unit_cost / list_price`. Which three products have the highest margin?

## Key Takeaways

- A Series is a labeled column; a DataFrame is a table of Series sharing one index.
- Select by label with `[]` or `loc`, by position with `iloc`.
- `read_csv` reads a CSV file into a DataFrame; `parse_dates` turns date columns into real dates.
- Start every analysis with `shape`, `head()`, `dtypes`, `describe()` and `value_counts()`.
