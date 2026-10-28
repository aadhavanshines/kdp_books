"""Exercise 8.1: a stack that also reports its minimum in constant
time. A second stack holds the minimum at each height."""


class MinStack:
    def __init__(self):
        self._items, self._mins = [], []

    def push(self, value):
        self._items.append(value)
        current = self._mins[-1] if self._mins else value
        self._mins.append(min(value, current))

    def pop(self):
        self._mins.pop()
        return self._items.pop()

    def min(self):
        return self._mins[-1]


s = MinStack()
for x in [5, 3, 7, 2, 8]:
    s.push(x)
    print(f"push {x}: min {s.min()}")
for _ in range(3):
    print(f"pop {s.pop()}: min {s.min()}")
