"""Python stops recursion that goes too deep."""

import sys


def depth(n):
    return 0 if n == 0 else 1 + depth(n - 1)


print("limit:", sys.getrecursionlimit())
print(depth(900))
try:
    depth(100_000)
except RecursionError:
    print("RecursionError: too deep")
