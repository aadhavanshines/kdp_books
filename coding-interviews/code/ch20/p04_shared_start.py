"""20.4 Shared Start: the longest prefix shared by all the strings."""

import os


def shared_start(strings):
    if not strings:
        return ""
    first = strings[0]
    for i, ch in enumerate(first):
        for s in strings[1:]:
            if i == len(s) or s[i] != ch:
                return first[:i]
    return first


def shared_start_minmax(strings):
    if not strings:
        return ""
    lo, hi = min(strings), max(strings)  # most different pair
    i = 0
    while i < len(lo) and lo[i] == hi[i]:
        i += 1
    return lo[:i]


def shared_start_lib(strings):
    return os.path.commonprefix(strings)


SOLUTIONS = [shared_start, shared_start_minmax, shared_start_lib]
EXAMPLES = [
    ((["flower", "flow", "flight"],), "fl"),
    ((["dog", "car"],), ""),
    (([],), ""),
    ((["solo"],), "solo"),
]


def random_case(rng):
    return (
        [
            "".join(rng.choice("ab") for _ in range(rng.randint(0, 4)))
            for _ in range(rng.randint(0, 5))
        ],
    )
