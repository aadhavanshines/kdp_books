"""Exercise 12.3: sort a list of 0s, 1s and 2s in one pass (the Dutch
national flag problem): quicksort3's three-way partition with pivot 1."""


def sort_colors(items):
    lt, i, gt = 0, 0, len(items) - 1
    while i <= gt:
        if items[i] == 0:
            items[lt], items[i] = items[i], items[lt]
            lt, i = lt + 1, i + 1
        elif items[i] == 2:
            items[i], items[gt] = items[gt], items[i]
            gt -= 1
        else:
            i += 1


colors = [2, 0, 2, 1, 1, 0, 1, 2, 0]
sort_colors(colors)
print(colors)
