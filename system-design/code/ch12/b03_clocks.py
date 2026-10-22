"""Chapter 12: Lamport clocks and vector clocks.

Vector clocks can tell whether two events are ordered or concurrent;
Lamport clocks give a total order that respects causality but cannot
detect concurrency.
"""


def compare(a, b):
    """Compare two vector clocks (dicts): 'before', 'after', 'equal' or
    'concurrent'."""
    keys = set(a) | set(b)
    le = all(a.get(k, 0) <= b.get(k, 0) for k in keys)
    ge = all(a.get(k, 0) >= b.get(k, 0) for k in keys)
    if le and ge:
        return "equal"
    if le:
        return "before"
    if ge:
        return "after"
    return "concurrent"


def merge(a, b):
    return {k: max(a.get(k, 0), b.get(k, 0)) for k in set(a) | set(b)}


def demo():
    # Two replicas of a shopping cart accept writes while disconnected.
    start = {"A": 1}
    on_a = merge(start, {"A": 2})  # A adds an item
    on_b = merge(start, {"B": 1})  # B removes an item
    print("A's version vs B's version:", compare(on_a, on_b))
    resolved = merge(merge(on_a, on_b), {"A": 3})  # A merges both
    print("resolved vs A's version:   ", compare(resolved, on_a))
    print("resolved vs B's version:   ", compare(resolved, on_b))


def lamport(events):
    """events: list of (process, kind, msg) where kind is 'local', 'send'
    or 'recv'; returns the Lamport time of each event."""
    clock, sent, out = {}, {}, []
    for proc, kind, msg in events:
        t = clock.get(proc, 0) + 1
        if kind == "recv":
            t = max(t, sent[msg] + 1)
        if kind == "send":
            sent[msg] = t
        clock[proc] = t
        out.append(t)
    return out


SOLUTIONS = [lamport]
EXAMPLES = [
    (
        (
            [
                ("P", "local", None),
                ("P", "send", "m1"),
                ("Q", "local", None),
                ("Q", "recv", "m1"),
                ("Q", "send", "m2"),
                ("P", "recv", "m2"),
            ],
        ),
        [1, 2, 1, 3, 4, 5],
    )
]


def test():
    assert compare({"A": 1}, {"A": 2}) == "before"
    assert compare({"A": 2, "B": 0}, {"A": 1, "B": 1}) == "concurrent"
    assert compare({}, {}) == "equal"
