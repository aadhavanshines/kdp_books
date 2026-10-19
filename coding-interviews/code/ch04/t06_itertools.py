"""Ready-made loops from itertools, and caching with functools."""

from functools import cache
from itertools import accumulate, combinations, permutations, product


def demo():
    print(list(combinations("abc", 2)))
    print(len(list(permutations("abcd"))))
    print(list(product([0, 1], repeat=2)))
    print(list(accumulate([3, 1, 4, 1])))  # running totals

    @cache  # remember results of earlier calls
    def ways(n):
        return 1 if n <= 1 else ways(n - 1) + ways(n - 2)

    print(ways(80))
    print(float("inf") > 10**100, min([], default=-1))
