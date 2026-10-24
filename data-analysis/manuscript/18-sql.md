# Chapter 18: SQL for Analysts

**SQL** (Structured Query Language, often pronounced "sequel") is the language of databases, and almost every analyst job asks for it. The good news: if you understand pandas filtering, grouping and merging, you already understand SQL's ideas. This chapter teaches the SQL you'll use daily, running against SQLite from Python, with the pandas equivalent of each piece.

## A Database in Memory

```python
@include code/ch18/sql_basics.py
```

```
@include code/ch18/sql_basics.out
```

`sqlite3.connect(":memory:")` creates a database that lives only while the program runs, perfect for practice. `to_sql` loads the orders and products into tables, and the small `sql` helper runs a query and prints the result.

## Reading a Query

The first query, clause by clause, in the order the database actually works through them:

| Clause | Meaning | pandas equivalent |
| --- | --- | --- |
| `FROM orders` | Start from this table | `orders` |
| `WHERE channel = 'app'` | Keep matching rows | `orders[orders["channel"] == "app"]` |
| `GROUP BY category` | Split into groups | `.groupby("category")` |
| `SELECT ..., COUNT(*), AVG(quantity)` | Calculate per group | `.agg(...)` |
| `HAVING COUNT(*) > 300` | Keep matching groups | filter the grouped result |
| `ORDER BY orders DESC` | Sort | `.sort_values(..., ascending=False)` |

`WHERE` filters rows *before* grouping; `HAVING` filters groups *after*. Every category had more than 300 app orders, with Bedding first.

## Joins

The second query joins orders to products to compute profit per product:

- `JOIN products AS p ON p.product = o.product` matches rows like `merge(on="product")`. `AS o` and `AS p` give the tables short names.
- `JOIN` alone is an inner join; `LEFT JOIN` keeps every row of the first table, like `how="left"`.
- `LIMIT 3` keeps the first three rows, like `head(3)`.

Floor lamps earn the most profit, $37,749, followed by duvet covers and cast iron pans.

## Window Functions

The third query finds the best-selling product in each region. A **window function** calculates across a group of rows without collapsing them:

- `RANK() OVER (PARTITION BY region ORDER BY SUM(quantity) DESC)` ranks products within each region, largest first. `PARTITION BY` is like `groupby` for the ranking.
- The outer query keeps rank 1.

In the West and the East, chef knives sell the most items; in the North pillow pairs, and in the South throw blankets. The pandas equivalent is `groupby(...).rank()` or the sort-then-`head(1)` pattern from Chapter 6.

> **Tip:** Common window functions: `ROW_NUMBER()`, `RANK()`, `SUM(...) OVER (...)` for running totals, `LAG(column)` for the previous row's value (like `shift`), and `AVG(...) OVER (... ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)` for rolling averages.

## SQL or pandas?

Use SQL when the data lives in a database: let the database do the filtering and grouping, and bring back only the small result. A query that returns 12 monthly totals is much faster than pulling 50 million rows into Python to total them. Use pandas for everything after that: reshaping, statistics, charts and anything awkward in SQL. Most analysts use both in the same project, often in the same program.

> **Warning:** Never build a query by pasting user input into the SQL text, as in `f"... WHERE region = '{region}'"`. A malicious or unlucky value can change the query (**SQL injection**). Pass values as parameters instead: `pd.read_sql("... WHERE region = ?", conn, params=[region])`.

## Exercises

1. **Busiest months.** Write a query that counts orders per month (SQLite's `strftime('%m', order_date)` gives the month) and lists the three busiest.
2. **Segments.** Join orders to customers and report, for each segment, the number of distinct buyers and the average quantity per order.

## Key Takeaways

- SQL's `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY` and `JOIN` map directly onto pandas filtering, grouping, sorting and merging.
- `WHERE` filters rows before grouping; `HAVING` filters groups after.
- Window functions such as `RANK() OVER (PARTITION BY ...)` rank and total within groups without collapsing rows.
- Let the database reduce the data; use pandas for the rest. Always pass values as parameters.
