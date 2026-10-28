"""A queue (first in, first out) in a ring buffer.

The items sit in fixed storage that wraps around: when the back reaches
the end, it continues at slot 0. Both ends move forward, so nothing is
ever shifted. When the storage is full, it doubles.
"""


class RingQueue:
    def __init__(self, capacity=8):
        self._data = [None] * capacity
        self._front = 0  # slot of the first item
        self._n = 0

    def __len__(self):
        return self._n

    def enqueue(self, value):
        if self._n == len(self._data):
            self._grow()
        back = (self._front + self._n) % len(self._data)
        self._data[back] = value
        self._n += 1

    def dequeue(self):
        if not self._n:
            raise IndexError("dequeue from an empty queue")
        value = self._data[self._front]
        self._data[self._front] = None
        self._front = (self._front + 1) % len(self._data)
        self._n -= 1
        return value

    def _grow(self):
        """Copy the items, in order, into storage twice the size."""
        old, size = self._data, len(self._data)
        self._data = [None] * (2 * size)
        for i in range(self._n):
            self._data[i] = old[(self._front + i) % size]
        self._front = 0
