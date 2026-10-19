"""15.5 Safe Queens: in how many ways can n queens be placed on an n x n
board so that no two attack each other?"""

from itertools import permutations


def safe_queens(n):
    cols, diag, anti = set(), set(), set()

    def place(row):
        if row == n:
            return 1
        count = 0
        for c in range(n):
            if c in cols or row - c in diag or row + c in anti:
                continue
            cols.add(c)
            diag.add(row - c)
            anti.add(row + c)
            count += place(row + 1)
            cols.remove(c)
            diag.remove(row - c)
            anti.remove(row + c)
        return count

    return place(0)


def safe_queens_brute(n):
    count = 0
    for perm in permutations(range(n)):  # one queen per row and column
        if (
            len({r - c for r, c in enumerate(perm)}) == n
            and len({r + c for r, c in enumerate(perm)}) == n
        ):
            count += 1
    return count


SOLUTIONS = [safe_queens, safe_queens_brute]
EXAMPLES = [((1,), 1), ((2,), 0), ((4,), 2), ((6,), 4), ((8,), 92)]


def test():
    assert safe_queens(10) == 724
