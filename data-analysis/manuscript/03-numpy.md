# Chapter 3: NumPy Essentials

pandas is built on **NumPy**, the library that gives Python fast arrays of numbers. You'll rarely use NumPy on its own in this book, but three of its ideas run through everything pandas does: operating on whole arrays at once, selecting with true/false masks, and **broadcasting**. This chapter covers them, plus NumPy's random number generator, which you'll use for simulations and statistics.

## Arrays and Vectorized Operations

A NumPy **array** is like a list, but every item has the same type, and arithmetic works on all the items at once:

```python
@include code/ch03/arrays.py
```

```
@include code/ch03/arrays.out
```

Line by line:

- `prices.dtype` is `float64`: 64-bit decimal numbers. `prices.shape` is `(5,)`: one dimension with five items.
- `prices * quantities` multiplies the arrays item by item, with no loop. This is called a **vectorized** operation. It's shorter to write and runs in fast compiled code, which matters when an array has millions of items.
- `prices > 40` makes an array of `True`/`False` values, a **boolean mask**, and `prices[mask]` keeps the items where the mask is `True`. You'll use exactly the same idea to filter rows in pandas.
- `reshape(3, 4)` turns 12 numbers into a grid of 3 rows and 4 columns. With `axis=0`, `sum` adds down each column; with `axis=1`, across each row.

> **Common Mistake:** Mixing up the axes. `axis=0` means "collapse the rows", so you get one result per column. If you get the wrong shape of answer, try the other axis.

## Broadcasting

When you combine arrays of different shapes, NumPy stretches the smaller one to fit, if it can. That's **broadcasting**:

```python
@include code/ch03/broadcasting.py
```

```
@include code/ch03/broadcasting.out
```

`sales` has 3 rows and 3 columns; `targets` has 3 items, one per store. `sales - targets` subtracts the targets from *every* row, giving each store's distance from its target each month. `sales >= targets` gives a mask of on-target months, and its mean down each column is the share of months on target: True counts as 1 and False as 0. Finally, dividing each row by its own total (`keepdims=True` keeps the totals as a column, so they line up with the rows) gives each store's share of each month's sales.

## Random Numbers and Simple Statistics

Simulations and many statistical methods need random numbers. Always create a generator with a **seed**, so your results can be repeated:

```python
@include code/ch03/random_stats.py
```

```
@include code/ch03/random_stats.out
```

The generator draws 10,000 heights from a **normal distribution**, the bell curve, with mean 170 and standard deviation 8. The sample's mean and standard deviation come out very close to those values. The 5th and 95th **percentiles** say that 90% of heights fall between about 157 and 183 cm. And because a mask is True or False, `(heights > 185).mean()` is the *share* of heights above 185: about 3%.

The second part rolls two dice 100,000 times. `np.bincount` counts how often each total appears; the counts rise to a peak at 7 and fall again, exactly as probability says they should. A quick simulation like this is often the easiest way to check your understanding of a probability question.

**Interesting Fact:** NumPy's random generator, `default_rng`, uses an algorithm called PCG64 by default. With the same seed and the same NumPy version, it produces the same numbers on every computer. That's why this book's data, made from seed 2026, is identical for every reader.

## Exercises

1. **Temperatures.** Make a 3 by 4 array of temperatures for three cities over four days. Print each city's average, the warmest reading on each day, and how many readings are above 15.
2. **Coin flips.** Simulate 10,000 runs of 10 coin flips with a seeded generator. In what share of runs do 8 or more heads come up? (The exact answer is 56/1024, about 0.055.)

## Key Takeaways

- NumPy arrays hold many numbers of one type, and arithmetic applies to every item at once.
- A boolean mask selects items; its mean is the share of True values.
- `axis=0` works down columns, `axis=1` across rows.
- Broadcasting stretches a smaller array to match a bigger one.
- Create random generators with a seed so results can be repeated.
