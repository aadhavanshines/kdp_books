"""A stable sort keeps items with equal keys in their original order."""


def insertion_sort_by(items, key):
    for i in range(1, len(items)):
        x = items[i]
        j = i - 1
        while j >= 0 and key(items[j]) > key(x):  # > not >=: stable
            items[j + 1] = items[j]
            j -= 1
        items[j + 1] = x


def selection_sort_by(items, key):
    for i in range(len(items) - 1):
        m = min(range(i, len(items)), key=lambda j: key(items[j]))
        items[i], items[m] = items[m], items[i]  # this swap can jump


people = [("Ada", 30), ("Bo", 25), ("Cy", 30), ("Di", 25)]
for sort in (insertion_sort_by, selection_sort_by):
    items = list(people)
    sort(items, key=lambda p: p[1])  # by age
    print(f"{sort.__name__:>18}: {items}")
