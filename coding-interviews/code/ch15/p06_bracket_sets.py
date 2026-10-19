"""15.6 Bracket Sets: all strings of n pairs of correctly nested ()."""

from itertools import product


def bracket_sets(n):
    out = []

    def build(text, opened, closed):
        if len(text) == 2 * n:
            out.append(text)
            return
        if opened < n:
            build(text + "(", opened + 1, closed)
        if closed < opened:  # only close what is open
            build(text + ")", opened, closed + 1)

    build("", 0, 0)
    return out


def bracket_sets_brute(n):
    def ok(s):
        depth = 0
        for ch in s:
            depth += 1 if ch == "(" else -1
            if depth < 0:
                return False
        return depth == 0

    return [
        "".join(p) for p in product("()", repeat=2 * n) if ok("".join(p))
    ]


SOLUTIONS = [bracket_sets, bracket_sets_brute]
EXAMPLES = [
    ((1,), ["()"]),
    ((3,), ["((()))", "(()())", "(())()", "()(())", "()()()"]),
    ((0,), [""]),
]


def random_case(rng):
    return (rng.randint(0, 5),)
