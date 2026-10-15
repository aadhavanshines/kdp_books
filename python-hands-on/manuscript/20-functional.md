# Chapter 20: Functional Tools and Pattern Matching

This chapter collects tools that make everyday code shorter and clearer. **Lambdas** are tiny functions you can write in the middle of an expression, perfect for sorting. `map`, `filter`, `reduce` and `partial` come from **functional programming**, a style built on passing functions around. And **structural pattern matching**, the `match` statement, checks the shape of data and pulls it apart in one step, which is ideal for commands, messages and nested data.

## Lambdas and Sorting Keys

Several times in this book you've passed a function as `key=` to tell `sorted`, `max` or `groupby` what to compare: `key=counts.get` in Chapter 7, `key=region_of` in Chapter 14, `key=attrgetter("year")` in Chapter 19. When the function is short and used only once, a **lambda** saves you from defining it separately:

```
@include code/ch20/lambdas_and_sorting.py
```

```
@include code/ch20/lambdas_and_sorting.out
```

`lambda book: book[1]` is a function that takes `book` and returns `book[1]`. It does exactly what this `year_of` function does, but it's written as an expression, without a name:

```
@include code/ch20/lambda_vs_def.py
```

```
@include code/ch20/lambda_vs_def.out
```

A lambda can contain only a single expression, whose value is returned automatically; no statements, no `return`. That's deliberate: anything longer deserves a proper `def` with a name.

`itemgetter(2)` from the `operator` module is a ready-made alternative to `lambda book: book[2]`, just as `attrgetter` gets attributes. The last example sorts by a tuple: first by length, then, for words of the same length, alphabetically ignoring case. Tuples compare item by item, which makes sorting by several keys easy. Use `reverse=True` for descending order, or a minus sign on a numeric key, as in `-score`, to reverse just that one part.

## map, filter, reduce and partial

```
@include code/ch20/functional_tools.py
```

```
@include code/ch20/functional_tools.out
```

- `map(function, items)` applies a function to every item.
- `filter(function, items)` keeps the items for which the function returns true.
- `reduce(function, items)`, from `functools`, combines items pairwise into one result: ((((1 × 2) × 3) × 4) × 5).
- `partial(function, ...)` makes a new function with some arguments filled in. `square` is `power` with the exponent fixed at 2.

`map` and `filter` return iterators, like generators, so the program wraps them in `list` to see the results. In Python, list comprehensions usually do the same job more readably, as the middle lines show, and most Python programmers prefer them. `map` is still handy with an existing function, such as `map(int, ["1", "2"])`. For reduction, Python has built-ins for the common cases: `sum`, `max`, `min`, `any`, `all` and `math.prod`.

## Pattern Matching

The `match` statement compares a value against a series of **patterns** and runs the first case that fits. Unlike a chain of `if` and `elif`, a pattern can check a value's shape and pick out its parts at the same time. Here it interprets typed commands:

```
@include code/ch20/match_commands.py
```

```
@include code/ch20/match_commands.out
```

`command.split()` makes a list of words, and each `case` describes a list:

- `["add", title]` matches a list of exactly two words whose first is `"add"`, and stores the second in `title`.
- `["add", title, year] if year.isdigit()` matches three words, but only if the **guard**, the `if` after the pattern, is true.
- `["remove", *titles]` matches `"remove"` followed by any number of words, collected into a list.
- `"quit" | "exit"` matches either word.
- `[]` matches an empty list, and `_` matches anything: the default case at the end.

Doing the same with `if` statements would need checks of the length, the first word and the types, all mixed together. The patterns read like a description of the valid commands.

Patterns can also match objects and dictionaries:

```
@include code/ch20/match_shapes.py
```

```
@include code/ch20/match_shapes.out
```

`Point(x=0, y=0)` matches a `Point` whose attributes are both 0. `Point(x=0, y=y)` matches any point with `x` 0, and captures its `y`. Patterns can nest: `Circle(center=Point(x=0, y=0), radius=r)` looks inside the circle at its center. A dictionary pattern like `{"type": "point", "x": x, "y": y}` matches any dictionary that has those keys, which is ideal for JSON data from files and web APIs. As with `if` and `elif`, order matters: put specific cases before general ones.

> **Note:** In a pattern, a plain name like `y` or `title` always captures a value; it never compares with a variable of that name. To compare with a constant, use a literal (`0`, `"add"`) or a dotted name such as `Color.RED`.

## Try It

1. Sort the books in `lambdas_and_sorting.py` by rating, lowest first, and then by title length.
2. Use `map` with `str.upper` to convert a list of names to capitals, then do the same with a list comprehension.
3. Add a `list` command to `handle` that accepts `list` alone or `list unread`.

## Exercises

1. **Top scores.** Write `top_n(scores, n)`, which takes a dictionary of names and scores and returns the `n` best `(name, score)` pairs, highest first, with ties in alphabetical order.
2. **Compose.** Write `compose(*functions)`, which returns a single function applying the given functions from right to left, so that `compose(f, g, h)(x)` is `f(g(h(x)))`. Try it with `str.strip`, `str.upper` and a lambda that adds `"!"`.
3. **Status codes.** Write `http_status(code)` with `match`: 200, 201 and 204 are "success"; 301 and 302 "redirect"; 404 "not found"; other codes from 400 to 499 "client error"; 500 to 599 "server error"; anything else "unknown".

## Key Takeaways

- A lambda is a one-expression function without a name; use it for short `key=` functions, and `def` for anything longer. `itemgetter` and `attrgetter` are ready-made keys.
- Sorting by a tuple sorts by several keys; `reverse=True` or a negated number reverses the order.
- `map`, `filter`, `reduce` and `partial` apply, select, combine and pre-fill functions. Comprehensions are usually clearer than `map` and `filter`.
- `match` compares data against patterns that check its shape and capture its parts, with `|` for alternatives, `*rest` for the remainder, guards, class patterns and dictionary patterns.
