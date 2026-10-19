"""15.1 All Bundles: every subset of distinct items (in any order)."""

from itertools import combinations


def all_bundles(items):
    out = []
    bundle = []

    def choose(i):
        if i == len(items):
            out.append(bundle[:])  # copy: bundle keeps changing
            return
        choose(i + 1)  # skip items[i]
        bundle.append(items[i])  # take items[i]
        choose(i + 1)
        bundle.pop()  # undo the choice

    choose(0)
    return out


def all_bundles_bits(items):
    n = len(items)
    return [
        [items[i] for i in range(n) if mask >> i & 1]
        for mask in range(1 << n)
    ]


def all_bundles_lib(items):
    return [
        list(c)
        for k in range(len(items) + 1)
        for c in combinations(items, k)
    ]


def NORMALIZE(r):
    return sorted(sorted(b) for b in r)


def CHECK(args, result):
    return NORMALIZE(result) == NORMALIZE(all_bundles_lib(*args))


SOLUTIONS = [all_bundles, all_bundles_bits, all_bundles_lib]
EXAMPLES = [((["a", "b"],), [[], ["b"], ["a"], ["a", "b"]]), (([],), [[]])]


def random_case(rng):
    return (list(range(rng.randint(0, 6))),)
