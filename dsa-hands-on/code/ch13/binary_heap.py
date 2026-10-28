"""A binary min-heap stored in a list.

The item at index i has its children at 2i + 1 and 2i + 2, and its
parent at (i - 1) // 2. Every parent is <= its children, so the
smallest item is always at index 0.
"""


class MinHeap:
    def __init__(self):
        self._items = []

    @classmethod
    def heapify(cls, items):
        """Build a heap from a list in linear time: sift down every
        parent, from the last one up to the root."""
        heap = cls()
        heap._items = list(items)
        for i in range(len(items) // 2 - 1, -1, -1):
            heap._sift_down(i)
        return heap

    def __len__(self):
        return len(self._items)

    def peek(self):
        if not self._items:
            raise IndexError("peek at an empty heap")
        return self._items[0]

    def push(self, value):
        self._items.append(value)  # add at the bottom, then move it up
        self._sift_up(len(self._items) - 1)

    def pop(self):
        """Remove and return the smallest item."""
        items = self._items
        if not items:
            raise IndexError("pop from an empty heap")
        last = items.pop()
        if not items:
            return last
        smallest, items[0] = items[0], last  # the last item to the top
        self._sift_down(0)
        return smallest

    def _sift_up(self, i):
        items = self._items
        while i > 0:
            parent = (i - 1) // 2
            if items[i] >= items[parent]:
                break
            items[i], items[parent] = items[parent], items[i]
            i = parent

    def _sift_down(self, i):
        items, n = self._items, len(self._items)
        while True:
            smallest = i
            for child in (2 * i + 1, 2 * i + 2):
                if child < n and items[child] < items[smallest]:
                    smallest = child
            if smallest == i:
                return
            items[i], items[smallest] = items[smallest], items[i]
            i = smallest
