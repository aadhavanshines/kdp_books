"""Exercise 10.2: search a sorted list that was rotated, such as
[4, 5, 6, 7, 0, 1, 2]. One half around mid is always in order."""


def search_rotated(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[lo] <= items[mid]:  # the left half is in order
            if items[lo] <= target < items[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:  # the right half is in order
            if items[mid] < target <= items[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1


items = [4, 5, 6, 7, 0, 1, 2]
print([search_rotated(items, t) for t in [0, 4, 7, 2, 3]])
