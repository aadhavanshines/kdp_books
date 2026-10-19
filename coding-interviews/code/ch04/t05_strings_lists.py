"""Everyday tools for strings, lists and grids."""


def demo():
    word = "Interview"
    print(word[::-1], word.lower().count("e"), "".join(sorted("cab")))
    print(ord("c") - ord("a"), chr(ord("a") + 2))

    for i, ch in enumerate("ab"):
        print(i, ch)
    print(list(zip([1, 2, 3], "xyz")))

    rows, cols = 2, 3
    grid = [[0] * cols for _ in range(rows)]  # each row is a new list
    grid[0][0] = 9
    print(grid)
    wrong = [[0] * cols] * rows  # the SAME row repeated: a classic bug
    wrong[0][0] = 9
    print(wrong)
