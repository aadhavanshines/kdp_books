"""Building a heap of n items: n pushes or one heapify? Count the swaps
on the worst input for pushing, a list in decreasing order."""

from binary_heap import MinHeap


class Counting(MinHeap):
    swaps = 0

    def _sift_up(self, i):
        items = self._items
        while i > 0 and items[i] < items[(i - 1) // 2]:
            parent = (i - 1) // 2
            items[i], items[parent] = items[parent], items[i]
            Counting.swaps += 1
            i = parent

    def _sift_down(self, i):
        items, n = self._items, len(self._items)
        while True:
            small = min(
                (c for c in (i, 2 * i + 1, 2 * i + 2) if c < n),
                key=items.__getitem__,
            )
            if small == i:
                return
            items[i], items[small] = items[small], items[i]
            Counting.swaps += 1
            i = small


print(f"{'n':>9} {'n pushes':>10} {'heapify':>9}")
for n in [1_000, 10_000, 100_000]:
    data = list(range(n, 0, -1))
    Counting.swaps = 0
    h = Counting()
    for x in data:
        h.push(x)
    pushes = Counting.swaps
    Counting.swaps = 0
    Counting.heapify(data)
    print(f"{n:>9,} {pushes:>10,} {Counting.swaps:>9,}")
