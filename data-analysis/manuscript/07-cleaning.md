# Chapter 7: Cleaning Messy Data

Real data is messy. People type region names three different ways, systems export prices with currency symbols, dates arrive in two formats in the same column, and the same row appears twice. If you analyze messy data as it is, you get wrong answers without any error message. Cleaning is where careful analysts earn their reputation.

This chapter cleans `orders_raw.csv`, an export of 300 orders that has every common problem, then shows how to check data automatically so problems can't sneak back in.

## Look Before You Clean

First, find out what's wrong:

```python
@include code/ch07/inspect_raw.py
```

```
@include code/ch07/inspect_raw.out
```

The problems, one by one:

- **Types are wrong.** `unit_price` and `order_date` are text (`str`), not numbers and dates. `quantity` is `float64` rather than whole numbers, because a column with missing values can't be a plain integer column.
- **Missing values.** 14 quantities are missing. `isna()` marks missing values, and summing it counts them per column.
- **Inconsistent text.** Look closely at the region counts: "East" appears twice. One of them is "East " with a trailing space, invisible in the output but a different value to the computer. There are also lowercase versions. Twelve spellings for four regions.
- **Duplicates.** Three rows are exact copies of others.
- **Formats.** Prices have a dollar sign, and dates come in two layouts: day/month/year and year-month-day.

## A Date Trap

Mixed date formats deserve their own warning, because the obvious fix silently gives wrong answers:

```python
@include code/ch07/date_trap.py
```

```
@include code/ch07/date_trap.out
```

Asking pandas to guess each date's format with `dayfirst=True` reads "05/01/2025" correctly as 5 January, but then also reads the ISO date "2025-01-06" as year, *day*, month: 1 June. No error, no warning, just a wrong date. The safe approach is to try each known format explicitly, with `errors="coerce"` turning non-matching dates into missing values (`NaT`, "not a time"), then combine them with `fillna`.

> **Warning:** Never let software guess dates when a column might mix formats. "03/04/2025" is 3 April in Britain and India and 4 March in the United States. Find out which format each source uses, and parse it explicitly.

## Cleaning, Step by Step

```python
@include code/ch07/clean_orders.py
```

```
@include code/ch07/clean_orders.out
```

1. `drop_duplicates()` removes the three repeated rows. `.copy()` makes a new, independent DataFrame, so changes to `clean` never affect `raw`.
2. `str.strip()` removes spaces at the ends, and `str.title()` capitalizes each word, turning twelve spellings into four.
3. `str.replace("$", "", regex=False)` removes the dollar sign, and `astype(float)` makes the column numeric. `regex=False` matters: in a regular expression (Chapter 13), `$` means "end of text", not a dollar sign.
4. Dates are parsed with each format explicitly. The `assert` stops the program if any date matched neither format, rather than letting missing dates slip through.
5. One quantity was 400, impossible for a homeware order (the real maximum is 7). Treat it as an entry error: set it to missing, along with the other 14 missing quantities, and fill all of them with the **median** quantity. With the missing values gone, the column can become whole numbers.

**What to do with missing values** is a judgment call, and you should say what you chose in your report:

| Approach | When it makes sense |
| --- | --- |
| Drop the rows (`dropna`) | Few rows affected, missing at random |
| Fill with median or mean (`fillna`) | A rough value is fine for totals |
| Fill from neighbors (`ffill`, `interpolate`) | Time series with short gaps (Chapter 25) |
| Keep as missing | The gap itself is meaningful; most pandas methods skip missing values |
| Fix at the source | Always the best option when you can |

**Real-World Story:** Spreadsheet programs helpfully convert anything that looks like a date into a date. A 2016 study in *Genome Biology* found that about one in five genetics papers that shared gene lists as Excel files contained gene names that had been silently converted into dates: the gene SEPT2 became 2 September, and MARCH1 became 1 March. In 2020, the committee that names human genes gave up and renamed them: SEPT1 is now SEPTIN1 and MARCH1 is MARCHF1. Cleaning means checking types, not just values.

## Validate With Checks

Once data is clean, write down your expectations as checks that run every time:

```python
@include code/ch07/validate.py
```

```
@include code/ch07/validate.out
```

Each line states one rule about the data: unique IDs, nothing missing, sensible quantities, positive prices, dates in the right year, only known regions. When next month's file arrives with a new problem, a check fails before any wrong number reaches a report. In a larger project, you'd turn these into tests (Chapter 19).

## Exercises

1. **Weights as text.** Clean this Series into numbers: `[" 12 kg", "7kg", "n/a", "15 KG ", ""]`. Lowercase it, remove "kg", strip spaces, and convert with `pd.to_numeric(..., errors="coerce")`, which turns anything unconvertible into a missing value. What's the mean of the known weights?
2. **Show the duplicates.** In `orders_raw.csv`, print every row that has a duplicate, both copies, sorted by order ID. (Hint: `duplicated(keep=False)` marks all copies.)

## Key Takeaways

- Inspect first: types, missing values, distinct spellings, duplicates and formats.
- Clean text with `str.strip()` and `str.title()`; convert types with `astype` and `to_datetime`.
- Parse dates with explicit formats; guessing can silently swap days and months.
- Choose how to handle missing values and impossible values, and say what you chose.
- Turn your expectations into automatic checks.
