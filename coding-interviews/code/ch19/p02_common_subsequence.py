"""19.2 Longest Shared Subsequence: the length of the longest sequence of
characters appearing in order (not necessarily together) in both a and b."""

from functools import cache


def shared(a, b):
    m, n = len(a), len(b)
    t = [[0] * (n + 1) for _ in range(m + 1)]  # t[i][j]: a[:i] vs b[:j]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                t[i][j] = t[i - 1][j - 1] + 1
            else:
                t[i][j] = max(t[i - 1][j], t[i][j - 1])
    return t[m][n]


def shared_memo(a, b):
    @cache
    def best(i, j):
        if i == len(a) or j == len(b):
            return 0
        if a[i] == b[j]:
            return 1 + best(i + 1, j + 1)
        return max(best(i + 1, j), best(i, j + 1))

    return best(0, 0)


SOLUTIONS = [shared, shared_memo]
EXAMPLES = [(("abcde", "ace"), 3), (("abc", "def"), 0), (("", "x"), 0)]


def random_case(rng):
    def s():
        return "".join(rng.choice("abc") for _ in range(rng.randint(0, 8)))

    return (s(), s())
