"""Exercise 25.1: square every number of a sorted list (negatives
included) and return the squares sorted, in linear time. The biggest
square is at one of the two ends, so fill the answer from the back."""


def sorted_squares(nums):
    out = [0] * len(nums)
    lo, hi = 0, len(nums) - 1
    for k in range(len(nums) - 1, -1, -1):
        if abs(nums[lo]) > abs(nums[hi]):
            out[k] = nums[lo] ** 2
            lo += 1
        else:
            out[k] = nums[hi] ** 2
            hi -= 1
    return out


print(sorted_squares([-7, -3, 2, 3, 11]))
