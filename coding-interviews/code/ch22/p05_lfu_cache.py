"""22.5 Least-Frequently Used Cache: when full, evict the key used the
fewest times; among those, the least recently used. get and put count as
uses. O(1) per operation."""

from collections import OrderedDict, defaultdict


class LFUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = {}  # key -> (value, uses)
        self.by_uses = defaultdict(OrderedDict)  # uses -> keys, LRU first
        self.min_uses = 0

    def _touch(self, key):
        value, uses = self.data[key]
        del self.by_uses[uses][key]
        if not self.by_uses[uses] and self.min_uses == uses:
            self.min_uses += 1  # that bucket is empty now
        self.data[key] = (value, uses + 1)
        self.by_uses[uses + 1][key] = None

    def get(self, key):
        if key not in self.data:
            return -1
        self._touch(key)
        return self.data[key][0]

    def put(self, key, value):
        if self.capacity == 0:
            return
        if key in self.data:
            self.data[key] = (value, self.data[key][1])
            self._touch(key)
            return
        if len(self.data) == self.capacity:
            old, _ = self.by_uses[self.min_uses].popitem(last=False)
            del self.data[old]
        self.data[key] = (value, 1)
        self.by_uses[1][key] = None
        self.min_uses = 1


class LFUCacheBrute:
    def __init__(self, capacity):
        self.capacity, self.clock = capacity, 0
        self.data = {}  # key -> [value, uses, last_used]

    def get(self, key):
        self.clock += 1
        if key not in self.data:
            return -1
        self.data[key][1] += 1
        self.data[key][2] = self.clock
        return self.data[key][0]

    def put(self, key, value):
        self.clock += 1
        if self.capacity == 0:
            return
        if key in self.data:
            self.data[key][0] = value
            self.data[key][1] += 1
            self.data[key][2] = self.clock
            return
        if len(self.data) == self.capacity:
            victim = min(self.data, key=lambda k: self.data[k][1:])
            del self.data[victim]
        self.data[key] = [value, 1, self.clock]


def run(cls, capacity, ops):
    cache, out = cls(capacity), []
    for op in ops:
        if op[0] == "get":
            out.append(cache.get(op[1]))
        else:
            cache.put(op[1], op[2])
    return out


def run_main(capacity, ops):
    return run(LFUCache, capacity, ops)


def run_brute(capacity, ops):
    return run(LFUCacheBrute, capacity, ops)


SOLUTIONS = [run_main, run_brute]
EXAMPLES = [
    (
        (
            2,
            [
                ("put", 1, 1),
                ("put", 2, 2),
                ("get", 1),
                ("put", 3, 3),
                ("get", 2),
                ("get", 3),
                ("put", 4, 4),
                ("get", 1),
                ("get", 3),
                ("get", 4),
            ],
        ),
        [1, -1, 3, -1, 3, 4],
    ),
]


def random_case(rng):
    ops = []
    for _ in range(rng.randint(1, 25)):
        if rng.random() < 0.5:
            ops.append(("get", rng.randint(0, 4)))
        else:
            ops.append(("put", rng.randint(0, 4), rng.randint(0, 9)))
    return (rng.randint(0, 3), ops)
