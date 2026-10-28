"""The height of a BST built from random keys and from sorted keys."""

import math
import random

from bst import BST

rng = random.Random(2026)
print(f"{'n':>7} {'log2 n':>7} {'random order':>13} {'sorted order':>13}")
for n in [100, 1_000, 10_000]:
    shuffled, ordered = BST(), BST()
    for k in rng.sample(range(n), n):
        shuffled.put(k, None)
    for k in range(n):
        ordered.put(k, None)
    print(
        f"{n:>7,} {math.log2(n):>7.1f} {shuffled.height():>13,} "
        f"{ordered.height():>13,}"
    )
