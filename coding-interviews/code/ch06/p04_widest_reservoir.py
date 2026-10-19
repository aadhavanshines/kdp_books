"""6.4 Widest Reservoir: two walls that hold the most water between them.

The water held between walls i and j is (j - i) * min(h[i], h[j])."""


def reservoir_brute(heights):
    best = 0
    for i in range(len(heights)):
        for j in range(i + 1, len(heights)):
            best = max(best, (j - i) * min(heights[i], heights[j]))
    return best


def reservoir(heights):
    left, right = 0, len(heights) - 1
    best = 0
    while left < right:
        width = right - left
        best = max(best, width * min(heights[left], heights[right]))
        # The shorter wall limits the water; moving the taller one
        # can never help, so move the shorter one inward.
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
    return best


SOLUTIONS = [reservoir, reservoir_brute]
EXAMPLES = [
    (([2, 8, 6, 2, 5, 4, 8, 3],), 40),
    (([1, 1],), 1),
    (([5],), 0),
]


def random_case(rng):
    return ([rng.randint(0, 10) for _ in range(rng.randint(0, 12))],)
