"""20.6 Find Every Match: all start positions where pattern occurs in text
(matches may overlap), in O(len(text) + len(pattern))."""


def find_all_brute(text, pattern):
    if not pattern:
        return list(range(len(text) + 1))
    return [
        i
        for i in range(len(text) - len(pattern) + 1)
        if text[i : i + len(pattern)] == pattern
    ]


def find_all(text, pattern):
    if not pattern:
        return list(range(len(text) + 1))
    # fail[i]: length of the longest proper prefix of pattern[:i+1]
    # that is also a suffix of it (the Knuth-Morris-Pratt table).
    fail = [0] * len(pattern)
    k = 0
    for i in range(1, len(pattern)):
        while k and pattern[i] != pattern[k]:
            k = fail[k - 1]
        if pattern[i] == pattern[k]:
            k += 1
        fail[i] = k
    out, k = [], 0
    for i, ch in enumerate(text):
        while k and ch != pattern[k]:
            k = fail[k - 1]  # fall back without moving i
        if ch == pattern[k]:
            k += 1
        if k == len(pattern):
            out.append(i - k + 1)
            k = fail[k - 1]
    return out


SOLUTIONS = [find_all, find_all_brute]
EXAMPLES = [
    (("abababa", "aba"), [0, 2, 4]),
    (("aaaa", "aa"), [0, 1, 2]),
    (("abc", "d"), []),
    (("ab", ""), [0, 1, 2]),
]


def random_case(rng):
    t = "".join(rng.choice("ab") for _ in range(rng.randint(0, 15)))
    p = "".join(rng.choice("ab") for _ in range(rng.randint(0, 4)))
    return (t, p)
