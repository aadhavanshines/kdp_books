# Appendix F: The Data Generator

This program makes every dataset in the book. Save it as `make_data.py` in your `data` folder and run it there, as Chapter 2 describes. With the library versions from Chapter 2, it produces exactly the files the book uses; the book's tests regenerate them on Python 3.12, 3.13, 3.14 and 3.15 and check that every file is identical.

Each function makes one dataset, with patterns built in on purpose, so your analyses have something real to find:

- `shop()`: products, customers and a year of orders for Larkspur Home, with holiday peaks, a spring garden season and larger orders when discounted; plus `orders_raw.csv`, 300 orders made messy on purpose.
- `survey()`: satisfaction that rises from the Basic to the Pro plan, and comments that match the ratings.
- `sessions()`: a checkout experiment in which version B converts a little better.
- `prices()`: random-walk prices for three companies that move partly with a market index.
- `health()`: seasonal pollution, sensor outages, and clinic visits that follow pollution two days later.
- `budget()`: a household's income, rent, bills and everyday spending.

```python
@include code/data/make_data.py
```
