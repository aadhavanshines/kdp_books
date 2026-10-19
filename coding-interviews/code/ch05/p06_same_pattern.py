"""5.6 Same Pattern: do two codes follow the same letter pattern?"""


def same_pattern_brute(a, b):
    if len(a) != len(b):
        return False
    for i in range(len(a)):
        for j in range(len(a)):
            if (a[i] == a[j]) != (b[i] == b[j]):
                return False
    return True


def same_pattern(a, b):
    if len(a) != len(b):
        return False
    forward, backward = {}, {}
    for x, y in zip(a, b):
        if forward.setdefault(x, y) != y:
            return False
        if backward.setdefault(y, x) != x:
            return False
    return True


SOLUTIONS = [same_pattern, same_pattern_brute]
EXAMPLES = [
    (("paper", "title"), True),
    (("foo", "bar"), False),
    (("ab", "aa"), False),
    (("", ""), True),
    (("abc", "ab"), False),
]


def random_case(rng):
    a = "".join(rng.choice("abc") for _ in range(rng.randint(0, 6)))
    b = "".join(rng.choice("xyz") for _ in range(len(a)))
    return (a, b)
