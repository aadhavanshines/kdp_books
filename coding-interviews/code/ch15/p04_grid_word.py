"""15.4 Grid Word: can word be spelled by moving up, down, left or right
through neighbouring cells, using each cell at most once?"""


def grid_word(grid, word):
    rows, cols = len(grid), len(grid[0])

    def found(r, c, i):
        if i == len(word):
            return True
        if not (0 <= r < rows and 0 <= c < cols):
            return False
        if grid[r][c] != word[i]:
            return False
        saved, grid[r][c] = grid[r][c], "#"  # mark as used
        ok = (
            found(r + 1, c, i + 1)
            or found(r - 1, c, i + 1)
            or found(r, c + 1, i + 1)
            or found(r, c - 1, i + 1)
        )
        grid[r][c] = saved  # unmark on the way back
        return ok

    return any(found(r, c, 0) for r in range(rows) for c in range(cols))


def grid_word_paths(grid, word):
    rows, cols = len(grid), len(grid[0])

    def paths(path):
        if len(path) == len(word):
            return True
        r, c = path[-1]
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if (
                0 <= nr < rows
                and 0 <= nc < cols
                and (nr, nc) not in path
                and grid[nr][nc] == word[len(path)]
            ):
                if paths(path + [(nr, nc)]):
                    return True
        return False

    if not word:
        return True
    return any(
        grid[r][c] == word[0] and paths([(r, c)])
        for r in range(rows)
        for c in range(cols)
    )


SOLUTIONS = [grid_word, grid_word_paths]
GRID = [list("ABCE"), list("SFCS"), list("ADEE")]
EXAMPLES = [
    ((GRID, "ABCCED"), True),
    ((GRID, "SEE"), True),
    ((GRID, "ABCB"), False),
]


def random_case(rng):
    rows, cols = rng.randint(1, 3), rng.randint(1, 4)
    g = [[rng.choice("ab") for _ in range(cols)] for _ in range(rows)]
    w = "".join(rng.choice("ab") for _ in range(rng.randint(1, 5)))
    return (g, w)
