"""Exercise 25.2: trapping rain water. Water above a bar is limited by
the shorter of the tallest bars to its left and right. Two pointers
keep both maxima and always settle the side with the lower one."""


def trapped(heights):
    lo, hi = 0, len(heights) - 1
    left_max = right_max = water = 0
    while lo < hi:
        if heights[lo] < heights[hi]:
            left_max = max(left_max, heights[lo])
            water += left_max - heights[lo]
            lo += 1
        else:
            right_max = max(right_max, heights[hi])
            water += right_max - heights[hi]
            hi -= 1
    return water


print(trapped([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))
print(trapped([4, 2, 0, 3, 2, 5]))
