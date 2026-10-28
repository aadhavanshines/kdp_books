"""Appending n items: our DynamicArray against Python's list."""

import bench
from dynamic_array import DynamicArray


class AddHundred(DynamicArray):
    """Grows by a fixed 100 slots instead of doubling."""

    def append(self, value):
        if self._n == self._capacity:
            self._resize(self._capacity + 100)
        self._data[self._n] = value
        self._n += 1


def fill(make):
    def run(n):
        a = make()
        for i in range(n):
            a.append(i)

    return run


sizes = [5_000, 10_000, 20_000, 40_000, 80_000]
results = {
    "list": bench.doubling(fill(list), lambda n: (n,), sizes),
    "doubling": bench.doubling(fill(DynamicArray), lambda n: (n,), sizes),
    "add 100": bench.doubling(fill(AddHundred), lambda n: (n,), sizes),
}
bench.table(results)
bench.chart(results, "ch06_append.png", "Appending n items")
