"""Mock 3: Snapshot Array. An array of n zeros supports set(i, value),
snap() -> snapshot id (0, 1, 2, ...), and get(i, snap_id): the value at i
when that snapshot was taken. Memory should grow with the number of sets,
not with n times the number of snaps."""

from bisect import bisect_right


class SnapshotArray:
    def __init__(self, n):
        self.history = [[(-1, 0)] for _ in range(n)]  # (snap, value)
        self.snap_id = 0

    def set(self, i, value):
        h = self.history[i]
        if h[-1][0] == self.snap_id:
            h[-1] = (self.snap_id, value)  # overwrite within this snap
        else:
            h.append((self.snap_id, value))

    def snap(self):
        self.snap_id += 1
        return self.snap_id - 1

    def get(self, i, snap_id):
        h = self.history[i]
        k = bisect_right(h, (snap_id, float("inf"))) - 1
        return h[k][1]


class SnapshotArrayCopy:
    def __init__(self, n):
        self.current, self.snaps = [0] * n, []

    def set(self, i, value):
        self.current[i] = value

    def snap(self):
        self.snaps.append(self.current[:])  # O(n) memory per snap
        return len(self.snaps) - 1

    def get(self, i, snap_id):
        return self.snaps[snap_id][i]


def run(cls, n, ops):
    arr, out = cls(n), []
    for op in ops:
        if op[0] == "set":
            arr.set(op[1], op[2])
        elif op[0] == "snap":
            out.append(arr.snap())
        else:
            out.append(arr.get(op[1], op[2]))
    return out


def snapshot_session(n, ops):
    return run(SnapshotArray, n, ops)


def snapshot_session_copy(n, ops):
    return run(SnapshotArrayCopy, n, ops)


SOLUTIONS = [snapshot_session, snapshot_session_copy]
EXAMPLES = [
    (
        (
            2,
            [
                ("set", 1, 4),
                ("snap",),
                ("set", 1, 7),
                ("snap",),
                ("get", 1, 0),
                ("get", 1, 1),
                ("get", 0, 1),
            ],
        ),
        [0, 1, 4, 7, 0],
    )
]


def random_case(rng):
    n, snaps, ops = rng.randint(1, 4), 0, []
    for _ in range(rng.randint(1, 15)):
        r = rng.random()
        if r < 0.4:
            ops.append(("set", rng.randrange(n), rng.randint(0, 9)))
        elif r < 0.7 or snaps == 0:
            ops.append(("snap",))
            snaps += 1
        else:
            ops.append(("get", rng.randrange(n), rng.randrange(snaps)))
    return (n, ops)
