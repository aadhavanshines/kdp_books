"""8.5 Region Sums: answer many "sum of this rectangle" queries on a grid."""


class RegionSums:
    def __init__(self, grid):
        rows = len(grid)
        cols = len(grid[0]) if rows else 0
        # p[r][c] = sum of the rectangle from (0, 0) to (r-1, c-1)
        self.p = [[0] * (cols + 1) for _ in range(rows + 1)]
        for r in range(rows):
            for c in range(cols):
                self.p[r + 1][c + 1] = (
                    grid[r][c]
                    + self.p[r][c + 1]
                    + self.p[r + 1][c]
                    - self.p[r][c]
                )

    def total(self, r1, c1, r2, c2):
        p = self.p
        return p[r2 + 1][c2 + 1] - p[r1][c2 + 1] - p[r2 + 1][c1] + p[r1][c1]


def region_sums(grid, queries):
    rs = RegionSums(grid)
    return [rs.total(*q) for q in queries]


def region_sums_brute(grid, queries):
    out = []
    for r1, c1, r2, c2 in queries:
        out.append(
            sum(
                grid[r][c]
                for r in range(r1, r2 + 1)
                for c in range(c1, c2 + 1)
            )
        )
    return out


SOLUTIONS = [region_sums, region_sums_brute]
EXAMPLES = [
    (
        ([[3, 0, 1], [5, 6, 3], [1, 2, 0]], [(0, 0, 1, 1), (1, 1, 2, 2)]),
        [14, 11],
    ),
]


def random_case(rng):
    rows, cols = rng.randint(1, 5), rng.randint(1, 5)
    g = [[rng.randint(-3, 9) for _ in range(cols)] for _ in range(rows)]
    qs = []
    for _ in range(4):
        r1, c1 = rng.randint(0, rows - 1), rng.randint(0, cols - 1)
        qs.append(
            (r1, c1, rng.randint(r1, rows - 1), rng.randint(c1, cols - 1))
        )
    return (g, qs)
