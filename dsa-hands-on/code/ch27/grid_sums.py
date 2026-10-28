"""Prefix sums in two dimensions: the sum of any rectangle of a grid in
four lookups, after one pass to build the table."""

grid = [
    [3, 0, 1, 4],
    [5, 6, 3, 2],
    [1, 2, 0, 1],
]
rows, cols = len(grid), len(grid[0])
# table[r][c]: the sum of the rectangle from (0, 0) up to (r-1, c-1)
table = [[0] * (cols + 1) for _ in range(rows + 1)]
for r in range(rows):
    for c in range(cols):
        table[r + 1][c + 1] = (
            grid[r][c] + table[r][c + 1] + table[r + 1][c] - table[r][c]
        )


def rect_sum(r1, c1, r2, c2):
    """Sum of rows r1..r2 and columns c1..c2, inclusive."""
    return (
        table[r2 + 1][c2 + 1]
        - table[r1][c2 + 1]
        - table[r2 + 1][c1]
        + table[r1][c1]
    )


print(rect_sum(0, 0, 2, 3), rect_sum(1, 1, 2, 2), rect_sum(0, 3, 1, 3))
