"""Recursion: a function that calls itself on a smaller problem."""


def factorial(n):
    if n <= 1:  # base case: small enough to answer directly
        return 1
    return n * factorial(n - 1)  # recursive case: a smaller problem


def total(items):
    """Sum a list: the first item plus the sum of the rest."""
    if not items:
        return 0
    return items[0] + total(items[1:])


print(factorial(5))
print(factorial(20))
print(total([3, 1, 4, 1, 5, 9]))
