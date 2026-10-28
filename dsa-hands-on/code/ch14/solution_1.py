"""Exercise 14.1: sort people by age (0 to 120) with a stable counting
sort; people of the same age keep their original order."""

from linear_sorts import counting_sort_by

people = [("Ana", 34), ("Ben", 7), ("Caz", 34), ("Dee", 71), ("Eli", 7)]
for name, age in counting_sort_by(people, lambda p: p[1], 120):
    print(f"{age:>3} {name}")
