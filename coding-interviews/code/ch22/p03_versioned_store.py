"""22.3 Versioned Store: set(key, value, time) and get(key, time), which
returns the value set at the latest time <= the given time, or "".
Times passed to set are strictly increasing for each key."""

from bisect import bisect_right
from collections import defaultdict


class VersionedStore:
    def __init__(self):
        self.times = defaultdict(list)  # key -> sorted times
        self.values = defaultdict(list)  # key -> values in the same order

    def set(self, key, value, time):
        self.times[key].append(time)
        self.values[key].append(value)

    def get(self, key, time):
        i = bisect_right(self.times[key], time)  # first time > time
        return self.values[key][i - 1] if i else ""


def run_ops(ops):
    store, out = VersionedStore(), []
    for op in ops:
        if op[0] == "set":
            store.set(*op[1:])
        else:
            out.append(store.get(*op[1:]))
    return out


def run_ops_brute(ops):
    rows, out = [], []
    for op in ops:
        if op[0] == "set":
            rows.append(op[1:])
        else:
            _, key, time = op
            best = [(t, v) for k, v, t in rows if k == key and t <= time]
            out.append(max(best)[1] if best else "")
    return out


SOLUTIONS = [run_ops, run_ops_brute]
EXAMPLES = [
    (
        (
            [
                ("set", "price", "10", 1),
                ("get", "price", 1),
                ("get", "price", 3),
                ("set", "price", "12", 4),
                ("get", "price", 4),
                ("get", "price", 5),
                ("get", "price", 0),
            ],
        ),
        ["10", "10", "12", "12", ""],
    ),
]


def random_case(rng):
    ops, last = [], {}
    for _ in range(rng.randint(1, 15)):
        key = rng.choice("ab")
        if rng.random() < 0.5:
            t = last.get(key, 0) + rng.randint(1, 3)
            last[key] = t
            ops.append(("set", key, str(rng.randint(0, 9)), t))
        else:
            ops.append(("get", key, rng.randint(0, 12)))
    return (ops,)
