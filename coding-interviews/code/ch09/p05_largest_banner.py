"""9.5 Largest Banner: the largest rectangle that fits under a skyline of
bars of width 1."""


def largest_banner_brute(heights):
    best = 0
    for i in range(len(heights)):
        low = heights[i]
        for j in range(i, len(heights)):
            low = min(low, heights[j])
            best = max(best, low * (j - i + 1))
    return best


def largest_banner(heights):
    stack = []  # indices with increasing heights
    best = 0
    for i, h in enumerate(heights + [0]):  # the 0 empties the stack
        while stack and heights[stack[-1]] >= h:
            j = stack.pop()
            # heights[j] extends left to just after the new stack top
            left = stack[-1] + 1 if stack else 0
            best = max(best, heights[j] * (i - left))
        stack.append(i)
    return best


SOLUTIONS = [largest_banner, largest_banner_brute]
EXAMPLES = [
    (([2, 1, 5, 6, 2, 3],), 10),
    (([4],), 4),
    (([],), 0),
    (([3, 3, 3],), 9),
]


def random_case(rng):
    return ([rng.randint(0, 8) for _ in range(rng.randint(0, 10))],)
