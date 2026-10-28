"""Exercise 11.1: count inversions, the pairs i < j with
items[i] > items[j]. Each step of insertion sort's inner loop fixes
exactly one, so counting the shifts counts them."""


def inversions(items):
    items, count = list(items), 0
    for i in range(1, len(items)):
        x, j = items[i], i - 1
        while j >= 0 and items[j] > x:
            items[j + 1] = items[j]
            j -= 1
            count += 1
        items[j + 1] = x
    return count


print(
    inversions([1, 2, 3]),
    inversions([3, 2, 1]),
    inversions([2, 4, 1, 3, 5]),
)
