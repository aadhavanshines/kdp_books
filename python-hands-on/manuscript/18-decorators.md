# Part IV: Advanced Python

# Chapter 18: Decorators and Context Managers

You've used decorators, such as `@dataclass`, `@property` and `@pytest.fixture`, and context managers, in every `with open(...)`. In this chapter you'll learn how they work and write your own. Both rest on one idea from Chapter 8: functions are values, which can be passed around, returned and stored like any other. Decorators let you add behavior to functions without changing their code; context managers make sure that set-up is always followed by clean-up. Libraries use both everywhere, and understanding them will make those libraries much less mysterious.

## Functions Are Objects

```
@include code/ch18/functions_as_objects.py
```

```
@include code/ch18/functions_as_objects.out
```

`say = shout` doesn't call `shout`; it gives the function a second name. `speak` takes a function as an argument and calls it. A function that takes or returns functions is called a **higher-order function**.

`make_multiplier` goes one step further: it defines a function inside itself and returns it. The inner function `multiply` uses `factor`, a variable of the outer function. Normally that variable would disappear when `make_multiplier` returns, but Python keeps it alive for as long as `multiply` needs it. A function that remembers variables from where it was created is called a **closure**. `double` and `triple` are two closures with different values of `factor`.

## Writing a Decorator

A **decorator** is a function that takes a function and returns a new function, usually one that does something extra and calls the original:

```
@include code/ch18/decorators.py
```

```
@include code/ch18/decorators.out
```

Writing `@log_calls` above `def add` is exactly the same as writing `add = log_calls(add)` after it. `log_calls` receives the original `add`, defines `wrapper`, which prints each call and its result, and returns `wrapper`. From then on, the name `add` refers to the wrapper, which calls the original inside. `*args` and `**kwargs`, from Chapter 8, let the wrapper accept and pass on any arguments, so the same decorator works on any function.

`@functools.wraps(func)` copies the original function's name and docstring onto the wrapper. Without it, `add.__name__` would be `"wrapper"`, and `help(add)` would show nothing useful. Always use it in your decorators.

`repeat(3)` is a decorator that takes an argument, which needs one more level: `repeat(3)` is called first and returns the actual decorator, which then receives `cheer`. Three nested functions look complicated at first, but the pattern is always the same, and you can copy it.

Decorators are ideal for things that apply to many functions but aren't part of what any one of them does: logging, timing, checking permissions, retrying after errors, and caching.

## Caching

Some functions are slow but always give the same result for the same arguments. A **cache** remembers results so that each one is calculated only once. The standard library has a decorator for it:

```
@include code/ch18/caching.py
```

```
@include code/ch18/caching.out
```

Calculating the 80th Fibonacci number this way, where each number is the sum of the two before it, is hopeless without the cache: the function would call itself about 76 quadrillion times, which would take years. With `@functools.cache`, each value from 0 to 80 is calculated once: 81 calls, and the answer appears instantly. `cache_info` shows that the cache answered 78 further requests itself.

The `global calls` line lets the function change the global variable `calls`, which it couldn't otherwise do, as you saw in Chapter 8. It's here only to count the calls; avoid `global` in real code.

> **Note:** Cache only functions whose result depends on nothing but their arguments. A function that reads a file or the current time would go on returning an old, stale answer. `functools.lru_cache(maxsize=1000)` keeps only the most recently used results, when memory matters.

## Context Managers

A **context manager** is an object that does something when a `with` block starts and something else when it ends, however it ends: normally, through `return` or `break`, or with an exception. Files close themselves this way. You can write your own in two ways:

```
@include code/ch18/context_managers.py
```

```
@include code/ch18/context_managers.out
```

**As a class**, with two special methods. `__enter__` runs at the start of the `with` block, and whatever it returns becomes the name after `as`. `__exit__` runs at the end. It receives details of any exception that happened in the block, or three `None` values if there wasn't one; returning `False` lets the exception carry on as usual.

**As a generator**, with the `@contextmanager` decorator from `contextlib`. Everything before `yield` runs at the start of the block and everything after it at the end. This is usually shorter. In real use, put the `yield` inside `try` with the clean-up in `finally`, so that the clean-up runs even if the block raises an exception; the exercise solution in Appendix A does this.

`contextlib.suppress` is a ready-made context manager that ignores the exceptions you name: deleting a file that might not exist is the classic example.

Use a context manager whenever something must be undone: files to close, locks to release (Chapter 21), database transactions to commit or roll back (Chapter 23), a setting to change temporarily and restore.

## Try It

1. Write a decorator `timed` that prints how long a function took, using `time.perf_counter()` before and after the call.
2. Remove `@functools.wraps(func)` from `log_calls` and run the program again. What does the last line print?
3. Run `fibonacci(30)` without the cache, counting the calls. How many are there?

## Exercises

1. **Retry.** Write a decorator `retry(times)` that calls the function again if it raises an exception, up to `times` attempts in total, printing each failure, and lets the last exception through if every attempt fails.
2. **Call counter.** Write a decorator `count_calls` that counts how often a function is called, in an attribute: `hello.calls`. (Functions are objects, so you can give them attributes.)
3. **Temporary value.** Write a context manager `temporary_value(mapping, key, value)` that sets `mapping[key]` inside a `with` block and restores the old value afterward, or removes the key if it wasn't there before.

## Key Takeaways

- Functions are objects: they can be passed as arguments, returned from functions and given new names. A closure remembers variables from where it was defined.
- A decorator takes a function and returns a replacement; `@decorator` above `def` is shorthand for `f = decorator(f)`. Use `functools.wraps` in every decorator.
- `functools.cache` remembers results, which can turn an impossible calculation into an instant one.
- Context managers run set-up and clean-up around a `with` block: write them as a class with `__enter__` and `__exit__`, or as a generator with `@contextmanager`.
