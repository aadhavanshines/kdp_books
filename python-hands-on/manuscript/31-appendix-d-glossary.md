# Appendix D: Glossary

**Argument.** A value passed to a function when it's called, as in `len("hi")`. See *parameter*.

**Assertion.** A check with `assert` that stops the program, or fails a test, if a condition is false.

**Attribute.** A value that belongs to an object, reached with a dot: `book.title`.

**Big-O notation.** A way of describing how the work a piece of code does grows with the size of its input: O(1), O(n), O(n²).

**Boolean.** A value that's either `True` or `False`; type `bool`.

**Class.** A description of a kind of object: its attributes and methods. Calling a class creates an instance.

**Closure.** A function that remembers variables from the function it was defined in.

**Comprehension.** A compact way to build a list, dictionary or set: `[x * 2 for x in items]`.

**Context manager.** An object used with `with`, which runs set-up code at the start of a block and clean-up code at the end.

**Coroutine.** A function defined with `async def`, which can pause at `await` while other tasks run.

**CSV.** Comma-separated values: a simple text format for tables.

**Dataclass.** A class whose `__init__`, `__repr__` and `__eq__` are written by the `@dataclass` decorator.

**Decorator.** A function that takes a function or class and returns a modified one, applied with `@name` above a definition.

**Dictionary.** A collection that maps unique keys to values; type `dict`.

**Docstring.** A string at the start of a function, class or module that describes it.

**Dry run.** Running a script so that it shows what it would do without doing it.

**Exception.** An error that interrupts a program, which can be handled with `try` and `except`.

**Expression.** A piece of code that produces a value, such as `2 + 3` or `name.upper()`.

**f-string.** A string with `f` before the quote, in which expressions in braces are replaced by their values.

**Fixture.** In pytest, a function that prepares something a test needs.

**Float.** A number with a decimal point; type `float`.

**Function.** A named, reusable block of code, defined with `def`.

**Generator.** A function that uses `yield` to produce values one at a time, pausing in between.

**GIL.** The global interpreter lock, which lets only one thread run Python code at a time in the standard interpreter.

**Hash.** A fixed-length fingerprint calculated from data. Sets and dictionaries use hashes to find items quickly.

**HTTP.** The protocol that browsers and web APIs use to send requests and responses.

**Immutable.** Unchangeable after creation, like strings, tuples and frozen dataclasses.

**Import.** Making a module's contents available to your program.

**Index.** The position of an item in a sequence, starting at 0.

**Inheritance.** Defining a class as a specialized version of another, reusing and overriding its methods.

**Instance.** One object made from a class.

**Integer.** A whole number; type `int`.

**Iterable.** Anything a `for` loop can go through, such as a list, string, dictionary, file or generator.

**Iterator.** An object that hands out values one at a time when `next` is called on it.

**JSON.** JavaScript Object Notation: a text format for nested data, used by web APIs and settings files.

**Lambda.** A small function without a name, written as a single expression.

**List.** An ordered, changeable collection of values; type `list`.

**Logging.** Recording what a program does, at levels from DEBUG to CRITICAL, with the `logging` module.

**Method.** A function that belongs to an object, called with a dot: `text.upper()`.

**Mocking.** Replacing part of a program with a fake during a test.

**Module.** A Python file whose contents can be imported.

**None.** Python's value meaning "nothing" or "no value".

**Object.** Any value in Python. Every object has a type, and may have attributes and methods.

**Package.** A folder of modules that's imported as a unit; also, a project that can be installed with pip.

**Parameter.** A name in a function's definition that receives an argument: in `def greet(name)`, `name` is a parameter.

**pip.** The standard tool for installing packages from PyPI.

**Property.** A method that's used like an attribute, defined with `@property`.

**PyPI.** The Python Package Index at pypi.org, where packages are published.

**Recursion.** A function calling itself, with a base case that stops it.

**Regular expression.** A pattern for matching text, used with the `re` module.

**Set.** An unordered collection of unique items; type `set`.

**Slice.** Part of a sequence, taken with `[start:stop:step]`.

**SQL.** Structured Query Language, used to create, read and change data in databases.

**Standard library.** The modules that come with every Python installation.

**String.** A piece of text; type `str`.

**Test.** Code that checks that other code works as expected.

**Thread.** A sequence of instructions that can run alongside others in the same program.

**Traceback.** The report Python prints when an exception isn't handled, showing the chain of calls that led to it.

**Tuple.** An ordered, unchangeable collection of values; type `tuple`.

**Type hint.** An annotation that states the intended type of a variable, parameter or return value.

**Variable.** A name that refers to a value.

**Virtual environment.** A folder with its own Python and installed packages, used to keep each project's packages separate.
