"""Backtracking: build a solution one choice at a time; when a choice
can't lead anywhere, undo it and try the next."""


def subsets(items):
    out, chosen = [], []

    def go(i):
        if i == len(items):
            out.append(list(chosen))
            return
        go(i + 1)  # leave items[i] out
        chosen.append(items[i])  # put it in
        go(i + 1)
        chosen.pop()  # undo, so the caller sees what it had

    go(0)
    return out


def permutations(items):
    out, chosen, used = [], [], [False] * len(items)

    def go():
        if len(chosen) == len(items):
            out.append(list(chosen))
            return
        for i, x in enumerate(items):
            if not used[i]:
                used[i] = True
                chosen.append(x)
                go()
                chosen.pop()
                used[i] = False

    go()
    return out


def combination_sum(candidates, target):
    """Every combination (repeats allowed) adding up to target."""
    out, chosen = [], []
    candidates = sorted(candidates)

    def go(start, remaining):
        if remaining == 0:
            out.append(list(chosen))
            return
        for i in range(start, len(candidates)):
            c = candidates[i]
            if c > remaining:
                break  # sorted: every later candidate is bigger too
            chosen.append(c)
            go(i, remaining - c)  # i, not i + 1: c may be used again
            chosen.pop()

    go(0, target)
    return out


def queens(n):
    """Ways to place n queens on an n x n board, none attacking another.
    One queen per row; sets of used columns and diagonals prune fast."""
    cols, diag, anti = set(), set(), set()

    def place(row):
        if row == n:
            return 1
        count = 0
        for c in range(n):
            if c in cols or row - c in diag or row + c in anti:
                continue  # attacked: prune this whole branch
            cols.add(c)
            diag.add(row - c)
            anti.add(row + c)
            count += place(row + 1)
            cols.remove(c)
            diag.remove(row - c)
            anti.remove(row + c)
        return count

    return place(0)
