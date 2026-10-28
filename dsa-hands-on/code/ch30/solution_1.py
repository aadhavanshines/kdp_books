"""Exercise 30.1: the maximum sum of a run of neighbors (Kadane's
algorithm): the best run ending here either extends the best run
ending one step back or starts fresh."""


def max_run_sum(nums):
    best = here = nums[0]
    for x in nums[1:]:
        here = max(x, here + x)
        best = max(best, here)
    return best


print(max_run_sum([-2, 1, -3, 4, -1, 2, 1, -5, 4]))
print(max_run_sum([-3, -1, -2]))
