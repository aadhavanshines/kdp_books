"""16.3 Warehouse Route: fewest steps from the top-left to the bottom-right
of a grid, moving up/down/left/right through open cells (0), never
through shelves (1). -1 if impossible."""

from collections import deque


def warehouse_route(grid):
    rows, cols = len(grid), len(grid[0])
    if grid[0][0] or grid[rows - 1][cols - 1]:
        return -1
    dist = {(0, 0): 0}
    queue = deque([(0, 0)])
    while queue:
        r, c = queue.popleft()
        if (r, c) == (rows - 1, cols - 1):
            return dist[(r, c)]
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if (
                0 <= nr < rows
                and 0 <= nc < cols
                and grid[nr][nc] == 0
                and (nr, nc) not in dist
            ):
                dist[(nr, nc)] = dist[(r, c)] + 1
                queue.append((nr, nc))
    return -1


def warehouse_route_relax(grid):
    """Bellman-Ford-style: repeat until no distance improves."""
    rows, cols = len(grid), len(grid[0])
    inf = float("inf")
    d = [[inf] * cols for _ in range(rows)]
    if grid[0][0] == 0:
        d[0][0] = 0
    changed = True
    while changed:
        changed = False
        for r in range(rows):
            for c in range(cols):
                if grid[r][c]:
                    continue
                for nr, nc in (
                    (r + 1, c),
                    (r - 1, c),
                    (r, c + 1),
                    (r, c - 1),
                ):
                    if (
                        0 <= nr < rows
                        and 0 <= nc < cols
                        and d[nr][nc] + 1 < d[r][c]
                    ):
                        d[r][c] = d[nr][nc] + 1
                        changed = True
    best = d[rows - 1][cols - 1]
    return -1 if best == inf else best


SOLUTIONS = [warehouse_route, warehouse_route_relax]
EXAMPLES = [
    (([[0, 0, 0], [1, 1, 0], [0, 0, 0]],), 4),
    (([[0, 1], [1, 0]],), -1),
    (([[0]],), 0),
]


def random_case(rng):
    rows, cols = rng.randint(1, 5), rng.randint(1, 5)
    g = [
        [1 if rng.random() < 0.3 else 0 for _ in range(cols)]
        for _ in range(rows)
    ]
    return (g,)
