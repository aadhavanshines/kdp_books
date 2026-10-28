"""Count the comparisons each sort makes on 1,000 items, arranged
three ways. Insertion sort adapts: nearly sorted input is cheap."""

import random

from simple_sorts import bubble_sort, insertion_sort, selection_sort


class Counted:
    """A number that counts every comparison made with it."""

    comparisons = 0

    def __init__(self, x):
        self.x = x

    def __lt__(self, other):
        Counted.comparisons += 1
        return self.x < other.x

    def __gt__(self, other):
        Counted.comparisons += 1
        return self.x > other.x


rng = random.Random(2026)
n = 1000
nearly = list(range(n))
for _ in range(10):  # swap ten random pairs of neighbors
    i = rng.randrange(n - 1)
    nearly[i], nearly[i + 1] = nearly[i + 1], nearly[i]
inputs = {
    "random": rng.sample(range(n), n),
    "nearly sorted": nearly,
    "reversed": list(range(n, 0, -1)),
}
print(f"{'':>15}" + "".join(f"{name:>15}" for name in inputs))
for sort in [selection_sort, insertion_sort, bubble_sort]:
    row = f"{sort.__name__:>15}"
    for data in inputs.values():
        items = [Counted(x) for x in data]
        Counted.comparisons = 0
        sort(items)
        row += f"{Counted.comparisons:>15,}"
    print(row)
