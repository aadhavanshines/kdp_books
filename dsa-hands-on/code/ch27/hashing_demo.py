"""The hash-map and prefix-sum solutions on small examples."""

from hashing_patterns import (
    count_subarrays_with_sum,
    first_unique,
    group_anagrams,
    longest_consecutive,
    prefix_sums,
)

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
print(first_unique("swiss"), first_unique("aabb"))
print(longest_consecutive([100, 4, 200, 1, 3, 2]))
sales = [3, 1, 4, 1, 5, 9, 2, 6]
prefix = prefix_sums(sales)
print(prefix, "sum of sales[2:6]:", prefix[6] - prefix[2])
print(count_subarrays_with_sum([1, 2, 3, -3, 1, 2], 3))
