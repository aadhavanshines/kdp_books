# Chapter 12: Dates and Time Series

Time is in almost every dataset: when an order was placed, when a sensor read, when a price closed. pandas has strong tools for dates: pulling out parts like the weekday, regrouping daily data into weeks or months, rolling averages, and changes from one period to the next.

## Date Parts

Once a column is a real date (`parse_dates` when reading, or `pd.to_datetime` later), the `.dt` accessor gives its parts:

```python
@include code/ch12/dates_basics.py
```

```
@include code/ch12/dates_basics.out
```

`dt.day_name()`, `dt.month_name()` and `dt.isocalendar().week` give the weekday, month and week number. Grouping by weekday shows Saturday is the busiest day, with Sunday second. Weekday names would sort alphabetically (Friday first), so `reindex` puts them in calendar order.

## Resampling: Days to Months

**Resampling** regroups a time series into new time periods. It needs the dates as the index:

```python
@include code/ch12/resample.py
```

```
@include code/ch12/resample.out
```

`resample("D").sum()` gives daily revenue (before discounts, this time), with a zero for any day without orders, so no day is silently missing. `resample("MS").sum()` then totals each month, labeled by its first day ("MS" means month start; "ME" would label by month end). The holiday season stands out: December's $61,500 is about three times February's.

`pct_change()` gives the change from each period to the previous one: October was 30.6% up on September, and growth continued through December.

> **Tip:** Common resampling codes: `D` (day), `W` (week, ending Sunday), `MS` and `ME` (month), `QS` and `QE` (quarter), `YS` and `YE` (year).

## Rolling Averages

Daily numbers are noisy. A **rolling average** smooths them by averaging each day with the days before it:

```python
@include code/ch12/rolling.py
```

```
@include code/ch12/rolling.out
```

`rolling(7).mean()` averages each day with the six before it. Daily revenue in the last week of November jumped between $1,250 and $2,317, while the 7-day average moved gently between about $1,650 and $1,800. The best seven days of the year ended on 12 December, at $2,359 a day: the pre-holiday peak.

`shift(1)` moves a series one step later in time (each day gets yesterday's value), which is how you compare each period with the one before, or line up a cause with an effect that comes later (Chapter 25).

## Exercises

1. **Weekly conversion.** `sessions.csv` records an experiment over four weeks of October. What share of sessions converted in each week? (Hint: the mean of a 0/1 column is the share of 1s.)
2. **Best and worst months.** For the city of Avonford in `air_quality.csv`, find the month with the highest and the lowest average PM2.5.

## Key Takeaways

- Use real date types; then `.dt` gives weekdays, months, weeks and more.
- `resample` regroups time series into new periods, with explicit zeros for empty ones.
- `pct_change` measures change between periods; `shift` compares each period with an earlier one.
- Rolling averages smooth noisy series and make trends visible.
