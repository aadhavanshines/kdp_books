"""Sorting with keys, and binary search with bisect."""

from bisect import bisect_left, bisect_right, insort


def demo():
    people = [("Ana", 31), ("Bo", 25), ("Cy", 31)]
    # Sort by age descending, then name ascending.
    print(sorted(people, key=lambda p: (-p[1], p[0])))

    scores = [10, 20, 20, 30]
    print(bisect_left(scores, 20), bisect_right(scores, 20))
    insort(scores, 25)  # insert, keeping the list sorted
    print(scores)
