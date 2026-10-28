"""Shortest route across an open square grid of n cells, corner to
corner. BFS visits each cell once: time grows in proportion to n."""

import bench
from grids import shortest_route


def make(n):
    side = int(n**0.5)
    grid = ["." * side] * side
    return grid, (0, 0), (side - 1, side - 1)


sizes = [10_000, 40_000, 160_000, 640_000]
results = {"BFS": bench.doubling(shortest_route, make, sizes)}
bench.table(results)
