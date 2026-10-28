"""Exercise 32.1: an LRU cache in a few lines with OrderedDict, whose
move_to_end() and popitem(last=False) do the linked-list work."""

from collections import OrderedDict


class SmallLRU(OrderedDict):
    def __init__(self, capacity):
        super().__init__()
        self.capacity = capacity

    def get(self, key, default=None):
        if key not in self:
            return default
        self.move_to_end(key)  # the end is the most recent
        return self[key]

    def put(self, key, value):
        self[key] = value
        self.move_to_end(key)
        if len(self) > self.capacity:
            self.popitem(last=False)  # the front is the oldest


c = SmallLRU(2)
c.put("a", 1)
c.put("b", 2)
c.get("a")
c.put("c", 3)
print(list(c.items()))
