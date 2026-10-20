"""13.6 No Two Alike: rearrange letters so no two neighbors are equal.
Return "" if impossible. Any valid answer is accepted."""

import heapq
from collections import Counter


def no_neighbors(s):
    heap = [(-c, ch) for ch, c in Counter(s).items()]
    heapq.heapify(heap)
    out = []
    held = None  # the letter used last step can't be used right away
    while heap:
        count, ch = heapq.heappop(heap)
        out.append(ch)
        if held:
            heapq.heappush(heap, held)
        held = (count + 1, ch) if count + 1 < 0 else None
    return "" if held else "".join(out)


def possible(s):
    return not s or max(Counter(s).values()) <= (len(s) + 1) // 2


def CHECK(args, result):
    (s,) = args
    if not possible(s):
        return result == ""
    return sorted(result) == sorted(s) and all(
        a != b for a, b in zip(result, result[1:])
    )


SOLUTIONS = [no_neighbors]
EXAMPLES = [(("ppa",), "pap"), (("pppa",), ""), (("",), "")]


def random_case(rng):
    return ("".join(rng.choice("aabc") for _ in range(rng.randint(0, 10))),)


def test():
    from itertools import permutations, product

    for n in range(7):  # possible() agrees with trying every arrangement
        for s in map("".join, product("abc", repeat=n)):
            exists = any(
                all(a != b for a, b in zip(p, p[1:]))
                for p in permutations(s)
            )
            assert possible(s) == exists, s
