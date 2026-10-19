"""14.6 Charging Loop: a delivery robot drives a loop of stations. At
station i it gains charge[i] and spends cost[i] to reach the next. Which
starting station lets it complete the loop with the battery never below
zero? Return the smallest such index, or -1."""


def charging_loop_brute(charge, cost):
    n = len(charge)
    for start in range(n):
        battery = 0
        for step in range(n):
            i = (start + step) % n
            battery += charge[i] - cost[i]
            if battery < 0:
                break
        else:
            return start
    return -1


def charging_loop(charge, cost):
    if sum(charge) < sum(cost):
        return -1
    start, battery = 0, 0
    for i in range(len(charge)):
        battery += charge[i] - cost[i]
        if battery < 0:
            # No station from start to i can work; try the next one.
            start, battery = i + 1, 0
    return start


SOLUTIONS = [charging_loop, charging_loop_brute]
EXAMPLES = [
    (([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]), 3),
    (([2, 3, 4], [3, 4, 3]), -1),
    (([5], [5]), 0),
]


def random_case(rng):
    n = rng.randint(1, 8)
    return (
        [rng.randint(0, 5) for _ in range(n)],
        [rng.randint(0, 5) for _ in range(n)],
    )
