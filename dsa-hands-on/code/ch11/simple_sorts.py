"""Three simple sorts. Each sorts the list in place, in quadratic time."""


def selection_sort(items):
    """Find the smallest remaining item and swap it into place."""
    n = len(items)
    for i in range(n - 1):
        smallest = i
        for j in range(i + 1, n):
            if items[j] < items[smallest]:
                smallest = j
        items[i], items[smallest] = items[smallest], items[i]


def insertion_sort(items):
    """Grow a sorted part on the left, inserting each new item into it."""
    for i in range(1, len(items)):
        x = items[i]
        j = i - 1
        while j >= 0 and items[j] > x:  # shift bigger items right
            items[j + 1] = items[j]
            j -= 1
        items[j + 1] = x


def bubble_sort(items):
    """Swap neighbors that are out of order; stop when a pass swaps none."""
    n = len(items)
    for end in range(n - 1, 0, -1):
        swapped = False
        for j in range(end):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
                swapped = True
        if not swapped:
            return
