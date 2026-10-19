"""7.1 Best Week: the highest total of k consecutive days of sales."""


def best_window_brute(sales, k):
    return max(sum(sales[i : i + k]) for i in range(len(sales) - k + 1))


def best_window(sales, k):
    window = sum(sales[:k])
    best = window
    for i in range(k, len(sales)):
        window += sales[i] - sales[i - k]  # add the new day, drop the old
        best = max(best, window)
    return best


SOLUTIONS = [best_window, best_window_brute]
EXAMPLES = [
    (([3, 8, 1, 9, 2, 7, 4], 3), 18),
    (([5], 1), 5),
    (([-2, -1, -3], 2), -3),
]


def random_case(rng):
    n = rng.randint(1, 10)
    sales = [rng.randint(-5, 10) for _ in range(n)]
    return (sales, rng.randint(1, n))
