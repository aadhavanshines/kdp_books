"""A memoizing decorator with a bounded cache, like the standard
library's functools.lru_cache, built on our LRUCache."""

import functools

from lru_cache import LRUCache

MISSING = object()


def lru_memoize(capacity):
    def decorate(func):
        cache = LRUCache(capacity)

        @functools.wraps(func)
        def wrapper(*args):
            result = cache.get(args, MISSING)
            if result is MISSING:
                result = func(*args)
                cache.put(args, result)
            return result

        wrapper.cache = cache
        return wrapper

    return decorate


@lru_memoize(capacity=100)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)


@functools.lru_cache(maxsize=100)
def fib_std(n):
    return n if n < 2 else fib_std(n - 1) + fib_std(n - 2)


print(fib(80), fib_std(80))
print("ours:", fib.cache.hits, "hits,", fib.cache.misses, "misses")
print("functools:", fib_std.cache_info())
