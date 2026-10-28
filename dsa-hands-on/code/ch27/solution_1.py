"""Exercise 27.1: is any value repeated within k positions? Remember
each value's last position."""


def nearby_duplicate(nums, k):
    last = {}
    for i, x in enumerate(nums):
        if x in last and i - last[x] <= k:
            return True
        last[x] = i
    return False


print(nearby_duplicate([1, 2, 3, 1], 3), nearby_duplicate([1, 2, 3, 1], 2))
