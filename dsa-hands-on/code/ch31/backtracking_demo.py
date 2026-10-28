"""Backtracking on small examples."""

from backtracking import combination_sum, permutations, queens, subsets

print(["".join(s) for s in subsets("abc")])
print(permutations([1, 2, 3]))
print(combination_sum([2, 3, 5], 8))
print([queens(n) for n in range(1, 11)])
