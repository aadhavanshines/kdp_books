# Part V: Going Further

# Chapter 27: Bigger Data and Faster Code

pandas works comfortably with tables up to a few million rows on a laptop. Beyond that, or when a program feels slow, a few habits go a long way: smaller column types, reading in chunks, whole-column operations, and readable step-by-step pipelines. This chapter covers them, and when to reach for other tools.

## Smaller Types, Less Memory

```python
@include code/ch27/memory.py
```

```
@include code/ch27/memory.out
```

`memory_usage(deep=True)` measures the real memory a DataFrame uses, including its text. Changing types cuts this table to 45% of its size:

- **`category`** for text columns with few distinct values (four regions, three channels, fifteen products): each value is stored once, and each row keeps only a small code.
- **`int8`** for quantities that never exceed 127 (`int16` up to 32,767, `int32` up to about 2 billion).
- **`float32`** for decimals that don't need 15 significant digits.

> **Warning:** Small integer types overflow silently if a value is too large: an `int8` can't hold 300. Only shrink a column when you know its range, and check with `min()` and `max()` first.

## Reading in Chunks

When a file is too big to load at once, read it in pieces and combine the partial results:

```python
@include code/ch27/chunks.py
```

```
@include code/ch27/chunks.out
```

`read_csv(..., chunksize=5_000)` returns the file 5,000 rows at a time. Each chunk is summarized and the partial totals are added up, so only one chunk is ever in memory. The final check confirms the result matches reading the whole file at once. This works for totals, counts, minimums and maximums; for medians and other statistics that need all the data together, you'll need a different tool.

## Readable Pipelines

Method chaining writes an analysis as a sequence of steps, read top to bottom:

```python
@include code/ch27/method_chain.py
```

```
@include code/ch27/method_chain.out
```

Each line is one step: read, add revenue, filter, group, sum, sort, take the top four, round. `pipe` passes the DataFrame to your own function, so custom steps fit into the chain. Wrapping the chain in parentheses lets it span several lines. There are no intermediate variables to keep track of, and you can comment out a step to see what it changes.

## Speed Habits

- **Whole-column operations** instead of loops and `apply(axis=1)` (Chapter 8). This is by far the biggest win.
- **Read only what you need:** `usecols`, `nrows` and `dtype` when loading.
- **Filter early:** drop rows and columns you don't need before merging and grouping.
- **Save cleaned data in a faster format:** Parquet files (`to_parquet`, which needs the `pyarrow` library) load much faster than CSV and keep column types.
- **Measure before optimizing:** time the slow part with `time.perf_counter()` and fix that, not what you guess is slow.

## When pandas Isn't Enough

- **DuckDB** runs SQL directly on CSV and Parquet files, often far faster than pandas for large group-bys and joins, and returns pandas DataFrames.
- **Polars** is a newer DataFrame library, designed for speed and for data larger than memory.
- **A real database** (PostgreSQL, or a cloud data warehouse) when data is shared, updated continuously, or much bigger than one computer.

Everything you've learned carries over: they all filter, group, join and reshape tables.

## Exercises

1. **Shrink the sessions.** Measure the memory used by `sessions.csv`, then convert `variant` and `device` to categories, `pages` to `int16`, `converted` to `int8` and `revenue` to `float32`. How much smaller is it?

## Key Takeaways

- `category`, smaller integers and `float32` can cut memory by half or more; check value ranges first.
- `chunksize` processes files too big for memory, for totals and counts.
- Method chains with `pipe` make pipelines readable step by step.
- Vectorize, read only what you need, filter early, and measure before optimizing.
