"""Binary search in a sorted sequence, and its two useful cousins."""


def binary_search(items, target):
    """Index of target in sorted items, or -1.

    Invariant: if target is anywhere, it is in items[lo:hi]. Each step
    halves that range, so it takes about log2(n) steps.
    """
    lo, hi = 0, len(items)
    while lo < hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            lo = mid + 1  # target can only be to the right of mid
        else:
            hi = mid  # target can only be to the left of mid
    return -1


def lower_bound(items, target):
    """The first index whose item is >= target (len(items) if none).
    It is where target would be inserted to keep the order."""
    lo, hi = 0, len(items)
    while lo < hi:
        mid = (lo + hi) // 2
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo


def upper_bound(items, target):
    """The first index whose item is > target (len(items) if none)."""
    lo, hi = 0, len(items)
    while lo < hi:
        mid = (lo + hi) // 2
        if items[mid] <= target:
            lo = mid + 1
        else:
            hi = mid
    return lo
