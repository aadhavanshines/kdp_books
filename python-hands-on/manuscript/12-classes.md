# Part III: Intermediate Python

# Chapter 12: Classes and Objects

In Pocket Library, a book is a dictionary, and the functions that work with books are separate from it. That works, but nothing stops a typo like `book["auther"]`, and nothing tells you which functions belong with which data. **Classes** bring data and the functions that work on it together. A class describes a kind of thing; an **object** is one particular thing of that kind. In this chapter you'll write classes, learn the vocabulary that comes with them, and rebuild Pocket Library with a `Book` class and a `Library` class.

## Your First Class

Every value in Python is already an object: `"hello"` is an object of class `str`, and `[1, 2]` is an object of class `list`. That's why they have methods, like `"hello".upper()`. Writing a class lets you create your own kinds of object:

```
@include code/ch12/bank_account.py
```

```
@include code/ch12/bank_account.out
```

- `class BankAccount:` starts the definition. Class names use **CamelCase**: capital letters at the start of each word, no underscores.
- Functions defined inside a class are its **methods**.
- `__init__` is a special method that Python calls when you create an object, to set it up. Its name has two underscores on each side; Python programmers call such names **dunder** (double underscore) names.
- Calling the class, as in `BankAccount("Meera", 100)`, creates a new object, an **instance** of the class, and runs `__init__` with the arguments.
- `self` is the object the method is working on. Python passes it automatically: `meera.deposit(50)` calls `deposit` with `self` set to `meera` and `amount` set to 50.
- `self.owner = owner` creates an **attribute**: a variable that belongs to the object. Each account has its own `owner` and `balance`.

The class enforces its own rules. `withdraw` refuses to take more than the balance, by raising an exception, and `deposit` refuses amounts that aren't positive. Code that uses the class doesn't have to remember those rules, because the class can't be put into an invalid state through its methods.

## Objects in the Shell

```
@include code/ch12/session_objects.txt
```

A class can be defined in the shell, too: the `...` prompt means Python is waiting for the rest of the block, and an empty line ends it. You read and change attributes with a dot. `isinstance` checks whether a value is an instance of a class, or of any class in a tuple. And two separate objects with the same attributes are not equal: `==` on objects of your own classes compares whether they're the same object, unless you tell Python otherwise. Chapter 13 shows how.

## Class Attributes

Attributes created on `self` belong to one object. Attributes defined directly in the class body belong to the class, and are shared by all its instances:

```
@include code/ch12/class_attributes.py
```

```
@include code/ch12/class_attributes.out
```

Each ticket has its own `seat`, but they share `price` and `sold`. Changing `Ticket.price` changes it for every ticket. Use class attributes for constants and shared settings; for anything that differs between objects, use instance attributes set in `__init__`.

> **Warning:** Never use a list or dictionary as a class attribute when each object needs its own, as in `books = []` in the class body. All instances would share one list. Create it in `__init__` instead: `self.books = []`.

## Why Classes?

A class bundles three things:

- **State**: the data each object holds, in its attributes.
- **Behavior**: what the object can do, in its methods.
- **Rules**: checks in the methods that keep the state valid.

This makes programs easier to understand: `account.withdraw(20)` says what it does, and all the code about accounts is in one place. It also makes them easier to change, because the rest of the program uses the methods without needing to know how the data is stored inside.

Not everything needs a class, though. A function is the right tool for a calculation, and a dictionary is fine for simple data that's passed around. Reach for a class when you have data and operations that belong together, especially when the data has rules.

## Project: Pocket Library, Version 5

Version 5 has a `Book` class for one book and a `Library` class for the collection, including saving and loading:

```
@include code/ch12/library_v5.py
```

```
@include code/ch12/library_v5.out
```

The program saves three books to `my_books.json`, loads them into a new `Library` object, finds the two books with "dune" in the title, marks the first one as read, and lists everything.

Look at how the code reads now. `again.find("dune")[0].mark_read()` says exactly what it does. Each class looks after its own details: `Book` knows how to describe itself and how to turn itself into a dictionary for saving, and `Library` knows how to find, save and load books. `Book.to_dict` and `Library.load` are opposites: one turns a book into plain data for JSON, the other turns plain data back into books.

`Book(**item)` is a shortcut worth knowing. Two stars before a dictionary in a call pass its key-value pairs as keyword arguments, so `Book(**{"title": "Dune", "author": "Frank Herbert", "year": 1965, "read": False})` is the same as `Book(title="Dune", author="Frank Herbert", year=1965, read=False)`. It works because the dictionary keys match the parameter names of `__init__`.

> **Note:** Version 5 still has room for improvement. `Book` needs a lot of repetitive code just to store four values, and printing a `Book` object directly shows something unhelpful like `<__main__.Book object at 0x...>`. The next chapter solves both problems.

## Try It

1. Add a `transfer(self, other, amount)` method to `BankAccount` that withdraws from one account and deposits into another. What should happen if the withdrawal fails?
2. Print a `Book` object directly with `print(book)`. What do you see?
3. Add a `by_author(self, name)` method to `Library` and use it.

## Exercises

1. **Rectangle.** Write a `Rectangle` class with `width` and `height`, and methods `area`, `perimeter` and `is_square`.
2. **Tally counter.** Write a `Tally` class with a `count` that starts at 0, a `click(times=1)` method that adds to it and returns the new count, and a `reset` method.
3. **Thermostat.** Write a `Thermostat` class with a target temperature and allowed limits (5 to 30 degrees by default). Its `set_target(value)` method should store the value but keep it within the limits, so `set_target(42)` sets 30. (Hint: `min(max(value, low), high)`.)

## Key Takeaways

- A class describes a kind of object; calling it creates an instance and runs `__init__`.
- Methods are functions inside a class. Their first parameter, `self`, is the object they work on; attributes set on `self` belong to that object.
- Class attributes are shared by all instances. Create mutable attributes like lists in `__init__`.
- Classes keep data, behavior and rules together, which makes code easier to read and change.
