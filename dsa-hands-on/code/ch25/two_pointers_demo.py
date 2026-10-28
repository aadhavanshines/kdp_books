"""The two-pointer solutions on small examples."""

from two_pointers import (
    dedupe_sorted,
    is_palindrome,
    most_water,
    move_zeros,
    pair_sum_sorted,
    three_sum,
)

print(pair_sum_sorted([1, 3, 4, 6, 8, 11], 10))
nums = [1, 1, 2, 3, 3, 3, 7]
print(dedupe_sorted(nums), nums)
print(is_palindrome("Was it a car or a cat I saw?"))
print(most_water([1, 8, 6, 2, 5, 4, 8, 3, 7]))
print(three_sum([-1, 0, 1, 2, -1, -4]))
nums = [0, 1, 0, 3, 12]
move_zeros(nums)
print(nums)
