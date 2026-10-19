"""22.4 Random Pick Set: add, remove and pick a uniformly random member,
each in O(1) on average."""

import random


class RandomSet:
    def __init__(self, rng=random):
        self.items = []  # the members, in no particular order
        self.where = {}  # member -> its index in items
        self.rng = rng

    def add(self, x):
        if x in self.where:
            return False
        self.where[x] = len(self.items)
        self.items.append(x)
        return True

    def remove(self, x):
        if x not in self.where:
            return False
        i, last = self.where[x], self.items[-1]
        self.items[i] = last  # move the last item into x's slot
        self.where[last] = i
        self.items.pop()
        del self.where[x]
        return True

    def pick(self):
        return self.rng.choice(self.items)


def run_ops(ops):
    s, out = RandomSet(), []
    for op, x in ops:
        out.append(s.add(x) if op == "add" else s.remove(x))
    return out, sorted(s.items)


def run_ops_brute(ops):
    s, out = set(), []
    for op, x in ops:
        if op == "add":
            out.append(x not in s)
            s.add(x)
        else:
            out.append(x in s)
            s.discard(x)
    return out, sorted(s)


SOLUTIONS = [run_ops, run_ops_brute]
EXAMPLES = [
    (
        (
            [
                ("add", 1),
                ("add", 1),
                ("remove", 2),
                ("add", 2),
                ("remove", 1),
            ],
        ),
        ([True, False, False, True, True], [2]),
    )
]


def random_case(rng):
    return (
        [
            (rng.choice(["add", "remove"]), rng.randint(0, 5))
            for _ in range(rng.randint(1, 15))
        ],
    )


def test():
    from collections import Counter

    s = RandomSet(random.Random(7))
    for x in "abcd":
        s.add(x)
    s.remove("b")
    counts = Counter(s.pick() for _ in range(30_000))
    assert set(counts) == {"a", "c", "d"}
    assert all(9_000 < c < 11_000 for c in counts.values()), counts
