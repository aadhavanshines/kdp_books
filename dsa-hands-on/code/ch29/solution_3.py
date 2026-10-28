"""Exercise 29.3: the cheapest way up a staircase where each step has a
cost and you may climb one or two at a time, starting on step 0 or 1."""


def min_cost_climb(cost):
    two_back = one_back = 0  # cheapest way to stand on the step
    for i in range(2, len(cost) + 1):
        two_back, one_back = (
            one_back,
            min(one_back + cost[i - 1], two_back + cost[i - 2]),
        )
    return one_back


print(min_cost_climb([10, 15, 20]))
print(min_cost_climb([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]))
