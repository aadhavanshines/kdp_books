"""Our first algorithm: find the largest number in a list."""


def largest(numbers):
    """Return the largest item. Raise ValueError if there are none."""
    if not numbers:
        raise ValueError("largest() of an empty list")
    best = numbers[0]
    for x in numbers[1:]:
        if x > best:
            best = x
    return best
