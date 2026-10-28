"""Exercise 30.3: can a list be split into two parts with equal sums?
A knapsack question: can some items add up to exactly half?"""


def can_split(nums):
    total = sum(nums)
    if total % 2:
        return False
    reachable = {0}
    for x in nums:
        reachable |= {s + x for s in reachable}
    return total // 2 in reachable


print(can_split([1, 5, 11, 5]), can_split([1, 2, 3, 5]))
