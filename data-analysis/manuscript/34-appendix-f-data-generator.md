# Appendix F: The Data Generator

This program makes every dataset in the book. It is also in the book's code repository (github.com/aadhavanshines/data-analysis-with-python-hands-on) as `code/data/make_data.py`, together with the files it makes. To type it yourself, enter the parts below, in order, into one file called `make_data.py` in your `data` folder, and run it there, as Chapter 2 describes. With the library versions from Chapter 2, it produces exactly the files the book uses; the book's tests regenerate them on Python 3.12, 3.13, 3.14 and 3.15 and check that every file is identical.

Each function makes one dataset, with patterns built in on purpose, so your analyses have something real to find:

- `shop()`: products, customers and a year of orders for Larkspur Home, with holiday peaks, a spring garden season and larger orders when discounted; plus `orders_raw.csv`, 300 orders made messy on purpose. Four smaller functions do the work.
- `survey()`: satisfaction that rises from the Basic to the Pro plan, and comments that match the ratings.
- `sessions()`: a checkout experiment in which version B converts a little better.
- `prices()`: random-walk prices for three companies that move partly with a market index.
- `health()`: seasonal pollution, sensor outages, and clinic visits that follow pollution two days later.
- `budget()`: a household's income, rent, bills and everyday spending.

> **Tip:** Each part starts with a line at the left margin (`def`, `import` or `if`). Every line of a function is indented at least four spaces, including the lines that continue on the next page. If Python reports an `IndentationError`, compare the line it names with the line above it in the book.

## Setup

The fixed seed, 2026, is what makes every run identical.

```python
@include code/data/make_data.py#L1-L11
```

## The Shop

```python
@include code/data/make_data.py::shop_products
```

```python
@include code/data/make_data.py::shop_customers
```

```python
@include code/data/make_data.py::shop_orders
```

```python
@include code/data/make_data.py::messy_copy
```

```python
@include code/data/make_data.py::shop
```

## The Survey and the Experiment

```python
@include code/data/make_data.py::survey
```

```python
@include code/data/make_data.py::sessions
```

## Prices, Health and the Budget

```python
@include code/data/make_data.py::prices
```

```python
@include code/data/make_data.py::health
```

```python
@include code/data/make_data.py::budget
```

## Writing the Files

```python
@include code/data/make_data.py#L315-L336
```
