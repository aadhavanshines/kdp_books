# Chapter 9: Working with Text

A great deal of programming is working with text: cleaning up what users type, reading names and addresses, splitting lines into fields, checking passwords, finding email addresses in a document. Python's strings come with dozens of methods for this, and the `re` module adds **regular expressions** for finding patterns. In this chapter you'll learn the methods you'll use most, build a password checker, and take your first steps with regular expressions.

## Slicing Strings

Strings are sequences of characters, so the slices you used on lists in Chapter 6 work on strings too:

```
@include code/ch09/session_strings.txt
```

`word[0:3]` takes characters 0, 1 and 2; `word[3:]` takes everything from index 3; `word[::2]` takes every second character; and `word[::-1]`, as you saw in Chapter 2, reverses a string.

The last line shows that strings are **immutable**: you can't change a character in place. Every string method returns a new string and leaves the original as it was. To "change" a string, you build a new one and assign it to the name: `word = "p" + word[1:]`.

## String Methods

These are the methods you'll reach for most often:

```
@include code/ch09/string_methods.py
```

```
@include code/ch09/string_methods.out
```

| Method | What it does |
| --- | --- |
| `strip()` | Removes spaces (and line breaks) from both ends; `lstrip` and `rstrip` do one end |
| `lower()`, `upper()`, `capitalize()`, `title()` | Change case |
| `split(sep)` | Splits into a list at each `sep`; with no argument, at any run of spaces |
| `sep.join(list)` | Joins a list of strings with `sep` between them |
| `startswith(s)`, `endswith(s)` | Check the beginning or end |
| `find(s)` | Position of `s`, or -1 if it isn't there |
| `count(s)` | How many times `s` appears |
| `replace(old, new)` | Replaces every `old` with `new` |
| `isdigit()`, `isalpha()`, `isupper()`, `islower()` | Check what kind of characters a string contains |

`repr` shows a value the way you'd type it in code, with quotes. It's useful for seeing spaces at the ends of a string, which `print` hides. Notice that `split(",")` keeps the empty string between the two commas: splitting on a specific separator never drops empty fields, which matters when you read data files.

> **Tip:** `split` and `join` are opposites. `"-".join("2026-10-15".split("-"))` gives back the original string. Together they're the quickest way to rearrange the parts of a string.

## Analyzing Text

This program reports on the first lines of a well-known poem by William Wordsworth:

```
@include code/ch09/text_report.py
```

```
@include code/ch09/text_report.out
```

`splitlines` splits a text into lines. To count words, the program first replaces commas and semicolons with spaces, so that `crowd,` counts as `crowd`, then splits on spaces. The loop to find the longest word keeps the first word of the greatest length, so "daffodils" wins over "wandered", which comes first but is one letter shorter. The last loop uses a slice and a width, `{line[:20]:20}`, to show the first 20 characters of each line in a column of exactly 20.

## Project: Password Checker

A good password is long and mixes kinds of characters. This checker lists everything that's wrong with a password, not just the first problem, so the user can fix it in one go:

```
@include code/ch09/password_checker.py
```

```
@include code/ch09/password_checker.out
```

The function goes through the password one character at a time and records which kinds it has seen, using `isupper`, `islower` and `isdigit`; anything else counts as a symbol. The line `has_upper = has_lower = has_digit = has_symbol = False` sets four variables to the same value at once. The function returns a list of problems, and an empty list means the password is strong. This design keeps the checking separate from the asking and printing, so the function could be reused in a web form or tested on its own, as you'll do in Chapter 15.

> **Note:** Real password rules are more subtle. Current security advice favors long passphrases and checking against lists of leaked passwords over rules about symbols. Treat this program as practice with strings, not as a security tool.

## Regular Expressions

Some text problems are about patterns: "something that looks like an email address" or "three digits, a space, four digits". **Regular expressions** describe such patterns in a compact language of their own. Python's `re` module uses them:

```
@include code/ch09/regex_intro.py
```

```
@include code/ch09/regex_intro.out
```

Write patterns as **raw strings**, with an `r` before the quote, so that backslashes reach the `re` module unchanged. The pieces used here:

| Pattern | Matches |
| --- | --- |
| `\d` | any digit |
| `\w` | a letter, digit or underscore |
| `[\w.]` | any one of the characters in the brackets |
| `+` | one or more of the thing before it |
| `{4}` | exactly four of the thing before it |
| `( )` | a group: a part you want to use separately |

`re.findall` returns every match in a list. `re.sub` replaces matches; `\1` in the replacement means "whatever group 1 matched", which is how the program keeps the first part of each phone number and masks the rest. `re.search` finds the first match and returns a **match object**, or `None` if there isn't one, so always check it before using it. `match.group(1)` and `match.group(2)` give the two groups.

Regular expressions are powerful, but they quickly become hard to read. Use string methods when they're enough, and keep patterns short and commented when they're not. The email pattern here is deliberately simple: a pattern that accepts every valid email address and nothing else is very long, and the only real test of an email address is to send it a message.

## Try It

1. In the shell, split `"2026-10-15"` into year, month and day, and join them back as `15/10/2026`.
2. Try `"  lots   of   spaces  ".split()` and `.split(" ")`. Why are the results different?
3. Change the phone pattern in `regex_intro.py` so that it also finds numbers written with hyphens, like `020-7946-0018`. (Hint: `[ -]` matches a space or a hyphen.)

## Exercises

1. **Caesar cipher.** Write `caesar(text, shift)`, which shifts each letter by `shift` places in the alphabet, wrapping from Z back to A, keeping upper and lower case and leaving other characters alone. Shifting by -3 should undo a shift of 3. (Hint: `ord("A")` is the number for a character and `chr(65)` the character for a number.)
2. **Title case.** Write `my_title(text)`, which capitalizes the first letter of each word and makes the rest lower case, without using `title()`.
3. **Hashtags.** Write `hashtags(text)`, which returns the hashtags in a text, without the `#`, using a regular expression.

## Key Takeaways

- Strings can be sliced like lists but can't be changed in place; every method returns a new string.
- `strip`, `lower`, `split`, `join`, `replace`, `startswith` and `find` handle most everyday text work.
- Keep checking logic in functions that return results, separate from input and output.
- Regular expressions find patterns: `re.findall`, `re.search` and `re.sub`, with raw-string patterns like `r"\d{4}"`. Use them when string methods aren't enough.
