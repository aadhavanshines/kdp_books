"""Chapter 7: a tiny log-structured merge (LSM) store.

Writes go to an in-memory table; when it is full it is frozen into an
immutable sorted run. Reads check the memory table, then runs from
newest to oldest. Compaction merges runs and drops overwritten values.
"""

from bisect import bisect_left

DELETED = object()  # a "tombstone" marks a deleted key


class LSMStore:
    def __init__(self, memtable_limit=4):
        self.memtable = {}
        self.runs = []  # list of sorted (key, value) lists, oldest first
        self.limit = memtable_limit

    def put(self, key, value):
        self.memtable[key] = value
        if len(self.memtable) >= self.limit:
            self.runs.append(sorted(self.memtable.items()))
            self.memtable = {}

    def delete(self, key):
        self.put(key, DELETED)

    def get(self, key):
        if key in self.memtable:
            value = self.memtable[key]
        else:
            value = None
            for run in reversed(self.runs):  # newest run first
                i = bisect_left(run, (key,))
                if i < len(run) and run[i][0] == key:
                    value = run[i][1]
                    break
        return None if value is DELETED else value

    def compact(self):
        merged = {}
        for run in self.runs:  # later runs overwrite earlier ones
            merged.update(run)
        live = [
            (k, v) for k, v in sorted(merged.items()) if v is not DELETED
        ]
        self.runs = [live] if live else []


def session(ops):
    store, out = LSMStore(), []
    for op in ops:
        if op[0] == "put":
            store.put(op[1], op[2])
        elif op[0] == "del":
            store.delete(op[1])
        elif op[0] == "compact":
            store.compact()
        else:
            out.append(store.get(op[1]))
    return out


def session_dict(ops):
    data, out = {}, []
    for op in ops:
        if op[0] == "put":
            data[op[1]] = op[2]
        elif op[0] == "del":
            data.pop(op[1], None)
        elif op[0] == "get":
            out.append(data.get(op[1]))
    return out


SOLUTIONS = [session, session_dict]
EXAMPLES = [
    (
        (
            [
                ("put", "k1", 1),
                ("put", "k2", 2),
                ("put", "k1", 3),
                ("del", "k2"),
                ("put", "k3", 4),
                ("get", "k1"),
                ("get", "k2"),
                ("compact",),
                ("get", "k3"),
            ],
        ),
        [3, None, 4],
    )
]


def random_case(rng):
    ops = []
    for _ in range(rng.randint(1, 40)):
        r, key = rng.random(), rng.choice(["a", "b", "c", "d", "e"])
        if r < 0.45:
            ops.append(("put", key, rng.randint(0, 9)))
        elif r < 0.6:
            ops.append(("del", key))
        elif r < 0.65:
            ops.append(("compact",))
        else:
            ops.append(("get", key))
    return (ops,)
