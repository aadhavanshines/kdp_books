"""6.2 Sorted Pair: in a sorted list of weights, find two that sum to a
target, using no extra memory. Return their positions, or []."""


def sorted_pair_brute(weights, target):
    for i in range(len(weights)):
        for j in range(i + 1, len(weights)):
            if weights[i] + weights[j] == target:
                return [i, j]
    return []


def sorted_pair(weights, target):
    left, right = 0, len(weights) - 1
    while left < right:
        total = weights[left] + weights[right]
        if total == target:
            return [left, right]
        if total < target:
            left += 1  # need a bigger sum
        else:
            right -= 1  # need a smaller sum
    return []


SOLUTIONS = [sorted_pair, sorted_pair_brute]
EXAMPLES = [
    (([1, 3, 4, 6, 9], 10), [1, 4]),
    (([2, 2], 4), [0, 1]),
    (([1, 2, 3], 7), []),
]


def CHECK(args, result):
    w, t = args
    if result == []:
        return sorted_pair_brute(w, t) == []
    i, j = result
    return i < j and w[i] + w[j] == t


def random_case(rng):
    w = sorted(rng.randint(-5, 10) for _ in range(rng.randint(0, 10)))
    return (w, rng.randint(-5, 15))
