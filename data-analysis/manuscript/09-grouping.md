# Chapter 9: Grouping and Aggregating

"Revenue by region." "Average rating by plan." "Orders per month per channel." Most business questions have this shape: split the data into groups, calculate something for each group, and combine the results into a table. pandas calls it **split-apply-combine**, and does it with `groupby`.

## groupby

```python
@include code/ch09/groupby_basics.py
```

```
@include code/ch09/groupby_basics.out
```

`orders.groupby("region")["revenue"].sum()` reads almost like English: group the orders by region, take the revenue column, sum it. The result is a Series indexed by region.

For several results at once, use `agg` with **named aggregations**: each argument names an output column and says which input column and which function to use. `count` counts rows, `sum` and `mean` do what you'd expect, and `nunique` counts distinct values, here distinct customers. Now the picture is richer: North has the most revenue because it has the most orders and customers, but West has the *highest average order*, $67.50. Which region is "best" depends on the question.

> **Tip:** Common aggregation functions: `count`, `sum`, `mean`, `median`, `min`, `max`, `std`, `nunique`, `first` and `last`. You can also pass your own function, such as `lambda s: s.quantile(0.9)`.

## Pivot Tables and Crosstabs

A **pivot table** groups by two things at once, one along the rows and one along the columns:

```python
@include code/ch09/pivot.py
```

```
@include code/ch09/pivot.out
```

Rows are categories, columns are quarters, and each cell is total revenue before discounts, shown in thousands of dollars. `margins=True` adds totals. The table tells a story at a glance: everything grows in the fourth quarter, the holiday season, but Garden peaks in the second quarter, spring, and falls back after.

`pd.crosstab` counts how often each combination of two columns occurs; with `normalize="index"`, each row adds up to 1. Here that shows each region's channel mix: about half of every region's orders come through the website, and the mix is very similar everywhere.

## Share of Total With transform

Sometimes you need a group's total *next to each row*, for example to compute each row's share of its group. `transform` returns one value per original row:

```python
@include code/ch09/share_of_total.py
```

```
@include code/ch09/share_of_total.out
```

First, revenue is summed by region and category (`as_index=False` keeps them as ordinary columns). Then `groupby("region")["revenue"].transform("sum")` gives each row its region's total, and dividing gives each category's share of its region. Sorting by share and keeping the first row per region shows each region's biggest category: Bedding everywhere except the West, where Lighting leads with almost 29%.

> **Common Mistake:** Comparing totals between groups of very different sizes. North has more revenue than West in every category simply because it has more customers. Shares, averages per customer or rates per order often answer the real question better than raw totals.

## Exercises

1. **Best seller per category.** Which product sold the most items in each category? (Hint: group by category and product, sum the quantities, then use `idxmax` within each category.)
2. **Satisfaction table.** Make a pivot table of average satisfaction from `survey.csv`, with age groups as rows and plans as columns.

## Key Takeaways

- `groupby` splits rows into groups, applies a calculation, and combines the results.
- Named aggregations with `agg` build summary tables with clear column names.
- `pivot_table` groups by two dimensions; `crosstab` counts combinations, optionally as shares.
- `transform` returns group results aligned with the original rows, for shares and comparisons within groups.
- Compare rates and averages, not just totals, when groups differ in size.
