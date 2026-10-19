"""19.3 Typo Distance: the fewest single-character insertions, deletions
or replacements that turn a into b."""

from functools import cache


def typo_distance(a, b):
    prev = list(range(len(b) + 1))  # distances from "" to b[:j]
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(
                    prev[j],  # delete a[i-1]
                    cur[j - 1],  # insert b[j-1]
                    prev[j - 1],  # replace
                )
        prev = cur
    return prev[len(b)]


def typo_distance_memo(a, b):
    @cache
    def d(i, j):
        if i == len(a):
            return len(b) - j
        if j == len(b):
            return len(a) - i
        if a[i] == b[j]:
            return d(i + 1, j + 1)
        return 1 + min(d(i + 1, j), d(i, j + 1), d(i + 1, j + 1))

    return d(0, 0)


SOLUTIONS = [typo_distance, typo_distance_memo]
EXAMPLES = [
    (("rocket", "pocket"), 1),
    (("launch", "lunches"), 3),
    (("", "abc"), 3),
    (("same", "same"), 0),
]


def random_case(rng):
    def s():
        return "".join(rng.choice("abc") for _ in range(rng.randint(0, 7)))

    return (s(), s())
