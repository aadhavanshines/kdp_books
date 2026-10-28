"""Exercise 17.2: the smallest number of nodes an AVL tree of height h
can have: N(h) = N(h - 1) + N(h - 2) + 1. It grows like Fibonacci,
which is why the height stays logarithmic."""

import math

fewest = {-1: 0, 0: 1}
for h in range(1, 31):
    fewest[h] = fewest[h - 1] + fewest[h - 2] + 1
for h in [5, 10, 20, 30]:
    n = fewest[h]
    print(
        f"height {h:>2} needs at least {n:>9,} nodes; "
        f"log2 of that is {math.log2(n):.1f}"
    )
