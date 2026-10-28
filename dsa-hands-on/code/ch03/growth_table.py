"""How the common growth rates compare as n grows."""

import math

print(
    f"{'n':>9} {'log2 n':>6} {'n log2 n':>10} {'n squared':>17} "
    f"{'2 to the n':>14}"
)
for n in [10, 100, 1_000, 10_000, 100_000, 1_000_000]:
    if n <= 30:
        two_to_n = f"{2**n:,}"
    else:  # too long to print: count its digits instead
        two_to_n = f"{math.floor(n * math.log10(2)) + 1:,} digits"
    print(
        f"{n:>9,} {math.log2(n):>6.1f} {n * math.log2(n):>10,.0f} "
        f"{n * n:>17,} {two_to_n:>14}"
    )
