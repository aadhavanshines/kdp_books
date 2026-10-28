"""Why comparison sorts need about n log2 n comparisons: there are n!
possible orders, and each yes-or-no comparison can at best halve the
orders still possible, so it takes at least log2(n!) comparisons."""

import math

print(f"{'n':>7} {'log2(n!)':>11} {'n log2 n':>11}")
for n in [10, 100, 1_000, 10_000, 100_000]:
    log2_factorial = math.lgamma(n + 1) / math.log(2)  # log2 of n!
    print(f"{n:>7,} {log2_factorial:>11,.0f} {n * math.log2(n):>11,.0f}")
