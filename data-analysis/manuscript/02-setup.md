# Chapter 2: Setting Up and the Book's Data

In this chapter you'll install the four libraries the book uses, create the folders for your work, make the datasets, and take a first look at them. It takes about fifteen minutes, and then everything else in the book just works.

## Python and a Virtual Environment

You need Python 3.12 or newer. Check what you have from a terminal (on Windows, use `py` instead of `python3`):

```
$ python3 --version
```

Make a folder for the book's work and, inside it, a **virtual environment**: a private set of installed libraries for this project, so it can't clash with anything else on your computer:

```
$ mkdir data-analysis
$ cd data-analysis
$ python3 -m venv .venv
```

Activate it each time you open a new terminal for this book. On macOS and Linux:

```
$ source .venv/bin/activate
```

On Windows:

```
$ .venv\Scripts\activate
```

## Installing the Libraries

The book uses four libraries:

- **NumPy:** fast arrays of numbers; pandas is built on it.
- **pandas:** tables of data (DataFrames) and almost everything you do with them.
- **matplotlib:** charts.
- **openpyxl:** reading and writing Excel files, which pandas uses behind the scenes.

Install the versions the book was tested with, so your output matches the book exactly:

```
$ python -m pip install numpy==2.5.4 pandas==3.0.6 matplotlib==3.11.2
$ python -m pip install openpyxl==3.1.5 pytest==9.1.1
```

(pytest, for testing your analysis code, appears in Chapter 19.) Newer versions will almost always work too; occasionally a number in a printed table may differ in the last digit, or a message may be worded differently.

Check the installation:

```python
@include code/ch02/check_setup.py
```

```
@include code/ch02/check_setup.out
```

> **Tip:** Many analysts also like **Jupyter notebooks**, where code, output and charts sit together on one page. Everything in this book works in a notebook as well (install it with `python -m pip install notebook` and start it with `jupyter notebook`). The book uses plain `.py` files because they're easier to test, rerun and share.

## The Folder Layout

Each chapter's programs go in their own folder, next to a shared `data` folder:

```
data-analysis/
    data/
        make_data.py
        orders.csv
        ...
    ch01/
        first_look.py
    ch02/
        check_setup.py
    ...
```

The programs read data with paths like `"../data/orders.csv"`: `..` means "the folder above this one", so a program in `ch05` finds the shared data folder. Run each program from inside its own chapter folder:

```
$ cd ch01
$ python first_look.py
```

## Making the Data

All the datasets in this book are fictional, and one program makes all of them: `make_data.py`, printed in full in Appendix F. It uses NumPy's random number generator with a fixed **seed** (2026), so it makes exactly the same "random" data on every computer, every time. That's why your results will match the book's to the last digit.

Type or copy `make_data.py` into your `data` folder and run it there:

```
$ cd data
$ python make_data.py
```

```
@include code/data/make_data.out
```

The data was built with patterns on purpose: busy Novembers and Decembers, garden products that sell in spring, bigger orders when there's a discount, a checkout page that converts a little better, pollution that affects clinic visits two days later. Practicing on data with known patterns is the best way to learn: when your analysis finds them, you know your method works.

## Meet the Data

This program lists every file with its size and columns:

```python
@include code/ch02/peek_data.py
```

```
@include code/ch02/peek_data.out
```

Here's what each one holds.

| File | One row per | Used in |
| --- | --- | --- |
| `orders.csv` | Order at Larkspur Home in 2025 | Most chapters; Project 1 |
| `customers.csv` | Customer: signup date, region, segment, birth year | Chapters 8, 10, 18 |
| `products.csv` | Product: category, list price, unit cost | Chapters 10, 18, 21 |
| `orders_raw.csv` | A messy export of 300 orders | Chapter 7 |
| `survey.csv` | Survey response: plan, ratings, comment | Chapters 13, 22 |
| `sessions.csv` | Website visit in a checkout experiment | Chapters 17, 23 |
| `prices.csv` | Trading day: prices of three companies and an index | Chapter 24 |
| `air_quality.csv` | Day and city: fine-particle pollution | Chapters 14, 16, 25 |
| `clinic_visits.csv` | Day and city: clinic visits for breathing problems | Chapters 14, 16, 25 |
| `budget.csv` | Bank transaction of one household | Chapters 13, 26 |

**CSV** (comma-separated values) is the most common way to share tables: plain text, one row per line, columns separated by commas, with the column names on the first line. Every spreadsheet program and database can read and write it.

## Key Takeaways

- Use a virtual environment per project, and install the exact library versions when you need reproducible results.
- The book's four libraries: NumPy (arrays), pandas (tables), matplotlib (charts) and openpyxl (Excel files).
- Keep each chapter's programs in their own folder beside a shared `data` folder.
- A fixed random seed makes "random" data identical everywhere, so your results match the book's.
