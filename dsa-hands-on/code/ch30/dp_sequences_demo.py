"""The sequence DPs on small examples."""

from dp_sequences import edit_distance, knapsack, lcs, lis

print("".join(lcs("ABCBDAB", "BDCABA")))
before = ["import os", "x = 1", "y = 2", "print(x)"]
after = ["import os", "import sys", "x = 1", "print(x)"]
print(lcs(before, after))  # the lines a diff keeps
print(edit_distance("kitten", "sitting"), edit_distance("flaw", "lawn"))
items = [(1, 1), (3, 4), (4, 5), (5, 7)]  # (weight, value)
print(knapsack(items, 7))
print(lis([10, 9, 2, 5, 3, 7, 101, 18]))
