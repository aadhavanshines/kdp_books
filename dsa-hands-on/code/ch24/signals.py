"""Words in a problem statement that point to a pattern."""

SIGNALS = [
    ("sorted array, pair or triple with a sum", "two pointers"),
    (
        "contiguous subarray or substring, longest or shortest",
        "sliding window",
    ),
    ("count subarrays with a sum; seen before; pairs", "hash map"),
    ("sums of ranges, asked many times", "prefix sums"),
    ("fewest steps, shortest path, levels, unweighted", "BFS"),
    ("connected regions, all paths, explore everything", "DFS"),
    ("order with prerequisites", "topological sort"),
    ("k largest, k smallest, k closest, merge k", "heap"),
    ("minimum or maximum value that works, monotone", "binary search"),
    ("count ways, best total, choices that overlap", "dynamic programming"),
    ("all combinations, permutations, placements", "backtracking"),
    ("next greater or smaller element", "monotonic stack"),
]
for signal, pattern in SIGNALS:
    print(f"{pattern:>19}: {signal}")
