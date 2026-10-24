# Chapter 5: Loading and Saving Data

Data comes in many formats: CSV files, Excel workbooks, JSON from web services, and tables in databases. pandas reads and writes all of them with a family of `read_...` functions and `to_...` methods. This chapter covers the four you'll meet most often, and the options that save you from trouble later.

## Reading CSV Files Carefully

`read_csv` has dozens of options. Four of them pay for themselves on almost every file:

```python
@include code/ch05/read_options.py
```

```
@include code/ch05/read_options.out
```

- `usecols` reads only the columns you need, which saves memory and time on big files.
- `parse_dates` turns text dates into real dates, so you can sort, filter and group by them correctly.
- `dtype` sets column types up front. Here `region` and `category` become `category` columns: pandas stores each distinct value once and keeps small codes for the rows, which uses much less memory for columns with few distinct values (Chapter 27).
- `info()` prints the result: columns, non-missing counts, types and memory used. The 5,833 non-null counts tell you there are no missing values in these columns.

Other options you'll reach for: `sep=";"` for semicolon-separated files (common in Europe, where the comma is the decimal separator), `decimal=","`, `encoding="latin-1"` for older files that aren't UTF-8, `na_values=["n/a", "-"]` for files that mark missing values in their own way, and `nrows=1000` to read just the start of a huge file while you explore it.

## Excel Workbooks

pandas reads and writes Excel files through openpyxl. One workbook can hold several sheets:

```python
@include code/ch05/excel_roundtrip.py
```

```
@include code/ch05/excel_roundtrip.out
```

`ExcelWriter` writes several DataFrames into one workbook, one per sheet. `read_excel` with `sheet_name=None` reads every sheet into a dictionary of DataFrames, keyed by sheet name.

Notice one change: `list_price` came back as whole numbers (45, 60, 24) instead of 45.0, 60.0 and 24.0. Excel stores numbers without a separate integer type, so whole-valued prices look like integers when read back. The values are the same, but it's a reminder that every trip through another format can change types. Check `dtypes` after reading.

> **Warning:** Excel is not a database. A worksheet holds at most 1,048,576 rows and 16,384 columns (the older `.xls` format only 65,536 rows), and when data is pasted into a full sheet, rows beyond the limit can be silently cut off. Keep large data in CSV files or a database, and use Excel for the summary, not the raw data.

**Real-World Story:** In October 2020, Public Health England reported that 15,841 positive COVID-19 test results from 25 September to 2 October had been left out of the daily case counts, delaying contact tracing for thousands of people. According to press reports at the time, the results were being combined in a spreadsheet whose size limit was exceeded, so the newest results were dropped without an error. The lesson for analysts: check row counts at every step. If 50,000 rows go in, make sure 50,000 come out.

## JSON

Web services usually return **JSON**: nested lists and dictionaries in text form.

```python
@include code/ch05/json_io.py
```

```
@include code/ch05/json_io.out
```

`to_json(orient="records")` writes one JSON object per row, a format most web tools accept. When JSON is nested, as in the two-order reply here, `json_normalize` flattens it into columns, joining nested names with dots: `customer.name`, `customer.city`.

## SQL Databases

Much of the world's data lives in databases, and pandas talks to them directly. Python includes **SQLite**, a database stored in a single file, so you can try this with nothing to install:

```python
@include code/ch05/sqlite_io.py
```

```
@include code/ch05/sqlite_io.out
```

`to_sql` writes a DataFrame into a database table (`if_exists="replace"` overwrites any older copy), and `read_sql` runs a query and returns the result as a DataFrame. The North region has the most orders and items. For other databases, such as PostgreSQL or MySQL, you connect with that database's Python driver and use the same `read_sql`. Chapter 18 teaches the SQL itself.

## Exercises

1. **Just two columns.** Read only `plan` and `satisfaction` from `survey.csv`, with `plan` as a category. Print the types and the list of categories.
2. **One file per region.** Write `orders.csv` out as four files, `orders_east.csv` and so on, one per region, and print how many rows each holds. (Hint: loop over `orders.groupby("region")`, which gives each region's name and its rows.)

## Key Takeaways

- `read_csv` options `usecols`, `parse_dates`, `dtype` and `na_values` prevent most loading problems.
- `read_excel` and `ExcelWriter` handle workbooks with several sheets; check types after reading.
- Excel has hard row limits; check row counts at every step of a pipeline.
- `json_normalize` flattens nested JSON; `read_sql` and `to_sql` connect pandas to databases.
