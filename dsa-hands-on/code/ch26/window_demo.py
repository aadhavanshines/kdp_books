"""The sliding-window solutions on small examples."""

from window import (
    longest_unique,
    max_sum_k,
    min_window,
    shortest_with_sum,
    window_maxima,
)

print(max_sum_k([2, 1, 5, 1, 3, 2], 3))
print(longest_unique("abcabcbb"), longest_unique("pwwkew"))
print(shortest_with_sum([2, 3, 1, 2, 4, 3], 7))
print(repr(min_window("ADOBECODEBANC", "ABC")))
print(window_maxima([1, 3, -1, -3, 5, 3, 6, 7], 3))
