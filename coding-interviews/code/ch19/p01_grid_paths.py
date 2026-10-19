"""19.1 Grid Paths: moving only right or down, how many routes cross an
r x c grid from top-left to bottom-right, avoiding blocked cells (1)?"""


def grid_paths(grid):
    rows, cols = len(grid), len(grid[0])
    ways = [0] * cols  # one row of the table at a time
    ways[0] = 1 if grid[0][0] == 0 else 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                ways[c] = 0
            elif c > 0:
                ways[c] += ways[c - 1]  # from above (old) + from left
    return ways[-1]


def grid_paths_brute(grid):
    rows, cols = len(grid), len(grid[0])

    def walk(r, c):
        if r >= rows or c >= cols or grid[r][c] == 1:
            return 0
        if (r, c) == (rows - 1, cols - 1):
            return 1
        return walk(r + 1, c) + walk(r, c + 1)

    return walk(0, 0)


SOLUTIONS = [grid_paths, grid_paths_brute]
EXAMPLES = [
    (([[0, 0, 0], [0, 1, 0], [0, 0, 0]],), 2),
    (([[0] * 7 for _ in range(3)],), 28),
    (([[1]],), 0),
]


def random_case(rng):
    rows, cols = rng.randint(1, 5), rng.randint(1, 5)
    return (
        [
            [1 if rng.random() < 0.2 else 0 for _ in range(cols)]
            for _ in range(rows)
        ],
    )
