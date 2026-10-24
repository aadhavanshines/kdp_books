# Chapter 10: Combining Tables

Data is usually split across several tables: orders in one, products in another, customers in a third. To answer "what's our profit by customer segment?" you need all three. This chapter shows how to **merge** tables on shared columns, how the four kinds of join differ, and how to stack tables with the same columns on top of each other.

## Merging on a Key

```python
@include code/ch10/merge_basics.py
```

```
@include code/ch10/merge_basics.out
```

`merge` matches rows with the same value in the `on` column, called the **key**. Each order gets its product's unit cost and its customer's segment. Two arguments make merges safe:

- `how="left"` keeps every order, even one whose product or customer were missing from the other table (it would get missing values instead of disappearing).
- `validate="many_to_one"` checks that each product and each customer appears only once in the right-hand table. If a product were listed twice by mistake, each matching order would be duplicated and every total would be wrong. With `validate`, pandas raises an error instead.

The result still has 5,833 rows, which confirms nothing was lost or duplicated. Profit is revenue minus quantity times unit cost, and both segments turn out to earn a 45% margin.

> **Tip:** After every merge, check the row count. If it grew, a key was duplicated; if it shrank with an inner join, some keys didn't match.

## Four Kinds of Join

Small tables make the differences easy to see:

```python
@include code/ch10/join_types.py
```

```
@include code/ch10/join_types.out
```

- **inner:** only keys in both tables (2 and 3).
- **left:** every row of the left table; missing values where the right has no match (Asha has no city).
- **right:** every row of the right table.
- **outer:** every key from either table.

`indicator=True` adds a `_merge` column that says where each row came from, the best way to find rows that didn't match.

## Stacking Tables

When tables have the same columns, for example the same report from different months, `concat` stacks them:

```python
@include code/ch10/concat_rows.py
```

```
@include code/ch10/concat_rows.out
```

`keys` labels each piece, giving a two-level index (quarter, then the original row number), so you never lose track of where a row came from. After stacking, everything else works as usual: store A sold 250 in the two quarters together.

## Exercises

1. **Customers with no orders.** Which customers in `customers.csv` never placed an order? Use a left merge with `indicator=True`. How many are there, and which are the first five?
2. **Buyer ages.** Merge orders with customers' birth years and find the median age of buyers in each category (use age = 2025 minus birth year).

## Key Takeaways

- `merge` joins tables on key columns; `how` chooses inner, left, right or outer.
- `validate` catches duplicated keys before they multiply your rows.
- Check row counts after every merge; `indicator=True` shows unmatched rows.
- `concat` stacks tables with the same columns; `keys` records where each part came from.
