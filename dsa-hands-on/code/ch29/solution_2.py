"""Exercise 29.2: paths through a grid moving right or down, with
blocked cells ("#"). Each cell's count is the sum of the counts above
it and to its left."""


def unique_paths(grid):
    cols = len(grid[0])
    row = [0] * cols
    row[0] = 1
    for line in grid:
        for c in range(cols):
            if line[c] == "#":
                row[c] = 0
            elif c:
                row[c] += row[c - 1]  # row[c] still holds the cell above
    return row[-1]


print(unique_paths(["...", ".#.", "..."]), unique_paths(["...."] * 4))
