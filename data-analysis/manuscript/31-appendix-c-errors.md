# Appendix C: Common Errors and Fixes

The errors analysts meet most often, what they mean, and how to fix them. The last line of a traceback names the error; start reading there.

| Error message (last line) | Usual cause | Fix |
| --- | --- | --- |
| `FileNotFoundError: ... orders.csv` | Running the program from a different folder | `cd` into the chapter folder, or check the path |
| `KeyError: 'Revenue'` | Column name misspelled or in different case | Print `df.columns` and copy the exact name |
| `ValueError: The truth value of a Series is ambiguous` | Using `and`/`or` between conditions | Use `&` and `\|`, with parentheses around each condition |
| `TypeError: unsupported operand type(s) for *: 'str' and 'int'` | A numeric column was read as text | Clean it and convert with `astype` or `pd.to_numeric` |
| `ValueError: could not convert string to float: '$18.00'` | Symbols or spaces in numbers | Remove them with `str.replace`, then convert |
| `ValueError: Index contains duplicate entries, cannot reshape` | `pivot` with repeated index/column pairs | Use `pivot_table` with an `aggfunc` |
| `MergeError: Merge keys are not unique in right dataset` | `validate` found duplicated keys | Find the duplicates with `duplicated()`, and fix them |
| `ValueError: time data ... doesn't match format` | A date in an unexpected layout | Check the formats present; parse each explicitly |
| `SettingWithCopyWarning` (older pandas) | Changing a filtered piece of a DataFrame | Add `.copy()` after filtering, or use `df.loc[mask, "col"] = ...` |
| `ModuleNotFoundError: No module named 'pandas'` | Virtual environment not active | Activate it (Chapter 2), or install the package |
| `ImportError: Missing optional dependency 'openpyxl'` | Reading or writing Excel without openpyxl | `python -m pip install openpyxl` |

## Wrong Answers Without Errors

The worst problems give no error at all:

- **Row counts change unexpectedly** after a merge: duplicated keys (use `validate`).
- **Totals too high:** duplicated rows (`drop_duplicates`), or a many-to-many merge.
- **Categories split in two:** spaces or capitals (`str.strip().str.title()`).
- **Dates in the wrong month:** day and month swapped while parsing (parse explicitly).
- **Averages of averages:** weighting groups equally when they differ in size (Chapter 20).
- **Missing values silently skipped:** `mean()` ignores them; check `isna().sum()` first.
