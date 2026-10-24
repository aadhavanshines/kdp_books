# Chapter 13: Working With Text

Text columns hold some of the most useful information in a dataset, and some of the hardest to use: product names, comments, bank transaction descriptions, codes. pandas gives every text column a `.str` accessor with Python's string methods and regular expressions, applied to the whole column at once.

## String Methods on Whole Columns

The survey has a free-text comment from each respondent:

```python
@include code/ch13/text_methods.py
```

```
@include code/ch13/text_methods.out
```

- `keep_default_na=False` matters here: by default, `read_csv` treats empty fields as missing, but an empty comment is a real answer ("nothing to say"), so the program keeps it as an empty string.
- `str.len()` gives each comment's length; `describe()` summarizes those lengths.
- `str.contains("slow")` marks comments containing a word; summing counts them: 114 mention slowness.
- `str.contains(r"price|value", regex=True)` uses a **regular expression**, a small pattern language. `|` means "or", so it finds comments mentioning either word.
- Lowercasing, splitting into words, and `explode` (one row per word) turns comments into a word list. Short common words such as "to" and "is", called **stopwords**, are removed before counting, or they'd top every list. "Support" is the most common remaining word.

## Extracting and Categorizing

Bank statements describe transactions in capital letters with store numbers mixed in. Regular expressions pull out the parts you need:

```python
@include code/ch13/extract.py
```

```
@include code/ch13/extract.out
```

`str.extract(r"#(\d+)")` finds a `#` followed by one or more digits (`\d+`), and returns the part in parentheses, the store number. Rows without a match get a missing value.

To categorize transactions, the program applies a dictionary of patterns in turn: any description matching `FRESHMART` is groceries, `TRANSIT|RIDESHARE` is transport, and so on. Anything unmatched stays "Other". The totals show the household's year: $50,400 of income, $18,680 on housing, and about $5,000 on groceries. Project 6 (Chapter 26) builds on this.

Some regular expression pieces worth knowing:

| Pattern | Matches |
| --- | --- |
| `\d`, `\d+` | One digit; one or more digits |
| `\w+` | A word (letters, digits, underscore) |
| `\s` | A space or tab |
| `^`, `$` | Start, end of the text |
| `A\|B` | A or B |
| `(...)` | A group to extract |
| `(?P<name>...)` | A named group (becomes a column name in `extract`) |

> **Tip:** `str.contains(pattern, case=False)` ignores capitals. When you search for a literal character that has a special meaning in patterns, such as `$`, `.` or `+`, use `regex=False` or escape it with a backslash.

## Exercises

1. **Cafe visits.** How many transactions were at each cafe? Show the names in title case ("Cafe Luma").
2. **Document codes.** Split codes like `"INV-2025-0041"` and `"po-2024-0007"` into three columns, `kind`, `year` and `num`, using `str.extract` with named groups. Make the kinds uppercase and `num` a whole number.

## Key Takeaways

- The `.str` accessor applies string methods to whole columns.
- `str.contains`, `str.extract` and `str.replace` accept regular expressions for flexible matching.
- `str.split` with `explode` turns text into one row per word; remove stopwords before counting.
- A dictionary of patterns turns messy descriptions into clean categories.
