"""Heights after inserting the keys 0 to n - 1 in sorted order."""

import math

from avl import AVLTree

print(
    f"{'n':>8} {'plain BST':>10} {'AVL':>4} {'log2 n':>7} "
    f"{'1.44 log2 n':>12}"
)
for n in [100, 1_000, 10_000, 100_000]:
    t = AVLTree()
    for k in range(n):
        t.put(k, None)
    print(
        f"{n:>8,} {n - 1:>10,} {t.height():>4} {math.log2(n):>7.1f} "
        f"{1.44 * math.log2(n):>12.1f}"
    )
