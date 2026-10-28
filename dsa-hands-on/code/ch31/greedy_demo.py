"""Greedy choices on small examples, and one where greedy fails."""

from greedy import (
    can_reach_end,
    greedy_coins,
    merge_intervals,
    most_meetings,
    rooms_needed,
)

meetings = [(9, 10), (9, 12), (10, 11), (11, 13), (12, 14), (13, 15)]
print(most_meetings(meetings))
print(rooms_needed(meetings), "rooms")
print(merge_intervals([(1, 3), (8, 10), (2, 6), (15, 18)]))
print(can_reach_end([2, 3, 1, 1, 4]), can_reach_end([3, 2, 1, 0, 4]))

# US coins: greedy is optimal. Coins 1, 3, 4: it is not.
print(greedy_coins([1, 5, 10, 25], 63), "coins for 63 cents")
print(greedy_coins([1, 3, 4], 6), "coins for 6 with 1, 3, 4 (3 + 3 is 2)")
