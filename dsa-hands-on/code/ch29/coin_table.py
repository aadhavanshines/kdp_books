"""Watch the bottom-up table fill: fewest coins for each amount 0..11,
with coins 1, 2 and 5."""

import math

coins, amount = [1, 2, 5], 11
table = [0] + [math.inf] * amount
for a in range(1, amount + 1):
    for c in coins:
        if c <= a and table[a - c] + 1 < table[a]:
            table[a] = table[a - c] + 1
print("amount: " + " ".join(f"{a:>2}" for a in range(amount + 1)))
print("coins:  " + " ".join(f"{t:>2}" for t in table))
