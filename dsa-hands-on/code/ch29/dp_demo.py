"""The DP solutions on small examples."""

from dp_basics import (
    climb_ways,
    coin_ways,
    fewest_coins,
    min_path_sum,
    rob,
)

print([climb_ways(n) for n in range(1, 11)])
print(rob([2, 7, 9, 3, 1]), rob([5, 1, 1, 5]))
print(fewest_coins([1, 5, 10, 25], 63), fewest_coins([2], 3))
print(coin_ways([1, 2, 5], 5))
print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))
