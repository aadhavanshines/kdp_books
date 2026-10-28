"""Exercise 12.1: count inversions in n log n time. While merging,
taking an item from the right half jumps it over every item still
waiting in the left half: that many inversions at once."""


def sort_and_count(items):
    if len(items) <= 1:
        return list(items), 0
    mid = len(items) // 2
    left, a = sort_and_count(items[:mid])
    right, b = sort_and_count(items[mid:])
    out, i, j, count = [], 0, 0, a + b
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
            count += len(left) - i
    return out + left[i:] + right[j:], count


print(sort_and_count([2, 4, 1, 3, 5])[1])
print(sort_and_count(list(range(1000, 0, -1)))[1])  # 1000 * 999 / 2
