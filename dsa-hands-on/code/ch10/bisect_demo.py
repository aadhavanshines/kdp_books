"""The bisect module: binary search in the standard library."""

import bisect

# Grades: the score where each grade starts, and the grade names
cutoffs = [60, 70, 80, 90]
grades = "FDCBA"
for score in [55, 60, 79, 90, 100]:
    print(score, grades[bisect.bisect_right(cutoffs, score)])

# Keep a list sorted as items arrive
scores = []
for s in [70, 40, 90, 55]:
    bisect.insort(scores, s)
print(scores)
