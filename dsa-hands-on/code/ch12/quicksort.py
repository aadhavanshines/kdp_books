"""Quicksort: pick a pivot, put smaller items left of it and bigger
ones right of it, then sort each side. Sorts in place."""

import random


def partition(items, lo, hi):
    """Lomuto partition of items[lo..hi] around items[hi]. Returns the
    pivot's final index: everything left of it is smaller."""
    pivot = items[hi]
    store = lo
    for i in range(lo, hi):
        if items[i] < pivot:
            items[i], items[store] = items[store], items[i]
            store += 1
    items[store], items[hi] = items[hi], items[store]
    return store


def quicksort_naive(items, lo=0, hi=None):
    """Always uses the last item as the pivot."""
    if hi is None:
        hi = len(items) - 1
    if lo < hi:
        p = partition(items, lo, hi)
        quicksort_naive(items, lo, p - 1)
        quicksort_naive(items, p + 1, hi)


def quicksort(items, lo=0, hi=None):
    """A random pivot, and recursion only on the smaller side, so the
    stack stays about log2(n) deep even in an unlucky case."""
    if hi is None:
        hi = len(items) - 1
    while lo < hi:
        r = random.randint(lo, hi)
        items[r], items[hi] = items[hi], items[r]
        p = partition(items, lo, hi)
        if p - lo < hi - p:
            quicksort(items, lo, p - 1)
            lo = p + 1  # loop on the bigger side instead of recursing
        else:
            quicksort(items, p + 1, hi)
            hi = p - 1


def quicksort3(items, lo=0, hi=None):
    """Three-way partition: items equal to the pivot are gathered in the
    middle and never touched again. Fast when there are many duplicates."""
    if hi is None:
        hi = len(items) - 1
    while lo < hi:
        pivot = items[random.randint(lo, hi)]
        lt, i, gt = (
            lo,
            lo,
            hi,
        )  # [lo,lt) < pivot, [lt,i) == pivot, (gt,hi] >
        while i <= gt:
            if items[i] < pivot:
                items[lt], items[i] = items[i], items[lt]
                lt, i = lt + 1, i + 1
            elif items[i] > pivot:
                items[i], items[gt] = items[gt], items[i]
                gt -= 1
            else:
                i += 1
        if lt - lo < hi - gt:
            quicksort3(items, lo, lt - 1)
            lo = gt + 1
        else:
            quicksort3(items, gt + 1, hi)
            hi = lt - 1
