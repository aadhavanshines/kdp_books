"""A dynamic array: a growable list built on fixed-size storage."""


def make_storage(capacity):
    """A fixed-size block of slots. We only ever read and write slots by
    index, never grow it, so it behaves like a raw block of memory."""
    return [None] * capacity


class DynamicArray:
    def __init__(self, growth=2.0):
        self._n = 0  # how many items are stored
        self._capacity = 1  # how many slots the storage has
        self._data = make_storage(1)
        self._growth = growth
        self.copies = 0  # items copied by resizing, for experiments

    def __len__(self):
        return self._n

    def _check(self, i):
        """Turn a negative index into a positive one; reject bad ones."""
        if i < 0:
            i += self._n
        if not 0 <= i < self._n:
            raise IndexError("DynamicArray index out of range")
        return i

    def __getitem__(self, i):
        return self._data[self._check(i)]

    def __setitem__(self, i, value):
        self._data[self._check(i)] = value

    def _resize(self, capacity):
        """Move every item into new storage with `capacity` slots."""
        new = make_storage(capacity)
        for i in range(self._n):
            new[i] = self._data[i]
        self.copies += self._n
        self._data, self._capacity = new, capacity

    def append(self, value):
        if self._n == self._capacity:  # full: grow first
            self._resize(
                max(self._n + 1, int(self._capacity * self._growth))
            )
        self._data[self._n] = value
        self._n += 1

    def insert(self, i, value):
        """Insert before position i, shifting later items right."""
        i = min(max(i + self._n if i < 0 else i, 0), self._n)
        if self._n == self._capacity:
            self._resize(
                max(self._n + 1, int(self._capacity * self._growth))
            )
        for j in range(self._n, i, -1):
            self._data[j] = self._data[j - 1]
        self._data[i] = value
        self._n += 1

    def pop(self, i=-1):
        """Remove and return the item at i, shifting later items left."""
        i = self._check(i)
        value = self._data[i]
        for j in range(i, self._n - 1):
            self._data[j] = self._data[j + 1]
        self._n -= 1
        self._data[self._n] = None  # don't keep a reference to it
        if 0 < self._n <= self._capacity // 4:  # mostly empty: shrink
            self._resize(self._capacity // 2)
        return value

    def __iter__(self):
        for i in range(self._n):
            yield self._data[i]

    def __repr__(self):
        return f"DynamicArray({list(self)})"
