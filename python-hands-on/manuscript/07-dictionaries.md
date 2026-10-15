# Chapter 7: Dictionaries and Sets

A list finds things by position: the third item, the last item. Very often you want to find things by name instead: the phone number for Ben, the price of apples, the number of times a word appears. That's what a **dictionary** does. In this chapter you'll learn dictionaries and their simpler relative, **sets**, write a word counter, and give each book in Pocket Library an author, a year and a "read" mark.

## Dictionaries

A dictionary stores **key-value pairs**. You write it in curly braces, with a colon between each key and its value. You look a value up by its key, in square brackets:

```
@include code/ch07/dict_basics.py
```

```
@include code/ch07/dict_basics.out
```

Assigning to a key adds the pair if the key is new, or replaces the value if it already exists; `del` removes a pair. Keys are unique: a dictionary can't hold two entries for `"Ben"`. Keys are usually strings or numbers; values can be anything, including lists and other dictionaries.

`items()` gives you the key-value pairs, which is the most common way to loop over a dictionary. `keys()` and `values()` give you just the keys or just the values. Dictionaries remember the order in which keys were added, and loops follow that order.

## Missing Keys

Looking up a key that isn't there is an error:

```
@include code/ch07/session_dicts.txt
```

A `KeyError` names the missing key. There are two ways to avoid it: check first with `in`, or use `get`, which returns a default value (or `None`, Python's "nothing" value) instead of failing. `update` adds or replaces several pairs at once.

The last line sorts the keys by their values. `sorted(stock)` would sort the keys alphabetically; `key=stock.get` tells `sorted` to call `stock.get` on each key and sort by the result, which is the quantity. `reverse=True` puts the largest first. You'll use `key=` often; Chapter 20 shows all it can do.

## Project: Word Counter

Counting things is one of the most common jobs for a dictionary. This program counts the words in a text and shows the five most common:

```
@include code/ch07/word_counter.py
```

```
@include code/ch07/word_counter.out
```

The text is a **triple-quoted string**, which can run over several lines. The program converts it to lower case, so that "The" and "the" count as one word, and `split()` breaks it into words at spaces and line breaks. `strip` removes punctuation from both ends of each word, and the program removes a trailing `'s` so that "cat's" counts as "cat".

The heart of the program is one line:

```
counts[word] = counts.get(word, 0) + 1
```

If the word is new, `get` returns 0, so it's stored with a count of 1. Otherwise, its count goes up by one. Remember this line; you'll write it many times.

When two words have the same count, such as "sat", "on" and "mat", `sorted` keeps them in the order they were first added. That's called a **stable** sort.

## Sets

A **set** is an unordered collection with no duplicates. You write it in curly braces without colons. Sets are fast at checking membership, and they support the operations you may remember from school mathematics:

```
@include code/ch07/sets.py
```

```
@include code/ch07/sets.out
```

- `a & b`, the **intersection**, holds the items in both sets.
- `a | b`, the **union**, holds the items in either set.
- `a - b`, the **difference**, holds the items in `a` but not in `b`.

`set(tags)` is the quickest way to remove duplicates from a list, although it loses the order. Sets have no order, so the program sorts them before printing to make the output predictable. An empty set is written `set()`, because `{}` is an empty dictionary.

## Choosing a Collection

| You need | Use |
| --- | --- |
| Items in order, which can change | a list |
| A small, fixed group of values | a tuple |
| Values looked up by a key | a dictionary |
| Unique items, or fast "is it there?" checks | a set |

## Project: Pocket Library, Version 2

A book is more than a title. Version 2 stores each book as a dictionary, and the library as a list of dictionaries, a structure you'll meet in nearly every real program:

```
@include code/ch07/library_v2.py
```

```
@include code/ch07/library_v2.out
```

To reach a value, you index twice: `books[0]` is the first book's dictionary, and `books[0]["title"]` is its title. In the loops, `book["title"]` does the same for each book in turn. Inside an f-string that's already in double quotes, the keys use single quotes: `{book['title']}`.

The program builds two summaries. The "still to read" list uses a loop and `append`, and `", ".join(to_read)` joins the titles into one string with a comma and a space between them. The count per author uses the same `get` pattern as the word counter.

## Try It

1. In `dict_basics.py`, try to print `phone_book["Asha"]` after it's been deleted. What error do you get?
2. Change `word_counter.py` to show the ten most common words, using your own paragraph of text.
3. Add a book of your own to `library_v2.py` and run it. Do the columns still line up? What happens if the title is longer than 18 characters?

## Exercises

1. **Invert.** Given a dictionary of countries and their capitals, build a new dictionary that maps each capital to its country, and use it to look up the country whose capital is Tokyo.
2. **Letter count.** Count how often each letter appears in "Mississippi", ignoring case, and print the letters in alphabetical order with their counts.
3. **Common friends.** Priya's friends are Asha, Ben, Chen and Dev; Omar's are Chen, Dev and Ella. Using sets, print the friends they have in common, and Priya's friends whom Omar doesn't know yet.

## Key Takeaways

- A dictionary maps unique keys to values: `d[key]` reads, `d[key] = value` adds or changes, `del d[key]` removes.
- A missing key raises `KeyError`; use `in` or `get(key, default)` to avoid it. `counts[k] = counts.get(k, 0) + 1` counts things.
- Loop over `items()` to get keys and values together. `sorted(d, key=d.get)` sorts keys by their values.
- Sets hold unique items and support `&`, `|` and `-`. A list of dictionaries is the natural way to store records.
