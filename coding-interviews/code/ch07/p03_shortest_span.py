"""7.3 Shortest Span: shortest run of consecutive deliveries whose total
weight is at least the target. All weights are positive. 0 if none."""


def shortest_span_brute(weights, target):
    best = 0
    for i in range(len(weights)):
        total = 0
        for j in range(i, len(weights)):
            total += weights[j]
            if total >= target:
                if best == 0 or j - i + 1 < best:
                    best = j - i + 1
                break
    return best


def shortest_span(weights, target):
    best = len(weights) + 1
    total = 0
    left = 0
    for right, w in enumerate(weights):
        total += w
        while total >= target:  # shrink while still big enough
            best = min(best, right - left + 1)
            total -= weights[left]
            left += 1
    return best if best <= len(weights) else 0


SOLUTIONS = [shortest_span, shortest_span_brute]
EXAMPLES = [
    (([4, 1, 1, 3, 2, 5], 8), 3),
    (([1, 1, 1], 5), 0),
    (([8], 7), 1),
]


def random_case(rng):
    w = [rng.randint(1, 6) for _ in range(rng.randint(0, 10))]
    return (w, rng.randint(1, 20))
