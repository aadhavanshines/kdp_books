# Chapter 13: Inheritance, Dataclasses and Special Methods

Chapter 12 ended with two problems: the `Book` class needed a lot of repetitive code just to hold four values, and its objects printed as something like `<__main__.Book object at 0x...>`. This chapter solves both, and goes further. You'll learn **inheritance**, which lets one class build on another; **special methods**, which let your objects work with `+`, `==`, `len`, `for` and `print`; **dataclasses**, which write the routine code for you; and **properties**, which check values as they're set. Pocket Library becomes a collection that works like Python's own.

## Inheritance

Different kinds of shape have a lot in common: a name, an area, a description. Inheritance lets you write the common parts once, in a **base class**, and the differences in **subclasses**:

```
@include code/ch13/inheritance.py
```

```
@include code/ch13/inheritance.out
```

`class Circle(Shape)` makes `Circle` a subclass of `Shape`: it **inherits** all of `Shape`'s methods, and can add new ones or **override** existing ones with its own versions. `describe` is written once in `Shape`, and calls `self.area()`, which runs the version for whatever kind of shape `self` actually is. That's why one loop can describe three different shapes. This idea, one method call that does the right thing for each type, is called **polymorphism**.

`super().__init__(...)` calls the base class's `__init__`, so that the shared set-up (here, storing the name) is done in one place. `Square` inherits from `Rectangle` and simply passes the same value twice. `Shape.area` raises `NotImplementedError` as a reminder that every subclass must provide its own.

A subclass is a special kind of its base class, so `isinstance(Square(1), Rectangle)` is `True`. A good test for inheritance is whether you can say "a square **is a** rectangle". If you'd instead say "a library **has** books", use an attribute, not inheritance.

> **Tip:** Keep inheritance shallow. One or two levels are easy to follow; five levels, where a method might be defined in any of them, are not. Many experienced programmers prefer small classes that hold other objects as attributes.

## Special Methods

Python's operators and built-in functions call special methods, with dunder names, on your objects. `a + b` calls `a.__add__(b)`, `a == b` calls `a.__eq__(b)`, `len(x)` calls `x.__len__()`, and so on. Define them, and your objects work with Python's syntax:

```
@include code/ch13/special_methods.py
```

```
@include code/ch13/special_methods.out
```

| Method | Called by |
| --- | --- |
| `__str__` | `print(x)` and `str(x)`: a readable version for users |
| `__repr__` | `repr(x)`, the shell, and inside lists: an unambiguous version for programmers, ideally looking like the code that creates the object |
| `__add__` | `x + y` |
| `__eq__` | `x == y` |
| `__lt__` | `x < y`, and therefore `sorted` |
| `__bool__` | `if x:` and `bool(x)` |
| `__len__` | `len(x)` |
| `__contains__` | `y in x` |
| `__iter__` | `for item in x` |

`Money` stores amounts as whole cents, so `Money(0.1) + Money(0.2) == Money(0.3)` is `True`, unlike the floats in Chapter 2. Notice that `print(coffee + cake)` uses `__str__`, while the sorted list uses `__repr__` for each item. If you define only one, define `__repr__`; Python uses it for `str` too when there's no `__str__`.

## Dataclasses

Many classes exist mainly to hold data. For those, the `dataclasses` module writes `__init__`, `__repr__` and `__eq__` for you:

```
@include code/ch13/dataclasses_demo.py
```

```
@include code/ch13/dataclasses_demo.out
```

The `@dataclass` line above the class is a **decorator**: it takes the class and adds methods to it. (Chapter 18 shows how decorators work.) Each line in the class body names a **field** and its type, such as `title: str`. These **type hints** document what each field should hold; Chapter 19 covers them in detail. Python itself doesn't check them.

The dataclass gives you, for free, an `__init__` that takes the fields in order, a `__repr__` that shows them, and an `__eq__` that compares them, so two books with the same fields are equal. Fields with defaults must come after fields without. For a list default, use `field(default_factory=list)`, which creates a new list for each object, for the reason given in the warning in Chapter 12.

`frozen=True` makes objects that can't be changed after they're created, like tuples, and `order=True` adds `<` and the other comparisons, comparing fields in order. That's why the versions sort correctly as numbers: 3.9 comes before 3.12, which wouldn't happen if they were compared as text. The last line tries to change a frozen object and fails.

## Properties

Sometimes an attribute needs checking whenever it's set, or should be calculated from other attributes. A **property** looks like an attribute from the outside but runs a method:

```
@include code/ch13/properties.py
```

```
@include code/ch13/properties.out
```

`@property` turns the `celsius` method into something you read without parentheses: `t.celsius`. `@celsius.setter` defines what happens when you assign to it: here, a check, then storing the value in `_celsius`. `fahrenheit` has no setter, so it's read-only and always up to date. The underscore at the start of `_celsius` is a convention meaning "internal: use the property instead".

Start with plain attributes. If you later need a check or a calculation, you can turn an attribute into a property without changing any code that uses it.

## Project: Pocket Library, Version 6

Version 6 makes `Book` a dataclass and gives `Library` special methods, so that it works like a built-in collection:

```
@include code/ch13/library_v6.py
```

```
@include code/ch13/library_v6.out
```

`len(library)`, `book in library` and `for book in library` all work, because `Library` defines `__len__`, `__contains__` and `__iter__`. `__iter__` simply hands the job to the list inside, with `iter(self._books)`; Chapter 14 explains iterators. The list is called `_books`, so other code is encouraged to use the library's methods instead of reaching inside. And `add` refuses duplicates by using the class's own `in` check.

`list(books or [])` in `__init__` is a common idiom: `books or []` gives an empty list when no books are passed, and `list(...)` makes a copy, so the library doesn't share a list with the caller.

## Try It

1. Add a `Triangle(base, height)` subclass of `Shape` and add one to the list in `inheritance.py`.
2. Remove `__str__` from `Money` and print `coffee`. Which method does Python use now?
3. Create a `Book` dataclass object without a year. Read the error message.

## Exercises

1. **Employees.** Write an `Employee` class with a name and monthly salary and a `yearly_cost` method, and a `Manager` subclass that adds a yearly bonus to the cost. Use `super()` in both `__init__` and `yearly_cost`.
2. **Fractions.** Write a `Fraction` class that stores fractions in lowest terms (hint: `math.gcd`), supports `+` and `==`, and prints as `5/6`. `Fraction(2, 4) == Fraction(1, 2)` should be `True`.
3. **Points.** Write a frozen dataclass `Point` with `x` and `y`, and a `distance_to` method. (Hint: `math.hypot`.)

## Key Takeaways

- A subclass inherits its base class's methods and can override them; `super()` calls the base class's version. Use inheritance for "is a" relationships.
- Special methods such as `__str__`, `__repr__`, `__eq__`, `__add__`, `__len__`, `__contains__` and `__iter__` make your objects work with Python's operators and built-ins.
- `@dataclass` writes `__init__`, `__repr__` and `__eq__` for classes that mainly hold data; `frozen=True` makes them unchangeable and `order=True` sortable.
- Properties look like attributes but run code, for checks and calculated values.
