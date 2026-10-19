"""5.2 First Repeat Visitor: the first badge ID seen for the second time."""


def first_repeat_brute(badges):
    for j in range(len(badges)):
        if badges[j] in badges[:j]:
            return badges[j]
    return None


def first_repeat(badges):
    seen = set()
    for badge in badges:
        if badge in seen:
            return badge
        seen.add(badge)
    return None


SOLUTIONS = [first_repeat, first_repeat_brute]
EXAMPLES = [
    ((["A7", "B2", "C9", "B2", "A7"],), "B2"),
    ((["X1", "X2"],), None),
    (([],), None),
    ((["Q", "Q"],), "Q"),
]


def random_case(rng):
    return ([rng.choice("ABCDEFGH") for _ in range(rng.randint(0, 10))],)
