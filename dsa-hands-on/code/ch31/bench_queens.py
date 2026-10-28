"""Counting n-queens placements: backtracking with pruning still grows
exponentially. Each row of the table adds one to n."""

import bench
from backtracking import queens

sizes = [6, 7, 8, 9, 10]
bench.table({"queens(n)": bench.doubling(queens, lambda n: (n,), sizes)})
