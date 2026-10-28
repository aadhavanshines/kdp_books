"""Recursive DFS on a big open grid goes thousands of calls deep."""

import sys


def fill_recursive(grid, r, c, seen):
    if not (0 <= r < len(grid) and 0 <= c < len(grid[0])):
        return
    if (r, c) in seen:
        return
    seen.add((r, c))
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        fill_recursive(grid, r + dr, c + dc, seen)


print("recursion limit:", sys.getrecursionlimit())
for side in (20, 100):
    grid = ["." * side] * side
    try:
        seen = set()
        fill_recursive(grid, 0, 0, seen)
        print(f"{side} x {side}: filled {len(seen):,} cells")
    except RecursionError:
        print(f"{side} x {side}: RecursionError")
