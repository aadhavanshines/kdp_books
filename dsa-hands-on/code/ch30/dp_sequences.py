"""Dynamic programming on sequences: tables indexed by positions in one
or two sequences."""

import bisect


def lcs(a, b):
    """The longest common subsequence of a and b (in order, not
    necessarily side by side). table[i][j] is the LCS length of
    a[:i] and b[:j]; walk back through it to recover the letters."""
    table = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                table[i][j] = table[i - 1][j - 1] + 1
            else:
                table[i][j] = max(table[i - 1][j], table[i][j - 1])
    out, i, j = [], len(a), len(b)
    while i and j:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1])
            i, j = i - 1, j - 1
        elif table[i - 1][j] >= table[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return out[::-1]


def edit_distance(a, b):
    """The fewest single-letter inserts, deletes and replacements that
    turn a into b. Only two rows of the table are kept."""
    prev = list(range(len(b) + 1))  # turning "" into b[:j]: j inserts
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j - 1], prev[j], cur[j - 1])
        prev = cur
    return prev[-1]


def knapsack(items, capacity):
    """The most value from (weight, value) items, each taken at most
    once, within capacity. best[c] is the best value using weight c;
    looping c downward keeps each item from being used twice."""
    best = [0] * (capacity + 1)
    for weight, value in items:
        for c in range(capacity, weight - 1, -1):
            best[c] = max(best[c], best[c - weight] + value)
    return best[capacity]


def lis_quadratic(nums):
    """Length of the longest strictly increasing subsequence, O(n^2):
    ends[i] is the longest one ending at nums[i]."""
    ends = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                ends[i] = max(ends[i], ends[j] + 1)
    return max(ends, default=0)


def lis(nums):
    """The same in O(n log n): tails[k] is the smallest possible last
    item of an increasing subsequence of length k + 1. It stays sorted,
    so each new number finds its place by binary search."""
    tails = []
    for x in nums:
        k = bisect.bisect_left(tails, x)
        if k == len(tails):
            tails.append(x)
        else:
            tails[k] = x
    return len(tails)
