# Chapter 19: Type Hints and Static Checking

Python doesn't make you declare what type a variable holds. That makes it quick to write, but it also means some mistakes, like adding a string to a number, show up only when that line runs, which may be in front of a user. **Type hints** let you write down the types you intend. Python itself ignores them when it runs your program, but your editor and a **type checker** called **mypy** read them and find mistakes before you run anything. In larger programs, type hints are some of the most useful documentation you can write.

## Writing Type Hints

You've seen type hints already, in dataclasses. Here they are on functions and variables:

```
@include code/ch19/typed_basics.py
```

```
@include code/ch19/typed_basics.out
```

- A parameter's type goes after a colon: `name: str`. With a default value, the default comes after the type: `times: int = 1`.
- The return type goes after an arrow before the colon: `-> str`.
- Collections say what they contain, in square brackets: `list[float]` is a list of floats; `dict[str, int]` maps strings to integers. A tuple lists each item's type: `tuple[int, int]`.
- `int | None` means "an `int` or `None`". Use it for functions that sometimes have nothing to return, like `find_index`.
- A variable can have a hint too: `scores: dict[str, int] = {...}`.

The hints change nothing when the program runs: the last line shows they're simply stored in the function's `__annotations__`. Python even lets you call `average` with integers, as here, because an `int` is accepted wherever a `float` is expected.

## Checking Types with mypy

**mypy** reads your code and its type hints and reports anything that doesn't fit, without running the program. Install it in your virtual environment with `python -m pip install mypy`. Here's a file with two mistakes:

```
@include code/ch19/type_mistakes.py
```

Running `python -m mypy --pretty type_mistakes.py` reports both, with the line, a description and a marker under the problem:

```
@include code/ch19/type_mistakes.out
```

Running the program would crash at the first mistake, `label(1965)`, and never even reach the second. mypy finds both at once, without running anything. In a large program, that turns bugs that would surface weeks later into errors you fix in seconds.

Editors such as Visual Studio Code do the same checking as you type, underlining mistakes and suggesting attribute names, because type hints tell them what each value is.

## Typing a Real Program

Here's part of Pocket Library with full type hints:

```
@include code/ch19/typed_library.py
```

```
@include code/ch19/typed_library.out
```

A few things are new:

- `newest` returns `Book | None`, because an empty library has no newest book. When the program uses the result, mypy insists on checking for `None` first. Forgetting that check is one of the most common bugs in any language, and mypy catches every case of it.
- `attrgetter("year")`, from the `operator` module, makes a small function that gets an object's `year` attribute, which is just what `max` needs for its `key`.
- `setdefault` returns the value for a key, first storing the default if the key is missing. It's another way to build a dictionary of lists.
- **`Protocol`** describes what an object must be able to do, rather than what class it must be. `Shelf` says "anything with a `books` attribute that's a list of `Book`". `count_tagged` accepts any such object, and `Library` qualifies without inheriting from `Shelf` or knowing it exists. This matches Python's style, often called **duck typing**: if it has the attributes you need, it'll do.

The book's harness checks this file, `typed_basics.py` and the exercise solution with `mypy --strict`, which requires hints everywhere and turns on all checks:

```
@include code/ch19/check_typed_library.out
```

## How Much to Type

Type hints are optional, and you can add them gradually. Good places to start:

- **Function parameters and return values.** They're the contracts between parts of your program and give the most value for the least effort.
- **Data classes**, which require them anyway.
- **Code that other people use**, such as libraries and shared modules.

Local variables rarely need hints; mypy works their types out from the values. Short scripts often don't need hints at all. Run mypy in your project as you would run your tests, and fix what it finds.

## Try It

1. Fix both mistakes in `type_mistakes.py` and run mypy again until it reports no errors.
2. Remove the `if newest is not None:` check in `typed_library.py` and run `python -m mypy typed_library.py`. Read the error.
3. Add type hints to the functions in your solutions to Chapter 8 and check them with mypy.

## Exercises

1. **Shopping basket.** Write an `Item` dataclass with `name`, `price` and `quantity` (default 1), and fully typed functions: `order_total(items, discount=0.0)`, which returns the total rounded to cents; `cheapest(items)`, which returns the cheapest item or `None` for an empty list; and `parse_quantities(text)`, which turns `"tea=2, milk=1"` into `{"tea": 2, "milk": 1}`. Check them with `mypy --strict`.

## Key Takeaways

- Type hints document intended types: `name: str`, `-> int`, `list[str]`, `dict[str, int]`, `int | None`. Python ignores them when running.
- mypy checks the hints without running the program and finds mistakes such as wrong types and missing `None` checks.
- `Protocol` describes what an object must have, not what class it is, which matches Python's duck typing.
- Add hints gradually, starting with function signatures and shared code, and run mypy as part of your checks.
