"""Merge sort: split in half, sort each half, merge the sorted halves."""


def merge(left, right):
    """Merge two sorted lists into one sorted list."""
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:  # <= takes from the left on ties: stable
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    out.extend(left[i:])  # one of these two is empty
    out.extend(right[j:])
    return out


def merge_sort(items):
    """Return a new sorted list. Always about n log2 n comparisons."""
    if len(items) <= 1:
        return list(items)
    mid = len(items) // 2
    return merge(merge_sort(items[:mid]), merge_sort(items[mid:]))
