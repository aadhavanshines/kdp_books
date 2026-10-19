"""7.4 Repaint the Fence: longest run of one colour after repainting at
most k boards. Colours are capital letters."""


def repaint_brute(boards, k):
    best = 0
    for i in range(len(boards)):
        for j in range(i, len(boards)):
            part = boards[i : j + 1]
            most = max(part.count(c) for c in set(part))
            if len(part) - most <= k:
                best = max(best, len(part))
    return best


def repaint(boards, k):
    counts = {}
    most = 0  # highest count of one colour seen in a window so far
    left = 0
    best = 0
    for right, colour in enumerate(boards):
        counts[colour] = counts.get(colour, 0) + 1
        most = max(most, counts[colour])
        if right - left + 1 - most > k:  # too many boards to repaint
            counts[boards[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best


SOLUTIONS = [repaint, repaint_brute]
EXAMPLES = [
    (("RRGRBB", 1), 4),
    (("AABABBA", 1), 4),
    (("", 2), 0),
    (("ABC", 0), 1),
]


def random_case(rng):
    s = "".join(rng.choice("ABC") for _ in range(rng.randint(0, 12)))
    return (s, rng.randint(0, 3))
