"""9.6 Window Peaks: the maximum of every window of k consecutive values."""

from collections import deque


def window_peaks_brute(values, k):
    return [max(values[i : i + k]) for i in range(len(values) - k + 1)]


def window_peaks(values, k):
    dq = deque()  # indices; their values decrease from front to back
    out = []
    for i, v in enumerate(values):
        while dq and values[dq[-1]] <= v:
            dq.pop()  # smaller values can never be a maximum again
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()  # front fell out of the window
        if i >= k - 1:
            out.append(values[dq[0]])
    return out


SOLUTIONS = [window_peaks, window_peaks_brute]
EXAMPLES = [
    (([1, 3, -1, -3, 5, 3, 6, 7], 3), [3, 3, 5, 5, 6, 7]),
    (([4], 1), [4]),
    (([2, 2, 2], 2), [2, 2]),
]


def random_case(rng):
    n = rng.randint(1, 12)
    v = [rng.randint(-5, 5) for _ in range(n)]
    return (v, rng.randint(1, n))
