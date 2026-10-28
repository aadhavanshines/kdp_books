"""Binary search on the answer: when you can check a guess quickly and
every guess above the answer passes, search the range of answers.

Problem: packages with these weights must ship in order within `days`
days. What is the smallest daily capacity that works?
"""


def days_needed(weights, capacity):
    days, load = 1, 0
    for w in weights:
        if load + w > capacity:  # this package starts a new day
            days, load = days + 1, 0
        load += w
    return days


def smallest_capacity(weights, days):
    lo, hi = max(weights), sum(weights)  # the answer is in lo..hi
    while lo < hi:
        mid = (lo + hi) // 2
        if days_needed(weights, mid) <= days:
            hi = mid  # mid works: maybe something smaller does too
        else:
            lo = mid + 1  # mid fails: the answer is bigger
    return lo


weights = [3, 2, 2, 4, 1, 4, 5, 6, 2, 3]
for days in [1, 3, 5, 10]:
    print(f"{days:>2} days: capacity {smallest_capacity(weights, days)}")
