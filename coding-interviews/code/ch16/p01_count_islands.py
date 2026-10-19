"""16.1 Count Islands: groups of land cells ("1") joined up, down, left
or right."""

from collections import deque


def count_islands(grid):
    grid = [row[:] for row in grid]  # don't change the caller's grid
    rows, cols = len(grid), len(grid[0]) if grid else 0

    def sink(r, c):
        if 0 <= r < rows and 0 <= c < cols and grid[r][c] == "1":
            grid[r][c] = "0"
            sink(r + 1, c)
            sink(r - 1, c)
            sink(r, c + 1)
            sink(r, c - 1)

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                islands += 1
                sink(r, c)
    return islands


def count_islands_bfs(grid):
    rows, cols = len(grid), len(grid[0]) if grid else 0
    seen = set()
    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in seen:
                islands += 1
                seen.add((r, c))
                queue = deque([(r, c)])
                while queue:
                    cr, cc = queue.popleft()
                    for nr, nc in (
                        (cr + 1, cc),
                        (cr - 1, cc),
                        (cr, cc + 1),
                        (cr, cc - 1),
                    ):
                        if (
                            0 <= nr < rows
                            and 0 <= nc < cols
                            and grid[nr][nc] == "1"
                            and (nr, nc) not in seen
                        ):
                            seen.add((nr, nc))
                            queue.append((nr, nc))
    return islands


SOLUTIONS = [count_islands, count_islands_bfs]
EXAMPLES = [
    (([list("11000"), list("11000"), list("00100"), list("00011")],), 3),
    (([list("000")],), 0),
    (([],), 0),
]


def random_case(rng):
    rows, cols = rng.randint(1, 6), rng.randint(1, 6)
    return ([[rng.choice("01") for _ in range(cols)] for _ in range(rows)],)
