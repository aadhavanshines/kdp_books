"""Exercise 26.2: the longest run of fruit trees you can pick from with
two baskets, each holding one kind: the longest window with at most two
distinct values."""

from collections import Counter


def longest_two_kinds(trees):
    counts, left, best = Counter(), 0, 0
    for right, kind in enumerate(trees):
        counts[kind] += 1
        while len(counts) > 2:
            counts[trees[left]] -= 1
            if counts[trees[left]] == 0:
                del counts[trees[left]]
            left += 1
        best = max(best, right - left + 1)
    return best


print(longest_two_kinds([1, 2, 1]), longest_two_kinds([1, 2, 3, 2, 2]))
