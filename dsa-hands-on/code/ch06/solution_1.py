"""Exercise 6.1: add extend(), which appends every item of an iterable,
growing the storage at most once when the length is known."""

from dynamic_array import DynamicArray


class ExtendableArray(DynamicArray):
    def extend(self, items):
        items = list(items)  # so we know how many there are
        needed = self._n + len(items)
        if needed > self._capacity:
            capacity = self._capacity
            while capacity < needed:
                capacity = max(capacity + 1, int(capacity * self._growth))
            self._resize(capacity)  # one resize, not one per doubling
        for x in items:
            self._data[self._n] = x
            self._n += 1


a = ExtendableArray()
a.append(0)
a.extend(range(1, 10))
assert list(a) == list(range(10))
print(a, "capacity", a._capacity, "copies", a.copies)
