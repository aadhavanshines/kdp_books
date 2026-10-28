"""How many slots does a search look at, as the table fills up?

Linear probing's average for a successful search is about
(1 + 1 / (1 - a)) / 2, where a is the load: the fraction of slots used.
"""

import random

from open_map import OpenMap

rng = random.Random(2026)
size = 100_000
print(f"{'load':>5} {'measured':>9} {'formula':>8}")
for load in [0.1, 0.3, 0.5, 0.6, 0.7, 0.8, 0.9]:
    m = OpenMap()
    m._slots = [None] * size  # a fixed size, so we control the load
    m._rehash = lambda: None  # and switch resizing off
    keys = [rng.getrandbits(60) for _ in range(int(load * size))]
    for k in keys:
        m[k] = True
    m.probes = 0
    for k in keys:
        m[k]  # look up every key once
    measured = m.probes / len(keys)
    formula = (1 + 1 / (1 - load)) / 2
    print(f"{load:>5} {measured:>9.2f} {formula:>8.2f}")
